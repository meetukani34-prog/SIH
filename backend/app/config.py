"""
AyurCTMS — Application Configuration
Loaded from environment variables via Pydantic Settings.
"""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/ayurctms"

    # JWT
    JWT_SECRET_KEY: str = "dev-secret-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 480

    # Master Security Credentials (loaded from .env)
    SUPERADMIN_MASTER_KEY: str = ""
    DEFAULT_USER_PASSWORD: str = ""

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    # App
    APP_NAME: str = "AyurCTMS"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # SAE Reporting Deadline (hours)
    SAE_REPORTING_DEADLINE_HOURS: int = 24

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
