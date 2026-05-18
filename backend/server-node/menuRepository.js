// 메뉴 레포지토리
// DT_TB_MENU 테이블에 대한 DB 쿼리를 담당한다.

const pool = require('../config/db');

/**
 * 전체 메뉴 목록을 조회한다.
 * @returns {Promise<Array>} 메뉴 목록
 */
async function findAll() {
  const [rows] = await pool.query(
    'SELECT MENU_NUM AS menuId, MENU_NM AS menuName, MENU_PRICE AS price, MENU_CATEGORY AS category, CAF_YN AS caffeine FROM DT_TB_MENU ORDER BY MENU_NUM',
  );
  return rows;
}

/**
 * 특정 시간대의 인기 메뉴 TOP3를 조회한다.
 * DT_TB_ODR을 집계해 해당 시간대에 가장 많이 주문된 메뉴를 반환한다.
 *
 * @param {number} startHour - 시간대 시작 (0~23)
 * @param {number} endHour   - 시간대 종료 (0~23)
 * @returns {Promise<Array>} 인기 메뉴 TOP3
 */
async function findTop3ByTimeRange(startHour, endHour) {
  const [rows] = await pool.query(
    `SELECT o.MENU_NUM AS menuId, m.MENU_NM AS menuName, SUM(o.MENU_CNT) AS totalCount
     FROM DT_TB_ODR o
     JOIN DT_TB_MENU m ON m.MENU_NUM = o.MENU_NUM
     WHERE HOUR(o.ODR_TIME) BETWEEN ? AND ?
     GROUP BY o.MENU_NUM, m.MENU_NM
     ORDER BY totalCount DESC
     LIMIT 3`,
    [startHour, endHour],
  );
  return rows;
}

module.exports = { findAll, findTop3ByTimeRange };
