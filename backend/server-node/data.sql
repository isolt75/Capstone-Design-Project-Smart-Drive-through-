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
  MENU_PRICE INT        NOT NULL,                             -- 메뉴 가격
  MENU_CATEGORY VARCHAR(30) NOT NULL,                         -- 메뉴 카테고리
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
INSERT IGNORE INTO DT_TB_MENU (MENU_NUM, MENU_NM, MENU_PRICE, MENU_CATEGORY, CAF_YN) VALUES
  (1,  '아메리카노',       3000, '커피',          'Y'),
  (2,  '콜드브루',         4500, '커피',          'Y'),
  (3,  '카라멜 마키아또',   4000, '커피',          'Y'),
  (4,  '카푸치노',         4000, '커피',          'Y'),
  (5,  '카페모카',         4000, '커피',          'Y'),
  (6,  '카페라떼',         4000, '커피',          'Y'),
  -- 아이스 블렌디드
  (7,  '자바칩 프라페',    4000, '아이스 블렌디드', 'Y'),
  (8,  '밀크쉐이크',       4000, '아이스 블렌디드', 'N'),
  (9,  '딸기요거트스무디',  4500, '아이스 블렌디드', 'N'),
  (10, '망고요거트스무디',  4500, '아이스 블렌디드', 'N'),
  -- 에이드, 주스
  (11, '레몬에이드',       3500, '에이드, 주스',   'N'),
  (12, '오렌지주스',       3000, '에이드, 주스',   'N'),
  (13, '라임모히또에이드',  3500, '에이드, 주스',   'N'),
  -- 티
  (14, '녹차',            2500, '티',            'Y'),
  (15, '자몽허니블랙티',    4000, '티',            'Y'),
  (16, '아이스티',         2000, '티',            'Y'),
  (17, '말차라떼',         3500, '티',            'Y'),
  (18, '초코라떼',         3000, '티',            'N'),
  (19, '우유',            2000, '티',            'N');
  
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
