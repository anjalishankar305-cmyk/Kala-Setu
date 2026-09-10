from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "KalaSetu"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    DATABASE_URL: str = "sqlite+aiosqlite:///./kalasetu.db"
    
    # Upload directories
    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000"

    @property
    def UPLOAD_DIR(self) -> Path:
        return self.BASE_DIR / "uploads"

    @property
    def RAW_DIR(self) -> Path:
        return self.UPLOAD_DIR / "raw"

    @property
    def PROCESSED_DIR(self) -> Path:
        return self.UPLOAD_DIR / "processed"

    @property
    def AUDIO_DIR(self) -> Path:
        return self.UPLOAD_DIR / "audio"

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    model_config = SettingsConfigDict(
        env_file=str(Path(__file__).resolve().parent.parent / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()

# Ensure directories exist
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
settings.RAW_DIR.mkdir(parents=True, exist_ok=True)
settings.PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
settings.AUDIO_DIR.mkdir(parents=True, exist_ok=True)
