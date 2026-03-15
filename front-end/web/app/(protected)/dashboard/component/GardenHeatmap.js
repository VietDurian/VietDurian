"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CircleMarker,
  MapContainer,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";

import { useLanguage } from "../context/LanguageContext";
import { gardenAPI } from "@/lib/api";

const M2_PER_HA = 10000;

const getAreaBucket = (areaHa) => {
  const n = Number(areaHa);
  if (Number.isNaN(n)) return "lt3";
  if (n < 3) return "lt3";
  if (n < 5) return "3to5";
  if (n < 7) return "5to7";
  return "gte7";
};

const BUCKETS = [
  {
    key: "lt3",
    label: "< 3 ha",
    dotClass: "bg-emerald-200 ring-2 ring-emerald-600/45 shadow-sm",
    haloClass: "bg-emerald-400/35",
    haloInsetClass: "-inset-5",
  },
  {
    key: "3to5",
    label: "3-5 ha",
    dotClass: "bg-emerald-400 ring-2 ring-emerald-800/40 shadow-sm",
    haloClass: "bg-emerald-500/30",
    haloInsetClass: "-inset-6",
  },
  {
    key: "5to7",
    label: "5-7 ha",
    dotClass: "bg-emerald-700 ring-2 ring-emerald-950/35 shadow-sm",
    haloClass: "bg-emerald-600/28",
    haloInsetClass: "-inset-7",
  },
  {
    key: "gte7",
    label: "≥ 7 ha",
    dotClass: "bg-emerald-950 ring-2 ring-emerald-200/55 shadow-sm",
    haloClass: "bg-emerald-900/22",
    haloInsetClass: "-inset-8",
  },
];

// Rough Vietnam bounding box to map lat/lng → x/y in the grid card
const VN_BOUNDS = {
  minLat: 8.0,
  maxLat: 23.5,
  minLng: 102.0,
  maxLng: 109.5,
};

const clamp01 = (n) => Math.max(0, Math.min(1, n));

const normalizeText = (s) => {
  if (!s) return "";
  return String(s)
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .trim();
};

const hashString = (s) => {
  const str = normalizeText(s);
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
};

const locationToXY = (location) => {
  // Deterministic placement inside Vietnam bounds based on the location string.
  const a = hashString(`${location}::a`);
  const b = hashString(`${location}::b`);
  // Keep markers away from edges a bit
  const x = 8 + a * 84;
  const y = 10 + b * 78;
  return { x, y };
};

const latLngToXY = (lat, lng) => {
  const latitude = Number(lat);
  const longitude = Number(lng);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  const x01 = clamp01(
    (longitude - VN_BOUNDS.minLng) / (VN_BOUNDS.maxLng - VN_BOUNDS.minLng),
  );
  const y01 = clamp01(
    (VN_BOUNDS.maxLat - latitude) / (VN_BOUNDS.maxLat - VN_BOUNDS.minLat),
  );

  return {
    x: x01 * 100,
    y: y01 * 100,
  };
};

const fmtCoord = (value, pos, neg) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "";
  const dir = n >= 0 ? pos : neg;
  return `${Math.abs(n).toFixed(3)}°${dir}`;
};

const toAreaHa = (point) => {
  const explicitHa = Number(point?.areaHa ?? point?.area_ha);
  if (Number.isFinite(explicitHa)) return explicitHa;

  const explicitM2 = Number(point?.areaM2 ?? point?.area_m2);
  if (Number.isFinite(explicitM2)) return explicitM2 / M2_PER_HA;

  const areaRaw = Number(point?.area);
  if (!Number.isFinite(areaRaw)) return 0;

  // Season diary area is entered in m2, convert to ha for dashboard map display.
  return areaRaw / M2_PER_HA;
};

