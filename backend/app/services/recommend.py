"""추천 로직.

- 재방문 고객(번호판 이력 있음): CLOVA Studio(HyperCLOVA X) LLM 이 주문 이력 +
  전체 메뉴를 보고 취향 기반 추천. 키 미설정/호출 실패 시 과거 주문 기반
  개인화 TOP3(personalized_top)로 폴백.
- 신규/이력 없음: 인기/대표 메뉴 풀에서 무작위 N개.
- 데이터 부족 시: 메뉴 앞 N개 순으로 폴백.
"""

from __future__ import annotations

import random
from datetime import datetime

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models import Cust, Menu, Odr
from app.services import clova_studio


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


def _popular_pool_ids(db: Session, k: int) -> list[int]:
    """전체 주문 기준 인기 menuId 풀(최대 k). 부족하면 메뉴 앞쪽으로 채운다."""
    q = (
        db.query(Odr.menu_num)
        .group_by(Odr.menu_num)
        .order_by(func.sum(Odr.menu_cnt).desc())
        .limit(k)
    )
    pool = _top_menu_ids(q)
    if len(pool) < k:  # 주문 데이터 부족 → 메뉴 앞쪽으로 풀 보강
        have = set(pool)
        for (mid,) in db.query(Menu.menu_num).order_by(Menu.menu_num).limit(k).all():
            if mid not in have:
                pool.append(mid)
            if len(pool) >= k:
                break
    return pool


def random_from_popular(db: Session, n: int = 3, pool_k: int = 8) -> list[dict]:
    """신규/이력 없는 고객용: 인기/대표 메뉴 풀에서 무작위 N개."""
    pool = _popular_pool_ids(db, pool_k)
    if not pool:
        return _fill_to_n(db, [], n)
    picked_ids = random.sample(pool, min(n, len(pool)))
    return _fill_to_n(db, _menus_by_ids(db, picked_ids), n)


def order_history_summary(db: Session, cust_num: int) -> list[dict]:
    """LLM 프롬프트용 주문 이력 요약: [{menuName, category, count}] (많이 주문한 순)."""
    rows = (
        db.query(Menu.menu_nm, Menu.menu_category, func.sum(Odr.menu_cnt).label("cnt"))
        .join(Odr, Odr.menu_num == Menu.menu_num)
        .filter(Odr.cust_num == cust_num)
        .group_by(Menu.menu_num, Menu.menu_nm, Menu.menu_category)
        .order_by(func.sum(Odr.menu_cnt).desc())
        .all()
    )
    return [
        {"menuName": nm, "category": cat, "count": int(cnt)}
        for nm, cat, cnt in rows
    ]


def recommend(db: Session, plate: str | None = None, n: int = 3) -> list[dict]:
    """기존 고객(이력 있음): CLOVA Studio LLM 추천(실패 시 personalized_top 폴백).
    신규/이력 없음: 인기 풀 무작위.
    """
    if plate:
        cust = db.query(Cust).filter(Cust.car_num == plate).first()
        if cust:
            history = order_history_summary(db, cust.cust_num)
            if history:  # 주문 이력 있는 기존 고객
                menus = [m.as_dict() for m in db.query(Menu).order_by(Menu.menu_num).all()]
                try:
                    ids = clova_studio.recommend_menus(history, menus, n)
                    picked = _menus_by_ids(db, ids)
                    if picked:
                        return _fill_to_n(db, picked, n)
                except (clova_studio.ClovaStudioUnavailable, clova_studio.ClovaStudioError):
                    pass  # 키 없음/호출 실패 → DB 휴리스틱 폴백
                return _fill_to_n(db, personalized_top(db, cust.cust_num, n), n)
    return random_from_popular(db, n=n)


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
