// MySQL 연결 풀 설정
// mysql2/promise를 사용해 async/await 방식으로 쿼리를 실행한다.

const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  charset: 'utf8mb4',        // 한글 지원
  timezone: '+09:00',        // 한국 시간대
  waitForConnections: true,
  connectionLimit: 10,       // 최대 동시 연결 수
  queueLimit: 0,
});

module.exports = pool;
