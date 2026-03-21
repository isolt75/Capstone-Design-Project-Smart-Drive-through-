// 주문 레포지토리
// DT_TB_ODR 테이블에 대한 DB 쿼리를 담당한다.
// 주문 1건의 여러 항목은 ODR_TIME이 동일한 여러 행으로 저장된다.

const pool = require('../config/db');

/**
 * 주문 항목들을 저장한다.
 * 동일한 주문 시간을 공유해 하나의 주문 묶음을 표현한다.
 *
 * @param {number} custNum - 고객 번호
 * @param {Array<{menuId, quantity}>} items - 주문 항목 목록
 * @returns {Promise<Date>} 저장된 주문 시간
 */
async function saveOrder(custNum, items) {
  // 동일 주문 묶음을 위해 주문 시간을 고정
  const orderTime = new Date();

  // 여러 항목을 한 번의 쿼리로 일괄 삽입
  const values = items.map((item) => [custNum, orderTime, item.menuId, item.quantity]);
  await pool.query(
    'INSERT INTO DT_TB_ODR (CUST_NUM, ODR_TIME, MENU_NUM, MENU_CNT) VALUES ?',
    [values]
  );

  return orderTime;
}

/**
 * 특정 고객의 마지막 주문 항목 목록을 조회한다.
 * DT_TB_MENU와 JOIN해 메뉴 이름도 함께 반환한다.
 *
 * @param {number} custNum - 고객 번호
 * @returns {Promise<Array>} 마지막 주문 항목 목록
 */
async function findLastOrderItemsByCustNum(custNum) {
  const [rows] = await pool.query(
    `SELECT o.MENU_NUM  AS menuId,
            m.MENU_NM   AS menuName,
            o.MENU_CNT  AS quantity
     FROM DT_TB_ODR o
     JOIN DT_TB_MENU m ON m.MENU_NUM = o.MENU_NUM
     WHERE o.CUST_NUM = ?
       AND o.ODR_TIME = (
         SELECT MAX(ODR_TIME) FROM DT_TB_ODR WHERE CUST_NUM = ?
       )`,
    [custNum, custNum]
  );
  return rows;
}

module.exports = { saveOrder, findLastOrderItemsByCustNum };
