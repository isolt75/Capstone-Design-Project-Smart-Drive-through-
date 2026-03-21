// 메뉴 컨트롤러
// GET /api/menus   - 전체 메뉴 목록
// GET /api/popular - 현재 시간대 인기 메뉴 TOP3

const menuService = require('../service/menuService');

/**
 * 전체 메뉴 목록을 반환한다.
 */
async function getAllMenus(req, res, next) {
  try {
    const result = await menuService.getAllMenus();
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * 현재 시간대 기준 인기 메뉴 TOP3를 반환한다.
 * 주문 이력이 없으면 빈 배열을 반환한다.
 */
async function getPopularMenus(req, res, next) {
  try {
    const result = await menuService.getPopularMenus();
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { getAllMenus, getPopularMenus };
