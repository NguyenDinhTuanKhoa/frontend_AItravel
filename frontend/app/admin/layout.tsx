'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  const menuItems = [
    { name: 'Dashboard', href: '/admin', icon: '📊' },
    { name: 'Điểm đến', href: '/admin/destinations', icon: '🏝️' },
    { name: 'Đánh giá', href: '/admin/reviews', icon: '⭐' },
    { name: 'Người dùng', href: '/admin/users', icon: '👥' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-900 text-white transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-800">
          <Link href="/admin" className="flex items-center gap-3">
            <Image src="/logowebsite.png" alt="Logo" width={40} height={40} className="rounded-xl" />
            {sidebarOpen && (
              <span className="text-xl font-bold">
                Travel<span className="text-sky-400">AI</span>
              </span>
            )}
          </Link>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-800 transition-colors"
                >
                  <span className="text-xl">{item.icon}</span>
                  {sidebarOpen && <span>{item.name}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Toggle & Back */}
        <div className="p-4 border-t border-gray-800 space-y-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 rounded-xl hover:bg-gray-700"
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-4 py-2 text-gray-400 hover:text-white"
          >
            {sidebarOpen ? '← Về trang chủ' : '🏠'}
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800">Admin Panel</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Xin chào, {user.name}</span>
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-sky-500 to-violet-500 flex items-center justify-center text-white font-bold">
              {user.name.charAt(0)}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
