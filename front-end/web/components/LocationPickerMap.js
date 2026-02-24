"use client";

import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";

const defaultCenter = [16.0471, 108.2068];
const vietnamBounds = L.latLngBounds(
  L.latLng(8.18, 102.14),
  L.latLng(23.39, 109.47),
);

const vietnamProvinces = [
  "An Giang",
  "Bà Rịa - Vũng Tàu",
  "Bắc Giang",
  "Bắc Kạn",
  "Bạc Liêu",
  "Bắc Ninh",
  "Bến Tre",
  "Bình Định",
  "Bình Dương",
  "Bình Phước",
  "Bình Thuận",
  "Cà Mau",
  "Cần Thơ",
  "Cao Bằng",
  "Đà Nẵng",
  "Đắk Lắk",
  "Đắk Nông",
  "Điện Biên",
  "Đồng Nai",
  "Đồng Tháp",
  "Gia Lai",
  "Hà Giang",
  "Hà Nam",
  "Hà Nội",
  "Hà Tĩnh",
  "Hải Dương",
  "Hải Phòng",
  "Hậu Giang",
  "Hòa Bình",
  "Hưng Yên",
  "Khánh Hòa",
  "Kiên Giang",
  "Kon Tum",
  "Lai Châu",
  "Lâm Đồng",
  "Lạng Sơn",
  "Lào Cai",
  "Long An",
  "Nam Định",
  "Nghệ An",
  "Ninh Bình",
  "Ninh Thuận",
  "Phú Thọ",
  "Phú Yên",
  "Quảng Bình",
  "Quảng Nam",
  "Quảng Ngãi",
  "Quảng Ninh",
  "Quảng Trị",
  "Sóc Trăng",
  "Sơn La",
  "Tây Ninh",
  "Thái Bình",
  "Thái Nguyên",
  "Thanh Hóa",
  "Thừa Thiên Huế",
  "Tiền Giang",
  "TP Hồ Chí Minh",
  "Trà Vinh",
  "Tuyên Quang",
  "Vĩnh Long",
  "Vĩnh Phúc",
  "Yên Bái",
];

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

function ClickToPick({ onPick }) {
  useMapEvents({
    click(event) {
      if (vietnamBounds.contains(event.latlng)) {
        onPick(event.latlng.lat, event.latlng.lng);
      }
    },
  });

  return null;
}

function RecenterMap({ latitude, longitude }) {
  const map = useMapEvents({});

  useEffect(() => {
    if (latitude == null || longitude == null) return;
    map.setView([latitude, longitude], Math.max(map.getZoom(), 13));
  }, [latitude, longitude, map]);

  return null;
}

export default function LocationPickerMap({ latitude, longitude, onPick }) {
  const hasCoords = Number.isFinite(latitude) && Number.isFinite(longitude);
  const center = hasCoords ? [latitude, longitude] : defaultCenter;
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredSuggestions = normalizedQuery
    ? vietnamProvinces
        .filter((province) => province.toLowerCase().includes(normalizedQuery))
        .slice(0, 8)
    : [];

  const handleSearch = async () => {
    const keyword = query.trim();
    if (!keyword || isSearching) return;

    try {
      setIsSearching(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&countrycodes=vn&bounded=1&viewbox=102.14,23.39,109.47,8.18&limit=1&q=${encodeURIComponent(
          `${keyword}, Vietnam`,
        )}`,
      );

      if (!response.ok) return;

      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0) return;

      const result = data[0];
      const lat = Number(result.lat);
      const lon = Number(result.lon);

      if (Number.isFinite(lat) && Number.isFinite(lon)) {
        onPick(lat, lon);
      }
    } catch {
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2">
        <div className="relative max-w-lg ml-auto">
          <input
            type="text"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => {
              setTimeout(() => setShowSuggestions(false), 120);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                setShowSuggestions(false);
                handleSearch();
              }
            }}
            placeholder="Tìm tỉnh/thành phố"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
          />

          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute z-1000 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg max-h-56 overflow-auto">
              {filteredSuggestions.map((province) => (
                <button
                  key={province}
                  type="button"
                  onClick={() => {
                    setQuery(province);
                    setShowSuggestions(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-emerald-50"
                >
                  {province}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            setShowSuggestions(false);
            handleSearch();
          }}
          disabled={isSearching || !query.trim()}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-emerald-600"
        >
          {isSearching ? "Đang tìm..." : "Tìm"}
        </button>
      </div>

      <div className="rounded-lg overflow-hidden border border-gray-300">
        <MapContainer
          center={center}
          zoom={hasCoords ? 13 : 6}
          minZoom={6}
          maxBounds={vietnamBounds}
          maxBoundsViscosity={1.0}
          scrollWheelZoom
          style={{ height: "320px", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickToPick onPick={onPick} />
          <RecenterMap latitude={latitude} longitude={longitude} />
          {hasCoords && (
            <Marker position={[latitude, longitude]} icon={markerIcon} />
          )}
        </MapContainer>
      </div>
    </div>
  );
}
