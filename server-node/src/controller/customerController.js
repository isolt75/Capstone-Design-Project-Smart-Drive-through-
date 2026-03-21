// 고객 조회 컨트롤러
// GET /api/customer?plate={번호판}

const customerService = require('../service/customerService');

/**
 * 번호판으로 고객을 조회한다.
 * 기존 고객이면 고객 정보와 마지막 주문 내역을 반환하고,
 * 신규 고객이면 isNew: true 만 반환한다.
 */
async function getCustomer(req, res, next) {
  try {
    const { plate } = req.query;

    // 필수 파라미터 검증
    if (!plate) {
      return res.status(400).json({ status: 400, message: '필수 파라미터가 없습니다: plate' });
    }

    const result = await customerService.findByPlate(plate);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { getCustomer };
