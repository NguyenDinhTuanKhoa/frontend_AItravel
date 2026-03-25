'use client';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatHistory {
  _id: string;
  title: string;
  lastMessage: string;
  createdAt: string;
}

const quickQuestions = [
  '🏖️ Gợi ý điểm đến biển đẹp',
  '🏔️ Du lịch Sapa cần chuẩn bị gì?',
  '💰 Lịch trình Đà Nẵng 3 ngày 5 triệu',
  '🍜 Ăn gì ngon ở Hội An?',
  '📅 Thời điểm nào đi Phú Quốc đẹp?',
];

const getWelcomeMessage = (): Message => ({
  id: 'welcome',
  role: 'assistant',
  content: 'Xin chào! 👋 Tôi là TravelAI - trợ lý du lịch thông minh của bạn. Tôi có thể giúp bạn:\n\n• Gợi ý điểm đến phù hợp\n• Lên lịch trình du lịch\n• Tư vấn ngân sách\n• Giới thiệu ẩm thực địa phương\n\nBạn muốn đi đâu? Hãy hỏi tôi bất cứ điều gì! 🌴',
  timestamp: new Date(),
});

// Format time safely for SSR
const formatTime = (date: Date) => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

export default function AIChatPage() {
  const { user, token, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [smartPromptProcessed, setSmartPromptProcessed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Initialize welcome message on client only
  useEffect(() => {
    setMessages([getWelcomeMessage()]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load chat histories when user logs in
  useEffect(() => {
    if (user && token) {
      loadChatHistories();
    } else {
      setChatHistories([]);
      setCurrentChatId(null);
    }
  }, [user, token]);

  // Check for smart suggestion prompt - wait for auth to finish loading
  useEffect(() => {
    if (authLoading || smartPromptProcessed) return;
    
    const smartPrompt = localStorage.getItem('smartSuggestionPrompt');
    if (smartPrompt) {
      localStorage.removeItem('smartSuggestionPrompt');
      setSmartPromptProcessed(true);
      // Delay để đảm bảo auth đã load xong
      setTimeout(() => {
        sendMessage(smartPrompt);
      }, 300);
    }
  }, [authLoading, smartPromptProcessed]);

  const loadChatHistories = async () => {
    try {
      const res = await fetch(`${API_URL}/ai/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setChatHistories(data.data);
      }
    } catch (error) {
      console.error('Error loading histories:', error);
    }
  };

  const loadChat = async (chatId: string) => {
    setLoadingHistory(true);
    try {
      const res = await fetch(`${API_URL}/ai/history/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCurrentChatId(chatId);
        const loadedMessages: Message[] = data.data.messages.map((m: any, idx: number) => ({
          id: `${chatId}-${idx}`,
          role: m.role,
          content: m.content,
          timestamp: new Date(m.timestamp)
        }));
        setMessages(loadedMessages.length > 0 ? loadedMessages : [getWelcomeMessage()]);
      }
    } catch (error) {
      console.error('Error loading chat:', error);
    }
    setLoadingHistory(false);
  };

  const createNewChat = async () => {
    if (!user || !token) {
      setMessages([getWelcomeMessage()]);
      setCurrentChatId(null);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/ai/history`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        }
      });
      const data = await res.json();
      if (data.success) {
        setCurrentChatId(data.data._id);
        setMessages([getWelcomeMessage()]);
        loadChatHistories();
      }
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  const deleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Xóa cuộc trò chuyện này?')) return;

    try {
      await fetch(`${API_URL}/ai/history/${chatId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setChatHistories(prev => prev.filter(h => h._id !== chatId));
      if (currentChatId === chatId) {
        setCurrentChatId(null);
        setMessages([getWelcomeMessage()]);
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      let aiResponse: string;

      if (user && token) {
        // Create chat if not exists
        let chatId = currentChatId;
        if (!chatId) {
          const createRes = await fetch(`${API_URL}/ai/history`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}` 
            }
          });
          const createData = await createRes.json();
          if (createData.success) {
            chatId = createData.data._id;
            setCurrentChatId(chatId);
          }
        }

        // Send message with history
        const res = await fetch(`${API_URL}/ai/history/${chatId}/message`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({ content: content.trim() })
        });
        const data = await res.json();
        
        if (data.success) {
          aiResponse = data.data.response;
          loadChatHistories(); // Refresh sidebar
        } else {
          throw new Error(data.message);
        }
      } else {
        // Guest mode - no history saving
        const apiMessages = messages
          .filter(m => m.id !== 'welcome')
          .map((m) => ({ role: m.role, content: m.content }));
        apiMessages.push({ role: 'user', content: content.trim() });

        const res = await fetch(`${API_URL}/ai/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: apiMessages })
        });
        const data = await res.json();
        aiResponse = data.response;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.',
          timestamp: new Date(),
        },
      ]);
    }

    setIsLoading(false);
    inputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-violet-950 to-gray-900 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 bg-black/30 border-r border-white/10 flex flex-col overflow-hidden`}>
        <div className="p-4 border-b border-white/10">
          <button
            onClick={createNewChat}
            className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-medium transition-all flex items-center justify-center gap-2"
          >
            <span>✨</span> Cuộc trò chuyện mới
          </button>
        </div>

        {user ? (
          <div className="flex-1 overflow-y-auto p-2">
            {chatHistories.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">Chưa có lịch sử chat</p>
            ) : (
              <div className="space-y-1">
                {chatHistories.map((chat) => (
                  <div
                    key={chat._id}
                    onClick={() => loadChat(chat._id)}
                    className={`group px-3 py-3 rounded-lg cursor-pointer transition-all flex items-center justify-between ${
                      currentChatId === chat._id 
                        ? 'bg-white/20 text-white' 
                        : 'hover:bg-white/10 text-gray-300'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{chat.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(chat.lastMessage).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <button
                      onClick={(e) => deleteChat(chat._id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded text-red-400 transition-all"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-3">Đăng nhập để lưu lịch sử chat</p>
              <Link
                href="/login"
                className="inline-block px-4 py-2 bg-gradient-to-r from-sky-500 to-violet-500 text-white text-sm rounded-lg"
              >
                Đăng nhập
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Toggle Sidebar */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 p-2 rounded-r-lg transition-all"
        style={{ left: sidebarOpen ? '288px' : '0' }}
      >
        <span className="text-white">{sidebarOpen ? '◀' : '▶'}</span>
      </button>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-black/20 backdrop-blur-xl border-b border-white/10">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image src="/logowebsite.png" alt="Logo" width={40} height={40} className="rounded-xl" />
              <div>
                <h1 className="text-xl font-bold text-white">
                  Travel<span className="gradient-text">AI</span> Chat
                </h1>
                <p className="text-xs text-gray-400">Powered by Llama 3.1</p>
              </div>
            </div>
            <Link href="/" className="px-4 py-2 text-gray-400 hover:text-white transition-colors">
              ← Về trang chủ
            </Link>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loadingHistory ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full"></div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-sky-500 to-violet-500'
                      : 'bg-gradient-to-r from-orange-500 to-pink-500'
                  }`}
                >
                  {message.role === 'user' ? '👤' : '🤖'}
                </div>

                <div
                  className={`max-w-[80%] rounded-2xl px-5 py-4 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-sky-500 to-violet-500 text-white rounded-tr-none'
                      : 'bg-white/10 backdrop-blur-sm text-gray-100 rounded-tl-none border border-white/10'
                  }`}
                >
                  {message.role === 'user' ? (
                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  ) : (
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                          li: ({ children }) => <li className="mb-1">{children}</li>,
                          strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  )}
                  <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-white/60' : 'text-gray-500'}`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center bg-gradient-to-r from-orange-500 to-pink-500">
                🤖
              </div>
              <div className="rounded-2xl rounded-tl-none px-5 py-4 bg-white/10 backdrop-blur-sm border border-white/10">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions */}
        {messages.length <= 1 && (
          <div className="px-6 pb-4">
            <p className="text-gray-400 text-sm mb-3">Gợi ý câu hỏi:</p>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(q)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-white text-sm transition-all border border-white/10"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 bg-black/20 backdrop-blur-xl border-t border-white/10">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Hỏi về du lịch..."
              disabled={isLoading}
              className="flex-1 px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-6 py-4 bg-gradient-to-r from-sky-500 to-violet-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-violet-500/30 transition-all disabled:opacity-50"
            >
              {isLoading ? '⏳' : '➤'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
