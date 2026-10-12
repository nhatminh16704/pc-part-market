from typing import Any, Dict
from fastapi import APIRouter, HTTPException, status
from app.config import settings
from app.schemas import ChatRequest, ChatResponse, ProductSearchQuery
from app.agent import support_agent, execute_product_search, ChatDeps

router = APIRouter(prefix="/api/chat", tags=["Chat"])


@router.post("", response_model=ChatResponse)
async def chat_with_agent(request: ChatRequest) -> ChatResponse:
    """
    Chat endpoint communicating with the PydanticAI Agent (DeepSeek / Gemini).
    The agent autonomously decides when to invoke the `search_products` tool
    to query the Catalog API with structured schemas (keyword, category, brand, price, specs).
    """
    has_key = (
        (settings.ai_provider == "deepseek" and bool(settings.deepseek_api_key))
        or bool(settings.gemini_api_key)
    )
    active_model = settings.deepseek_model if settings.ai_provider == "deepseek" else settings.gemini_model

    if not has_key:
        return ChatResponse(
            reply=(
                "[Placeholder] Chưa cấu hình API Key trong file .env. "
                "Vui lòng thiết lập DEEPSEEK_API_KEY hoặc GEMINI_API_KEY để bắt đầu."
            ),
            session_id=request.session_id,
            model=active_model,
            products=[],
        )

    try:
        # Run agent with PydanticAI and ChatDeps to collect matched products
        deps = ChatDeps()
        result = await support_agent.run(request.message, deps=deps)
        reply_content = getattr(result, "output", getattr(result, "data", str(result)))

        # Format products for UI cards (limit to top 6 relevant items)
        cards = deps.retrieved_products[:6]

        return ChatResponse(
            reply=str(reply_content),
            session_id=request.session_id,
            model=active_model,
            products=cards,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi tương tác với Agent: {str(e)}",
        )


@router.post("/search", response_model=Dict[str, Any])
async def search_catalog_products(query: ProductSearchQuery) -> Dict[str, Any]:
    """
    Directly execute product search against Catalog Service with structured schema:
    keyword, category, brand, min_price, max_price, and specs.
    """
    return await execute_product_search(query)
