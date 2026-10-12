from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    """A single chat message."""
    role: str = Field(description="Role: 'user', 'assistant', or 'system'")
    content: str = Field(description="Content of the message")


class ChatRequest(BaseModel):
    """Incoming chat request."""
    message: str = Field(..., description="User question or message")
    session_id: Optional[str] = Field(None, description="Optional session or conversation ID")
    history: Optional[List[ChatMessage]] = Field(default=[], description="Previous conversation turns")


class ChatResponse(BaseModel):
    """Outgoing chat response."""
    reply: str = Field(..., description="Agent reply message")
    session_id: Optional[str] = Field(None, description="Session or conversation ID")
    model: str = Field(..., description="LLM model used")
    extracted_search: Optional[Dict[str, Any]] = Field(None, description="Extracted search parameters if tool was called")
    products: Optional[List[Dict[str, Any]]] = Field(default=[], description="List of matched products with details for UI cards")


class ProductSearchQuery(BaseModel):
    """Schema for searching products in eShop Catalog."""
    keyword: Optional[str] = Field(None, description="Tên sản phẩm, mã hoặc từ khoá tìm kiếm chung (VD: 'RTX 4080', 'i5 13600K', 'B760')")
    category: Optional[str] = Field(None, description="Tên hoặc slug danh mục sản phẩm (VD: 'VGA - Card màn hình', 'CPU - Bộ vi xử lý', 'Mainboard - Bo mạch chủ', 'RAM - Bộ nhớ trong', 'Ổ cứng SSD', 'Nguồn máy tính - PSU', 'Vỏ máy tính - Case')")
    brand: Optional[str] = Field(None, description="Hãng sản xuất (VD: 'ASUS', 'MSI', 'GIGABYTE', 'Intel', 'AMD', 'Colorful', 'Corsair', 'Kingston')")
    min_price: Optional[int] = Field(None, description="Mức giá tối thiểu bằng VNĐ (VD: 5000000)")
    max_price: Optional[int] = Field(None, description="Mức giá tối đa bằng VNĐ (VD: 25000000)")
    specs: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Dictionary thông số kỹ thuật chuẩn hóa, ví dụ: {'gpu_chip': 'RTX 4080', 'vram_gb': '16', 'socket': 'AM5', 'ram_type': 'DDR5', 'capacity_gb': '32', 'wattage_w': '750'}"
    )
    page_size: int = Field(default=8, description="Số lượng kết quả lấy ra mỗi trang")
    page_index: int = Field(default=0, description="Số thứ tự trang (bắt đầu từ 0)")


class ProductSearchItem(BaseModel):
    """Individual product search result item."""
    id: str
    name: str
    seo_name: str
    brand: Optional[str] = None
    category: Optional[str] = None
    price: int = 0
    quantity: int = 0
    image_url: Optional[str] = None
    specifications: Optional[str] = None
    specs_normalized: Optional[str] = None
    description: Optional[str] = None
    status: str = "ACTIVE"


class ProductSearchResult(BaseModel):
    """Paginated product search response from Catalog API."""
    page_index: int
    page_size: int
    count: int
    data: List[ProductSearchItem] = []


class HealthResponse(BaseModel):
    """Service health response."""
    status: str = "ok"
    app_name: str
    gemini_model: str
    api_key_configured: bool
    catalog_api_url: str
