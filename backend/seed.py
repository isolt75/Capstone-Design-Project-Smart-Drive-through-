"""DB 테이블 생성 + 시드 데이터 적재 (idempotent).

실행: backend/ 에서  python seed.py
- 메뉴 19종 (dtWeb data.sql 동일)
- 샘플 고객 2명 + 과거 주문(추천이 빈 DB에서도 동작하도록)
"""

from __future__ import annotations

from datetime import datetime, timedelta

from app.db import SessionLocal, engine
from app.models import Base, Cust, Menu, Odr

MENUS = [
    (1, "아메리카노", 3000, "커피", "Y"),
    (2, "콜드브루", 4500, "커피", "Y"),
    (3, "카라멜 마키아또", 4000, "커피", "Y"),
    (4, "카푸치노", 4000, "커피", "Y"),
    (5, "카페모카", 4000, "커피", "Y"),
    (6, "카페라떼", 4000, "커피", "Y"),
    (7, "자바칩 프라페", 4000, "아이스 블렌디드", "Y"),
    (8, "밀크쉐이크", 4000, "아이스 블렌디드", "N"),
    (9, "딸기요거트스무디", 4500, "아이스 블렌디드", "N"),
    (10, "망고요거트스무디", 4500, "아이스 블렌디드", "N"),
    (11, "레몬에이드", 3500, "에이드, 주스", "N"),
    (12, "오렌지주스", 3000, "에이드, 주스", "N"),
    (13, "라임모히또에이드", 3500, "에이드, 주스", "N"),
    (14, "녹차", 2500, "티", "Y"),
    (15, "자몽허니블랙티", 4000, "티", "Y"),
    (16, "아이스티", 2000, "티", "Y"),
    (17, "말차라떼", 3500, "티", "Y"),
    (18, "초코라떼", 3000, "티", "N"),
    (19, "우유", 2000, "티", "N"),
]

CUSTS = [
    (1, "김민준", "01가 0785"),
    (2, "이서연", "23나 1234"),
]

# (cust_num, odr_grp, hours_ago, [(menu_num, cnt), ...])
SAMPLE_ORDERS = [
    (1, "0001", 1, [(1, 2), (4, 1)]),
    (2, "0002", 2, [(3, 1), (1, 1)]),
]


def seed() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        existing_menu = {m.menu_num for m in db.query(Menu.menu_num).all()}
        for num, nm, price, cat, caf in MENUS:
            if num not in existing_menu:
                db.add(Menu(menu_num=num, menu_nm=nm, menu_price=price,
                            menu_category=cat, caf_yn=caf))

        existing_cust = {c.car_num for c in db.query(Cust.car_num).all()}
        for num, nm, car in CUSTS:
            if car not in existing_cust:
                db.add(Cust(cust_num=num, cust_nm=nm, car_num=car))
        db.flush()

        if db.query(Odr).count() == 0:
            now = datetime.now()
            for cust_num, grp, hours_ago, items in SAMPLE_ORDERS:
                t = now - timedelta(hours=hours_ago)
                for menu_num, cnt in items:
                    db.add(Odr(cust_num=cust_num, odr_time=t, menu_num=menu_num,
                               menu_cnt=cnt, odr_grp=grp, odr_status="DONE"))

        db.commit()
        print(f"seed done: menus={db.query(Menu).count()} "
              f"custs={db.query(Cust).count()} orders={db.query(Odr).count()}")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
