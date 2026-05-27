"""메뉴 / 추천 라우터. dtWeb src/api/menu.ts 계약에 맞춘다."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Menu
from app.services import recommend as rec

router = APIRouter(prefix="/api", tags=["menus"])


@router.get("/menus")
def get_menus(db: Session = Depends(get_db)):
    menus = db.query(Menu).order_by(Menu.menu_num).all()
    return {"success": True, "menus": [m.as_dict() for m in menus]}


@router.get("/popular")
def get_popular(db: Session = Depends(get_db)):
    """현재 시간대 인기 TOP3 (하위호환: 프론트 getPopularMenus)."""
    return {"success": True, "top3": rec.time_based_top(db, n=3)}


@router.get("/recommend")
def get_recommend(plate: str | None = None, db: Session = Depends(get_db)):
    """plate 이력 있으면 개인화, 없으면 시간대 인기."""
    return {"success": True, "top3": rec.recommend(db, plate=plate, n=3)}


@router.get("/menus/{menu_id}")
def get_menu(menu_id: int, db: Session = Depends(get_db)):
    menu = db.query(Menu).filter(Menu.menu_num == menu_id).first()
    if not menu:
        return {"success": False, "message": "메뉴 없음"}
    return menu.as_dict()
