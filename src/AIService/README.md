# AI Support Service (Chatbot Tư Vấn)

Microservice AI Chatbot hỗ trợ khách hàng và tư vấn cấu hình PC/Linh kiện máy tính cho hệ thống eShop.
Dự án được xây dựng với:
- **Ngôn ngữ**: Python 3.12+
- **API Framework**: [FastAPI](https://fastapi.tiangolo.com/) + Uvicorn
- **AI Agent Framework**: [PydanticAI](https://ai.pydantic.dev/)
- **LLM Provider**: Google Gemini (`GEMINI_API_KEY`)

---

## 📁 Cấu trúc thư mục

```
src/AIService/
├── app/
│   ├── __init__.py
│   ├── main.py          # FastAPI application entrypoint & middleware
│   ├── config.py        # Cấu hình Pydantic Settings & GEMINI_API_KEY
│   ├── schemas.py       # Pydantic data schemas (ChatRequest, ChatResponse, ...)
│   ├── agent.py         # Khởi tạo PydanticAI Agent với Gemini LLM
│   └── routers/
│       ├── __init__.py
│       └── chat.py      # Router endpoint /api/chat
├── .env.example         # Mẫu biến môi trường
├── .gitignore           # Bỏ qua venv, cache và file .env
├── requirements.txt     # Danh sách thư viện Python
└── README.md
```

---

## 🚀 Hướng dẫn cài đặt & Khởi chạy

### 1. Tạo Virtual Environment (Khuyến nghị)
Tại thư mục `src/AIService`:
```bash
python -m venv .venv

# Kích hoạt trên Windows PowerShell:
.\.venv\Scripts\Activate.ps1

# Hoặc Command Prompt:
.\.venv\Scripts\activate.bat
```

### 2. Cài đặt Dependencies
```bash
pip install -r requirements.txt
```

### 3. Cấu hình biến môi trường
Tạo file `.env` từ `.env.example`:
```bash
cp .env.example .env
```
Mở `.env` và điền `GEMINI_API_KEY` của bạn (lấy tại [Google AI Studio](https://aistudio.google.com/)):
```env
HOST=0.0.0.0
PORT=8000
DEBUG=True

GEMINI_API_KEY=AIzaSy...
GEMINI_MODEL=google-gla:gemini-1.5-flash
```

### 4. Khởi chạy Server
```bash
uvicorn app.main:app --reload --port 8000
```
Hoặc:
```bash
python -m app.main
```

---

## 📌 Các Endpoints chính

- **Swagger UI / API Docs**: `http://localhost:8000/docs`
- **Health Check**: `GET /health`
- **Gửi tin nhắn Chat**: `POST /api/chat`
  ```json
  {
    "message": "Tư vấn cho tôi cấu hình PC chơi game tầm 20 triệu"
  }
  ```
