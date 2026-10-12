import axios from 'axios';

const AI_BASE_URL = import.meta.env.VITE_AI_API_URL || 'http://localhost:8000';

import type { ChatProductItem } from '../types';

export interface SendMessageResponse {
  reply: string;
  model?: string;
  products?: ChatProductItem[];
}

export const sendChatMessage = async (message: string): Promise<SendMessageResponse> => {
  try {
    const response = await axios.post<SendMessageResponse>(
      `${AI_BASE_URL}/api/chat`,
      { message },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 45000, // 45 seconds for LLM reasoning + catalog tool call
      }
    );

    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Yêu cầu AI tư vấn bị quá thời gian chờ (timeout). Vui lòng thử lại!');
      }
      if (error.response?.data?.detail) {
        throw new Error(String(error.response.data.detail));
      }
      if (error.message?.includes('Network Error')) {
        throw new Error('Không thể kết nối đến AI Service (cổng 8000). Hãy đảm bảo AI Service đang chạy!');
      }
    }
    throw new Error(error?.message || 'Có lỗi xảy ra khi trò chuyện với trợ lý AI.');
  }
};
