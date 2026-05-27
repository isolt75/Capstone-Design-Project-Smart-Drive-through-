"""추천 로직.

- 재방문 고객(번호판 이력 있음): 과거 주문 기반 개인화 TOP3 (단골 메뉴)
- 신규/이력 없음: 현재 시간대 인기 TOP3
- 데이터 부족 시: 전체 인기 → 메뉴 앞 N개 순으로 폴백
"""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models import Cust, Menu, Odr


def _menus_by_ids(db: Session, menu_ids: list[int]) -> list[dict]:
    """menu_ids 순서를 유지하며 Menu dict 목록 반환."""
    if not menu_ids:
        return []
    menus = {m.menu_num: m for m in db.query(Menu).filter(Menu.menu_num.in_(menu_ids)).all()}
    return [menus[mid].as_dict() for mid in menu_ids if mid in menus]


def _fill_to_n(db: Session, picked: list[dict], n: int) -> list[dict]:
    """picked 가 n개 미만이면 메뉴 앞쪽으로 채운다(중복 제외)."""
    if len(picked) >= n:
        return picked[:n]
    have = {m["menuId"] for m in picked}
    q = db.query(Menu)
    if have:
        q = q.filter(Menu.menu_num.notin_(have))
    extra = q.order_by(Menu.menu_num).limit(n - len(picked)).all()
    return picked + [m.as_dict() for m in extra]


def _top_menu_ids(query) -> list[int]:
    return [row[0] for row in query.all()]


def personalized_top(db: Session, cust_num: int, n: int = 3) -> list[dict]:
    """해당 고객의 과거 주문에서 가장 많이 주문한 메뉴 TOP n."""
    q = (
        db.query(Odr.menu_num, func.sum(Odr.menu_cnt).label("cnt"))
        .filter(Odr.cust_num == cust_num)
        .group_by(Odr.menu_num)
        .order_by(func.sum(Odr.menu_cnt).desc())
        .limit(n)
    )
    return _menus_by_ids(db, _top_menu_ids(q))


def time_based_top(db: Session, hour: int | None = None, n: int = 3) -> list[dict]:
    """현재(또는 지정) 시간대에 가장 많이 팔린 메뉴 TOP n.

    시간대는 [hour-1, hour+1] 밴드로 넉넉히 잡고, 부족하면 전체 인기로 폴백.
    """
    if hour is None:
        hour = datetime.now().hour
    lo, hi = (hour - 1) % 24, (hour + 1) % 24

    band = func.hour(Odr.odr_time)
    cond = band.between(lo, hi) if lo <= hi else (band >= lo) | (band <= hi)
    q = (
        db.query(Odr.menu_num, func.sum(Odr.menu_cnt).label("cnt"))
        .filter(cond)
        .group_by(Odr.menu_num)
        .order_by(func.sum(Odr.menu_cnt).desc())
        .limit(n)
    )
    picked = _menus_by_ids(db, _top_menu_ids(q))

    if len(picked) < n:  # 시간대 데이터 부족 → 전체 인기
        q_all = (
            db.query(Odr.menu_num, func.sum(Odr.menu_cnt).label("cnt"))
            .group_by(Odr.menu_num)
            .order_by(func.sum(Odr.menu_cnt).desc())
            .limit(n)
        )
        have = {m["menuId"] for m in picked}
        for extra in _menus_by_ids(db, _top_menu_ids(q_all)):
            if extra["menuId"] not in have:
                picked.append(extra)
            if len(picked) >= n:
                break

    return _fill_to_n(db, picked, n)


def recommend(db: Session, plate: str | None = None, n: int = 3) -> list[dict]:
    """plate 이력이 있으면 개인화, 없으면 시간대 인기."""
    if plate:
        cust = db.query(Cust).filter(Cust.car_num == plate).first()
        if cust:
            picked = personalized_top(db, cust.cust_num, n)
            if picked:
                return _fill_to_n(db, picked, n)
    return time_based_top(db, n=n)


def last_order_items(db: Session, cust_num: int) -> list[dict]:
    """고객의 가장 최근 주문 묶음의 항목들 → [{menuId, menuName, quantity}]."""
    latest = (
        db.query(Odr)
        .filter(Odr.cust_num == cust_num)
        .order_by(Odr.odr_time.desc(), Odr.odr_num.desc())
        .first()
    )
    if not latest:
        return []
    rows = (
        db.query(Odr, Menu)
        .join(Menu, Menu.menu_num == Odr.menu_num)
        .filter(Odr.odr_grp == latest.odr_grp)
        .order_by(Odr.odr_num)
        .all()
    )
    return [
        {"menuId": odr.menu_num, "menuName": menu.menu_nm, "quantity": odr.menu_cnt}
        for odr, menu in rows
    ]
