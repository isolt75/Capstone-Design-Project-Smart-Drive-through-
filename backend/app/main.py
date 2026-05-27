"""FastAPI 엔트리포인트. CORS + 라우터 등록 + 시작 시 테이블 생성."""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.db import engine
from app.models import Base
from app.routers import customers, edge, menus, orders, stt

app = FastAPI(title="Smart Drive-through Main Server", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
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
