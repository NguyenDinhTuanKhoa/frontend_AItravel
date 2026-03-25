'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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
  };
}

const categoryTags: Record<string, string> = {
  beach: 'Biển',
  mountain: 'Núi',
  city: 'Thành phố',
  countryside: 'Nông thôn',
  historical: 'Di tích',
};

const priceLabels: Record<string, string> = {
  budget: 'Từ 1.5tr',
  'mid-range': 'Từ 2.5tr',
  luxury: 'Từ 5tr',
};

export default function Destinations() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/destinations?limit=6`);
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
    fetchDestinations();
  }, []);

  if (loading) {
    return (
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="h-12 bg-gray-200 rounded w-72 mb-12"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-gray-200 rounded-3xl h-96"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
          <div>
            <span className="inline-block px-4 py-2 bg-orange-100 text-orange-600 rounded-full text-sm font-semibold mb-4">
              Điểm Đến Hấp Dẫn
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Khám Phá <span className="gradient-text">Việt Nam</span>
            </h2>
          </div>
          <Link 
            href="/destinations"
            className="mt-6 md:mt-0 px-6 py-3 border-2 border-gray-200 rounded-full font-semibold text-gray-700 hover:border-sky-500 hover:text-sky-500 transition-all"
          >
            Xem tất cả →
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map((dest) => (
            <Link
              key={dest._id}
              href={`/destinations/${dest._id}`}
              className="group relative bg-white rounded-3xl overflow-hidden shadow-lg shadow-gray-200/50 card-hover cursor-pointer"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={dest.images[0] || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                
                <span className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-semibold text-gray-800">
                  {categoryTags[dest.category] || dest.category}
                </span>

                <button 
                  onClick={(e) => e.preventDefault()}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>

                <div className="absolute bottom-4 left-4 text-white">
                  <span className="text-2xl font-bold">{priceLabels[dest.priceRange] || 'Liên hệ'}</span>
                  <span className="text-white/80 text-sm">/người</span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-sky-600 transition-colors">
                  {dest.name}
                </h3>
                <p className="text-gray-500 text-sm mb-2">{dest.location.city}</p>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500">★</span>
                    <span className="font-semibold text-gray-900">{dest.rating}</span>
                  </div>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-500">
                    {dest.reviewCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')} đánh giá
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
