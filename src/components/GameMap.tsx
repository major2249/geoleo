import React, { useRef, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { LatLng } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface GameMapProps {
  onLocationSelect: (location: { lat: number; lng: number }) => void;
  selectedLocation?: { lat: number; lng: number };
  actualLocation?: { lat: number; lng: number };
  showActual?: boolean;
  disabled?: boolean;
}

const MapClickHandler: React.FC<{ onLocationSelect: (location: { lat: number; lng: number }) => void; disabled?: boolean }> = ({ onLocationSelect, disabled }) => {
  useMapEvents({
    click: (e) => {
      if (!disabled) {
        onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    },
  });
  return null;
};

export const GameMap: React.FC<GameMapProps> = ({
  onLocationSelect,
  selectedLocation,
  actualLocation,
  showActual,
  disabled
}) => {
  const [mapKey, setMapKey] = useState(0);

  // Force re-render when showActual changes
  useEffect(() => {
    if (showActual) {
      setMapKey(prev => prev + 1);
    }
  }, [showActual]);

  const userIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const actualIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  return (
    <div className={`h-full w-full rounded-lg overflow-hidden ${disabled ? 'pointer-events-none opacity-75' : ''}`}>
      <MapContainer
        key={mapKey}
        center={[20, 0]}
        zoom={2}
        className="h-full w-full"
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onLocationSelect={onLocationSelect} disabled={disabled} />
        
        {selectedLocation && (
          <Marker 
            position={[selectedLocation.lat, selectedLocation.lng]} 
            icon={userIcon}
          />
        )}
        
        {showActual && actualLocation && (
          <Marker 
            position={[actualLocation.lat, actualLocation.lng]} 
            icon={actualIcon}
          />
        )}
      </MapContainer>
    </div>
  );
};