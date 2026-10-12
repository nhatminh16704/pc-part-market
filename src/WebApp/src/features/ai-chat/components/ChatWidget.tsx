import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatVND } from '@/utils/format';
import {
  Bot,
  Send,
  X,
  Sparkles,
  Trash2,
  Minimize2,
  Maximize2,
  ChevronRight,
  Cpu,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import type { ChatMessage, QuickPrompt } from '../types';
import { sendChatMessage } from '../services/aiChatService';

const QUICK_PROMPTS: QuickPrompt[] = [
  { label: '🔥 Card RTX 3060 ASUS', prompt: 'Tìm cho tôi card màn hình RTX 3060 của ASUS' },
  { label: '⚡ Tìm CPU Core i5', prompt: 'Có những dòng CPU Intel Core i5 nào?' },
  { label: '💰 Tư vấn PC 20 triệu', prompt: 'Tư vấn cấu hình máy tính chơi game tầm 20 triệu VNĐ' },
  { label: '🚀 RAM DDR5 giá tốt', prompt: 'Tìm kit RAM DDR5 cho bo mạch chủ mới nhất' },
];

const INITIAL_MESSAGE: ChatMessage = {
  id: 'init-msg',
  sender: 'assistant',
  text: 'Xin chào! 👋 Tôi là **Trợ lý AI của eShop PC**.\n\nTôi có thể giúp bạn tra cứu giá cả linh kiện máy tính có sẵn trong kho, kiểm tra tương thích và tư vấn cấu hình PC tối ưu nhất. Bạn đang cần tìm linh kiện gì hôm nay?',
  timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
};

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, isMinimized, messages, isLoading]);

  const handleSend = async (messageText?: string) => {
    const textToSend = (messageText || input).trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendChatMessage(textToSend);
      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        products: response.products,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: `⚠️ **Không thể lấy phản hồi:** ${err.message || 'Lỗi không xác định.'}`,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        ...INITIAL_MESSAGE,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.trim().startsWith('### ')) {
        return (
          <h4 key={idx} className="font-bold text-sky-300 text-sm mt-2 mb-1 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-sky-400" />
            {line.replace('### ', '')}
          </h4>
        );
      }
      if (line.trim().startsWith('---')) {
        return <hr key={idx} className="border-white/10 my-2" />;
      }
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        const bulletText = line.trim().substring(2);
        return (
          <li key={idx} className="ml-4 list-disc text-slate-200 text-xs my-0.5 leading-relaxed">
            {parseInlineMarkdown(bulletText)}
          </li>
        );
      }
      return (
        <p key={idx} className="text-xs text-slate-200 my-1 leading-relaxed">
          {parseInlineMarkdown(line)}
        </p>
      );
    });
  };

  const parseInlineMarkdown = (content: string) => {
    // Replace **bold**
    const parts = content.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldText = part.slice(2, -2);
        // Highlight price VND specially
        if (boldText.includes('VNĐ') || boldText.includes('đ') || boldText.includes('VND')) {
          return (
            <span key={i} className="font-bold text-amber-300 bg-amber-500/10 px-1 py-0.5 rounded text-[11px]">
              {boldText}
            </span>
          );
        }
        return (
          <strong key={i} className="font-semibold text-sky-200">
            {boldText}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-slate-900/90 text-sky-200 border border-sky-500/30 px-3 py-1.5 rounded-full text-xs shadow-lg shadow-sky-500/10 backdrop-blur-md animate-fade-in pointer-events-none">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
            <span>Hỏi AI tư vấn PC & linh kiện</span>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className="group relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-purple-600 p-0.5 shadow-xl shadow-sky-500/30 hover:shadow-sky-500/50 hover:scale-105 active:scale-95 transition-all duration-300"
            title="Mở Trợ lý AI eShop"
            aria-label="Mở Trợ lý AI eShop"
          >
            <div className="w-full h-full bg-slate-950/80 group-hover:bg-slate-950/40 rounded-[14px] flex items-center justify-center transition-colors">
              <Bot className="w-7 h-7 text-white group-hover:scale-110 transition-transform duration-300" />
            </div>

            {/* Pulsing online badge */}
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-950"></span>
            </span>
          </button>
        </div>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div
          className={`fixed right-4 sm:right-6 bottom-4 sm:bottom-6 z-50 transition-all duration-300 flex flex-col ${
            isMinimized
              ? 'w-72 h-14'
              : 'w-[calc(100vw-2rem)] sm:w-[420px] h-[580px] max-h-[85vh]'
          } rounded-2xl bg-slate-950/95 backdrop-blur-2xl border border-sky-500/30 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_30px_rgba(56,189,248,0.2)] overflow-hidden`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 px-4 py-3 border-b border-white/10 flex items-center justify-between select-none">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-md shadow-sky-500/30">
                <Bot className="w-4 h-4 text-white" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full"></span>
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  eShop AI Assistant
                  <span className="text-[10px] font-medium bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded border border-indigo-500/30">
                    DeepSeek V4.1
                  </span>
                </div>
                {!isMinimized && (
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                    Sẵn sàng tư vấn linh kiện & tra giá DB
                  </div>
                )}
              </div>
            </div>

            {/* Header controls */}
            <div className="flex items-center gap-1">
              {!isMinimized && (
                <button
                  onClick={handleClearChat}
                  className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-lg transition-colors"
                  title="Xóa đoạn chat"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-lg transition-colors"
                title={isMinimized ? 'Mở rộng' : 'Thu nhỏ'}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-white/5 rounded-lg transition-colors"
                title="Đóng chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body Content (hidden when minimized) */}
          {!isMinimized && (
            <>
              {/* Messages scroll area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-slate-700">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs shadow-md ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-br-xs'
                          : msg.isError
                          ? 'bg-rose-950/60 text-rose-200 border border-rose-500/30 rounded-bl-xs'
                          : 'bg-slate-900/90 text-slate-200 border border-white/10 rounded-bl-xs'
                      }`}
                    >
                      {msg.sender === 'assistant' ? (
                        <div>
                          {renderFormattedText(msg.text)}

                          {/* Render Rich Product Cards if any products were retrieved */}
                          {msg.products && msg.products.length > 0 && (
                            <div className="mt-3 pt-2.5 border-t border-white/10 space-y-2">
                              <div className="text-[11px] font-semibold text-sky-300 flex items-center gap-1">
                                <Cpu className="w-3.5 h-3.5" />
                                <span>Linh kiện gợi ý trong kho eShop:</span>
                              </div>
                              <div className="flex flex-col gap-2">
                                {msg.products.map((p) => (
                                  <Link
                                    key={p.id}
                                    to={`/products/${p.id}`}
                                    onClick={() => setIsOpen(false)}
                                    className="group/card flex items-center gap-2.5 p-2 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-white/10 hover:border-sky-500/40 transition-all duration-200"
                                  >
                                    <div className="w-12 h-12 rounded-lg bg-slate-900 border border-white/5 overflow-hidden shrink-0 flex items-center justify-center p-1">
                                      <img
                                        src={p.imageUrl || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=200&q=80'}
                                        alt={p.name}
                                        className="w-full h-full object-contain group-hover/card:scale-105 transition-transform"
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      {p.brand && (
                                        <span className="text-[9px] uppercase tracking-wider text-sky-400 font-bold block">
                                          {p.brand}
                                        </span>
                                      )}
                                      <div className="text-[11px] font-semibold text-white truncate group-hover/card:text-sky-300 transition-colors">
                                        {p.name}
                                      </div>
                                      <div className="flex items-center justify-between gap-1 mt-0.5">
                                        <span className="text-[11px] font-bold text-amber-300">
                                          {p.price > 0 ? formatVND(p.price) : 'Liên hệ'}
                                        </span>
                                        <span className="text-[9px] text-sky-400 flex items-center gap-0.5 group-hover/card:translate-x-0.5 transition-transform font-medium">
                                          Xem chi tiết <ExternalLink className="w-2.5 h-2.5" />
                                        </span>
                                      </div>
                                    </div>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
                  </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex items-center gap-2 text-xs text-sky-300 bg-slate-900/80 border border-sky-500/20 rounded-2xl rounded-bl-xs px-3.5 py-2.5 max-w-[75%] animate-pulse">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-400" />
                    <span>AI đang phân tích & tra cứu catalog...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompt Chips */}
              <div className="px-3 py-2 bg-slate-950/60 border-t border-white/5 flex gap-1.5 overflow-x-auto scrollbar-none">
                {QUICK_PROMPTS.map((item, idx) => (
                  <button
                    key={idx}
                    disabled={isLoading}
                    onClick={() => handleSend(item.prompt)}
                    className="shrink-0 text-[11px] bg-slate-900/90 hover:bg-sky-950/60 text-slate-300 hover:text-sky-300 border border-white/10 hover:border-sky-500/40 rounded-full px-2.5 py-1 transition-all flex items-center gap-1 active:scale-95 disabled:opacity-50"
                  >
                    <span>{item.label}</span>
                    <ChevronRight className="w-3 h-3 text-slate-500" />
                  </button>
                ))}
              </div>

              {/* Input Form */}
              <div className="p-3 bg-slate-950 border-t border-white/10">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Hỏi AI: Tư vấn card màn hình, CPU, build PC..."
                    disabled={isLoading}
                    className="flex-1 bg-slate-900/90 border border-white/15 focus:border-sky-400 focus:ring-1 focus:ring-sky-400/50 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none transition-all disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="h-8 w-8 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-sky-500/20 active:scale-95"
                    title="Gửi tin nhắn"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
                <div className="text-[10px] text-center text-slate-500 mt-1.5">
                  Được hỗ trợ bởi DeepSeek V4.1-Flash & Database eShop
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
