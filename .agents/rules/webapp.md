# WebApp Frontend Rules & Best Practices

Áp dụng cho mọi công việc phát triển trên thư mục `src/WebApp`.

## 1. State Management
- **Server Data**: Bắt buộc dùng **TanStack Query** (`useQuery`, `useMutation`). Tuyệt đối không dùng `useEffect` + `fetch` rồi đẩy vào Zustand.
- **Client UI Data**: Dùng **Zustand** thuần túy cho trạng thái hiển thị (modal/drawer `isOpen`, active filter tabs).
- **Custom Hook Pattern**: Đóng gói Query/Mutation + UI state vào Custom Hook chuyên dụng (như `useCart`, `useProducts`, `useAuth`) để components gọi trực tiếp.

## 2. API Endpoints (`src/lib/axios.ts`)
- `apiClient` có `baseURL: '/api'`.
- Không lặp lại prefix `/api/` trong URL endpoint (viết `/basket`, `/catalog/products`, `/auth/login`).
- `X-Buyer-Id` và Bearer Token được interceptor đính kèm tự động.

## 3. Data Integrity & Security
- `ProductId` và `VariantId` là UUID (`Guid`).
- Không gửi `price` từ client lên khi thêm vào giỏ; server luôn tự lấy giá Catalog.
- Hỗ trợ hiển thị biến động giá (`oldUnitPrice` vs `unitPrice`).

## 4. Workflow
- Luôn chạy `npm run build` kiểm tra TypeScript (`0 Error(s)`).
- Làm xong là commit ngay vào Git theo quy tắc người dùng yêu cầu.
