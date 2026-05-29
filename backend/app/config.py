"""중앙 설정 (.env 로드 + pydantic 검증).

비밀키/DB URL은 모두 환경변수로 관리한다(하드코딩 금지).
"""

from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # --- Database ---
    db_url: str = "mysql+pymysql://root:1234@127.0.0.1:3306/dt_database?charset=utf8mb4"

    # --- CORS ---
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    # --- Edge uploads ---
    upload_dir: str = "./uploads"

    # --- Clova Speech (STT) ---
    clova_invoke_url: str = ""
    clova_secret_key: str = ""
    clova_language: str = "Kor"

    # --- Clova Studio (HyperCLOVA X, 추천 LLM) ---
    # STT 와는 별개 제품/키. 비어 있으면 추천이 DB 휴리스틱으로 폴백된다.
    clova_studio_api_key: str = ""
    clova_studio_url: str = (
        "https://clovastudio.stream.ntruss.com/testapp/v1/chat-completions/HCX-003"
    )

    # --- 신선도 윈도우 ---
    # /ocr/latest, /voice/latest 가 이 시간(초) 안의 이벤트만 "현재 차량"으로 본다.
    # 지나면 빈 응답 → 키오스크 헤더가 "IoT cafe" 로 되돌아감.
    # Pi 가 VEHICLE_DEPARTED 를 백엔드로 보내지 않는 PoC 단계에선 이게 가장 단순한 방법.
    edge_event_freshness_sec: int = 60

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
