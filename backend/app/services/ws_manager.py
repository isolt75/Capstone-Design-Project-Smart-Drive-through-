"""직원 화면 실시간 푸시용 WebSocket 허브.

동기 라우트 핸들러(create_order / complete_order)에서 notify()를 호출하면,
바인딩된 이벤트 루프로 브로드캐스트를 안전하게 넘긴다(스레드풀 → 루프).
직원 화면이 하나도 안 붙어 있으면 아무 일도 하지 않는다.
"""

from __future__ import annotations

import asyncio
from typing import Any

from fastapi import WebSocket


class StaffHub:
    def __init__(self) -> None:
        self._conns: set[WebSocket] = set()
        self._loop: asyncio.AbstractEventLoop | None = None

    def bind_loop(self, loop: asyncio.AbstractEventLoop) -> None:
        """첫 WebSocket 접속 시점에 실행 중인 이벤트 루프를 기억한다."""
        self._loop = loop

    async def connect(self, ws: WebSocket) -> None:
        await ws.accept()
        self._conns.add(ws)

    def disconnect(self, ws: WebSocket) -> None:
        self._conns.discard(ws)

    async def _broadcast(self, message: dict[str, Any]) -> None:
        dead: list[WebSocket] = []
        for ws in list(self._conns):
            try:
                await ws.send_json(message)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self._conns.discard(ws)

    def notify(self, message: dict[str, Any]) -> None:
        """동기 코드에서 호출 — 이벤트 루프에 브로드캐스트를 예약한다."""
        loop = self._loop
        if loop is None or not self._conns:
            return
        asyncio.run_coroutine_threadsafe(self._broadcast(message), loop)


staff_hub = StaffHub()
