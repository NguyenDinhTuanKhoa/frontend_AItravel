'use client';
import { useState, useEffect } from 'react';
import { adminApi } from '../../lib/adminApi';

interface Review {
  _id: string;
  user: { _id: string; name: string; email: string };
  destination: { _id: string; name: string };
  rating: number;
  title: string;
  content: string;
  createdAt: string;
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadReviews();
  }, [page]);

  const loadReviews = async () => {
    setLoading(true);
    const { data } = await adminApi.getReviews(page);
    if (data) {
      const result = data as { reviews: Review[]; totalPages: number };
      setReviews(result.reviews);
      setTotalPages(result.totalPages);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc muốn xóa đánh giá này?')) {
      await adminApi.deleteReview(id);
      loadReviews();
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>★</span>
    ));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Quản lý Đánh giá</h2>

      {/* Reviews List */}
      <div className="bg-white rounded-2xl shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Đang tải...</div>
        ) : reviews.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Chưa có đánh giá nào</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {reviews.map((review) => (
              <div key={review._id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-sky-500 to-violet-500 flex items-center justify-center text-white font-bold">
                      {review.user?.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">{review.user?.name}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-500 text-sm">{review.user?.email}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-sky-100 text-sky-700 rounded-full text-sm">
                          {review.destination?.name}
                        </span>
                        <div className="flex">{renderStars(review.rating)}</div>
                        <span className="text-gray-400 text-sm">
                          {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      {review.title && (
                        <h4 className="font-medium text-gray-900 mb-1">{review.title}</h4>
                      )}
                      <p className="text-gray-600">{review.content}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(review._id)}
                    className="px-3 py-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t flex items-center justify-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border rounded-lg disabled:opacity-50"
            >
              ←
            </button>
            <span className="text-gray-600">
              Trang {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 border rounded-lg disabled:opacity-50"
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
