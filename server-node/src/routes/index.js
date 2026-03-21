// 라우터 설정
// 각 엔드포인트를 컨트롤러 함수에 연결한다.

const express = require('express');
const router = express.Router();

const customerController = require('../controller/customerController');
const orderController = require('../controller/orderController');
const menuController = require('../controller/menuController');

// 고객 조회: GET /api/customer?plate={번호판}
router.get('/customer', customerController.getCustomer);

// 주문 처리: POST /api/order
router.post('/order', orderController.placeOrder);

// 전체 메뉴: GET /api/menus
router.get('/menus', menuController.getAllMenus);

// 인기 메뉴 TOP3: GET /api/popular
router.get('/popular', menuController.getPopularMenus);

module.exports = router;
