import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment or .env file."""

    app_name: str = "eShop AI Support Service"
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = True

    # AI Provider: "deepseek" or "google"
    ai_provider: str = "deepseek"

    # DeepSeek API Configuration
    deepseek_api_key: str = "sk-fd0e0985a71c4ae5ae245a12ecf8212f"
    deepseek_base_url: str = "https://api.deepseek.com"
    deepseek_model: str = "deepseek-flash"

    # Google Gemini API Settings (legacy/fallback)
    gemini_api_key: str = ""
    google_api_key: str = ""
    gemini_model: str = "google:gemini-3.6-flash"

    # Catalog API Service URL
    catalog_api_base_url: str = "http://localhost:5222"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()

# Support both GEMINI_API_KEY and GOOGLE_API_KEY environment variables
effective_gemini_key = settings.gemini_api_key or settings.google_api_key
if effective_gemini_key:
    os.environ["GEMINI_API_KEY"] = effective_gemini_key
    os.environ["GOOGLE_API_KEY"] = effective_gemini_key
if settings.deepseek_api_key:
    os.environ["DEEPSEEK_API_KEY"] = settings.deepseek_api_key
