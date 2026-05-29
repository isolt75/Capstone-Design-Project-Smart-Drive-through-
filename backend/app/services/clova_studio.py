"""CLOVA Studio(HyperCLOVA X) 추천 LLM 클라이언트.

기존 고객의 주문 이력 + 전체 메뉴를 넘겨, 취향 기반 추천 메뉴(menuId)를 받는다.
clova.py(STT) 와 같은 규약: 키가 없으면 ClovaStudioUnavailable 을 던져
호출부(recommend.py)가 DB 휴리스틱으로 폴백하게 한다.

Chat Completions(비스트리밍): header=Authorization: Bearer <key> /
X-NCP-CLOVASTUDIO-REQUEST-ID / Accept: application/json,
응답 본문 result.message.content 에 모델 출력이 담긴다.
"""

from __future__ import annotations

import json
import re
import uuid

import httpx

from app.config import settings


class ClovaStudioUnavailable(RuntimeError):
    """CLOVA Studio 키 미설정."""


class ClovaStudioError(RuntimeError):
    """CLOVA Studio 호출/파싱 실패."""


SYSTEM_PROMPT = (
    "너는 IoT 카페 키오스크의 메뉴 추천 도우미다. "
    "고객의 과거 주문 이력과 전체 메뉴를 보고, 그 고객이 좋아할 만한 메뉴를 추천한다. "
    "단골 메뉴만 반복하지 말고, 취향(커피/단맛/시원함 등)에 어울리는 새로운 메뉴도 섞어 제안하라. "
    "반드시 주어진 메뉴 목록의 menuId 중에서만 고르고, "
    "설명 없이 menuId 정수만 담은 JSON 배열 하나만 출력하라. 예: [1, 6, 17]"
)


def _build_user_prompt(order_history: list[dict], menus: list[dict], n: int) -> str:
    menu_lines = "\n".join(
        f"- menuId={m['menuId']} | {m['menuName']} | {m['category']}" for m in menus
    )
    if order_history:
        hist_lines = "\n".join(
            f"- {h['menuName']} ({h['category']}) x{h['count']}회" for h in order_history
        )
    else:
        hist_lines = "(주문 이력 없음)"
    return (
        f"[전체 메뉴]\n{menu_lines}\n\n"
        f"[이 고객의 과거 주문 이력]\n{hist_lines}\n\n"
        f"위 고객에게 추천할 메뉴 {n}개를 골라 menuId JSON 배열로만 답하라."
    )


def _parse_menu_ids(content: str, valid_ids: set[int], n: int) -> list[int]:
    """모델 출력에서 유효한 menuId 정수를 순서대로 추출(중복 제거, 최대 n개)."""
    candidates: list[int] = []
    try:
        parsed = json.loads(content)
        if isinstance(parsed, list):
            candidates = [int(x) for x in parsed if isinstance(x, (int, float, str)) and str(x).strip().lstrip("-").isdigit()]
    except (ValueError, TypeError):
        candidates = []
    if not candidates:  # JSON 파싱 실패 → 정규식으로 정수 긁기
        candidates = [int(tok) for tok in re.findall(r"\d+", content)]

    out: list[int] = []
    for mid in candidates:
        if mid in valid_ids and mid not in out:
            out.append(mid)
        if len(out) >= n:
            break
    return out


def recommend_menus(order_history: list[dict], menus: list[dict], n: int = 3) -> list[int]:
    """주문 이력 + 전체 메뉴 → 추천 menuId 목록.

    menus: [{"menuId","menuName","category", ...}]  (Menu.as_dict() 결과)
    order_history: [{"menuName","category","count"}]
    """
    if not settings.clova_studio_api_key:
        raise ClovaStudioUnavailable("CLOVA_STUDIO_API_KEY 미설정 — 추천 LLM 비활성화")
    if not menus:
        raise ClovaStudioError("메뉴 목록이 비어 있음")

    valid_ids = {int(m["menuId"]) for m in menus}
    headers = {
        "Authorization": f"Bearer {settings.clova_studio_api_key}",
        "X-NCP-CLOVASTUDIO-REQUEST-ID": uuid.uuid4().hex,
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    body = {
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": _build_user_prompt(order_history, menus, n)},
        ],
        "maxTokens": 100,
        "temperature": 0.5,
        "topP": 0.8,
        "repeatPenalty": 1.1,
    }
    try:
        resp = httpx.post(
            settings.clova_studio_url,
            headers=headers,
            json=body,
            timeout=httpx.Timeout(5.0, read=15.0),
        )
    except httpx.HTTPError as exc:
        raise ClovaStudioError(f"CLOVA Studio 네트워크 오류: {exc}") from exc

    if resp.status_code != 200:
        raise ClovaStudioError(f"CLOVA Studio HTTP {resp.status_code}: {resp.text[:200]}")
    try:
        payload = resp.json()
        content = payload["result"]["message"]["content"]
    except (ValueError, KeyError, TypeError) as exc:
        raise ClovaStudioError(f"CLOVA Studio 응답 파싱 실패: {resp.text[:200]}") from exc

    ids = _parse_menu_ids(str(content or ""), valid_ids, n)
    if not ids:
        raise ClovaStudioError(f"추천 menuId 추출 실패: {content!r}")
    return ids
