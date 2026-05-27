"""요청/응답 pydantic 모델. 응답은 프론트(dtWeb) 계약에 맞춘다."""

from __future__ import annotations

from pydantic import BaseModel, Field


class OrderItemIn(BaseModel):
    menuId: int
    quantity: int = Field(ge=1)


class OrderRequestIn(BaseModel):
    plate: str
    customerName: str | None = None
    items: list[OrderItemIn]
