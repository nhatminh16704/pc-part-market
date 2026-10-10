# pc-part-market

Hệ thống sàn thương mại điện tử chuyên kinh doanh linh kiện máy tính (PC Parts), được xây dựng trên kiến trúc Microservices sử dụng **.NET 9** và **.NET Aspire**.

---

## 🛠 Công nghệ sử dụng

* **Nền tảng chính:** .NET 9 (C# 13)
* **Orchestration & Giám sát:** [.NET Aspire](https://learn.microsoft.com/dotnet/aspire/)
* **Cơ sở dữ liệu:** PostgreSQL (kèm extension `pgvector`)
* **ORM:** Entity Framework Core
* **Bộ nhớ đệm & Giỏ hàng:** Redis
* **Message Broker:** RabbitMQ
* **Giao diện:** Blazor Web App (Interactive Server / WebAssembly)

---

## 📋 Yêu cầu môi trường

1. [.NET 9 SDK](https://dot.net/download) (hoặc mới hơn)
2. [Docker Desktop](https://www.docker.com/products/docker-desktop/) (cần bật trước khi chạy ứng dụng để Aspire tự khởi tạo PostgreSQL, Redis, RabbitMQ)

---

## 🚀 Hướng dẫn khởi chạy

1. **Khởi động Docker Desktop**.
2. **Chạy ứng dụng từ terminal:**
   ```powershell
   dotnet run --project src/eShop.AppHost/eShop.AppHost.csproj
   ```
3. **Mở Aspire Dashboard:**
   Terminal sẽ in ra đường link đăng nhập dạng:
   ```text
   Login to the dashboard at: https://localhost:19888/login?t=...
   ```
   Mở link này trên trình duyệt để quản lý các services, xem logs và truy cập giao diện cửa hàng (`webapp`).
