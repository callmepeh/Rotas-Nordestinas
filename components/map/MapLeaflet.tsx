"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icon using CDN URLs to avoid import issues
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LeafletMapProps {
  latitude: number;
  longitude: number;
  popupText?: string;
}

export const LeafletMap = ({
  latitude,
  longitude,
  popupText,
}: LeafletMapProps) => {
  if (latitude === undefined || longitude === undefined) {
    return <div>Carregando mapa...</div>;
  }

  const position: [number, number] = [latitude, longitude];

  return (
    <MapContainer
      center={position}
      zoom={13}
      style={{ height: "400px", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={position}>
        {popupText && <Popup>{popupText}</Popup>}
      </Marker>
    </MapContainer>
  );
};
