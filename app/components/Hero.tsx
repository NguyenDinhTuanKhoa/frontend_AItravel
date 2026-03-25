'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const destinations = ['Đà Nẵng', 'Phú Quốc', 'Hội An', 'Sapa', 'Nha Trang', 'Đà Lạt'];
const searchSuggestions = [
  'Biển đẹp gần Sài Gòn...',
  'Du lịch Đà Nẵng 3 ngày...',
  'Khách sạn view đẹp Đà Lạt...',
  'Tour Phú Quốc giá rẻ...',
  'Ăn gì ở Hội An...',
  'Sapa mùa nào đẹp nhất...',
];

export default function Hero() {
  const router = useRouter();
  const [currentDest, setCurrentDest] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [typingText, setTypingText] = useState('');
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = () => {
    const query = searchQuery.trim() || destinations[currentDest];
    router.push(`/destinations?search=${encodeURIComponent(query)}`);
  };

  const handleTagClick = (tag: string) => {
    // Lấy text không có emoji
    const category = tag.replace(/^[^\s]+\s/, '');
    router.push(`/destinations?category=${encodeURIComponent(category)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Destination rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDest((prev) => (prev + 1) % destinations.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Typing effect
  useEffect(() => {
    if (isFocused || searchQuery) return;

    const currentSuggestion = searchSuggestions[suggestionIndex];
    let timeout: NodeJS.Timeout;

    if (isTyping) {
      if (typingText.length < currentSuggestion.length) {
        timeout = setTimeout(() => {
          setTypingText(currentSuggestion.slice(0, typingText.length + 1));
        }, 100);
      } else {
        timeout = setTimeout(() => setIsTyping(false), 2000);
      }
    } else {
      if (typingText.length > 0) {
        timeout = setTimeout(() => {
          setTypingText(typingText.slice(0, -1));
        }, 50);
      } else {
        setSuggestionIndex((prev) => (prev + 1) % searchSuggestions.length);
        setIsTyping(true);
      }
    }

    return () => clearTimeout(timeout);
  }, [typingText, isTyping, suggestionIndex, isFocused, searchQuery]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-900 via-violet-900 to-orange-900"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920')] bg-cover bg-center opacity-30"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-sky-500/20 rounded-full blur-3xl float"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl float float-delay-1"></div>
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl float float-delay-2"></div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 text-center pt-24">
        <div className="slide-up">
          <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sky-300 text-sm font-medium mb-6 border border-white/20">
            ✨ Khám phá với sức mạnh AI
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 slide-up" style={{ animationDelay: '0.1s' }}>
          Hành Trình Của Bạn
          <br />
          <span className="gradient-text">Bắt Đầu Từ Đây</span>
        </h1>

        <p className="text-xl md:text-2xl text-white/80 mb-4 slide-up" style={{ animationDelay: '0.2s' }}>
          Để AI giúp bạn khám phá
        </p>

        {/* Animated Destination */}
        <div className="h-12 mb-8 slide-up" style={{ animationDelay: '0.3s' }}>
          <span className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-violet-400 to-orange-400 transition-all duration-500">
            {destinations[currentDest]}
          </span>
        </div>

        {/* Search Box */}
        <div className="max-w-3xl mx-auto slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-2 border border-white/20 shadow-2xl">
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex-1 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl">🔍</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onKeyDown={handleKeyDown}
                  className="w-full pl-14 pr-4 py-4 bg-white/90 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 text-lg"
                />
                {/* Typing placeholder overlay */}
                {!searchQuery && !isFocused && (
                  <div className="absolute left-14 top-1/2 -translate-y-1/2 pointer-events-none">
                    <span className="text-gray-500 text-lg">
                      {typingText}
                      <span className="inline-block w-0.5 h-5 bg-sky-500 ml-0.5 animate-pulse"></span>
                    </span>
                  </div>
                )}
                {isFocused && !searchQuery && (
                  <div className="absolute left-14 top-1/2 -translate-y-1/2 pointer-events-none">
                    <span className="text-gray-400 text-lg">Bạn muốn đi đâu?</span>
                  </div>
                )}
              </div>
              <button 
                onClick={handleSearch}
                className="px-8 py-4 bg-gradient-to-r from-sky-500 via-violet-500 to-orange-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-violet-500/30 transition-all hover:scale-105 shimmer"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Khám Phá Ngay
                </span>
              </button>
            </div>
          </div>

          {/* Quick Tags */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {['🏖️ Biển', '🏔️ Núi', '🏛️ Di tích', '🌆 Thành phố', '🍜 Ẩm thực'].map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium transition-all hover:scale-105 border border-white/10"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-8 h-12 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-white/60 rounded-full animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}
