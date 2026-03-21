// 테이블 스키마 정의
// 실제 DB 테이블 구조를 문서화한다.

/**
 * DT_TB_CUST - 고객 테이블
 *   CUST_NUM  INT         PK, AUTO_INCREMENT  고객 번호
 *   CUST_NM   VARCHAR(10) NOT NULL            고객 이름
 *   CAR_NUM   VARCHAR(20) NOT NULL UNIQUE      차량 번호
 *
 * DT_TB_MENU - 메뉴 테이블
 *   MENU_NUM  INT         PK, AUTO_INCREMENT  메뉴 번호
 *   MENU_NM   VARCHAR(30) NOT NULL            메뉴 이름
 *   CAF_YN    VARCHAR(1)  NOT NULL            카페인 유무 (Y/N)
 *
 * DT_TB_ODR - 주문 테이블 (주문 항목별 1행)
 *   ODR_NM    INT         PK, AUTO_INCREMENT  주문 번호
 *   CUST_NUM  INT         NOT NULL FK         고객 번호
 *   ODR_TIME  DATETIME    NOT NULL            주문 시간
 *   MENU_NUM  INT         NOT NULL FK         메뉴 번호
 *   MENU_CNT  INT         NOT NULL            메뉴 수량
 */

module.exports = {};
