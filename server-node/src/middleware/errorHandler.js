// 전역 에러 핸들러 미들웨어
// 컨트롤러에서 next(err)로 전달된 에러를 일관된 JSON 형태로 응답한다.

/**
 * Express 에러 핸들링 미들웨어 (파라미터 4개 필수)
 */
function errorHandler(err, req, res, next) {
  console.error('[서버 에러]', err.message);

  // MySQL 중복 키 에러 (번호판 중복 등)
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      status: 409,
      message: '이미 등록된 번호판입니다.',
      timestamp: new Date().toISOString(),
    });
  }

  // 그 외 서버 내부 오류
  res.status(500).json({
    status: 500,
    message: '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    timestamp: new Date().toISOString(),
  });
}

module.exports = errorHandler;
