// 고객 조회 서비스
// 차량 번호로 기존 고객 여부를 판별하고, 마지막 주문 내역을 함께 반환한다.

const customerRepository = require('../repository/customerRepository');
const orderLogRepository = require('../repository/orderLogRepository');

/**
 * 차량 번호로 고객을 조회한다.
 *
 * @param {string} plate - 차량 번호 (예: "01가 0785")
 * @returns {Promise<Object>} 기존 고객이면 고객 정보 + 마지막 주문, 신규이면 { isNew: true }
 */
async function findByPlate(plate) {
  const customer = await customerRepository.findByCarNum(plate);

  // 신규 고객: 차량 번호가 DB에 없는 경우
  if (!customer) {
    return { isNew: true };
  }

  // 마지막 주문 항목 조회 (주문 내역이 없으면 빈 배열)
  const lastOrder = await orderLogRepository.findLastOrderItemsByCustNum(customer.CUST_NUM);

  return {
    isNew: false,
    customerId: customer.CUST_NUM,
    customerName: customer.CUST_NM,
    plate: customer.CAR_NUM,
    lastOrder,
  };
}

module.exports = { findByPlate };
