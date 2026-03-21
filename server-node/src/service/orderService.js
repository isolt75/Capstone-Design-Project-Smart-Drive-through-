// 주문 처리 서비스
// 주문 완료 시 DT_TB_ODR에 저장하고, 신규 고객이면 DT_TB_CUST에도 자동 등록한다.

const customerRepository = require('../repository/customerRepository');
const orderLogRepository = require('../repository/orderLogRepository');

/**
 * 주문을 처리한다.
 * 1. 차량 번호로 고객을 조회한다.
 * 2. 신규 고객이면 자동 등록한다.
 * 3. DT_TB_ODR에 주문 항목을 저장한다.
 *
 * @param {string} plate        - 차량 번호
 * @param {string} customerName - 고객 이름
 * @param {Array<{menuId, menuName, quantity}>} items - 주문 항목 목록
 * @returns {Promise<Object>} 성공 여부, 고객 ID, 주문 시각
 */
async function placeOrder(plate, customerName, items) {
  // 기존 고객 조회
  let customer = await customerRepository.findByCarNum(plate);
  let custNum;

  if (customer) {
    // 기존 고객
    custNum = customer.CUST_NUM;
  } else {
    // 신규 고객 자동 등록
    custNum = await customerRepository.save(customerName, plate);
  }

  // 주문 항목 저장 (menuId 기준으로 저장)
  const orderItems = items.map((item) => ({ menuId: item.menuId, quantity: item.quantity }));
  const orderTime = await orderLogRepository.saveOrder(custNum, orderItems);

  return {
    success: true,
    customerId: custNum,
    orderTime,
  };
}

module.exports = { placeOrder };
