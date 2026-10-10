import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: Tự động đính kèm Authorization Bearer token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
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
