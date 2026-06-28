"""ORM 모델. 기존 팀 스키마(DT_TB_*) 테이블/컬럼명을 그대로 유지하되,
직원 POS·대기열을 위해 DT_TB_ODR 에 ODR_GRP / ODR_STATUS 2컬럼만 최소 추가했다.
"""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class Menu(Base):
    __tablename__ = "DT_TB_MENU"

    menu_num: Mapped[int] = mapped_column("MENU_NUM", Integer, primary_key=True, autoincrement=True)
    menu_nm: Mapped[str] = mapped_column("MENU_NM", String(30), nullable=False)
    menu_price: Mapped[int] = mapped_column("MENU_PRICE", Integer, nullable=False)
    menu_category: Mapped[str] = mapped_column("MENU_CATEGORY", String(30), nullable=False)
    caf_yn: Mapped[str] = mapped_column("CAF_YN", String(1), nullable=False, default="N")

    def as_dict(self) -> dict:
        return {
            "menuId": self.menu_num,
            "menuName": self.menu_nm,
            "price": self.menu_price,
            "category": self.menu_category,
            "cafYn": self.caf_yn,
        }


class Cust(Base):
    __tablename__ = "DT_TB_CUST"

    cust_num: Mapped[int] = mapped_column("CUST_NUM", Integer, primary_key=True, autoincrement=True)
    cust_nm: Mapped[str] = mapped_column("CUST_NM", String(20), nullable=False)
    car_num: Mapped[str] = mapped_column("CAR_NUM", String(20), nullable=False, unique=True)


class Odr(Base):
    __tablename__ = "DT_TB_ODR"

    odr_num: Mapped[int] = mapped_column("ODR_NUM", Integer, primary_key=True, autoincrement=True)
    cust_num: Mapped[int] = mapped_column("CUST_NUM", ForeignKey("DT_TB_CUST.CUST_NUM"), nullable=False)
    odr_time: Mapped[datetime] = mapped_column("ODR_TIME", DateTime, nullable=False, default=datetime.now)
    menu_num: Mapped[int] = mapped_column("MENU_NUM", ForeignKey("DT_TB_MENU.MENU_NUM"), nullable=False)
    menu_cnt: Mapped[int] = mapped_column("MENU_CNT", Integer, nullable=False)
    # --- 신규 추가: 주문 묶음 + 처리 상태 ---
    odr_grp: Mapped[str] = mapped_column("ODR_GRP", String(20), nullable=False, index=True)
    odr_status: Mapped[str] = mapped_column("ODR_STATUS", String(10), nullable=False, default="WAITING")


class CartItem(Base):
    """음성 주문 장바구니. event_id 단위로 누적, status: OPEN→CONFIRMED→PAID."""

    __tablename__ = "DT_TB_CART"

    id: Mapped[int] = mapped_column("ID", Integer, primary_key=True, autoincrement=True)
    event_id: Mapped[str] = mapped_column("EVENT_ID", String(64), nullable=False, index=True)
    menu_num: Mapped[int] = mapped_column("MENU_NUM", ForeignKey("DT_TB_MENU.MENU_NUM"), nullable=False)
    quantity: Mapped[int] = mapped_column("QUANTITY", Integer, nullable=False)
    unit_price: Mapped[int] = mapped_column("UNIT_PRICE", Integer, nullable=False)
    status: Mapped[str] = mapped_column("STATUS", String(10), nullable=False, default="OPEN")
    created_at: Mapped[datetime] = mapped_column("CREATED_AT", DateTime, default=datetime.now)


class EdgeEvent(Base):
    """엣지가 보낸 차량 진입/음성 이벤트. /ocr/latest 와 음성 텍스트 연결의 근거."""

    __tablename__ = "DT_TB_EDGE_EVENT"

    event_id: Mapped[str] = mapped_column("EVENT_ID", String(64), primary_key=True)
    device_id: Mapped[str | None] = mapped_column("DEVICE_ID", String(40), nullable=True)
    plate: Mapped[str | None] = mapped_column("PLATE", String(20), nullable=True)
    voice_text: Mapped[str | None] = mapped_column("VOICE_TEXT", String(500), nullable=True)
    distance_cm: Mapped[float | None] = mapped_column("DISTANCE_CM", Float, nullable=True)
    captured_at: Mapped[datetime | None] = mapped_column("CAPTURED_AT", DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column("CREATED_AT", DateTime, default=datetime.now)
