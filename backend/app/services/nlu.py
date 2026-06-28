"""한국어 음성 발화 → 메뉴+수량 파싱 (store.ts parseVoiceOrder 의 Python 포트).

반환: (items, is_checkout)
  items       = [{"menu_num": int, "menu_nm": str, "qty": int, "unit_price": int}, ...]
  is_checkout = True  이면 "주문완료/계산/끝/결제" 키워드가 포함됨
"""

from __future__ import annotations

import re
from typing import TypedDict

from sqlalchemy.orm import Session

from app.models import Menu

_CHECKOUT_KEYWORDS = ("주문완료", "주문 완료", "계산", "결제", "끝")

_NUMBER_MAP: dict[str, int] = {
    "한개": 1, "한잔": 1, "하나": 1,
    "두개": 2, "두잔": 2, "둘": 2,
    "세개": 3, "세잔": 3, "셋": 3,
    "네개": 4, "네잔": 4, "넷": 4,
    "다섯개": 5, "다섯잔": 5, "다섯": 5,
    "여섯개": 6, "여섯잔": 6, "여섯": 6,
    "일곱개": 7, "일곱잔": 7, "일곱": 7,
    "여덟개": 8, "여덟잔": 8, "여덟": 8,
    "아홉개": 9, "아홉잔": 9, "아홉": 9,
    "열개": 10, "열잔": 10, "열": 10,
    "한": 1, "두": 2, "세": 3, "네": 4,
}
_NUMBER_WORDS = sorted(_NUMBER_MAP.keys(), key=len, reverse=True)


class ParsedItem(TypedDict):
    menu_num: int
    menu_nm: str
    qty: int
    unit_price: int


def parse(text: str, db: Session) -> tuple[list[ParsedItem], bool]:
    if not text:
        return [], False

    is_checkout = any(kw in text for kw in _CHECKOUT_KEYWORDS)

    compact = text.replace(" ", "")
    menus = db.query(Menu).all()
    # 긴 이름 우선 — "카페라떼"가 "라떼"보다 먼저 매칭
    menus_sorted = sorted(menus, key=lambda m: len(m.menu_nm), reverse=True)

    items: list[ParsedItem] = []
    seen: set[int] = set()

    for menu in menus_sorted:
        if menu.menu_num in seen:
            continue
        needle = menu.menu_nm.replace(" ", "")
        if len(needle) < 2:
            continue
        idx = compact.find(needle)
        if idx < 0:
            continue

        before = compact[max(0, idx - 3): idx]
        after = compact[idx + len(needle): idx + len(needle) + 5]
        window = before + after

        qty = 1
        m = re.search(r"\d+", window)
        if m:
            n = int(m.group())
            if 0 < n < 100:
                qty = n
        else:
            for word in _NUMBER_WORDS:
                if word in window:
                    qty = _NUMBER_MAP[word]
                    break

        items.append(
            ParsedItem(
                menu_num=menu.menu_num,
                menu_nm=menu.menu_nm,
                qty=qty,
                unit_price=menu.menu_price,
            )
        )
        seen.add(menu.menu_num)

    return items, is_checkout
