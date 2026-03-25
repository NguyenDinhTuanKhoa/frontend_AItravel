'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import * as XLSX from 'xlsx';
import { adminApi } from '../../lib/adminApi';

// Dynamic import Map component (no SSR for Leaflet)
const MapPreview = dynamic(() => import('./MapPreview'), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-gray-100 rounded-xl animate-pulse flex items-center justify-center">
      <span className="text-gray-400">Đang tải bản đồ...</span>
    </div>
  ),
});

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
}

const categories = [
  { id: 'beach', label: '🏖️ Biển', color: 'bg-cyan-100 text-cyan-700' },
  { id: 'mountain', label: '🏔️ Núi', color: 'bg-green-100 text-green-700' },
  { id: 'city', label: '🌆 Thành phố', color: 'bg-violet-100 text-violet-700' },
  { id: 'countryside', label: '🌾 Nông thôn', color: 'bg-amber-100 text-amber-700' },
  { id: 'historical', label: '🏛️ Di tích', color: 'bg-rose-100 text-rose-700' },
];

const priceRanges = [
  { id: 'budget', label: '💰 Tiết kiệm' },
  { id: 'mid-range', label: '💵 Trung bình' },
  { id: 'luxury', label: '💎 Cao cấp' },
];

export default function AdminDestinations() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    city: '',
    country: 'Việt Nam',
    coordinates: '',
    images: '',
    category: 'beach',
    priceRange: 'mid-range',
    amenities: '',
    activities: '',
    bestTimeToVisit: '',
  });

  // Coordinates for map preview
  const [previewCoords, setPreviewCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Excel import state
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState<Array<Record<string, string>>>([]);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadDestinations();
  }, [search]);

  // Update preview map when coordinates change
  useEffect(() => {
    if (!formData.coordinates.trim()) {
      setPreviewCoords(null);
      return;
    }

    const parts = formData.coordinates.split(',').map(s => parseFloat(s.trim()));
    if (parts.length === 2) {
      const [lat, lng] = parts;
      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        setPreviewCoords({ lat, lng });
        return;
      }
    }
    setPreviewCoords(null);
  }, [formData.coordinates]);

  const loadDestinations = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.getDestinations(1, search);
      if (data) setDestinations((data as { destinations: Destination[] }).destinations);
    } catch (error) {
      console.error('Error loading destinations:', error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    let coordinates: { lat: number; lng: number } | undefined;

    if (formData.coordinates.trim()) {
      const parts = formData.coordinates.split(',').map(s => parseFloat(s.trim()));
      if (parts.length === 2) {
        const [lat, lng] = parts;
        if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          coordinates = { lat, lng };
        }
      }
    }

    const payload = {
      name: formData.name,
      description: formData.description,
      location: {
        city: formData.city,
        country: formData.country,
        coordinates,
      },
      images: formData.images.split(',').map(s => s.trim()).filter(Boolean),
      category: formData.category,
      priceRange: formData.priceRange,
      amenities: formData.amenities.split(',').map(s => s.trim()).filter(Boolean),
      activities: formData.activities.split(',').map(s => s.trim()).filter(Boolean),
      bestTimeToVisit: formData.bestTimeToVisit.split(',').map(s => s.trim()).filter(Boolean),
    };

    try {
      if (editingId) {
        await adminApi.updateDestination(editingId, payload);
      } else {
        await adminApi.createDestination(payload);
      }

      setShowModal(false);
      resetForm();
      loadDestinations();
    } catch (error) {
      console.error('Error saving destination:', error);
      alert('Có lỗi xảy ra khi lưu!');
    }
    setSaving(false);
  };

  const handleEdit = (dest: Destination) => {
    setEditingId(dest._id);
    setFormData({
      name: dest.name,
      description: dest.description,
      city: dest.location?.city || '',
      country: dest.location?.country || 'Việt Nam',
      coordinates: dest.location?.coordinates
        ? `${dest.location.coordinates.lat}, ${dest.location.coordinates.lng}`
        : '',
      images: dest.images?.join(', ') || '',
      category: dest.category,
      priceRange: dest.priceRange,
      amenities: '',
      activities: '',
      bestTimeToVisit: '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc muốn xóa điểm đến này?')) {
      await adminApi.deleteDestination(id);
      loadDestinations();
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setPreviewCoords(null);
    setFormData({
      name: '',
      description: '',
      city: '',
      country: 'Việt Nam',
      coordinates: '',
      images: '',
      category: 'beach',
      priceRange: 'mid-range',
      amenities: '',
      activities: '',
      bestTimeToVisit: '',
    });
  };

  // Excel import functions
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(worksheet, { defval: '' });

        if (jsonData.length === 0) {
          alert('File Excel trống hoặc không có dữ liệu!');
          return;
        }

        setImportData(jsonData);
        setShowImportModal(true);
      } catch (error) {
        console.error('Error reading Excel:', error);
        alert('Lỗi đọc file Excel! Vui lòng kiểm tra định dạng file.');
      }
    };
    reader.readAsArrayBuffer(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const mapExcelRowToDestination = (row: Record<string, string>) => {
    // Map Vietnamese column names to fields
    const name = row['Tên'] || row['name'] || row['Name'] || '';
    const description = row['Mô tả'] || row['description'] || row['Description'] || '';
    const city = row['Thành phố'] || row['Tỉnh'] || row['city'] || row['City'] || '';
    const country = row['Quốc gia'] || row['country'] || row['Country'] || 'Việt Nam';
    const coordinates = row['Tọa độ'] || row['coordinates'] || row['Coordinates'] || '';
    const images = row['Hình ảnh'] || row['images'] || row['Images'] || '';
    const category = row['Loại'] || row['category'] || row['Category'] || 'beach';
    const priceRange = row['Mức giá'] || row['priceRange'] || row['PriceRange'] || 'mid-range';
    const amenities = row['Tiện ích'] || row['amenities'] || row['Amenities'] || '';
    const activities = row['Hoạt động'] || row['activities'] || row['Activities'] || '';
    const bestTimeToVisit = row['Thời điểm'] || row['bestTimeToVisit'] || row['BestTimeToVisit'] || '';

    // Parse coordinates
    let coords: { lat: number; lng: number } | undefined;
    if (coordinates) {
      const parts = coordinates.split(',').map(s => parseFloat(s.trim()));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        coords = { lat: parts[0], lng: parts[1] };
      }
    }

    // Map category names
    let categoryId = category.toLowerCase();
    if (categoryId.includes('biển') || categoryId.includes('beach')) categoryId = 'beach';
    else if (categoryId.includes('núi') || categoryId.includes('mountain')) categoryId = 'mountain';
    else if (categoryId.includes('thành phố') || categoryId.includes('city')) categoryId = 'city';
    else if (categoryId.includes('nông thôn') || categoryId.includes('countryside')) categoryId = 'countryside';
    else if (categoryId.includes('di tích') || categoryId.includes('historical')) categoryId = 'historical';

    // Map price range
    let priceId = priceRange.toLowerCase();
    if (priceId.includes('tiết kiệm') || priceId.includes('budget')) priceId = 'budget';
    else if (priceId.includes('trung bình') || priceId.includes('mid')) priceId = 'mid-range';
    else if (priceId.includes('cao cấp') || priceId.includes('luxury')) priceId = 'luxury';

    return {
      name,
      description,
      location: {
        city,
        country,
        coordinates: coords,
      },
      images: images.split(',').map(s => s.trim()).filter(Boolean),
      category: categoryId,
      priceRange: priceId,
      amenities: amenities.split(',').map(s => s.trim()).filter(Boolean),
      activities: activities.split(',').map(s => s.trim()).filter(Boolean),
      bestTimeToVisit: bestTimeToVisit.split(',').map(s => s.trim()).filter(Boolean),
    };
  };

  const handleImportAll = async () => {
    if (importData.length === 0) return;

    setImporting(true);
    setImportProgress({ current: 0, total: importData.length });

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < importData.length; i++) {
      const row = importData[i];
      const destination = mapExcelRowToDestination(row);

      if (!destination.name) {
        errorCount++;
        continue;
      }

      try {
        await adminApi.createDestination(destination);
        successCount++;
      } catch (error) {
        console.error('Error importing row:', error);
        errorCount++;
      }

      setImportProgress({ current: i + 1, total: importData.length });
    }

    setImporting(false);
    setShowImportModal(false);
    setImportData([]);

    alert(`Import hoàn tất!\n✅ Thành công: ${successCount}\n❌ Lỗi: ${errorCount}`);
    loadDestinations();
  };

  const downloadTemplate = () => {
    const template = [
      {
        'Tên': 'Vịnh Hạ Long',
        'Mô tả': 'Di sản thiên nhiên thế giới với hàng nghìn đảo đá vôi',
        'Thành phố': 'Quảng Ninh',
        'Quốc gia': 'Việt Nam',
        'Tọa độ': '20.9101, 107.1839',
        'Hình ảnh': 'https://example.com/image1.jpg, https://example.com/image2.jpg',
        'Loại': 'beach',
        'Mức giá': 'mid-range',
        'Hoạt động': 'Tham quan, Chèo kayak, Lặn biển',
        'Tiện ích': 'Wifi, Nhà hàng, Bãi đỗ xe',
        'Thời điểm': 'Tháng 3, Tháng 4, Tháng 5',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Điểm đến');

    // Set column widths
    ws['!cols'] = [
      { wch: 20 }, { wch: 50 }, { wch: 15 }, { wch: 12 }, { wch: 20 },
      { wch: 50 }, { wch: 12 }, { wch: 12 }, { wch: 30 }, { wch: 30 }, { wch: 25 },
    ];

    XLSX.writeFile(wb, 'mau_diem_den.xlsx');
  };

  // Get category styling
  const getCategoryStyle = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.color || 'bg-gray-100 text-gray-700';
  };

  const getCategoryLabel = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.label || categoryId;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quản lý Điểm đến</h2>
          <p className="text-gray-500 text-sm mt-1">Thêm, sửa, xóa các địa điểm du lịch</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2"
          >
            <span>📥</span>
            <span>Import Excel</span>
          </button>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl hover:from-sky-600 hover:to-blue-700 transition-all shadow-lg shadow-sky-500/25 flex items-center gap-2"
          >
            <span className="text-lg">+</span>
            <span>Thêm điểm đến</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Tìm kiếm điểm đến..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Địa điểm</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Vị trí</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Tọa độ</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Loại</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Giá</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Rating</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-500">Đang tải...</span>
                  </div>
                </td>
              </tr>
            ) : destinations.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-4xl">🏝️</span>
                    <span>Chưa có điểm đến nào</span>
                  </div>
                </td>
              </tr>
            ) : (
              destinations.map((dest) => (
                <tr key={dest._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {dest.images?.[0] ? (
                        <img src={dest.images[0]} alt="" className="w-14 h-14 rounded-xl object-cover shadow-sm" />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center text-2xl">
                          🏞️
                        </div>
                      )}
                      <div>
                        <span className="font-semibold text-gray-900">{dest.name}</span>
                        <p className="text-sm text-gray-500 truncate max-w-[200px]">{dest.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    📍 {dest.location?.city || 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    {dest.location?.coordinates ? (
                      <div className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                        {dest.location.coordinates.lat.toFixed(4)}, {dest.location.coordinates.lng.toFixed(4)}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">Chưa có</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getCategoryStyle(dest.category)}`}>
                      {getCategoryLabel(dest.category)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{dest.priceRange}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="font-medium">{dest.rating?.toFixed(1) || '0.0'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(dest)}
                        className="px-3 py-1.5 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors text-sm font-medium"
                      >
                        ✏️ Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(dest._id)}
                        className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                      >
                        🗑️ Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white p-6 border-b z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {editingId ? '✏️ Sửa điểm đến' : '➕ Thêm điểm đến mới'}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Điền thông tin chi tiết cho địa điểm du lịch
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  📝 Thông tin cơ bản
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Tên địa điểm <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      placeholder="VD: Vịnh Hạ Long"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Thành phố/Tỉnh <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      placeholder="VD: Quảng Ninh"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Mô tả <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
                    rows={3}
                    placeholder="Mô tả chi tiết về địa điểm..."
                    required
                  />
                </div>
              </div>

              {/* Coordinates & Map */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  📍 Tọa độ GPS & Bản đồ
                </h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Tọa độ GPS (Vĩ độ, Kinh độ)
                  </label>
                  <input
                    type="text"
                    value={formData.coordinates}
                    onChange={(e) => setFormData({ ...formData, coordinates: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent font-mono"
                    placeholder="VD: 20.9101, 107.1839"
                  />
                  <p className="text-xs text-gray-400 mt-1">Nhập dưới dạng: Vĩ độ (−90 đến 90), Kinh độ (−180 đến 180)</p>
                </div>

                {/* Map Preview */}
                <div className="rounded-xl overflow-hidden border border-gray-200">
                  <MapPreview
                    lat={previewCoords?.lat ?? 16.0544}
                    lng={previewCoords?.lng ?? 108.2022}
                    name={formData.name || 'Vị trí mới'}
                    editable={true}
                    onCoordinatesChange={(lat, lng) => {
                      setFormData({ ...formData, coordinates: `${lat.toFixed(6)}, ${lng.toFixed(6)}` });
                    }}
                  />
                  {previewCoords && (
                    <div className="bg-sky-50 px-4 py-2 border-t border-sky-100">
                      <span className="font-mono text-sky-600 text-sm">
                        📍 {previewCoords.lat.toFixed(6)}, {previewCoords.lng.toFixed(6)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Images */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  🖼️ Hình ảnh
                </h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    URLs ảnh (phân cách bằng dấu phẩy)
                  </label>
                  <textarea
                    value={formData.images}
                    onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent font-mono text-sm resize-none"
                    rows={2}
                    placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                  />
                </div>
                {formData.images && (
                  <div className="flex gap-2 flex-wrap">
                    {formData.images.split(',').map((url, idx) => {
                      const trimmedUrl = url.trim();
                      if (!trimmedUrl) return null;
                      return (
                        <img
                          key={idx}
                          src={trimmedUrl}
                          alt={`Preview ${idx + 1}`}
                          className="w-20 h-20 object-cover rounded-lg border"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80?text=Error';
                          }}
                        />
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Category & Price */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  🏷️ Phân loại
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Loại hình
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Mức giá
                    </label>
                    <select
                      value={formData.priceRange}
                      onChange={(e) => setFormData({ ...formData, priceRange: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    >
                      {priceRanges.map((price) => (
                        <option key={price.id} value={price.id}>{price.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Activities */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  🎯 Hoạt động & Tiện ích
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Hoạt động (phân cách bằng dấu phẩy)
                    </label>
                    <input
                      type="text"
                      value={formData.activities}
                      onChange={(e) => setFormData({ ...formData, activities: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      placeholder="Tắm biển, Lướt sóng, Chụp ảnh"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Tiện ích (phân cách bằng dấu phẩy)
                    </label>
                    <input
                      type="text"
                      value={formData.amenities}
                      onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      placeholder="Wifi, Bãi đỗ xe, Nhà hàng"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Thời điểm tốt nhất (phân cách bằng dấu phẩy)
                  </label>
                  <input
                    type="text"
                    value={formData.bestTimeToVisit}
                    onChange={(e) => setFormData({ ...formData, bestTimeToVisit: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="Tháng 3, Tháng 4, Tháng 5"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl hover:from-sky-600 hover:to-blue-700 transition-all font-medium shadow-lg shadow-sky-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <span>{editingId ? '💾 Cập nhật' : '✨ Thêm mới'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Excel Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">📥 Import từ Excel</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Xem trước {importData.length} điểm đến sẽ được import
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={downloadTemplate}
                  className="px-3 py-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors text-sm font-medium"
                >
                  📄 Tải file mẫu
                </button>
                <button
                  onClick={() => { setShowImportModal(false); setImportData([]); }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-6">
              {importing ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-lg font-medium text-gray-700">
                    Đang import... {importProgress.current}/{importProgress.total}
                  </p>
                  <div className="w-64 h-2 bg-gray-200 rounded-full mt-4 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-600">#</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-600">Tên</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-600">Thành phố</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-600">Tọa độ</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-600">Loại</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-600">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {importData.slice(0, 50).map((row, idx) => {
                        const dest = mapExcelRowToDestination(row);
                        const isValid = !!dest.name;
                        return (
                          <tr key={idx} className={isValid ? '' : 'bg-red-50'}>
                            <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                            <td className="px-4 py-3 font-medium">{dest.name || '—'}</td>
                            <td className="px-4 py-3">{dest.location.city || '—'}</td>
                            <td className="px-4 py-3 font-mono text-xs">
                              {dest.location.coordinates
                                ? `${dest.location.coordinates.lat}, ${dest.location.coordinates.lng}`
                                : '—'}
                            </td>
                            <td className="px-4 py-3">{getCategoryLabel(dest.category)}</td>
                            <td className="px-4 py-3">
                              {isValid ? (
                                <span className="text-emerald-600">✓ Hợp lệ</span>
                              ) : (
                                <span className="text-red-600">✗ Thiếu tên</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {importData.length > 50 && (
                    <p className="text-center text-gray-500 py-4">
                      ... và {importData.length - 50} dòng khác
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 border-t bg-gray-50 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                💡 Các cột hỗ trợ: Tên, Mô tả, Thành phố, Quốc gia, Tọa độ, Hình ảnh, Loại, Mức giá, Hoạt động, Tiện ích, Thời điểm
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowImportModal(false); setImportData([]); }}
                  disabled={importing}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-medium disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleImportAll}
                  disabled={importing || importData.length === 0}
                  className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all font-medium shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {importing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Đang import...</span>
                    </>
                  ) : (
                    <>
                      <span>✨</span>
                      <span>Import {importData.length} điểm đến</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
