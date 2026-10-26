# WebApp Development Guidelines & Conventions

Tài liệu quy chuẩn phát triển dành cho ứng dụng **Frontend (`src/WebApp`)** trong hệ thống **PC Part Market (eShop)**. Áp dụng cho mọi tác vụ thêm tính năng, sửa lỗi hoặc refactor.

---

## 1. Quản lý State: Phân tách Server State và UI State

### A. Server State (Bắt buộc dùng TanStack React Query)
- **Tất cả các dữ liệu lấy từ Backend / API** (Catalog, Basket/Cart, Auth, Categories, Brands) **BẮT BUỘC** phải được quản lý qua **TanStack React Query** (`@tanstack/react-query`).
- **Quy tắc**:
  - Dùng `useQuery` cho thao tác đọc (Fetch/Get): tự động cache, re-fetch khi focus tab, quản lý `isLoading`, `isError`.
  - Dùng `useMutation` cho thao tác ghi (Create, Update, Delete):
    - Khi mutation thành công, luôn gọi `queryClient.setQueryData` hoặc `queryClient.invalidateQueries` để đồng bộ cache tức thì.
  - **TUYỆT ĐỐI KHÔNG**: Tự viết `fetch` hay `axios` thủ công bên trong `useEffect` rồi nhét dữ liệu server vào Zustand store.

### B. Client UI State (Dùng Zustand)
- **Zustand stores** (`src/features/*/stores/`): **CHỈ** dùng để quản lý trạng thái giao diện nội bộ của trình duyệt:
  - Mở/đóng modal, drawer (`isOpen`, `openCart`, `closeCart`, `toggleCart`).
  - Bộ lọc tạm trên giao diện (filter drawer, active tab).
  - Trạng thái view mode (grid/list).

### C. Pattern Hook tổng hợp (`useCart`, `useAuth`, v.v.)
- Đóng gói Server State (Query/Mutation) và UI State (Zustand) vào một Custom Hook duy nhất:
  ```tsx
  // src/features/cart/hooks/useCart.ts
  export const useCart = () => {
    const { data: basket, isLoading } = useBasket();
    const addMutation = useAddToBasket();
    const { isOpen, openCart, closeCart } = useCartUIStore();
    return {
      items: basket?.items ?? [],
      totalCount: basket?.totalCount ?? 0,
      totalAmount: basket?.totalAmount ?? 0,
      hasPriceChanges: basket?.hasPriceChanges ?? false,
      isOpen,
      openCart,
      closeCart,
      addItem: (product, variant) => addMutation.mutateAsync({ ... }),
    };
  };
  ```
- Các component (`Navbar`, `ProductCard`, `ProductDetail`, `CartDrawer`) chỉ cần import và sử dụng hook này: `const { addItem, openCart } = useCart();`.

---

## 2. Quy chuẩn gọi API qua Axios (`src/lib/axios.ts`)

- `apiClient` trong `src/lib/axios.ts` đã được cấu hình sẵn **`baseURL: '/api'`**.
- **LỖI CẦN TRÁNH TUYỆT ĐỐI**:
  - ❌ `apiClient.post('/api/auth/login')` $\rightarrow$ Sẽ bị nối thành `/api/api/auth/login` (Lỗi 404/502).
  - ❌ `apiClient.get('/api/basket')` $\rightarrow$ Sẽ bị nối thành `/api/api/basket`.
  - ✅ **Đúng**: `apiClient.post('/auth/login')` hoặc `apiClient.get('/basket')`.
- **Định danh khách hàng (Identity)**:
  - `axios.ts` đã có Request Interceptor tự động tạo và gửi `X-Buyer-Id` cho khách vãng lai (Guest).
  - Khi đăng nhập, tự động gửi kèm `Authorization: Bearer <token>`.

---

## 3. Quy chuẩn dữ liệu Catalog & Giỏ hàng (PC Part Market)

1. **Khóa định danh**:
   - `ProductId` và `VariantId` luôn là kiểu **`Guid`** (chuỗi UUID ở frontend, ví dụ: `019460a3-0000-7000-8000-000000000001`).
   - Mỗi sản phẩm phần cứng PC luôn có ít nhất 1 biến thể (`ProductVariant`).
2. **Bảo mật giá**:
   - Client **không bao giờ tự gửi giá (`price`)** lên server để lưu vào giỏ. Client chỉ gửi `{ productId, variantId, quantity }`. Giá chính thức do `Basket.API` tra cứu từ `Catalog.API`.
3. **Biến động giá**:
   - `BasketItemDto` trả về cả `unitPrice` (giá hiện tại) và `oldUnitPrice` (giá lúc thêm).
   - Nếu `oldUnitPrice > unitPrice`: UI hiển thị gạch ngang giá cũ và badge giảm giá.
   - Nếu `oldUnitPrice < unitPrice`: UI hiển thị cảnh báo tăng giá.

---

## 4. Quy trình kiểm tra & Git Commit (Bắt buộc)

- **Nguyên tắc "Làm xong là commit luôn"**: Khi hoàn thành một tính năng hoặc một bước sửa lỗi, phải commit ngay vào Git, không để dồn nhiều tính năng vào 1 commit.
- **Kiểm tra TypeScript trước khi commit**:
  ```bash
  npm run build
  ```
  Đảm bảo `0 Error(s)` và `tsc -b` biên dịch sạch sẽ trước khi tạo commit.
