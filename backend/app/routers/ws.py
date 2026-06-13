"""직원 화면 실시간 갱신용 WebSocket 엔드포인트.

접속 즉시 현재 대기열을 1회 보내고, 이후 주문 생성/완료가 일어날 때마다
서버가 갱신된 대기열을 push 한다(폴링 대비 지연 제거).
"""

from __future__ import annotations

import asyncio

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.db import SessionLocal
from app.routers.orders import _waiting_payload
from app.services.ws_manager import staff_hub

router = APIRouter()


@router.websocket("/ws/staff")
async def ws_staff(ws: WebSocket) -> None:
    # 첫 접속 시점에 이벤트 루프를 허브에 바인딩(동기 라우트에서 push 가능해짐).
    staff_hub.bind_loop(asyncio.get_running_loop())
    await staff_hub.connect(ws)

    # 접속 직후 현재 대기열 스냅샷 1회 전송.
    db = SessionLocal()
    try:
        await ws.send_json({"type": "waiting", "orders": _waiting_payload(db)})
    finally:
        db.close()

    try:
        # 클라이언트 메시지는 연결 유지용으로만 받고 무시한다.
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        staff_hub.disconnect(ws)
    except Exception:
        staff_hub.disconnect(ws)
