try:
    import truststore
    truststore.inject_into_ssl()
except Exception:
    pass

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.schemas import HealthResponse
from app.routers import chat

app = FastAPI(
    title=settings.app_name,
    description="Microservice AI Chatbot hỗ trợ khách hàng và tư vấn cấu hình PC sử dụng PydanticAI & Gemini LLM",
    version="0.1.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat.router)


@app.get("/", tags=["General"])
async def root():
    return {
        "service": settings.app_name,
        "status": "running",
        "docs_url": "/docs",
    }


@app.get("/health", response_model=HealthResponse, tags=["General"])
async def health_check() -> HealthResponse:
    """Service health check endpoint."""
    active_model = settings.deepseek_model if settings.ai_provider == "deepseek" else settings.gemini_model
    has_key = bool(settings.deepseek_api_key) if settings.ai_provider == "deepseek" else bool(settings.gemini_api_key)
    return HealthResponse(
        status="ok",
        app_name=settings.app_name,
        gemini_model=active_model,
        api_key_configured=has_key,
        catalog_api_url=settings.catalog_api_base_url,
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
    )
