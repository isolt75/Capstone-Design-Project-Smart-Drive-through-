"""엣지 수신 라우터 (SRS §4). scripts/mock_server.py 의 DB 연동 정식 버전.

엣지는 이미 OCR/STT를 수행해 plate_number / text 를 함께 보낸다. 여기서는
- 멀티미디어 파일을 UPLOAD_DIR 에 백업 저장하고
- 번호판/음성 텍스트를 DT_TB_EDGE_EVENT 에 적재한다(키오스크가 /ocr/latest 로 읽음).
"""

from __future__ import annotations

from datetime import datetime
from pathlib import Path

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from starlette.datastructures import UploadFile

from app.config import settings
from app.db import get_db
from app.models import EdgeEvent

router = APIRouter(prefix="/api/v1", tags=["edge"])

UPLOAD_ROOT = Path(settings.upload_dir)


def _parse_float(v) -> float | None:
    try:
        return float(v) if v not in (None, "") else None
    except (TypeError, ValueError):
        return None


def _parse_dt(v) -> datetime | None:
    if not v:
        return None
    try:
        return datetime.fromisoformat(str(v).replace("Z", "+00:00"))
    except ValueError:
        return None


async def _save_files(form, event_id: str) -> list[str]:
    """멀티파트의 파일 필드를 UPLOAD_ROOT/<ts>_<event>/ 에 저장."""
    files = [(k, v) for k, v in form.multi_items() if isinstance(v, UploadFile)]
    if not files:
        return []
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    out_dir = UPLOAD_ROOT / f"{ts}_{(event_id or 'unknown')[:8]}"
    out_dir.mkdir(parents=True, exist_ok=True)
    saved = []
    for field, f in files:
        dest = out_dir / f"{field}__{f.filename or field}"
        dest.write_bytes(await f.read())
        saved.append(dest.name)
    return saved


def _upsert_event(db: Session, event_id: str, **fields) -> EdgeEvent:
    ev = db.query(EdgeEvent).filter(EdgeEvent.event_id == event_id).first()
    if ev is None:
        ev = EdgeEvent(event_id=event_id)
        db.add(ev)
    for k, v in fields.items():
        if v is not None:
            setattr(ev, k, v)
    db.commit()
    return ev


@router.post("/drivethrough/vehicle-entry")
async def vehicle_entry(request: Request, db: Session = Depends(get_db)):
    form = await request.form()
    event_id = form.get("event_id") or "unknown"
    saved = await _save_files(form, event_id)

    _upsert_event(
        db,
        event_id,
        device_id=form.get("device_id"),
        plate=(form.get("plate_number") or None),
        distance_cm=_parse_float(form.get("distance_cm")),
        captured_at=_parse_dt(form.get("captured_at")),
    )
    return {
        "success": True,
        "event_id": event_id,
        "received_at": datetime.now().isoformat(),
        "received_files": saved,
        "message": "vehicle-entry received",
    }


@router.post("/drivethrough/voice-order")
async def voice_order(request: Request, db: Session = Depends(get_db)):
    form = await request.form()
    event_id = form.get("event_id") or "unknown"
    saved = await _save_files(form, event_id)

    _upsert_event(
        db,
        event_id,
        device_id=form.get("device_id"),
        voice_text=(form.get("text") or None),
    )
    return {
        "success": True,
        "event_id": event_id,
        "received_at": datetime.now().isoformat(),
        "received_files": saved,
        "message": "voice-order received",
    }


@router.get("/edge/events")
def recent_events(
    limit: int = 10,
    event_id: str | None = None,
    db: Session = Depends(get_db),
):
    """엣지 수신 이벤트(번호판/음성 텍스트) 조회 — 디버그/확인용.

    event_id 가 주어지면 해당 단건만(길이 1 리스트, limit 무시) 반환하고,
    없으면 최근 limit 건을 반환한다.
    """
    q = db.query(EdgeEvent)
    if event_id:
        q = q.filter(EdgeEvent.event_id == event_id)
    rows = (
        q.order_by(EdgeEvent.created_at.desc())
        .limit(1 if event_id else min(limit, 100))
        .all()
    )
    return [
        {
            "event_id": e.event_id,
            "device_id": e.device_id,
            "plate": e.plate,
            "voice_text": e.voice_text,
            "captured_at": e.captured_at.isoformat() if e.captured_at else None,
            "created_at": e.created_at.isoformat() if e.created_at else None,
        }
        for e in rows
    ]


@router.post("/edge/heartbeat")
async def heartbeat(request: Request):
    body = await request.json()
    return {
        "success": True,
        "next_heartbeat_sec": 60,
        "config_updated": False,
        "device_id": body.get("device_id"),
    }
