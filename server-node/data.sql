-- 스마트 드라이브스루 샘플 데이터
-- MySQL에서 실행: mysql -u root -p smart_drive < data.sql

-- ─── 테이블 생성 ────────────────────────────────────────────────

-- 고객 테이블
CREATE TABLE IF NOT EXISTS DT_TB_CUST (
  CUST_NUM INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,  -- 고객 번호
  CUST_NM  VARCHAR(10)  NOT NULL,                             -- 고객 이름
  CAR_NUM  VARCHAR(20)  NOT NULL UNIQUE                       -- 차량 번호
);

-- 메뉴 테이블
CREATE TABLE IF NOT EXISTS DT_TB_MENU (
  MENU_NUM INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,  -- 메뉴 번호
  MENU_NM  VARCHAR(30)  NOT NULL,                             -- 메뉴 이름
  CAF_YN   VARCHAR(1)   NOT NULL                              -- 카페인 유무 (Y/N)
);

-- 주문 테이블 (주문 1건당 메뉴 항목별로 1행씩 저장)
CREATE TABLE IF NOT EXISTS DT_TB_ODR (
  ODR_NM   INT      NOT NULL AUTO_INCREMENT PRIMARY KEY,  -- 주문 번호
  CUST_NUM INT      NOT NULL,                             -- 고객 번호 (FK)
  ODR_TIME DATETIME NOT NULL,                             -- 주문 시간
  MENU_NUM INT      NOT NULL,                             -- 메뉴 번호 (FK)
  MENU_CNT INT      NOT NULL,                             -- 메뉴 수량
  FOREIGN KEY (CUST_NUM) REFERENCES DT_TB_CUST(CUST_NUM),
  FOREIGN KEY (MENU_NUM) REFERENCES DT_TB_MENU(MENU_NUM)
);

-- ─── 메뉴 샘플 데이터 ──────────────────────────────────────────
INSERT IGNORE INTO DT_TB_MENU (MENU_NUM, MENU_NM, CAF_YN) VALUES
  (1,  '뜨거운 아메리카노',    'Y'),
  (2,  '차가운 아메리카노',    'Y'),
  (3,  '뜨거운 라떼',         'Y'),
  (4,  '차가운 라떼',         'Y'),
  (5,  '뜨거운 바닐라라떼',   'Y'),
  (6,  '차가운 바닐라라떼',   'Y'),
  (7,  '뜨거운 카푸치노',     'Y'),
  (8,  '뜨거운 카라멜마키아토','Y'),
  (9,  '차가운 카라멜마키아토','Y'),
  (10, '초코라떼',            'N'),
  (11, '녹차라떼',            'N'),
  (12, '딸기라떼',            'N');

-- ─── 샘플 고객 데이터 ──────────────────────────────────────────
INSERT IGNORE INTO DT_TB_CUST (CUST_NUM, CUST_NM, CAR_NUM) VALUES
  (1, '김민준', '01가 0785'),
  (2, '이서연', '23나 1234');

-- ─── 샘플 주문 데이터 (고객 1의 주문) ─────────────────────────
INSERT IGNORE INTO DT_TB_ODR (ODR_NM, CUST_NUM, ODR_TIME, MENU_NUM, MENU_CNT) VALUES
  (1, 1, DATE_SUB(NOW(), INTERVAL 1 HOUR), 1, 2),
  (2, 1, DATE_SUB(NOW(), INTERVAL 1 HOUR), 4, 1);

-- ─── 샘플 주문 데이터 (고객 2의 주문) ─────────────────────────
INSERT IGNORE INTO DT_TB_ODR (ODR_NM, CUST_NUM, ODR_TIME, MENU_NUM, MENU_CNT) VALUES
  (3, 2, DATE_SUB(NOW(), INTERVAL 2 HOUR), 3, 1),
  (4, 2, DATE_SUB(NOW(), INTERVAL 2 HOUR), 1, 1);
