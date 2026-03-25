'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { destinationApi, reviewApi, recommendationApi } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

// Dynamic import Map
const Map = dynamic(() => import('../../components/Map'), { 
  ssr: false,
  loading: () => <div className="h-48 bg-gray-100 rounded-xl animate-pulse"></div>
});

interface Cuisine {
  name: string;
  description: string;
}

interface Destination {
  _id: string;
  name: string;
  description: string;
  location: { 
    city: string; 
    country: string;
    coordinates?: { lat: number; lng: number };
  };
  images: string[];
  category: string;
  priceRange: string;
  rating: number;
  reviewCount: number;
  amenities: string[];
  bestTimeToVisit: string[];
  activities: string[];
  cuisine?: Cuisine[];
}

interface Review {
  _id: string;
  user: { name: string; avatar?: string };
  rating: number;
  title: string;
  content: string;
  createdAt: string;
  visitDate?: string;
}

interface Weather {
  temp: number;
  feelsLike: number;
  humidity: number;
  description: string;
  iconUrl: string;
  windSpeed: number;
  cityName: string;
}

interface Forecast {
  date: string;
  tempMin: number;
  tempMax: number;
  iconUrl: string;
  description: string;
}

const categoryLabels: Record<string, string> = {
  beach: '🏖️ Biển',
  mountain: '🏔️ Núi',
  city: '🌆 Thành phố',
  countryside: '🌾 Nông thôn',
  historical: '🏛️ Di tích',
};

const priceLabels: Record<string, string> = {
  budget: '💰 Tiết kiệm',
  'mid-range': '💵 Trung bình',
  luxury: '💎 Cao cấp',
};

// Mock data cho demo
const mockDestination: Destination = {
  _id: '1',
  name: 'Đà Nẵng',
  description: 'Đà Nẵng là thành phố biển xinh đẹp nằm ở miền Trung Việt Nam, nổi tiếng với bãi biển Mỹ Khê tuyệt đẹp, cầu Rồng độc đáo và Bà Nà Hills huyền ảo. Đây là điểm đến lý tưởng cho những ai yêu thích sự kết hợp giữa biển, núi và văn hóa.',
  location: { city: 'Đà Nẵng', country: 'Việt Nam' },
  images: [
    'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1200',
    'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800',
    'https://images.unsplash.com/photo-1570366583862-f91883984fde?w=800',
    'https://images.unsplash.com/photo-1528127269322-539801943592?w=800',
  ],
  category: 'beach',
  priceRange: 'mid-range',
  rating: 4.8,
  reviewCount: 2340,
  amenities: ['WiFi miễn phí', 'Bãi đỗ xe', 'Nhà hàng', 'Hồ bơi', 'Spa'],
  bestTimeToVisit: ['Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 8'],
  activities: ['Tắm biển', 'Lướt sóng', 'Tham quan Bà Nà', 'Ăn hải sản', 'Chụp ảnh cầu Rồng'],
};

const mockReviews: Review[] = [
  {
    _id: '1',
    user: { name: 'Nguyễn Văn A' },
    rating: 5,
    title: 'Tuyệt vời!',
    content: 'Đà Nẵng thực sự là thiên đường. Biển đẹp, đồ ăn ngon, người dân thân thiện. Chắc chắn sẽ quay lại!',
    createdAt: '2024-01-15',
    visitDate: '2024-01-10',
  },
  {
    _id: '2',
    user: { name: 'Trần Thị B' },
    rating: 4,
    title: 'Rất đáng để đi',
    content: 'Cảnh đẹp, nhiều chỗ chụp ảnh. Chỉ tiếc là hơi đông du khách vào cuối tuần.',
    createdAt: '2024-01-10',
  },
];

interface Itinerary {
  _id: string;
  title: string;
  startDate: string;
  endDate: string;
  destinations: { destination: { _id: string; name: string } }[];
}

