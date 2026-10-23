import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

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

// Response Interceptor: Xử lý response & log traceId từ OpenTelemetry
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const traceId = error.response.data?.traceId;
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
