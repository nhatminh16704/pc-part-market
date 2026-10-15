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
      const trimmed = line.trim();

      // Heading 2 (e.g. ## 🔹 Core i5 thế hệ 10)
      if (trimmed.startsWith('## ')) {
        return (
          <h3 key={idx} className="font-bold text-[#002023] text-sm mt-3 mb-1.5 flex items-center gap-1.5 border-b border-slate-200 pb-1">
            <Cpu className="w-4 h-4 text-[#ff5636] shrink-0" />
            <span>{trimmed.replace(/^##\s+/, '')}</span>
          </h3>
        );
      }

      // Heading 3 / 4
      if (trimmed.startsWith('### ')) {
        return (
          <h4 key={idx} className="font-bold text-[#004147] text-xs mt-2 mb-1 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-[#ff5636] shrink-0" />
            <span>{trimmed.replace(/^###\s+/, '')}</span>
          </h4>
        );
      }

      // Divider line
      if (trimmed.startsWith('---')) {
        return <hr key={idx} className="border-slate-200 my-2" />;
      }

      // Markdown Table Rows (e.g. | Model | Giá | or |---|---|)
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        // Skip table separator line |---|---|
        if (/^\|[\s\-:|]+\|$/.test(trimmed)) {
          return null;
        }

        const cells = trimmed
          .split('|')
          .map((c) => c.trim())
          .filter(Boolean);

        // Skip generic table header row (Model, Giá, Thông số...)
        const isHeaderRow = cells.some((c) =>
          ['model', 'tên', 'giá', 'nhân/luồng', 'xung nhịp', 'cache', 'thông số'].includes(c.toLowerCase())
        );
        if (isHeaderRow) {
          return null;
        }

        // Render table row as clean, compact item
        const [firstCell, ...otherCells] = cells;
        return (
          <div
            key={idx}
            className="my-1 p-2 rounded-lg bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-1.5 text-xs text-slate-700"
          >
            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff5636] inline-block"></span>
              {parseInlineMarkdown(firstCell)}
            </div>
            {otherCells.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-600">
                {otherCells.map((cell, cIdx) => (
                  <span
                    key={cIdx}
                    className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-700 font-medium"
                  >
                    {parseInlineMarkdown(cell)}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      }

      // Bullet points
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        const bulletText = trimmed.substring(2);
        return (
          <li key={idx} className="ml-4 list-disc text-slate-700 text-xs my-0.5 leading-relaxed">
            {parseInlineMarkdown(bulletText)}
          </li>
        );
      }

      // Blank line
      if (!trimmed) {
        return null;
      }

      return (
        <p key={idx} className="text-xs text-slate-700 my-1 leading-relaxed">
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
            <span key={i} className="font-bold text-[#ff5636] bg-[#ff5636]/10 px-1 py-0.5 rounded text-[11px]">
              {boldText}
            </span>
          );
        }
        return (
          <strong key={i} className="font-bold text-slate-900">
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
          <div className="hidden sm:flex items-center gap-2 bg-white text-slate-800 border border-slate-200 px-3.5 py-1.5 rounded-full text-xs font-medium shadow-md pointer-events-none">
            <Sparkles className="w-3.5 h-3.5 text-[#ff5636]" />
            <span>Hỏi AI tư vấn PC & tra cứu kho</span>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className="group relative w-14 h-14 rounded-2xl bg-[#ff5636] hover:bg-[#e03e1e] p-0.5 shadow-xl shadow-[#ff5636]/30 hover:scale-105 active:scale-95 transition-all duration-300"
            title="Mở Trợ lý AI eShop"
            aria-label="Mở Trợ lý AI eShop"
          >
            <div className="w-full h-full rounded-[14px] flex items-center justify-center">
              <Bot className="w-7 h-7 text-white group-hover:scale-110 transition-transform duration-300" />
            </div>

            {/* Pulsing online badge */}
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
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
          } rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden`}
        >
          {/* Header */}
          <div className="bg-[#002023] px-4 py-3 border-b border-[#004147] flex items-center justify-between select-none">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-xl bg-[#ff5636] flex items-center justify-center shadow-md shadow-[#ff5636]/30">
                <Bot className="w-4 h-4 text-white" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#002023] rounded-full"></span>
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  eShop AI Assistant
                  <span className="text-[10px] font-medium bg-[#ff5636]/20 text-[#ff8c75] px-1.5 py-0.2 rounded border border-[#ff5636]/30">
                    DeepSeek V4.1
                  </span>
                </div>
                {!isMinimized && (
                  <div className="text-[10px] text-slate-300 flex items-center gap-1">
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
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  title="Xóa đoạn chat"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title={isMinimized ? 'Mở rộng' : 'Thu nhỏ'}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-300 hover:text-rose-400 hover:bg-white/10 rounded-lg transition-colors"
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
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/70 scrollbar-thin scrollbar-thumb-slate-300">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs shadow-xs ${
                        msg.sender === 'user'
                          ? 'bg-[#ff5636] text-white rounded-br-xs'
                          : msg.isError
                          ? 'bg-rose-50 text-rose-800 border border-rose-200 rounded-bl-xs'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                      }`}
                    >
                      {msg.sender === 'assistant' ? (
                        <div>
                          {renderFormattedText(msg.text)}

                          {/* Render Rich Product Cards if any products were retrieved */}
                          {msg.products && msg.products.length > 0 && (
                            <div className="mt-3 pt-2.5 border-t border-slate-200 space-y-2">
                              <div className="text-[11px] font-semibold text-[#002023] flex items-center gap-1">
                                <Cpu className="w-3.5 h-3.5 text-[#ff5636]" />
                                <span>Linh kiện gợi ý trong kho eShop:</span>
                              </div>
                              <div className="flex flex-col gap-2">
                                {msg.products.map((p) => (
                                  <Link
                                    key={p.id}
                                    to={`/products/${p.id}`}
                                    className="group/card flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 hover:bg-orange-50/60 border border-slate-200 hover:border-[#ff5636]/40 transition-all duration-200"
                                  >
                                    <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center p-1">
                                      <img
                                        src={p.imageUrl || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=200&q=80'}
                                        alt={p.name}
                                        className="w-full h-full object-contain group-hover/card:scale-105 transition-transform"
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      {p.brand && (
                                        <span className="text-[9px] uppercase tracking-wider text-[#ff5636] font-bold block">
                                          {p.brand}
                                        </span>
                                      )}
                                      <div className="text-[11px] font-semibold text-slate-900 truncate group-hover/card:text-[#ff5636] transition-colors">
                                        {p.name}
                                      </div>
                                      <div className="flex items-center justify-between gap-1 mt-0.5">
                                        <span className="text-[11px] font-bold text-[#ff5636]">
                                          {p.price > 0 ? formatVND(p.price) : 'Liên hệ'}
                                        </span>
                                        <span className="text-[9px] text-slate-500 group-hover/card:text-[#ff5636] flex items-center gap-0.5 group-hover/card:translate-x-0.5 transition-transform font-medium">
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
                    <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
                  </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex items-center gap-2 text-xs text-slate-700 bg-white border border-slate-200 rounded-2xl rounded-bl-xs px-3.5 py-2.5 max-w-[75%] shadow-xs animate-pulse">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#ff5636]" />
                    <span>AI đang phân tích & tra cứu catalog...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompt Chips */}
              <div className="px-3 py-2 bg-white border-t border-slate-200 flex gap-1.5 overflow-x-auto scrollbar-none">
                {QUICK_PROMPTS.map((item, idx) => (
                  <button
                    key={idx}
                    disabled={isLoading}
                    onClick={() => handleSend(item.prompt)}
                    className="shrink-0 text-[11px] bg-slate-50 hover:bg-orange-50 text-slate-700 hover:text-[#ff5636] border border-slate-200 hover:border-[#ff5636]/40 rounded-full px-2.5 py-1 transition-all flex items-center gap-1 active:scale-95 disabled:opacity-50"
                  >
                    <span>{item.label}</span>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  </button>
                ))}
              </div>

              {/* Input Form */}
              <div className="p-3 bg-white border-t border-slate-200">
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
                    className="flex-1 bg-slate-50 border border-slate-200 focus:border-[#ff5636] focus:bg-white focus:ring-1 focus:ring-[#ff5636]/30 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="h-8 w-8 rounded-xl bg-[#ff5636] hover:bg-[#e03e1e] text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm active:scale-95"
                    title="Gửi tin nhắn"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
                <div className="text-[10px] text-center text-slate-400 mt-1.5">
                  Được hỗ trợ bởi AI & Database eShop
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
