# Smart Drive-through Main Server

라즈베리파이 엣지 서버(`smart_kiosk_rpi_server`)와 연동되는 **메인 서버 + 키오스크/직원 웹**.

```
엣지(RPi)  ──HTTPS multipart──▶  backend (FastAPI)  ──REST──▶  frontend (Vue 키오스크/POS)
 번호판 OCR / 음성 STT            MySQL(dt_database)            차량인식→추천→주문→직원화면
```

- `backend/` — FastAPI + SQLAlchemy + MySQL. 엣지 수신(`/api/v1/...`) + 키오스크 API(`/api/...`)
  + 재방문 개인화 추천. 실행법은 [`backend/README.md`](backend/README.md).
- `frontend/` — Vue 3 + Vite (기존 dtWeb 재사용). `npm install && npm run dev` → http://localhost:5173

## 빠른 시작
1. MySQL 8.0 기동 + `CREATE DATABASE dt_database;`
2. backend: venv → `pip install -r requirements.txt` → `python seed.py` → `uvicorn app.main:app --port 8000`
3. frontend: `npm install` → `npm run dev`
4. 브라우저에서 http://localhost:5173 접속 → 키오스크 흐름 확인
