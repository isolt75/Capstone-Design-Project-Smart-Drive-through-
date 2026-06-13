"""FastAPI 엔트리포인트. CORS + 라우터 등록 + 시작 시 테이블 생성."""

from __future__ import annotations

import json

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.db import engine
from app.models import Base
from app.routers import customers, edge, menus, orders, stt, ws


class UnicodeJSONResponse(JSONResponse):
    """한글 등 비ASCII를 \\uXXXX 로 이스케이프하지 않고 UTF-8 그대로 응답.

    Content-Type 에도 charset=utf-8 을 명시해 브라우저가 인코딩을 헷갈리지 않게 한다.
    """

    media_type = "application/json; charset=utf-8"

    def render(self, content) -> bytes:
        return json.dumps(
            content,
            ensure_ascii=False,
            allow_nan=False,
            separators=(",", ":"),
        ).encode("utf-8")


app = FastAPI(
    title="Smart Drive-through Main Server",
    version="1.0.0",
    default_response_class=UnicodeJSONResponse,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    # 같은 공유기(LAN)의 사설 IP에서 접속하는 키오스크/직원 화면도 허용.
    # 서버 노트북 IP가 바뀌어도 되도록 사설 대역(192.168/10/172.16-31)을 정규식으로 열어둔다.
    allow_origin_regex=(
        r"^http://(localhost|127\.0\.0\.1|"
        r"(192\.168|10\.\d{1,3}|172\.(1[6-9]|2\d|3[01]))\.\d{1,3}\.\d{1,3})"
        r"(:\d+)?$"
    ),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    # 테이블이 없으면 생성(시드는 seed.py로 별도 실행).
    Base.metadata.create_all(bind=engine)


@app.get("/health")
def health():
    return {"status": "ok"}


app.include_router(menus.router)
app.include_router(orders.router)
app.include_router(customers.router)
app.include_router(stt.router)
app.include_router(edge.router)
app.include_router(ws.router)
