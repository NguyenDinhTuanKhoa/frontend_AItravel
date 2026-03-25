'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Navbar from '../components/Navbar';

const Map = dynamic(() => import('../components/Map'), { 
  ssr: false,
  loading: () => (
    <div className="h-full bg-gray-100 animate-pulse flex items-center justify-center">
      <span className="text-gray-400">Đang tải bản đồ...</span>
    </div>
  )
});

interface Destination {
  _id: string;
  name: string;
  description: string;
  images: string[];
  category: string;
  rating: number;
  reviewCount: number;
  priceRange: string;
  location: {
    city: string;
    country: string;
    coordinates?: { lat: number; lng: number };
  };
}

const categories = [
  { id: '', label: 'Tất cả', icon: '🌍', color: 'bg-gray-500' },
  { id: 'beach', label: 'Biển', icon: '🏖️', color: 'bg-cyan-500' },
  { id: 'mountain', label: 'Núi', icon: '🏔️', color: 'bg-green-500' },
  { id: 'city', label: 'Thành phố', icon: '🌆', color: 'bg-violet-500' },
  { id: 'countryside', label: 'Nông thôn', icon: '🌾', color: 'bg-amber-500' },
  { id: 'historical', label: 'Di tích', icon: '🏛️', color: 'bg-red-500' },
];

export default function ExplorePage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/destinations?limit=100`);
      const data = await res.json();
      if (data.success) {
        setDestinations(data.data);
      }
    } catch (error) {
      console.error('Error fetching destinations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDestinations = useMemo(() => {
    return destinations.filter(dest => {
      const matchCategory = !selectedCategory || dest.category === selectedCategory;
      const matchSearch = !searchQuery || 
        dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dest.location.city.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [destinations, selectedCategory, searchQuery]);

  const handleMarkerClick = (dest: Destination) => {
    setSelectedDestination(dest);
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      // Find first matching destination
      const found = filteredDestinations[0];
      if (found) {
        setSelectedDestination(found);
      }
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <Navbar />
      
      <div className="flex-1 pt-20 relative">
        {/* Search Bar - Compact floating */}
        <div className="absolute top-24 left-4 z-[1000]">
          <div className="bg-white rounded-xl shadow-lg p-2 flex items-center gap-2">
            <span className="text-gray-400 pl-2">🔍</span>
            <input
              type="text"
              placeholder="Tìm kiếm địa điểm... (Enter để tìm)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              className="w-72 px-2 py-2 bg-transparent focus:outline-none text-gray-800"
            />
            <span className="text-sm text-gray-400 pr-2">{filteredDestinations.length}</span>
          </div>
        </div>

        {/* Category Pills - Bottom center */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000]">
          <div className="bg-white/95 backdrop-blur-sm rounded-full shadow-lg px-2 py-2 flex items-center gap-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${
                  selectedCategory === cat.id
                    ? `${cat.color} text-white`
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{cat.icon}</span>
                <span className="hidden sm:inline">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Map - Fullscreen */}
        <div className="h-full w-full">
          {loading ? (
            <div className="h-full flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <div className="animate-spin w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-500">Đang tải bản đồ...</p>
              </div>
            </div>
          ) : (
            <Map
              destinations={filteredDestinations as any}
              center={[16.0, 106.0]}
              zoom={6}
              height="100%"
              onMarkerClick={handleMarkerClick as any}
              selectedId={selectedDestination?._id}
            />
          )}
        </div>

        {/* Selected Destination Card */}
        {selectedDestination && (
          <div className="absolute bottom-20 left-4 z-[1000] w-80">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <button
                onClick={() => setSelectedDestination(null)}
                className="absolute top-3 right-3 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white z-10"
              >
                ✕
              </button>
              
              {/* Image */}
              <div className="relative h-40">
                <img
                  src={selectedDestination.images[0]}
                  alt={selectedDestination.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-3 left-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
                    categories.find(c => c.id === selectedDestination.category)?.color
                  }`}>
                    {categories.find(c => c.id === selectedDestination.category)?.icon}{' '}
                    {categories.find(c => c.id === selectedDestination.category)?.label}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-bold text-xl text-gray-900 mb-1">{selectedDestination.name}</h3>
                <p className="text-gray-500 text-sm mb-3">📍 {selectedDestination.location.city}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500">★</span>
                    <span className="font-semibold">{selectedDestination.rating}</span>
                    <span className="text-gray-400 text-sm">({selectedDestination.reviewCount} đánh giá)</span>
                  </div>
                  <Link
                    href={`/destinations/${selectedDestination._id}`}
                    className="px-5 py-2 bg-gradient-to-r from-sky-500 to-violet-500 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all"
                  >
                    Xem chi tiết →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Legend - Top right */}
        <div className="absolute top-24 right-4 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg z-[1000]">
          <p className="text-xs font-semibold text-gray-700 mb-2">Chú thích</p>
          <div className="space-y-1">
            {categories.slice(1).map(cat => (
              <div key={cat.id} className="flex items-center gap-2 text-xs">
                <span>{cat.icon}</span>
                <span className="text-gray-600">{cat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
