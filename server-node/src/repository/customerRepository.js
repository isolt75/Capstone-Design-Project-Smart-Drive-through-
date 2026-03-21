// 고객 레포지토리
// DT_TB_CUST 테이블에 대한 DB 쿼리를 담당한다.

const pool = require('../config/db');

/**
 * 차량 번호로 고객을 조회한다.
 * @param {string} carNum - 차량 번호
 * @returns {Promise<Object|null>} 고객 정보 또는 null
 */
async function findByCarNum(carNum) {
  const [rows] = await pool.query(
    'SELECT CUST_NUM, CUST_NM, CAR_NUM FROM DT_TB_CUST WHERE CAR_NUM = ?',
    [carNum]
  );
  return rows[0] || null;
}

/**
 * 신규 고객을 등록한다.
 * @param {string} custNm - 고객 이름
 * @param {string} carNum - 차량 번호
 * @returns {Promise<number>} 생성된 CUST_NUM
 */
async function save(custNm, carNum) {
  const [result] = await pool.query(
    'INSERT INTO DT_TB_CUST (CUST_NM, CAR_NUM) VALUES (?, ?)',
    [custNm, carNum]
  );
  return result.insertId;
}

module.exports = { findByCarNum, save };
