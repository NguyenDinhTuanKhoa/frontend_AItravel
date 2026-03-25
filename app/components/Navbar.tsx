'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();

  // Pages that need dark navbar by default
  // Only homepage (/) has transparent nav with white text
  const needsDarkNav = pathname !== '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isDark = scrolled || needsDarkNav;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isDark ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Image
              src="/logowebsite.png"
              alt="TravelAI Logo"
              width={40}
              height={40}
              className="rounded-xl"
            />
            <span className={`text-2xl font-bold transition-colors ${
              isDark ? 'text-gray-900' : 'text-white'
            }`}>
              Travel<span className="gradient-text">AI</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { name: 'Khám Phá', href: '/explore' },
              { name: 'Điểm Đến', href: '/destinations' },
              { name: 'AI Chat', href: '/ai-chat' },
            ].map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`font-medium transition-all hover:scale-105 ${
                  pathname === item.href ? 'text-sky-500' : 
                  isDark ? 'text-gray-700 hover:text-sky-500' : 'text-white/90 hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                    isDark 
                      ? 'bg-gray-100 hover:bg-gray-200' 
                      : 'bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-sky-500 to-violet-500 flex items-center justify-center text-white font-semibold">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className={`font-medium ${isDark ? 'text-gray-700' : 'text-white'}`}>
                    {user.name || 'User'}
                  </span>
                  <svg className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''} ${isDark ? 'text-gray-700' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 fade-in">
                    <Link href="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                      👤 Tài khoản
                    </Link>
                    {user.role === 'admin' && (
                      <Link href="/admin" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                        ⚙️ Quản trị
                      </Link>
                    )}
                    <Link href="/saved" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                      ❤️ Đã lưu
                    </Link>
                    <hr className="my-2" />
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-50"
                    >
                      🚪 Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`font-medium transition-colors ${
                    isDark ? 'text-gray-700 hover:text-sky-500' : 'text-white hover:text-sky-200'
                  }`}
                >
                  Đăng Nhập
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-2.5 bg-gradient-to-r from-sky-500 to-violet-500 text-white font-semibold rounded-full hover:shadow-lg hover:shadow-sky-500/30 transition-all hover:scale-105"
                >
                  Đăng Ký
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <div className={`w-6 h-0.5 mb-1.5 transition-all ${isDark ? 'bg-gray-900' : 'bg-white'} ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}></div>
            <div className={`w-6 h-0.5 mb-1.5 transition-all ${isDark ? 'bg-gray-900' : 'bg-white'} ${menuOpen ? 'opacity-0' : ''}`}></div>
            <div className={`w-6 h-0.5 transition-all ${isDark ? 'bg-gray-900' : 'bg-white'} ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}></div>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-white rounded-2xl shadow-xl p-6 mb-4 fade-in">
            {[
              { name: 'Khám Phá', href: '/explore' },
              { name: 'Điểm Đến', href: '/destinations' },
              { name: 'AI Chat', href: '/ai-chat' },
            ].map((item) => (
              <Link key={item.name} href={item.href} className={`block py-3 font-medium hover:text-sky-500 ${
                pathname === item.href ? 'text-sky-500' : 'text-gray-700'
              }`}>
                {item.name}
              </Link>
            ))}
            <div className="flex gap-3 mt-4 pt-4 border-t">
              {user ? (
                <>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-sky-500 to-violet-500 flex items-center justify-center text-white font-semibold">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span className="font-medium text-gray-700">{user.name || 'User'}</span>
                  </div>
                  <button onClick={logout} className="px-4 py-2 text-red-500 font-medium">
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="flex-1 py-2.5 text-center text-gray-700 font-medium">
                    Đăng Nhập
                  </Link>
                  <Link href="/register" className="flex-1 py-2.5 text-center bg-gradient-to-r from-sky-500 to-violet-500 text-white font-semibold rounded-full">
                    Đăng Ký
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
