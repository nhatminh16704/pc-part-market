import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

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
