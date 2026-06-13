"""주문 생성 / 직원 대기열 라우터. dtWeb src/api/order.ts 계약에 맞춘다."""

from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Cust, Menu, Odr
from app.schemas import OrderRequestIn
from app.services.plate import normalize
from app.services.ws_manager import staff_hub

router = APIRouter(prefix="/api/orders", tags=["orders"])


def _waiting_payload(db: Session) -> list[dict]:
    """대기(WAITING) 주문을 묶음별로 그룹핑해 직원 화면 형식으로 반환.

    GET /waiting 응답과 WebSocket 푸시가 같은 형식을 쓰도록 공용 헬퍼로 둔다.
    """
    rows = (
        db.query(Odr, Menu, Cust)
        .join(Menu, Menu.menu_num == Odr.menu_num)
        .join(Cust, Cust.cust_num == Odr.cust_num)
        .filter(Odr.odr_status == "WAITING")
        .order_by(Odr.odr_grp, Odr.odr_num)
        .all()
    )

    grouped: dict[str, dict] = {}
    for odr, menu, cust in rows:
        order = grouped.setdefault(
            odr.odr_grp,
            {"orderNum": odr.odr_grp, "customerId": cust.car_num, "items": []},
        )
        order["items"].append(
            {"id": menu.menu_num, "name": menu.menu_nm, "quantity": odr.menu_cnt}
        )
    return list(grouped.values())


def _next_order_no(db: Session, now: datetime) -> str:
    """오늘 생성된 주문 묶음 수 + 1 → 4자리 주문번호."""
    today0 = now.replace(hour=0, minute=0, second=0, microsecond=0)
    seq = (
        db.query(func.count(func.distinct(Odr.odr_grp)))
        .filter(Odr.odr_time >= today0)
        .scalar()
    ) or 0
    return f"{seq + 1:04d}"


@router.post("")
def create_order(req: OrderRequestIn, db: Session = Depends(get_db)):
    if not req.plate or not req.plate.strip():
        raise HTTPException(status_code=400, detail="차량번호 누락")
    if not req.items:
        raise HTTPException(status_code=400, detail="주문 항목 없음")

    # 기존 고객 조회(공백 무시) / 신규 저장
    cust = (
        db.query(Cust)
        .filter(func.replace(Cust.car_num, " ", "") == normalize(req.plate))
        .first()
    )
    if cust is None:
        cust = Cust(cust_nm=(req.customerName or req.plate), car_num=req.plate)
        db.add(cust)
        db.flush()  # cust_num 확보

    now = datetime.now()
    order_no = _next_order_no(db, now)

    for item in req.items:
        menu = db.query(Menu).filter(Menu.menu_num == item.menuId).first()
        if menu is None:
            db.rollback()
            raise HTTPException(status_code=400, detail=f"존재하지 않는 메뉴 ID: {item.menuId}")
        db.add(
            Odr(
                cust_num=cust.cust_num,
                odr_time=now,
                menu_num=menu.menu_num,
                menu_cnt=item.quantity,
                odr_grp=order_no,
                odr_status="WAITING",
            )
        )

    db.commit()

    # 새 주문을 직원 화면에 즉시 push(갱신된 대기열 전체 전송).
    staff_hub.notify({"type": "waiting", "orders": _waiting_payload(db)})

    return {
        "success": True,
        "customerId": cust.cust_num,
        "customerName": cust.cust_nm,
        "plate": cust.car_num,
        "orderTime": now.isoformat(),
        "orderNumber": order_no,
    }


@router.get("/waiting")
def waiting_orders(db: Session = Depends(get_db)):
    """대기(WAITING) 주문을 묶음별로 그룹핑해 직원 화면 형식으로 반환."""
    return _waiting_payload(db)


@router.post("/{order_no}/done")
def complete_order(order_no: str, db: Session = Depends(get_db)):
    """직원이 주문 묶음을 완료 처리(대기열에서 제거)."""
    updated = (
        db.query(Odr)
        .filter(Odr.odr_grp == order_no, Odr.odr_status == "WAITING")
        .update({Odr.odr_status: "DONE"})
    )
    db.commit()

    # 완료 처리도 모든 직원 화면에 즉시 반영(여러 화면 동기화).
    staff_hub.notify({"type": "waiting", "orders": _waiting_payload(db)})

    return {"success": True, "updated": updated}
