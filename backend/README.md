# Main Server (FastAPI)

스마트 드라이브스루 메인 서버. 엣지(라즈베리파이)가 보낸 번호판/음성을 받아 저장하고,
키오스크에 메뉴·재방문 개인화 추천을 제공하며, 주문을 직원 POS 대기열로 흘려보낸다.

## 실행

```powershell
# 1) 가상환경 + 의존성
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

# 2) 환경변수
copy .env.example .env   # DB 비밀번호/Clova 키 필요 시 수정

# 3) DB 준비 (MySQL 8.0 실행 중이어야 함)
#    dt_database 가 없으면:  CREATE DATABASE dt_database;
python seed.py           # 테이블 생성 + 메뉴19/샘플 적재

# 4) 서버 기동
uvicorn app.main:app --reload --port 8000
#    문서: http://localhost:8000/docs
```

## 엔드포인트

### 프론트(키오스크/직원) — `/api/...`
| Method | Path | 설명 |
|---|---|---|
| GET | `/api/menus` | 전체 메뉴 |
| GET | `/api/popular` | 현재 시간대 인기 TOP3 |
| GET | `/api/recommend?plate=` | 개인화(이력 있음)/시간대 인기 |
| GET | `/api/menus/{id}` | 메뉴 단건 |
| GET | `/api/customer?plate=` | 고객 조회(신규/재방문+최근주문) |
| GET | `/api/ocr/latest` | 최근 인식 번호판 |
| POST | `/api/orders` | 주문 생성 |
| GET | `/api/orders/waiting` | 직원 대기 주문 |
| POST | `/api/orders/{no}/done` | 주문 완료 처리 |
| POST | `/api/stt` | 오디오→텍스트(Clova) |

### 엣지 수신 — `/api/v1/...` (SRS §4)
| Method | Path |
|---|---|
| POST | `/api/v1/drivethrough/vehicle-entry` |
| POST | `/api/v1/drivethrough/voice-order` |
| POST | `/api/v1/edge/heartbeat` |

엣지 `.env` 에서 `EDGE_API_BASE_URL=http://<서버IP>:8000/api/v1` 로 설정하면 연동 완료.
