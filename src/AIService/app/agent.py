import os
from typing import Any, Dict, Optional
import httpx
from pydantic_ai import Agent, RunContext
from app.config import settings
from app.schemas import ProductSearchQuery

from pydantic_ai.models.openai import OpenAIChatModel
from pydantic_ai.providers.openai import OpenAIProvider

# Ensure API keys are in environment
if settings.deepseek_api_key:
    os.environ["DEEPSEEK_API_KEY"] = settings.deepseek_api_key
effective_gemini = settings.gemini_api_key or settings.google_api_key
if effective_gemini:
    os.environ["GEMINI_API_KEY"] = effective_gemini
    os.environ["GOOGLE_API_KEY"] = effective_gemini


def resolve_model():
    """Create and return the active LLM model (DeepSeek or Google Gemini)."""
    if settings.ai_provider == "deepseek" and settings.deepseek_api_key:
        provider = OpenAIProvider(
            base_url=settings.deepseek_base_url,
            api_key=settings.deepseek_api_key,
        )
        # DeepSeek V4.1-Flash (non-thinking model)
        return OpenAIChatModel(settings.deepseek_model, provider=provider)

    name = settings.gemini_model
    if not name:
        return "google:gemini-3.6-flash"
    if name.startswith("google-gla:"):
        return f"google:{name.removeprefix('google-gla:')}"
    if name.startswith("gemini-"):
        return f"google:{name}"
    return name


SYSTEM_PROMPT = """
Bạn là Trợ lý AI tư vấn linh kiện máy tính chuyên nghiệp tại eShop PC.

NHIỆM VỤ:
1. Giải đáp thắc mắc về linh kiện PC: CPU, VGA, Mainboard, RAM, SSD, Nguồn (PSU), Case, Tản nhiệt, Màn hình.
2. Khi khách cần tìm kiếm linh kiện hoặc tư vấn mua sắm: Luôn gọi tool `search_products` để lấy dữ liệu thực tế từ kho Catalog.

QUY TẮC PHẢN HỒI KHI TRẢ KẾT QUẢ TÌM KIẾM:
- Giao diện đã tự động hiển thị danh sách thẻ card sản phẩm trực quan không cần liệt kê lặp lại danh sách sản phẩm hay giá tiền.
- Trả lời ngắn gọn:
  + Thông báo vắn tắt đã tìm thấy các mẫu phù hợp.
  + NẾU khách có đề cập use-case cụ thể (như chơi game, làm đồ họa, render video, lập trình, văn phòng...): Tư vấn ngắn gọn mẫu tối ưu nhất từ danh sách.
- Nếu không tìm thấy sản phẩm trong kho: Báo ngắn gọn và gợi ý từ khóa hoặc model thay thế tương đương.
""".strip()


from dataclasses import dataclass, field


@dataclass
class ChatDeps:
    """Dependencies passed into the agent run to collect tool execution context."""
    retrieved_products: list[dict[str, Any]] = field(default_factory=list)


# Initialize Pydantic AI Agent with configured model and dependencies
support_agent = Agent(
    model=resolve_model(),
    system_prompt=SYSTEM_PROMPT,
    deps_type=ChatDeps,
)


async def execute_product_search(query: ProductSearchQuery) -> Dict[str, Any]:
    """
    Directly query the Catalog Service backend API for products matching the search query.
    """
    url = f"{settings.catalog_api_base_url.rstrip('/')}/api/catalog/products/search"
    payload = {
        "keyword": query.keyword,
        "category": query.category,
        "brand": query.brand,
        "minPrice": query.min_price,
        "maxPrice": query.max_price,
        "specs": {str(k): str(v) for k, v in query.specs.items()} if query.specs else None,
        "pageSize": query.page_size,
        "pageIndex": query.page_index,
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(url, json=payload)
            if response.status_code == 200:
                result_json = response.json()
                api_data = result_json.get("data", {})
                products = api_data.get("data", [])
                total = api_data.get("count", len(products))
                return {
                    "status": "success",
                    "total_found": total,
                    "products": products,
                    "query_applied": payload,
                }
            else:
                return {
                    "status": "error",
                    "status_code": response.status_code,
                    "message": f"Catalog API returned {response.status_code}: {response.text}",
                    "products": [],
                }
    except httpx.RequestError as exc:
        return {
            "status": "connection_error",
            "message": f"Không thể kết nối đến Catalog Service ({url}): {str(exc)}",
            "products": [],
            "query_applied": payload,
        }


@support_agent.tool
async def search_products(
    ctx: RunContext[ChatDeps],
    keyword: Optional[str] = None,
    category: Optional[str] = None,
    brand: Optional[str] = None,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    specs: Optional[Dict[str, Any]] = None,
    page_size: int = 8,
) -> Dict[str, Any]:
    """
    Tìm kiếm và tra cứu sản phẩm linh kiện máy tính trong cơ sở dữ liệu eShop Catalog.

    Args:
        keyword: Từ khoá hoặc tên sản phẩm cần tìm (VD: 'RTX 4070', 'Core i5 13600K', 'B760')
        category: Danh mục sản phẩm ('VGA - Card màn hình', 'CPU - Bộ vi xử lý', 'Mainboard - Bo mạch chủ', 'RAM - Bộ nhớ trong', 'Ổ cứng SSD', 'Nguồn máy tính - PSU', 'Vỏ máy tính - Case', 'Tản nhiệt - Cooling', 'Màn hình máy tính')
        brand: Thương hiệu sản phẩm (VD: 'ASUS', 'MSI', 'GIGABYTE', 'Intel', 'AMD', 'Colorful', 'Corsair', 'Kingston')
        min_price: Giá tối thiểu bằng VNĐ (VD: 5000000)
        max_price: Giá tối đa bằng VNĐ (VD: 25000000)
        specs: Thông số kỹ thuật chi tiết chuẩn hóa (VD: {'gpu_chip': 'RTX 4070', 'socket': 'AM5', 'ram_type': 'DDR5', 'wattage_w': 750, 'capacity_gb': 1000})
        page_size: Số lượng kết quả cần lấy (mặc định 8)
    """
    query = ProductSearchQuery(
        keyword=keyword,
        category=category,
        brand=brand,
        min_price=min_price,
        max_price=max_price,
        specs=specs,
        page_size=page_size,
        page_index=0,
    )
    result = await execute_product_search(query)

    # Collect retrieved products into deps for the UI to display rich product cards
    if ctx.deps is not None and result.get("status") == "success":
        for p in result.get("products", []):
            if not any(existing.get("id") == p.get("id") for existing in ctx.deps.retrieved_products):
                ctx.deps.retrieved_products.append(p)

    return result
