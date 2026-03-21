// 스마트 드라이브스루 API 서버 진입점
// Express 앱을 초기화하고 미들웨어, 라우터, 에러 핸들러를 등록한다.

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const apiRouter = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 8080;

// ─── 미들웨어 ───────────────────────────────────────────────
// CORS: 모든 오리진 허용 (라즈베리파이 등 다른 디바이스에서 호출 가능)
app.use(cors());

// JSON 요청 본문 파싱
app.use(express.json());

// ─── 라우터 ─────────────────────────────────────────────────
app.use('/api', apiRouter);

// ─── 에러 핸들러 ─────────────────────────────────────────────
// 반드시 라우터 등록 이후에 위치해야 한다.
app.use(errorHandler);

// ─── 서버 시작 ───────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});