export default function DestinationDetailPage() {
  const params = useParams();
  const { user, token } = useAuth();
  const [destination, setDestination] = useState<Destination | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [similarDestinations, setSimilarDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [forecast, setForecast] = useState<Forecast[]>([]);
  const [showItineraryModal, setShowItineraryModal] = useState(false);
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [newItinerary, setNewItinerary] = useState({ title: '', startDate: '', endDate: '' });
  const [savingItinerary, setSavingItinerary] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', content: '', visitDate: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    loadData();
  }, [params.id]);

  const loadData = async () => {
    setLoading(true);
    
    try {
      // Load destination from API
      const destRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/destinations/${params.id}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      const destData = await destRes.json();
      
      if (destData.success && destData.data) {
        setDestination(destData.data);
      } else {
        setDestination(null);
      }

      // Load reviews
      const reviewRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/destination/${params.id}`);
      const reviewData = await reviewRes.json();
      
      if (reviewData.success && reviewData.data) {
        setReviews(reviewData.data);
      } else {
        setReviews([]);
      }

      // Load similar destinations
      const similarRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/destinations?category=${destData.data?.category || ''}&limit=3`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      const similarData = await similarRes.json();
      
      if (similarData.success && similarData.data) {
        // Filter out current destination
        setSimilarDestinations(similarData.data.filter((d: Destination) => d._id !== params.id));
      }

      // Track view if logged in
      if (user) {
        recommendationApi.trackView(params.id as string, 0);
        
        // Check if destination is saved
        const savedToken = localStorage.getItem('token');
        if (savedToken) {
          const savedRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/saved/check/${params.id}`,
            { headers: { Authorization: `Bearer ${savedToken}` } }
          );
          const savedData = await savedRes.json();
          if (savedData.success) {
            setIsSaved(savedData.data.saved);
          }
        }
      }

      // Load weather if coordinates available
      if (destData.data?.location?.coordinates) {
        const { lat, lng } = destData.data.location.coordinates;
        
        // Current weather
        const weatherRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/weather/current?lat=${lat}&lng=${lng}`
        );
        const weatherData = await weatherRes.json();
        if (weatherData.success) {
          setWeather(weatherData.data);
        }

        // Forecast
        const forecastRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/weather/forecast?lat=${lat}&lng=${lng}`
        );
        const forecastData = await forecastRes.json();
        if (forecastData.success) {
          setForecast(forecastData.data);
        }
      }
    } catch (error) {
      console.error('Error loading destination:', error);
      setDestination(null);
    }

    setLoading(false);
  };

  const handleSave = async () => {
    if (!user) {
      alert('Vui lòng đăng nhập để lưu điểm đến');
      return;
    }
    
    const savedToken = localStorage.getItem('token');
    if (!savedToken) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/saved/${params.id}`,
        { 
          method: 'POST',
          headers: { Authorization: `Bearer ${savedToken}` } 
        }
      );
      const data = await res.json();
      if (data.success) {
        setIsSaved(data.data.saved);
      }
    } catch (error) {
      console.error('Error saving destination:', error);
    }
  };

  const loadItineraries = async () => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/itineraries`,
        { headers: { Authorization: `Bearer ${savedToken}` } }
      );
      const data = await res.json();
      if (data.success) {
        setItineraries(data.data);
      }
    } catch (error) {
      console.error('Error loading itineraries:', error);
    }
  };

  const handleAddToItinerary = async (itineraryId: string) => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) return;

    setSavingItinerary(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/itineraries/${itineraryId}/destinations`,
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${savedToken}` 
          },
          body: JSON.stringify({ destinationId: params.id })
        }
      );
      const data = await res.json();
      if (data.success) {
        alert('Đã thêm vào lịch trình!');
        setShowItineraryModal(false);
      } else {
        alert(data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error adding to itinerary:', error);
    }
    setSavingItinerary(false);
  };

  const handleCreateItinerary = async () => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken || !newItinerary.title || !newItinerary.startDate || !newItinerary.endDate) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setSavingItinerary(true);
    try {
      // Create new itinerary
      const createRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/itineraries`,
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${savedToken}` 
          },
          body: JSON.stringify(newItinerary)
        }
      );
      const createData = await createRes.json();
      
      if (createData.success) {
        // Add destination to new itinerary
        await handleAddToItinerary(createData.data._id);
        setNewItinerary({ title: '', startDate: '', endDate: '' });
        loadItineraries();
      }
    } catch (error) {
      console.error('Error creating itinerary:', error);
    }
    setSavingItinerary(false);
  };

  const openItineraryModal = () => {
    if (!user) {
      alert('Vui lòng đăng nhập để thêm vào lịch trình');
      return;
    }
    loadItineraries();
    setShowItineraryModal(true);
  };

  const openReviewModal = () => {
    if (!user) {
      alert('Vui lòng đăng nhập để viết đánh giá');
      return;
    }
    setReviewForm({ rating: 5, title: '', content: '', visitDate: '' });
    setShowReviewModal(true);
  };

  const handleSubmitReview = async () => {
    if (!reviewForm.content.trim()) {
      alert('Vui lòng nhập nội dung đánh giá');
      return;
    }

    const savedToken = localStorage.getItem('token');
    if (!savedToken) return;

    setSubmittingReview(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${savedToken}`
        },
        body: JSON.stringify({
          destination: params.id,
          rating: reviewForm.rating,
          title: reviewForm.title,
          content: reviewForm.content,
          visitDate: reviewForm.visitDate || undefined
        })
      });
      const data = await res.json();
      
      if (data.success) {
        alert('Đánh giá đã được gửi!');
        setShowReviewModal(false);
        // Reload reviews
        const reviewRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/destination/${params.id}`);
        const reviewData = await reviewRes.json();
        if (reviewData.success) {
          setReviews(reviewData.data);
        }
      } else {
        alert(data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Có lỗi xảy ra');
    }
    setSubmittingReview(false);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}>
        ★
      </span>
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Không tìm thấy điểm đến</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Images */}
      <div className="pt-20">
        <div className="relative h-[60vh] bg-gray-900">
          <Image
            src={destination.images[activeImage] || destination.images[0]}
            alt={destination.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>

          {/* Image Navigation */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {destination.images.slice(0, 5).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`w-3 h-3 rounded-full transition-all ${
                  idx === activeImage ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>

          {/* View All Photos */}
          <button
            onClick={() => setShowAllPhotos(true)}
            className="absolute bottom-6 right-6 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-lg font-medium text-gray-800 hover:bg-white transition-all"
          >
            📷 Xem tất cả ảnh
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-sky-100 text-sky-600 rounded-full text-sm font-medium">
                      {categoryLabels[destination.category] || destination.category}
                    </span>
                    <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium">
                      {priceLabels[destination.priceRange] || destination.priceRange}
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900">{destination.name}</h1>
                  <p className="text-gray-500 flex items-center gap-1 mt-1">
                    📍 {destination.location.city}, {destination.location.country}
                  </p>
                </div>
                <button
                  onClick={handleSave}
                  className={`p-3 rounded-full transition-all ${
                    isSaved
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <svg className="w-6 h-6" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {renderStars(destination.rating)}
                  <span className="font-bold text-gray-900 ml-1">{destination.rating}</span>
                </div>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">{destination.reviewCount.toLocaleString('vi-VN')} đánh giá</span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Giới thiệu</h2>
              <p className="text-gray-600 leading-relaxed">{destination.description}</p>
            </div>

            {/* Activities */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Hoạt động nổi bật</h2>
              <div className="flex flex-wrap gap-3">
                {destination.activities.map((activity, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-gradient-to-r from-sky-50 to-violet-50 text-gray-700 rounded-full border border-sky-100"
                  >
                    {activity}
                  </span>
                ))}
              </div>
            </div>

            {/* Best Time */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Thời điểm lý tưởng</h2>
              <div className="flex flex-wrap gap-3">
                {destination.bestTimeToVisit.map((time, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100"
                  >
                    🗓️ {time}
                  </span>
                ))}
              </div>
            </div>

            {/* Cuisine / Ẩm thực */}
            {destination.cuisine && destination.cuisine.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">🍜 Ẩm thực đặc sản</h2>
                <div className="space-y-4">
                  {destination.cuisine.map((item, idx) => (
                    <div key={idx} className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100">
                      <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Đánh giá ({reviews.length})</h2>
                <button 
                  onClick={openReviewModal}
                  className="px-4 py-2 bg-sky-500 text-white rounded-lg font-medium hover:bg-sky-600 transition-all"
                >
                  ✍️ Viết đánh giá
                </button>
              </div>

              {reviews.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-2">Chưa có đánh giá nào</p>
                  <p className="text-sm text-gray-400">Hãy là người đầu tiên đánh giá!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                  <div key={review._id} className="border-b border-gray-100 pb-6 last:border-0">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-sky-500 to-violet-500 flex items-center justify-center text-white font-bold">
                        {review.user.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">{review.user.name}</span>
                          <span className="text-gray-400 text-sm">
                            {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                          {renderStars(review.rating)}
                        </div>
                        {review.title && (
                          <h4 className="font-medium text-gray-900 mb-1">{review.title}</h4>
                        )}
                        <p className="text-gray-600">{review.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          
          <div className="space-y-6">
            {/* Actions Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <button
                onClick={openItineraryModal}
                className="w-full py-4 bg-gradient-to-r from-sky-500 to-violet-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-sky-500/30 transition-all"
              >
                📅 Thêm vào lịch trình
              </button>

              {/* Amenities */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-3">Tiện ích</h3>
                <div className="grid grid-cols-2 gap-2">
                  {destination.amenities.slice(0, 6).map((amenity, idx) => (
                    <span key={idx} className="text-sm text-gray-600 flex items-center gap-1">
                      ✓ {amenity}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">Vị trí</h3>
              {destination.location?.coordinates ? (
                <Map
                  destinations={[destination as any]}
                  center={[destination.location.coordinates.lat, destination.location.coordinates.lng]}
                  zoom={12}
                  height="200px"
                />
              ) : (
                <div className="h-48 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                  🗺️ Không có tọa độ
                </div>
              )}
              <a 
                href={`https://www.google.com/maps?q=${destination.location?.coordinates?.lat},${destination.location?.coordinates?.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 block text-center text-sm text-sky-500 hover:text-sky-600"
              >
                Xem trên Google Maps →
              </a>
            </div>

            {/* Weather */}
            {weather && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">🌤️ Thời tiết hiện tại</h3>
                <div className="flex items-center gap-4 mb-4">
                  <img src={weather.iconUrl} alt={weather.description} className="w-16 h-16" />
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{weather.temp}°C</p>
                    <p className="text-gray-500 capitalize">{weather.description}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-500">Cảm giác như</p>
                    <p className="font-semibold text-gray-900">{weather.feelsLike}°C</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-500">Độ ẩm</p>
                    <p className="font-semibold text-gray-900">{weather.humidity}%</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 col-span-2">
                    <p className="text-gray-500">Gió</p>
                    <p className="font-semibold text-gray-900">{weather.windSpeed} km/h</p>
                  </div>
                </div>

                {/* 5-day Forecast */}
                {forecast.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h4 className="font-medium text-gray-900 mb-3">Dự báo 5 ngày</h4>
                    <div className="space-y-2">
                      {forecast.map((day, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 w-20">
                            {new Date(day.date).toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'numeric' })}
                          </span>
                          <img src={day.iconUrl} alt={day.description} className="w-8 h-8" />
                          <span className="text-gray-900 font-medium w-16 text-right">
                            {day.tempMin}° - {day.tempMax}°
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Similar Destinations */}
        {similarDestinations.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Điểm đến tương tự</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {similarDestinations.map((dest) => (
                <Link
                  key={dest._id}
                  href={`/destinations/${dest._id}`}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all group"
                >
                  <div className="relative h-48">
                    <Image
                      src={dest.images[0] || 'https://via.placeholder.com/400'}
                      alt={dest.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900">{dest.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <span className="text-yellow-400">★</span>
                      {dest.rating}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />

      {/* Photo Gallery Modal */}
      {showAllPhotos && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <button
            onClick={() => setShowAllPhotos(false)}
            className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300"
          >
            ✕
          </button>
          <div className="max-w-4xl w-full">
            <Image
              src={destination.images[activeImage]}
              alt={destination.name}
              width={1200}
              height={800}
              className="rounded-lg"
            />
            <div className="flex justify-center gap-2 mt-4">
              {destination.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${
                    idx === activeImage ? 'border-white' : 'border-transparent opacity-50'
                  }`}
                >
                  <Image src={img} alt="" width={64} height={64} className="object-cover w-full h-full" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Itinerary Modal */}
      {showItineraryModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Thêm vào lịch trình</h3>
                <button
                  onClick={() => setShowItineraryModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Existing Itineraries */}
              {itineraries.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Lịch trình hiện có</h4>
                  <div className="space-y-2">
                    {itineraries.map((it) => (
                      <button
                        key={it._id}
                        onClick={() => handleAddToItinerary(it._id)}
                        disabled={savingItinerary}
                        className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-sky-500 hover:bg-sky-50 transition-all disabled:opacity-50"
                      >
                        <p className="font-medium text-gray-900">{it.title}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(it.startDate).toLocaleDateString('vi-VN')} - {new Date(it.endDate).toLocaleDateString('vi-VN')}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {it.destinations.length} điểm đến
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Create New Itinerary */}
              <div className="pt-4 border-t border-gray-100">
                <h4 className="font-medium text-gray-900 mb-3">Tạo lịch trình mới</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Tên lịch trình"
                    value={newItinerary.title}
                    onChange={(e) => setNewItinerary({ ...newItinerary, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-sky-500"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-gray-500">Ngày bắt đầu</label>
                      <input
                        type="date"
                        value={newItinerary.startDate}
                        onChange={(e) => setNewItinerary({ ...newItinerary, startDate: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-sky-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Ngày kết thúc</label>
                      <input
                        type="date"
                        value={newItinerary.endDate}
                        onChange={(e) => setNewItinerary({ ...newItinerary, endDate: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleCreateItinerary}
                    disabled={savingItinerary || !newItinerary.title || !newItinerary.startDate || !newItinerary.endDate}
                    className="w-full py-3 bg-gradient-to-r from-sky-500 to-violet-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {savingItinerary ? 'Đang lưu...' : 'Tạo và thêm điểm đến'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Viết đánh giá</h3>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Đánh giá của bạn</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className={`text-3xl transition-all ${
                        star <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-300'
                      } hover:scale-110`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề (tùy chọn)</label>
                <input
                  type="text"
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                  placeholder="VD: Tuyệt vời!"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung đánh giá *</label>
                <textarea
                  value={reviewForm.content}
                  onChange={(e) => setReviewForm({ ...reviewForm, content: e.target.value })}
                  placeholder="Chia sẻ trải nghiệm của bạn..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-sky-500 resize-none"
                />
              </div>

              {/* Visit Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ngày đi (tùy chọn)</label>
                <input
                  type="date"
                  value={reviewForm.visitDate}
                  onChange={(e) => setReviewForm({ ...reviewForm, visitDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmitReview}
                disabled={submittingReview || !reviewForm.content.trim()}
                className="w-full py-3 bg-gradient-to-r from-sky-500 to-violet-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
              >
                {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
