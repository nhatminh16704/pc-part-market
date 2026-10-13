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
    """Cấu trúc tham số tìm kiếm sản phẩm linh kiện PC trong eShop Catalog."""
    keyword: Optional[str] = Field(
        default=None,
        description="Tên sản phẩm hoặc từ khoá tìm kiếm chung (VD: 'RTX 4060', 'i5 13400F', 'B760M', '980 Pro')"
    )
    category: Optional[str] = Field(
        default=None,
        description="Tên danh mục sản phẩm ('VGA - Card màn hình', 'CPU - Bộ vi xử lý', 'Mainboard - Bo mạch chủ', 'RAM - Bộ nhớ trong', 'Ổ cứng SSD', 'Nguồn máy tính - PSU', 'Vỏ máy tính - Case', 'Tản nhiệt - Cooling', 'Màn hình máy tính')"
    )
    brand: Optional[str] = Field(
        default=None,
        description="Hãng sản xuất (VD: 'ASUS', 'MSI', 'GIGABYTE', 'Intel', 'AMD', 'Colorful', 'Corsair', 'Kingston')"
    )
    min_price: Optional[int] = Field(
        default=None,
        description="Mức giá tối thiểu bằng VNĐ (VD: 5000000)"
    )
    max_price: Optional[int] = Field(
        default=None,
        description="Mức giá tối đa bằng VNĐ (VD: 25000000)"
    )
    specs: Optional[Dict[str, Any]] = Field(
        default=None,
        description=(
            "Dictionary bộ lọc thông số kỹ thuật chuẩn hóa theo danh mục:\n"
            "- VGA: gpu_chip ('RTX 4060', 'RTX 3060'), vram_gb (8, 12, 16), recommended_psu_w (550, 650, 750)\n"
            "- CPU: cpu_vendor ('Intel', 'AMD'), series ('Core i5', 'Ryzen 7'), socket ('LGA1700', 'AM5'), cores (6, 8, 14), has_igpu (true/false)\n"
            "- Mainboard: socket ('LGA1700', 'AM5'), chipset ('B760', 'B650', 'Z790'), ram_type ('DDR4', 'DDR5'), form_factor ('ATX', 'mATX'), wifi (true/false)\n"
            "- RAM: ram_type ('DDR4', 'DDR5'), capacity_gb (8, 16, 32), speed_mhz (3200, 5600, 6000)\n"
            "- SSD: capacity_gb (500, 1000, 2000), form_factor ('M.2 2280'), interface ('PCIe 4.0')\n"
            "- PSU: wattage_w (550, 650, 750, 850), efficiency ('80 Plus Bronze', '80 Plus Gold'), modular ('Full-Modular')\n"
            "- Monitor: screen_inch (24, 27, 32), resolution ('FHD', '2K', '4K'), refresh_hz (144, 165, 240), panel ('IPS', 'VA', 'OLED')\n"
            "- Case: case_type ('Mid Tower'), color ('Đen', 'Trắng'), supported_forms ('ATX', 'mATX')\n"
            "- Cooler: cooler_type ('Tản nhiệt nước AIO', 'Tản nhiệt khí'), radiator_mm (240, 360), supported_sockets ('LGA1700', 'AM5')"
        )
    )
    page_size: int = Field(
        default=8,
        description="Số lượng sản phẩm lấy ra (mặc định 8, tối đa 50)"
    )
    page_index: int = Field(
        default=0,
        description="Số thứ tự trang kết quả (bắt đầu từ 0)"
    )


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
