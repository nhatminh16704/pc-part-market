export interface ChatProductItem {
  id: string;
  name: string;
  seoName?: string;
  brand?: string;
  category?: string;
  price: number;
  quantity?: number;
  imageUrl?: string;
  description?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isError?: boolean;
  products?: ChatProductItem[];
}

export interface QuickPrompt {
  label: string;
  prompt: string;
}
