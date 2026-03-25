'use client';

import { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Destination {
  _id: string;
  name: string;
  description: string;
  images: string[];
  category: string;
  rating: number;
  reviewCount?: number;
  priceRange?: string;
  location: {
    city: string;
    country: string;
    coordinates?: { lat: number; lng: number };
  };
}

interface MapProps {
  destinations?: Destination[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  onMarkerClick?: (dest: Destination) => void;
  selectedId?: string;
}

const categoryIcons: Record<string, string> = {
  beach: '🏖️',
  mountain: '🏔️',
  city: '🌆',
  countryside: '🌾',
  historical: '🏛️',
};

const categoryColors: Record<string, string> = {
  beach: '#0ea5e9',
  mountain: '#22c55e',
  city: '#8b5cf6',
  countryside: '#f59e0b',
  historical: '#ef4444',
};

export default function Map({ 
  destinations = [], 
  center = [16.0, 106.0], 
  zoom = 6,
  height = '500px',
  onMarkerClick,
  selectedId
}: MapProps) {
  const [map, setMap] = useState<L.Map | null>(null);
  const [markersLayer, setMarkersLayer] = useState<L.LayerGroup | null>(null);

  useEffect(() => {
    // Initialize map
    const mapInstance = L.map('map-container').setView(center, zoom);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(mapInstance);

    const markers = L.layerGroup().addTo(mapInstance);
    
    setMap(mapInstance);
    setMarkersLayer(markers);

    return () => {
      mapInstance.remove();
    };
  }, []);

  useEffect(() => {
    if (!map || !markersLayer) return;

    // Clear existing markers
    markersLayer.clearLayers();

    // Add markers for each destination
    destinations.forEach((dest) => {
      if (!dest.location?.coordinates?.lat || !dest.location?.coordinates?.lng) return;

      const { lat, lng } = dest.location.coordinates;
      const color = categoryColors[dest.category] || '#6b7280';
      const icon = categoryIcons[dest.category] || '📍';
      const isSelected = dest._id === selectedId;

      // Create custom icon
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            background: ${isSelected ? '#1e40af' : color};
            width: ${isSelected ? '44px' : '36px'};
            height: ${isSelected ? '44px' : '36px'};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${isSelected ? '20px' : '16px'};
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            border: 3px solid white;
            cursor: pointer;
            transition: all 0.2s;
            transform: ${isSelected ? 'scale(1.1)' : 'scale(1)'};
          ">
            ${icon}
          </div>
        `,
        iconSize: [isSelected ? 44 : 36, isSelected ? 44 : 36],
        iconAnchor: [isSelected ? 22 : 18, isSelected ? 22 : 18],
      });

      const marker = L.marker([lat, lng], { icon: customIcon });
      
      // Popup content
      const popupContent = `
        <div style="min-width: 200px; font-family: system-ui;">
          <img src="${dest.images[0]}" alt="${dest.name}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" />
          <h3 style="margin: 0 0 4px; font-size: 16px; font-weight: 600;">${dest.name}</h3>
          <p style="margin: 0 0 4px; color: #6b7280; font-size: 12px;">📍 ${dest.location.city}</p>
          <div style="display: flex; align-items: center; gap: 4px;">
            <span style="color: #eab308;">★</span>
            <span style="font-weight: 600;">${dest.rating}</span>
            <span style="color: #9ca3af; margin-left: 8px; font-size: 12px;">${icon} ${dest.category}</span>
          </div>
        </div>
      `;
      
      marker.bindPopup(popupContent);
      
      marker.on('click', () => {
        if (onMarkerClick) onMarkerClick(dest);
      });

      markersLayer.addLayer(marker);
    });
  }, [map, markersLayer, destinations, selectedId, onMarkerClick]);

  // Pan to selected destination
  useEffect(() => {
    if (!map || !selectedId) return;
    
    const dest = destinations.find(d => d._id === selectedId);
    if (dest?.location?.coordinates) {
      map.setView([dest.location.coordinates.lat, dest.location.coordinates.lng], 10, {
        animate: true
      });
    }
  }, [map, selectedId, destinations]);

  return (
    <div 
      id="map-container" 
      style={{ height, width: '100%', borderRadius: '16px', zIndex: 1 }}
    />
  );
}
