"use client";

import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";

const defaultCenter = [16.0471, 108.2068];

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function RecenterMap({ latitude, longitude }) {
  const map = useMap();

  useEffect(() => {
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;
    map.setView([latitude, longitude], Math.max(map.getZoom(), 14));
  }, [latitude, longitude, map]);

  return null;
}

export default function LocationViewMap({ latitude, longitude }) {
  const hasCoords = Number.isFinite(latitude) && Number.isFinite(longitude);
  const center = hasCoords ? [latitude, longitude] : defaultCenter;

  return (
    <div className="rounded-lg overflow-hidden border border-gray-300">
      <MapContainer
        center={center}
        zoom={hasCoords ? 14 : 6}
        minZoom={5}
        scrollWheelZoom
        dragging
        style={{ height: "320px", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterMap latitude={latitude} longitude={longitude} />
        {hasCoords && (
          <Marker position={[latitude, longitude]} icon={markerIcon} />
        )}
      </MapContainer>
    </div>
  );
}
