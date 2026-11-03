import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

export const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Queue management for concurrent 401 requests
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

function getOrCreateBuyerId(): string {
  try {
    let buyerId = localStorage.getItem('eshop_buyer_id');
    if (!buyerId) {
      buyerId = typeof crypto !== 'undefined' && crypto.randomUUID 
        ? crypto.randomUUID() 
        : 'guest-' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('eshop_buyer_id', buyerId);
    }
    return buyerId;
  } catch {
    return 'guest-anonymous';
  }
}

// Request Interceptor: Tự động đính kèm Authorization Bearer token & X-Buyer-Id
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const buyerId = getOrCreateBuyerId();
    config.headers['X-Buyer-Id'] = buyerId;

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Xử lý 401 tự động Refresh Token và log lỗi
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Nếu lỗi 401 Unauthorized và request chưa từng retry, không phải các endpoint auth cơ bản
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh-token')
    ) {
      const refreshToken = localStorage.getItem('refresh_token');

      // Nếu không có refresh token -> Không thể làm mới, chuyển về trang đăng nhập
      if (!refreshToken) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_info');
        return Promise.reject(error);
      }

      // Nếu đang có 1 request khác thực hiện refresh -> xếp hàng chờ
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(apiClient(originalRequest));
            },
            reject: (err) => reject(err),
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Dùng axios thuần để gọi refresh-token tránh lặp qua interceptor
        const res = await axios.post('/api/v1/auth/refresh-token', { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = res.data;

        localStorage.setItem('access_token', accessToken);
        if (newRefreshToken) {
          localStorage.setItem('refresh_token', newRefreshToken);
        }

        processQueue(null, accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_info');
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response) {
      const traceId = (error.response.data as any)?.traceId;
      console.warn(
        `[API Error] Status: ${error.response.status} | TraceId: ${traceId || 'N/A'} | URL: ${error.config?.url}`,
        error.response.data
      );
    } else if (error.request) {
      console.error('[API Network Error] No response received from server:', error.message);
    } else {
      console.error('[API Request Error]', error.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
