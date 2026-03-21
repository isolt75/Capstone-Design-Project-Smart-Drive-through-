// 메뉴 서비스
// 전체 메뉴 조회 및 현재 시간대 인기 메뉴 TOP3를 제공한다.

const menuRepository = require('../repository/menuRepository');

/**
 * 전체 메뉴 목록을 반환한다.
 * @returns {Promise<Object>} 메뉴 목록
 */
async function getAllMenus() {
  const menus = await menuRepository.findAll();
  return { menus };
}

/**
 * 현재 시간대 기준 인기 메뉴 TOP3를 반환한다.
 *
 * 시간대 구분:
 *   - 아침: 06~10시
 *   - 점심: 11~13시
 *   - 오후: 14~17시
 *   - 저녁: 18~21시
 *   - 야간: 22~05시
 *
 * @returns {Promise<Object>} 인기 메뉴 TOP3
 */
async function getPopularMenus() {
  const hour = new Date().getHours();
  const [startHour, endHour] = resolveTimeRange(hour);

  const result = await menuRepository.findTop3ByTimeRange(startHour, endHour);

  const top3 = result.map(({ menuId, menuName }) => ({ menuId, menuName }));
  return { top3 };
}

/**
 * 현재 시각(시)을 기준으로 시간대 범위를 결정한다.
 *
 * @param {number} hour - 현재 시각의 시 (0~23)
 * @returns {[number, number]} [시작시, 종료시]
 */
function resolveTimeRange(hour) {
  if (hour >= 6 && hour <= 10)  return [6, 10];   // 아침
  if (hour >= 11 && hour <= 13) return [11, 13];  // 점심
  if (hour >= 14 && hour <= 17) return [14, 17];  // 오후
  if (hour >= 18 && hour <= 21) return [18, 21];  // 저녁
  if (hour >= 22)               return [22, 23];  // 야간 (전반)
  return [0, 5];                                  // 야간 (후반, 0~5시)
}

module.exports = { getAllMenus, getPopularMenus };
