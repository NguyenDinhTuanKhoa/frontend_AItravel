'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { destinationApi, recommendationApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';

interface Destination {
  _id: string;
  name: string;
  description: string;
  location: { city: string; country: string };
  images: string[];
  category: string;
  priceRange: string;
  rating: number;
  reviewCount: number;
}

const categories = [
  { id: '', label: 'Tất cả', icon: '🌍', color: 'from-gray-500 to-gray-600' },
  { id: 'beach', label: 'Biển', icon: '🏖️', color: 'from-cyan-500 to-blue-500' },
  { id: 'mountain', label: 'Núi', icon: '🏔️', color: 'from-emerald-500 to-green-600' },
  { id: 'city', label: 'Thành phố', icon: '🌆', color: 'from-violet-500 to-purple-600' },
  { id: 'countryside', label: 'Nông thôn', icon: '🌾', color: 'from-amber-500 to-orange-500' },
  { id: 'historical', label: 'Di tích', icon: '🏛️', color: 'from-rose-500 to-red-600' },
];

const priceRanges = [
  { id: '', label: 'Tất cả mức giá', icon: '💵' },
  { id: 'budget', label: 'Tiết kiệm', icon: '💰' },
  { id: 'mid-range', label: 'Trung bình', icon: '💳' },
  { id: 'luxury', label: 'Cao cấp', icon: '💎' },
];

// Mock data
const mockDestinations: Destination[] = [
  {
    _id: '1',
    name: 'Đà Nẵng',
    description: 'Thành phố biển xinh đẹp miền Trung với bãi biển Mỹ Khê nổi tiếng, cầu Rồng độc đáo và Bà Nà Hills huyền ảo.',
    location: { city: 'Đà Nẵng', country: 'Việt Nam' },
    images: ['https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800'],
    category: 'beach',
    priceRange: 'mid-range',
    rating: 4.8,
    reviewCount: 2340,
  },
  {
    _id: '2',
    name: 'Phú Quốc',
    description: 'Đảo ngọc phương Nam với những bãi biển hoang sơ, nước biển trong xanh và hoàng hôn tuyệt đẹp.',
    location: { city: 'Phú Quốc', country: 'Việt Nam' },
    images: ['https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800'],
    category: 'beach',
    priceRange: 'luxury',
    rating: 4.9,
    reviewCount: 1890,
  },
  {
    _id: '3',
    name: 'Sapa',
    description: 'Vùng núi thơ mộng Tây Bắc với ruộng bậc thang tuyệt đẹp và văn hóa dân tộc đặc sắc.',
    location: { city: 'Sapa', country: 'Việt Nam' },
    images: ['https://images.unsplash.com/photo-1570366583862-f91883984fde?w=800'],
    category: 'mountain',
    priceRange: 'budget',
    rating: 4.7,
    reviewCount: 1560,
  },
  {
    _id: '4',
    name: 'Hội An',
    description: 'Phố cổ di sản thế giới với những ngôi nhà cổ, đèn lồng lung linh và ẩm thực đặc sắc.',
    location: { city: 'Hội An', country: 'Việt Nam' },
    images: ['https://images.unsplash.com/photo-1555921015-5532091f6026?w=800'],
    category: 'historical',
    priceRange: 'mid-range',
    rating: 4.8,
    reviewCount: 3120,
  },
  {
    _id: '5',
    name: 'Nha Trang',
    description: 'Thành phố biển sôi động với vịnh biển đẹp, đảo Vinpearl và cuộc sống về đêm náo nhiệt.',
    location: { city: 'Nha Trang', country: 'Việt Nam' },
    images: ['https://images.unsplash.com/photo-1573790387438-4da905039392?w=800'],
    category: 'beach',
    priceRange: 'mid-range',
    rating: 4.5,
    reviewCount: 2780,
  },
  {
    _id: '6',
    name: 'Đà Lạt',
    description: 'Thành phố ngàn hoa với khí hậu mát mẻ quanh năm, kiến trúc Pháp cổ và thiên nhiên thơ mộng.',
    location: { city: 'Đà Lạt', country: 'Việt Nam' },
    images: ['https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?w=800'],
    category: 'mountain',
    priceRange: 'budget',
    rating: 4.8,
    reviewCount: 2100,
  },
];

function DestinationsContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPrice, setSelectedPrice] = useState('');
  const [sortBy, setSortBy] = useState('rating');

  // Đọc query params từ URL khi component mount
  useEffect(() => {
    const searchFromUrl = searchParams.get('search');
    const categoryFromUrl = searchParams.get('category');
    
    if (searchFromUrl) {
      setSearchQuery(searchFromUrl);
    }
    if (categoryFromUrl) {
      // Map category name từ tiếng Việt sang id
      const categoryMap: { [key: string]: string } = {
        'Biển': 'beach',
        'Núi': 'mountain',
        'Di tích': 'historical',
        'Thành phố': 'city',
        'Ẩm thực': '',
        'Nông thôn': 'countryside',
      };
      const categoryId = categoryMap[categoryFromUrl] || categoryFromUrl;
      setSelectedCategory(categoryId);
    }
  }, [searchParams]);

  useEffect(() => {
    loadDestinations();
  }, [selectedCategory, selectedPrice, sortBy, searchQuery]);

  const loadDestinations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedPrice) params.append('priceRange', selectedPrice);
      if (searchQuery) params.append('search', searchQuery);
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/destinations?${params.toString()}`, {
        cache: 'no-store', // Disable cache để luôn fetch data mới
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      const data = await res.json();
      
      if (data.success && data.data) {
        setDestinations(data.data);
      } else {
        setDestinations([]);
      }
    } catch (error) {
      console.error('Error loading destinations:', error);
      setDestinations([]);
    }
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadDestinations();
    if (user) {
      recommendationApi.trackSearch(searchQuery, {
        category: selectedCategory,
        priceRange: selectedPrice,
      });
    }
  };

  const sortedDestinations = [...destinations].sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'reviews') return b.reviewCount - a.reviewCount;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  const selectedCategoryData = categories.find(c => c.id === selectedCategory) || categories[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <div className="relative pt-20 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div className={`absolute inset-0 bg-gradient-to-br ${selectedCategoryData.color} opacity-90`}></div>
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920')] bg-cover bg-center opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-transparent to-transparent"></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-32 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl float"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-white/10 rounded-full blur-3xl float float-delay-1"></div>

        <div className="relative max-w-7xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <span className="inline-block text-6xl mb-4 animate-bounce">{selectedCategoryData.icon}</span>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              Khám Phá Điểm Đến
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Tìm kiếm và khám phá những địa điểm tuyệt vời nhất Việt Nam
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-2 border border-white/20 shadow-2xl">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl">🔍</span>
                  <input
                    type="text"
                    placeholder="Tìm kiếm điểm đến mơ ước..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-14 pr-4 py-4 bg-white rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 text-lg"
                  />
                </div>
                <button
                  type="submit"
                  className="px-8 py-4 bg-white text-gray-800 font-bold rounded-xl hover:bg-gray-100 transition-all hover:scale-105 shadow-lg"
                >
                  Tìm kiếm
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                  selectedCategory === cat.id
                    ? `bg-gradient-to-r ${cat.color} text-white shadow-lg scale-105`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="text-xl">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filters & Results */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filter Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-3">
            {/* Price Filter */}
            <div className="relative">
              <select
                value={selectedPrice}
                onChange={(e) => setSelectedPrice(e.target.value)}
                className="appearance-none px-5 py-3 pr-10 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium cursor-pointer shadow-sm"
              >
                {priceRanges.map((price) => (
                  <option key={price.id} value={price.id}>
                    {price.icon} {price.label}
                  </option>
                ))}
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">▼</span>
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none px-5 py-3 pr-10 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium cursor-pointer shadow-sm"
              >
                <option value="rating">⭐ Đánh giá cao nhất</option>
                <option value="reviews">💬 Nhiều đánh giá nhất</option>
                <option value="name">🔤 Tên A-Z</option>
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">▼</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-gray-500 font-medium">
              {sortedDestinations.length} điểm đến
            </span>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full"></div>
          </div>
        ) : sortedDestinations.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm">
            <span className="text-6xl mb-4 block">🔍</span>
            <p className="text-gray-500 text-xl mb-4">Không tìm thấy điểm đến phù hợp</p>
            <button
              onClick={() => {
                setSelectedCategory('');
                setSelectedPrice('');
                setSearchQuery('');
              }}
              className="px-6 py-3 bg-sky-500 text-white rounded-xl font-medium hover:bg-sky-600 transition-all"
            >
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedDestinations.map((dest, index) => (
              <Link
                key={dest._id}
                href={`/destinations/${dest._id}`}
                className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={dest.images[0] || 'https://via.placeholder.com/400'}
                    alt={dest.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  
                  {/* Category Badge */}
                  <span className={`absolute top-4 left-4 px-3 py-1.5 bg-gradient-to-r ${
                    categories.find(c => c.id === dest.category)?.color || 'from-gray-500 to-gray-600'
                  } text-white rounded-full text-sm font-medium shadow-lg`}>
                    {categories.find(c => c.id === dest.category)?.icon} {categories.find(c => c.id === dest.category)?.label}
                  </span>

                  {/* Favorite Button */}
                  <button 
                    onClick={(e) => { e.preventDefault(); }}
                    className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-lg group/fav"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>

                  {/* Location & Name */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white/80 text-sm mb-1 flex items-center gap-1">
                      📍 {dest.location.city}, {dest.location.country}
                    </p>
                    <h3 className="text-2xl font-bold text-white">{dest.name}</h3>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <p className="text-gray-600 line-clamp-2 mb-4">{dest.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full">
                        <span className="text-yellow-500 text-lg">★</span>
                        <span className="font-bold text-gray-900">{dest.rating}</span>
                      </div>
                      <span className="text-gray-400 text-sm">
                        ({dest.reviewCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')} đánh giá)
                      </span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      dest.priceRange === 'budget' ? 'bg-green-100 text-green-700' :
                      dest.priceRange === 'mid-range' ? 'bg-blue-100 text-blue-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {priceRanges.find(p => p.id === dest.priceRange)?.icon} {priceRanges.find(p => p.id === dest.priceRange)?.label}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="relative bg-gradient-to-r from-sky-500 via-violet-500 to-orange-500 rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920')] bg-cover bg-center opacity-20"></div>
          <div className="relative p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Không tìm thấy điểm đến ưng ý?
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Hãy để AI giúp bạn tìm điểm đến hoàn hảo dựa trên sở thích của bạn
            </p>
            <Link
              href="/ai-chat"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-800 font-bold rounded-xl hover:bg-gray-100 transition-all hover:scale-105 shadow-xl"
            >
              <span>🤖</span>
              Hỏi TravelAI ngay
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

// Wrapper component với Suspense boundary cho useSearchParams
export default function DestinationsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full"></div>
      </div>
    }>
      <DestinationsContent />
    </Suspense>
  );
}
