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

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