export function GardenHeatmap({ points }) {
  const { t } = useLanguage();
  const [dbGardens, setDbGardens] = useState([]);

  useEffect(() => {
    let mounted = true;
    gardenAPI
      .getGardensForMap()
      .then((res) => {
        const list = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
            ? res
            : [];
        if (!mounted) return;
        setDbGardens(list);
      })
      .catch(() => {
        if (!mounted) return;
        setDbGardens([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const data = useMemo(() => {
    if (Array.isArray(points) && points.length > 0) return points;
    if (Array.isArray(dbGardens) && dbGardens.length > 0) return dbGardens;
    return [];
  }, [points, dbGardens]);

  const normalized = useMemo(() => {
    return data
      .map((p, idx) => {
        const latitude = Number(p?.latitude ?? p?.lat);
        const longitude = Number(p?.longitude ?? p?.lng);
        const areaHa = toAreaHa(p);
        const safeAreaHa = Number.isFinite(areaHa) ? areaHa : 0;
        const hasLatLng =
          Number.isFinite(latitude) && Number.isFinite(longitude);
        const fromXY = {
          x: Number(p?.x),
          y: Number(p?.y),
        };
        const hasXY = Number.isFinite(fromXY.x) && Number.isFinite(fromXY.y);
        const projected = hasXY
          ? fromXY
          : (latLngToXY(latitude, longitude) ??
            locationToXY(p?.location ?? p?.name ?? String(idx)));
        const x = Math.max(0, Math.min(100, Number(projected?.x ?? 0)));
        const y = Math.max(0, Math.min(100, Number(projected?.y ?? 0)));
        return {
          id: p?.id ?? p?._id ?? `p-${idx}`,
          x,
          y,
          lat: hasLatLng ? latitude : null,
          lng: hasLatLng ? longitude : null,
          areaHa: safeAreaHa,
          bucket: getAreaBucket(safeAreaHa),
          name: p?.name ?? "Vườn",
          location: p?.location ?? "",
          latitude: Number.isFinite(latitude)
            ? latitude
            : Number(p?.latitude ?? 0),
          longitude: Number.isFinite(longitude)
            ? longitude
            : Number(p?.longitude ?? 0),
        };
      })
      .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
  }, [data]);

  const mapPoints = useMemo(
    () =>
      normalized.filter(
        (p) => Number.isFinite(p.lat) && Number.isFinite(p.lng),
      ),
    [normalized],
  );

  const bucketStyle = useMemo(
    () =>
      new Map([
        [
          "lt3",
          {
            className: "fill-emerald-200 stroke-emerald-600",
            radius: 6,
            fillOpacity: 0.7,
          },
        ],
        [
          "3to5",
          {
            className: "fill-emerald-400 stroke-emerald-800",
            radius: 7,
            fillOpacity: 0.7,
          },
        ],
        [
          "5to7",
          {
            className: "fill-emerald-700 stroke-emerald-950",
            radius: 8,
            fillOpacity: 0.7,
          },
        ],
        [
          "gte7",
          {
            className: "fill-emerald-950 stroke-emerald-200",
            radius: 9,
            fillOpacity: 0.7,
          },
        ],
      ]),
    [],
  );

  function FitAllBounds({ points: pts }) {
    const map = useMap();
    useEffect(() => {
      if (!map || !Array.isArray(pts) || pts.length === 0) return;
      const latLngs = pts
        .map((p) => [p.lat, p.lng])
        .filter(([lat, lng]) => Number.isFinite(lat) && Number.isFinite(lng));
      if (latLngs.length === 0) return;
      if (latLngs.length === 1) {
        map.setView(latLngs[0], 11, { animate: false });
        return;
      }
      map.fitBounds(latLngs, { padding: [24, 24] });
    }, [map, pts]);
    return null;
  }

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100">
      <div className="mb-4 md:mb-6">
        <h2 className="text-base md:text-lg font-bold text-[#1a4d2e]">
          {t("garden_distribution")}
        </h2>
        <p className="text-xs md:text-sm text-gray-500">
          {t("track_coordinates")}
        </p>
      </div>

      <div className="relative w-full h-65 md:h-75 rounded-xl border border-emerald-100 overflow-hidden bg-emerald-50/70">
        <MapContainer
          center={[15.8, 107.1]}
          zoom={6}
          scrollWheelZoom
          className="w-full h-full"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <FitAllBounds points={mapPoints} />

          {mapPoints.map((p) => {
            const style = bucketStyle.get(p.bucket) || bucketStyle.get("lt3");
            const locationLine = p.location?.trim()
              ? p.location
              : `${fmtCoord(p.latitude, "N", "S")}, ${fmtCoord(p.longitude, "E", "W")}`;
            return (
              <CircleMarker
                key={p.id}
                center={[p.lat, p.lng]}
                radius={style.radius}
                pathOptions={{
                  weight: 2,
                  opacity: 1,
                  fillOpacity: style.fillOpacity,
                  className: style.className,
                }}
              >
                <Tooltip direction="top" offset={[0, -8]} opacity={1} sticky>
                  <div>
                    <div className="font-bold text-[#1a4d2e]">{p.name}</div>
                    <div className="text-sm">
                      {t("area")}: {p.areaHa.toFixed(2)} ha
                    </div>
                    <div className="text-xs text-gray-600">{locationLine}</div>
                  </div>
                </Tooltip>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <p className="text-xs md:text-sm text-gray-700">{t("area")}: </p>
          {BUCKETS.map((b) => (
            <div key={b.key} className="flex items-center gap-2">
              <span className={`w-4 h-4 rounded-full ${b.dotClass}`} />
              <p className="text-xs md:text-sm text-gray-700">{b.label}</p>
            </div>
          ))}
        </div>
        <p className="text-xs md:text-sm text-gray-700">
          {t("total")}: {normalized.length}
        </p>
      </div>
    </div>
  );
}
