"use client";

import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { useEffect, useRef, useState } from "react";

const defaultCenter = [16.0471, 108.2068];
const vietnamBounds = L.latLngBounds(
  L.latLng(8.18, 102.14),
  L.latLng(23.39, 109.47),
);

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
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLocationName, setSelectedLocationName] = useState("");
  const abortRef = useRef(null);
  const debounceRef = useRef(null);

  const buildSearchUrl = (keyword, limit = 8) =>
    `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&countrycodes=vn&bounded=1&viewbox=102.14,23.39,109.47,8.18&limit=${limit}&accept-language=vi&q=${encodeURIComponent(
      `${keyword}, Vietnam`,
    )}`;

  const buildReverseUrl = (lat, lon) =>
    `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&accept-language=vi&lat=${lat}&lon=${lon}`;

  const normalizeLocationText = (addressDetails = {}, fallback = "") => {
    const district =
      addressDetails.city_district ||
      addressDetails.district ||
      addressDetails.county ||
      addressDetails.suburb ||
      addressDetails.town ||
      addressDetails.city ||
      "";

    const province =
      addressDetails.state ||
      addressDetails.province ||
      addressDetails.city ||
      addressDetails.region ||
      "";

    const compact = [district, province].filter(Boolean).join(", ");
    if (compact) return compact;

    if (fallback) {
      const chunks = fallback
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);
      if (chunks.length >= 2) {
        return `${chunks[chunks.length - 2]}, ${chunks[chunks.length - 1]}`;
      }
      return fallback;
    }

    return "";
  };

  const selectSuggestion = (suggestion) => {
    const lat = Number(suggestion.lat);
    const lon = Number(suggestion.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;

    const displayName = suggestion.display_name || "";
    const locationText = normalizeLocationText(suggestion.address, displayName);
    setQuery(displayName);
    setSelectedLocationName(displayName);
    setShowSuggestions(false);
    onPick(lat, lon, {
      displayName,
      locationText,
      address: suggestion.address || null,
    });
  };

  const handleMapPick = async (lat, lon) => {
    setSelectedLocationName(
      `Tọa độ đã chọn: ${lat.toFixed(6)}, ${lon.toFixed(6)}`,
    );

    try {
      const response = await fetch(buildReverseUrl(lat, lon), {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        onPick(lat, lon);
        return;
      }

      const data = await response.json();
      const displayName = data?.display_name || "";
      const locationText = normalizeLocationText(
        data?.address || {},
        displayName,
      );

      if (displayName) {
        setSelectedLocationName(displayName);
      }

      onPick(lat, lon, {
        displayName,
        locationText,
        address: data?.address || null,
      });
    } catch {
      onPick(lat, lon);
    }
  };

  const handleSearch = async () => {
    const keyword = query.trim();
    if (!keyword || isSearching) return;

    if (suggestions.length > 0) {
      selectSuggestion(suggestions[0]);
      return;
    }

    try {
      setIsSearching(true);
      const response = await fetch(buildSearchUrl(keyword, 1));

      if (!response.ok) return;

      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0) return;

      const result = data[0];
      const lat = Number(result.lat);
      const lon = Number(result.lon);

      if (Number.isFinite(lat) && Number.isFinite(lon)) {
        const displayName = result.display_name || keyword;
        const locationText = normalizeLocationText(
          result.address || {},
          displayName,
        );
        setQuery(displayName);
        setSelectedLocationName(displayName);
        onPick(lat, lon, {
          displayName,
          locationText,
          address: result.address || null,
        });
      }
    } catch {
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const keyword = query.trim();

    if (keyword.length < 2) {
      setIsSuggesting(false);
      setSuggestions([]);
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      try {
        setIsSuggesting(true);
        if (abortRef.current) {
          abortRef.current.abort();
        }

        const controller = new AbortController();
        abortRef.current = controller;

        const response = await fetch(buildSearchUrl(keyword), {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          setSuggestions([]);
          setIsSuggesting(false);
          return;
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          setSuggestions([]);
          setIsSuggesting(false);
          return;
        }

        setSuggestions(data.slice(0, 8));
        setIsSuggesting(false);
      } catch (error) {
        if (error?.name !== "AbortError") {
          setSuggestions([]);
        }
        setIsSuggesting(false);
      }
    }, 350);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  useEffect(() => {
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2 relative">
        <div className="relative max-w-lg ml-auto w-full">
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
            placeholder="Tìm địa điểm cụ thể (xã/phường, quận/huyện, tỉnh...)"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
          />

          {showSuggestions && query.trim().length >= 2 && (
            <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg max-h-64 overflow-auto">
              {isSuggesting && (
                <div className="px-3 py-2 text-sm text-gray-500">
                  Đang tìm gợi ý địa điểm...
                </div>
              )}

              {!isSuggesting && suggestions.length === 0 && (
                <div className="px-3 py-2 text-sm text-gray-500">
                  Không có gợi ý phù hợp
                </div>
              )}

              {!isSuggesting &&
                suggestions.map((suggestion) => (
                  <button
                    key={suggestion.place_id}
                    type="button"
                    onClick={() => {
                      selectSuggestion(suggestion);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-emerald-50"
                  >
                    {suggestion.display_name}
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
          <ClickToPick onPick={handleMapPick} />
          <RecenterMap latitude={latitude} longitude={longitude} />
          {hasCoords && (
            <Marker position={[latitude, longitude]} icon={markerIcon} />
          )}
        </MapContainer>
      </div>

      {(selectedLocationName || hasCoords) && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm">
          <p className="text-emerald-800 font-medium">Vị trí đã chọn</p>
          <p className="text-emerald-700 wrap-break-word">
            {selectedLocationName ||
              `Tọa độ đã chọn: ${Number(latitude).toFixed(6)}, ${Number(longitude).toFixed(6)}`}
          </p>
        </div>
      )}
    </div>
  );
}
