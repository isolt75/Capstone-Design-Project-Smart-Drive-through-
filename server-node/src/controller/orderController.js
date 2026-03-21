// 주문 컨트롤러
// POST /api/order

const orderService = require('../service/orderService');

/**
 * 주문을 처리한다.
 * 신규 고객이면 자동 등록되며, OrderLog에 주문 내역이 저장된다.
 */
async function placeOrder(req, res, next) {
  try {
    const { plate, customerName, items } = req.body;

    // 필수 필드 검증
    if (!plate || !customerName || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        status: 400,
        message: '요청 본문이 올바르지 않습니다. plate, customerName, items 는 필수입니다.',
      });
    }

    const result = await orderService.placeOrder(plate, customerName, items);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { placeOrder };
