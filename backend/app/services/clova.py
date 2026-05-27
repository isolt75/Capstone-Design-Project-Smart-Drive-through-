"""CLOVA Speech 짧은 문장 인식(서버용). 엣지 stt_client.py 포팅(httpx).

Short Sentence: host=clovaspeech-gw.ncloud.com / path=/recog/v1/stt /
body=raw octet-stream / header=X-CLOVASPEECH-API-KEY.
키가 없으면 STTUnavailable 을 던져 라우터가 503을 반환하게 한다.
"""

from __future__ import annotations

import httpx

from app.config import settings


class STTUnavailable(RuntimeError):
    """Clova 키/URL 미설정."""


class STTError(RuntimeError):
    """Clova 호출/파싱 실패."""


def transcribe(wav_bytes: bytes) -> str:
    """WAV 바이트 → 인식 텍스트."""
    if not settings.clova_invoke_url or not settings.clova_secret_key:
        raise STTUnavailable(
            "CLOVA_INVOKE_URL / CLOVA_SECRET_KEY 미설정 — STT 비활성화"
        )

    headers = {
        "X-CLOVASPEECH-API-KEY": settings.clova_secret_key,
        "Content-Type": "application/octet-stream",
    }
    try:
        resp = httpx.post(
            settings.clova_invoke_url,
            headers=headers,
            params={"lang": settings.clova_language},
            content=wav_bytes,
            timeout=httpx.Timeout(5.0, read=30.0),
        )
    except httpx.HTTPError as exc:
        raise STTError(f"Clova 네트워크 오류: {exc}") from exc

    if resp.status_code != 200:
        raise STTError(f"Clova HTTP {resp.status_code}: {resp.text[:200]}")
    try:
        payload = resp.json()
    except ValueError as exc:
        raise STTError(f"Clova 응답 JSON 파싱 실패: {resp.text[:200]}") from exc
    return str(payload.get("text", "") or "")
