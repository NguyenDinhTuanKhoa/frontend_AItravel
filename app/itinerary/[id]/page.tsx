'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';

const Map = dynamic(() => import('../../components/Map'), { 
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 rounded-xl animate-pulse"></div>
});

interface Destination {
  _id: string;
  name: string;
  images: string[];
  location: { city: string; country: string; coordinates?: { lat: number; lng: number } };
  category: string;
  rating: number;
}

interface ItineraryDestination {
  destination: Destination;
  order: number;
  notes: string;
  activities: string[];
}

interface Itinerary {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  destinations: ItineraryDestination[];
  budget: { estimated: number; actual: number };
}

const statusOptions = [
  { value: 'planning', label: 'Đang lên kế hoạch', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'ongoing', label: 'Đang diễn ra', color: 'bg-green-100 text-green-700' },
  { value: 'completed', label: 'Đã hoàn thành', color: 'bg-gray-100 text-gray-700' },
];

export default function ItineraryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ title: '', description: '', status: '' });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadItinerary();
  }, [user, params.id]);

  const loadItinerary = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/itineraries/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setItinerary(data.data);
        setEditData({
          title: data.data.title,
          description: data.data.description || '',
          status: data.data.status
        });
      }
    } catch (error) {
      console.error('Error loading itinerary:', error);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    if (!token || !itinerary) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/itineraries/${itinerary._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(editData)
      });
      const data = await res.json();
      if (data.success) {
        setItinerary(data.data);
        setEditing(false);
      }
    } catch (error) {
      console.error('Error updating itinerary:', error);
    }
  };

  const handleRemoveDestination = async (destId: string) => {
    if (!confirm('Bạn có chắc muốn xóa điểm đến này khỏi lịch trình?')) return;
    
    const token = localStorage.getItem('token');
    if (!token || !itinerary) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/itineraries/${itinerary._id}/destinations/${destId}`,
        { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.success) {
        loadItinerary();
      }
    } catch (error) {
      console.error('Error removing destination:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc muốn xóa lịch trình này?')) return;
    
    const token = localStorage.getItem('token');
    if (!token || !itinerary) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/itineraries/${itinerary._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        router.push('/saved');
      }
    } catch (error) {
      console.error('Error deleting itinerary:', error);
    }
  };


  const getDayCount = () => {
    if (!itinerary) return 0;
    const start = new Date(itinerary.startDate);
    const end = new Date(itinerary.endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  const getStatusInfo = (status: string) => {
    return statusOptions.find(s => s.value === status) || statusOptions[0];
  };

  // Get destinations with coordinates for map
  const mapDestinations = itinerary?.destinations
    .filter(d => d.destination?.location?.coordinates)
    .map(d => d.destination) || [];

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!itinerary) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl mb-4">📅</p>
          <p className="text-gray-500">Không tìm thấy lịch trình</p>
          <Link href="/saved" className="text-sky-500 hover:underline mt-2 inline-block">
            ← Quay lại
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(itinerary.status);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-24 pb-12">
        <div className="max-w-5xl mx-auto px-4">
          {/* Back button */}
          <Link href="/saved" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6">
            ← Quay lại
          </Link>

          {/* Header */}
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            {editing ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  className="w-full text-2xl font-bold px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-sky-500"
                />
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  placeholder="Mô tả lịch trình..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-sky-500"
                  rows={3}
                />
                <select
                  value={editData.status}
                  onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-sky-500"
                >
                  {statusOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <div className="flex gap-3">
                  <button onClick={handleSave} className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600">
                    Lưu
                  </button>
                  <button onClick={() => setEditing(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                    Hủy
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-2xl font-bold text-gray-900">{itinerary.title}</h1>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    {itinerary.description && (
                      <p className="text-gray-600 mb-3">{itinerary.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-gray-500">
                      <span>📅 {new Date(itinerary.startDate).toLocaleDateString('vi-VN')} - {new Date(itinerary.endDate).toLocaleDateString('vi-VN')}</span>
                      <span>🗓️ {getDayCount()} ngày</span>
                      <span>📍 {itinerary.destinations.length} điểm đến</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditing(true)} className="p-2 text-gray-400 hover:text-sky-500 hover:bg-sky-50 rounded-lg">
                      ✏️
                    </button>
                    <button onClick={handleDelete} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                      🗑️
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>


          {/* Map */}
          {mapDestinations.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">🗺️ Bản đồ lịch trình</h2>
              <Map
                destinations={mapDestinations as any}
                height="300px"
                zoom={6}
              />
            </div>
          )}

          {/* Destinations */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">📍 Các điểm đến</h2>
              <Link 
                href="/destinations" 
                className="text-sm text-sky-500 hover:text-sky-600"
              >
                + Thêm điểm đến
              </Link>
            </div>

            {itinerary.destinations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-6xl mb-4">🗺️</p>
                <p className="text-gray-500 mb-4">Chưa có điểm đến nào trong lịch trình</p>
                <Link href="/destinations" className="text-sky-500 hover:underline">
                  Khám phá điểm đến →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {itinerary.destinations.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
                  >
                    {/* Order number */}
                    <div className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-sm">
                      {idx + 1}
                    </div>

                    {/* Image */}
                    <Link href={`/destinations/${item.destination?._id}`} className="shrink-0">
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                        <Image
                          src={item.destination?.images?.[0] || 'https://via.placeholder.com/100'}
                          alt={item.destination?.name || ''}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/destinations/${item.destination?._id}`}>
                        <h3 className="font-semibold text-gray-900 hover:text-sky-500">
                          {item.destination?.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-500">
                        📍 {item.destination?.location?.city}, {item.destination?.location?.country}
                      </p>
                      {item.notes && (
                        <p className="text-sm text-gray-600 mt-1">📝 {item.notes}</p>
                      )}
                    </div>

                    {/* Rating */}
                    <div className="text-sm text-gray-500">
                      <span className="text-yellow-400">★</span> {item.destination?.rating}
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => handleRemoveDestination(item.destination?._id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="Xóa khỏi lịch trình"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Suggestion */}
          <div className="mt-6 bg-gradient-to-r from-sky-500 to-violet-500 rounded-2xl p-6 text-white">
            <h3 className="font-semibold mb-2">💡 Gợi ý từ AI</h3>
            <p className="text-white/90 mb-4">
              Hãy hỏi AI để được gợi ý lịch trình chi tiết, nhà hàng, khách sạn phù hợp với chuyến đi của bạn!
            </p>
            <Link 
              href="/ai-chat" 
              className="inline-block px-4 py-2 bg-white text-sky-600 font-medium rounded-lg hover:bg-gray-100 transition-all"
            >
              Chat với AI →
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
