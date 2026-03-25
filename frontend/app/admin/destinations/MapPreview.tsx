'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapPreviewProps {
  lat: number;
  lng: number;
  name?: string;
  onCoordinatesChange?: (lat: number, lng: number) => void;
  editable?: boolean;
}

export default function MapPreview({ lat, lng, name = 'Vị trí', onCoordinatesChange, editable = false }: MapPreviewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [mapId] = useState(() => `map-preview-${Math.random().toString(36).substr(2, 9)}`);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{ display_name: string; lat: string; lon: string }>>([]);

  // Initialize map once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Create map
    const map = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom: 14,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(map);

    mapInstanceRef.current = map;

    // Create custom icon
    const customIcon = createCustomIcon();

    // Add marker
    const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
    marker.bindPopup(createPopupContent(name, lat, lng)).openPopup();
    markerRef.current = marker;

    // Add click handler for editable mode
    if (editable && onCoordinatesChange) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat: newLat, lng: newLng } = e.latlng;
        onCoordinatesChange(newLat, newLng);
      });
    }

    // Cleanup on unmount only
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // Update map view and marker when props change
  useEffect(() => {
    if (!mapInstanceRef.current || !markerRef.current) return;

    // Update view
    mapInstanceRef.current.setView([lat, lng], mapInstanceRef.current.getZoom(), {
      animate: true,
      duration: 0.5,
    });

    // Update marker
    markerRef.current.setLatLng([lat, lng]);
    markerRef.current.setPopupContent(createPopupContent(name, lat, lng));

    // Reopen popup
    markerRef.current.openPopup();
  }, [lat, lng, name]);

  function createCustomIcon(): L.DivIcon {
    return L.divIcon({
      className: 'custom-preview-marker',
      html: `
        <div style="
          background: linear-gradient(135deg, #0ea5e9, #2563eb);
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          box-shadow: 0 4px 15px rgba(14, 165, 233, 0.5);
          border: 3px solid white;
          animation: marker-pulse 2s ease-in-out infinite;
        ">
          📍
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });
  }

  function createPopupContent(name: string, lat: number, lng: number): string {
    return `
      <div style="text-align: center; padding: 10px; min-width: 180px;">
        <div style="font-weight: 600; font-size: 15px; color: #1e293b; margin-bottom: 6px;">
          ${name || 'Vị trí mới'}
        </div>
        <div style="
          font-size: 12px;
          color: #0ea5e9;
          font-family: ui-monospace, monospace;
          background: #f0f9ff;
          padding: 6px 10px;
          border-radius: 6px;
        ">
          ${lat.toFixed(6)}, ${lng.toFixed(6)}
        </div>
        <a
          href="https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}"
          target="_blank"
          rel="noopener noreferrer"
          style="
            display: inline-block;
            margin-top: 8px;
            font-size: 12px;
            color: #0ea5e9;
            text-decoration: none;
          "
        >
          🔗 Xem trên OpenStreetMap
        </a>
      </div>
    `;
  }

  // Search location using Nominatim (OpenStreetMap geocoding)
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    setSearchResults([]);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&countrycodes=vn`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Search error:', error);
    }

    setSearching(false);
  };

  const handleSelectResult = (result: { lat: string; lon: string }) => {
    const newLat = parseFloat(result.lat);
    const newLng = parseFloat(result.lon);

    if (onCoordinatesChange) {
      onCoordinatesChange(newLat, newLng);
    }

    setSearchResults([]);
    setSearchQuery('');
  };

  return (
    <>
      <style jsx global>{`
        @keyframes marker-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .custom-preview-marker {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15) !important;
        }
        .leaflet-popup-tip {
          box-shadow: none !important;
        }
      `}</style>

      {editable && (
        <div className="mb-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Tìm địa điểm... (VD: Vịnh Hạ Long)"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent pr-10"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            </div>
            <button
              type="button"
              onClick={handleSearch}
              disabled={searching}
              className="px-4 py-2.5 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition-colors disabled:opacity-50"
            >
              {searching ? '...' : 'Tìm'}
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-48 overflow-y-auto">
              {searchResults.map((result, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectResult(result)}
                  className="w-full px-4 py-3 text-left hover:bg-sky-50 border-b border-gray-100 last:border-b-0 transition-colors"
                >
                  <div className="text-sm text-gray-800 line-clamp-2">{result.display_name}</div>
                  <div className="text-xs text-gray-400 mt-1 font-mono">
                    {parseFloat(result.lat).toFixed(6)}, {parseFloat(result.lon).toFixed(6)}
                  </div>
                </button>
              ))}
            </div>
          )}

          <p className="text-xs text-gray-400 mt-2">
            💡 Click trực tiếp vào bản đồ để chọn vị trí hoặc tìm kiếm địa điểm
          </p>
        </div>
      )}

      <div
        ref={mapContainerRef}
        id={mapId}
        className="h-64 w-full rounded-xl"
        style={{ minHeight: '256px', zIndex: 0, cursor: editable ? 'crosshair' : 'grab' }}
      />
    </>
  );
}
