"""고객 조회 + 최신 번호판(OCR) 라우터. dtWeb src/api/customer.ts 계약에 맞춘다."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Cust, EdgeEvent
from app.services import recommend as rec
from app.services.plate import normalize

router = APIRouter(prefix="/api", tags=["customers"])


@router.get("/ocr/latest")
def ocr_latest(db: Session = Depends(get_db)):
    """엣지가 보낸 가장 최근 차량 진입 이벤트의 번호판."""
    ev = (
        db.query(EdgeEvent)
        .filter(EdgeEvent.plate.isnot(None))
        .order_by(EdgeEvent.created_at.desc())
        .first()
    )
    return {"plate": ev.plate if ev else ""}


@router.get("/voice/latest")
def voice_latest(db: Session = Depends(get_db)):
    """Pi 마이크 → Clova STT 로 들어온 가장 최근 voice_text.

    키오스크가 2초 폴링 → event_id 가 바뀌면 새 발화로 보고 파싱+장바구니 반영.
    """
    ev = (
        db.query(EdgeEvent)
        .filter(EdgeEvent.voice_text.isnot(None))
        .order_by(EdgeEvent.created_at.desc())
        .first()
    )
    if ev is None:
        return {"text": "", "event_id": "", "created_at": ""}
    return {
        "text": ev.voice_text or "",
        "event_id": ev.event_id,
        "created_at": ev.created_at.isoformat() if ev.created_at else "",
    }


@router.get("/customer")
def get_customer(plate: str, db: Session = Depends(get_db)):
    """번호판으로 고객 조회. 신규면 {isNew:true}, 재방문이면 최근 주문 포함.

    OCR 공백 편차를 흡수하기 위해 공백 무시 매칭한다.
    """
    cust = (
        db.query(Cust)
        .filter(func.replace(Cust.car_num, " ", "") == normalize(plate))
        .first()
    )
    if not cust:
        return {"isNew": True}
    return {
        "isNew": False,
        "plate": cust.car_num,
        "customerId": cust.cust_num,
        "customerName": cust.cust_nm,
        "lastOrder": rec.last_order_items(db, cust.cust_num),
    }
