'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    name: '',
    preferences: {
      travelStyle: [] as string[],
      budget: '',
      interests: [] as string[]
    }
  });
  const [stats, setStats] = useState({ saved: 0, itineraries: 0, reviews: 0 });

  const travelStyles = ['Phiêu lưu', 'Thư giãn', 'Văn hóa', 'Ẩm thực', 'Thiên nhiên', 'Lịch sử'];
  const budgetOptions = [
    { value: 'low', label: '💰 Tiết kiệm' },
    { value: 'medium', label: '💵 Trung bình' },
    { value: 'high', label: '💎 Cao cấp' }
  ];
  const interestOptions = ['Biển', 'Núi', 'Thành phố', 'Nông thôn', 'Di tích', 'Ẩm thực', 'Mua sắm', 'Chụp ảnh'];

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadProfile();
    loadStats();
  }, [user, router]);

  const loadProfile = async () => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${savedToken}` }
      });
      const data = await res.json();
      if (data.success || data._id) {
        const userData = data.data || data;
        setFormData({
          name: userData.name || '',
          preferences: userData.preferences || { travelStyle: [], budget: '', interests: [] }
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadStats = async () => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) return;

    try {
      const [savedRes, itinRes, reviewsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/saved`, { headers: { Authorization: `Bearer ${savedToken}` } }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/itineraries`, { headers: { Authorization: `Bearer ${savedToken}` } }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/my`, { headers: { Authorization: `Bearer ${savedToken}` } })
      ]);
      const savedData = await savedRes.json();
      const itinData = await itinRes.json();
      const reviewsData = await reviewsRes.json();
      
      setStats({
        saved: savedData.data?.length || 0,
        itineraries: itinData.data?.length || 0,
        reviews: reviewsData.data?.length || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    const savedToken = localStorage.getItem('token');
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${savedToken}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: 'Cập nhật thành công!' });
        setEditing(false);
      } else {
        setMessage({ type: 'error', text: data.message || 'Có lỗi xảy ra' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Không thể cập nhật profile' });
    } finally {
      setLoading(false);
    }
  };

  const toggleTravelStyle = (style: string) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        travelStyle: prev.preferences.travelStyle.includes(style)
          ? prev.preferences.travelStyle.filter(s => s !== style)
          : [...prev.preferences.travelStyle, style]
      }
    }));
  };

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        interests: prev.preferences.interests.includes(interest)
          ? prev.preferences.interests.filter(i => i !== interest)
          : [...prev.preferences.interests, interest]
      }
    }));
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-500 to-violet-500 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-4xl font-bold">
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{formData.name || user.name}</h1>
              <p className="text-white/80">{user.email}</p>
              <p className="text-sm text-white/60 mt-1">
                {user.role === 'admin' ? '👑 Quản trị viên' : '✈️ Thành viên'}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 text-center shadow-sm">
            <div className="text-3xl font-bold text-sky-500">{stats.saved}</div>
            <div className="text-gray-500">Đã lưu</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-sm">
            <div className="text-3xl font-bold text-violet-500">{stats.itineraries}</div>
            <div className="text-gray-500">Lịch trình</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-sm">
            <div className="text-3xl font-bold text-amber-500">{stats.reviews}</div>
            <div className="text-gray-500">Đánh giá</div>
          </div>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message.text}
          </div>
        )}

        {/* Profile Form */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Thông tin cá nhân</h2>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 text-sky-500 hover:bg-sky-50 rounded-lg transition"
              >
                ✏️ Chỉnh sửa
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg transition"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition disabled:opacity-50"
                >
                  {loading ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
              {editing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{formData.name || 'Chưa cập nhật'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <p className="text-gray-900">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">Sở thích du lịch</h2>

          {/* Travel Style */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Phong cách du lịch</label>
            <div className="flex flex-wrap gap-2">
              {travelStyles.map(style => (
                <button
                  key={style}
                  onClick={() => editing && toggleTravelStyle(style)}
                  disabled={!editing}
                  className={`px-4 py-2 rounded-full text-sm transition ${
                    formData.preferences.travelStyle.includes(style)
                      ? 'bg-sky-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } ${!editing && 'cursor-default'}`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Ngân sách</label>
            <div className="flex gap-3">
              {budgetOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => editing && setFormData(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, budget: option.value }
                  }))}
                  disabled={!editing}
                  className={`px-4 py-2 rounded-lg text-sm transition ${
                    formData.preferences.budget === option.value
                      ? 'bg-violet-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } ${!editing && 'cursor-default'}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Sở thích</label>
            <div className="flex flex-wrap gap-2">
              {interestOptions.map(interest => (
                <button
                  key={interest}
                  onClick={() => editing && toggleInterest(interest)}
                  disabled={!editing}
                  className={`px-4 py-2 rounded-full text-sm transition ${
                    formData.preferences.interests.includes(interest)
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } ${!editing && 'cursor-default'}`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Truy cập nhanh</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => router.push('/saved')}
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <span className="text-2xl">❤️</span>
              <span>Địa điểm đã lưu</span>
            </button>
            <button
              onClick={() => router.push('/ai-chat')}
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <span className="text-2xl">🤖</span>
              <span>Chat với AI</span>
            </button>
            <button
              onClick={() => router.push('/explore')}
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <span className="text-2xl">🗺️</span>
              <span>Khám phá bản đồ</span>
            </button>
            <button
              onClick={() => router.push('/destinations')}
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <span className="text-2xl">📍</span>
              <span>Điểm đến</span>
            </button>
            {user.role === 'admin' && (
              <button
                onClick={() => router.push('/admin')}
                className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition col-span-2"
              >
                <span className="text-2xl">⚙️</span>
                <span>Quản trị hệ thống</span>
              </button>
            )}
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full py-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition font-medium"
        >
          🚪 Đăng xuất
        </button>
      </main>

      <Footer />
    </div>
  );
}
