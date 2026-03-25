'use client';
import { useState, useEffect } from 'react';
import { adminApi } from '../lib/adminApi';

interface Stats {
  counts: { users: number; destinations: number; reviews: number };
  recentUsers: { _id: string; name: string; email: string; createdAt: string }[];
  recentReviews: { _id: string; user: { name: string }; destination: { name: string }; rating: number; createdAt: string }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const { data } = await adminApi.getStats();
    if (data) setStats(data as Stats);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-sky-100 flex items-center justify-center text-2xl">
              👥
            </div>
            <div>
              <p className="text-gray-500 text-sm">Người dùng</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.counts.users || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center text-2xl">
              🏝️
            </div>
            <div>
              <p className="text-gray-500 text-sm">Điểm đến</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.counts.destinations || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-orange-100 flex items-center justify-center text-2xl">
              ⭐
            </div>
            <div>
              <p className="text-gray-500 text-sm">Đánh giá</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.counts.reviews || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Người dùng mới</h3>
          <div className="space-y-4">
            {stats?.recentUsers?.map((user) => (
              <div key={user._id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-sky-500 to-violet-500 flex items-center justify-center text-white font-bold">
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
            ))}
            {(!stats?.recentUsers || stats.recentUsers.length === 0) && (
              <p className="text-gray-500 text-center py-4">Chưa có người dùng</p>
            )}
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Đánh giá mới</h3>
          <div className="space-y-4">
            {stats?.recentReviews?.map((review) => (
              <div key={review._id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  ⭐
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{review.destination?.name}</p>
                  <p className="text-sm text-gray-500">bởi {review.user?.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-orange-500">{review.rating}/5</p>
                  <span className="text-xs text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>
            ))}
            {(!stats?.recentReviews || stats.recentReviews.length === 0) && (
              <p className="text-gray-500 text-center py-4">Chưa có đánh giá</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
