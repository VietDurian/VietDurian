"use client";

"use client";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Star } from "lucide-react";

import { useLanguage } from "../context/LanguageContext";
import { productsAdminAPI } from "../../../../lib/api";
import Image from "next/image";

const decimalToNumber = (value) => {
  if (typeof value === "number") return value;
  if (typeof value === "object" && value?.$numberDecimal)
    return Number(value.$numberDecimal);
  return Number(value || 0);
};

const mapProduct = (p) => ({
  id: p?._id,
  name: p?.name,
  rating: decimalToNumber(p?.rating),
  userId: p?.user_id?._id || p?.user_id || "",
  user_name: p?.user_id?.full_name || p?.userName || "—",
  typeName: p?.type_id?.name || p?.typeName || "—",
  description: p?.description || "",
  price: decimalToNumber(p?.price),
  origin: p?.origin || "",
  weight: Number(p?.weight ?? 0),
  viewCount: Number(p?.view_count ?? 0),
  harvestStartDate: p?.harvest_start_date || null,
  harvestEndDate: p?.harvest_end_date || null,
  status: p?.status || "",
  createdAt: p?.created_at || null,
  updatedAt: p?.updated_at || null,
  imageUrl: (() => {
    const images = p?.images ?? p?.image ?? p?.thumbnail ?? p?.cover;
    if (Array.isArray(images)) {
      const first = images[0];
      if (!first) return "";
      if (typeof first === "string") return first;
      return first?.url || first?.secure_url || first?.path || "";
    }
    if (typeof images === "string") return images;
    if (images && typeof images === "object")
      return images?.url || images?.secure_url || images?.path || "";
    return p?.image_url || p?.thumbnail_url || "";
  })(),
});

const clampRating = (rating) => Math.max(0, Math.min(5, Number(rating) || 0));

const getLevel = (rating) => {
  const r = clampRating(rating);
  if (r >= 4) return "high";
  if (r >= 2.5) return "medium";
  return "low";
};

const levelBadgeClass = (level) => {
  switch (level) {
    case "high":
      return "bg-red-50 text-red-700 border-red-100";
    case "medium":
      return "bg-yellow-50 text-yellow-700 border-yellow-100";
    case "low":
    default:
      return "bg-blue-50 text-blue-700 border-blue-100";
  }
};

const ratingBarClass = (level) => {
  switch (level) {
    case "high":
      return "bg-red-500";
    case "medium":
      return "bg-yellow-500";
    case "low":
    default:
      return "bg-blue-500";
  }
};

const formatCompactNumber = (n) => {
  const x = Number(n || 0);
  if (x >= 1_000_000) return `${(x / 1_000_000).toFixed(1)}M`;
  if (x >= 1_000) return `${(x / 1_000).toFixed(1)}K`;
  return `${x}`;
};

function StarsRow({ value = 0 }) {
  const r = clampRating(value);
  const full = Math.floor(r);
  const half = r - full >= 0.5;

  return (
    <div className="flex items-center gap-0.5" aria-label={`rating ${r}`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const idx = i + 1;
        const filled = idx <= full;
        const isHalf = !filled && half && idx === full + 1;

        // trick: show half by overlaying width-1/2
        return (
          <span key={i} className="relative inline-flex w-4 h-4">
            <Star className="w-4 h-4 text-gray-300" />
            {filled ? (
              <Star className="w-4 h-4 text-amber-500 absolute inset-0" />
            ) : isHalf ? (
              <span className="absolute inset-0 overflow-hidden w-1/2">
                <Star className="w-4 h-4 text-amber-500" />
              </span>
            ) : null}
          </span>
        );
      })}
    </div>
  );
}

function ProductThumb({ src, alt }) {
  return (
    <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <Image
          src={src}
          alt={alt || "product"}
          width={96}
          height={96}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="text-[10px] text-gray-400 font-semibold">No image</div>
      )}
    </div>
  );
}

export function ProductRatingWidget({ limit = 50 } = {}) {
  const { t } = useLanguage();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await productsAdminAPI.getAllProducts({
          page: 1,
          limit: Number(limit) || 50,
        });
        const listRaw = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
            ? res.data.data
            : [];

        const mapped = listRaw.map(mapProduct).filter((p) => p?.id);
        if (mounted) setProducts(mapped);
      } catch (e) {
        if (mounted) setError(e?.message || t("failed_to_load_products"));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    run();
    return () => {
      mounted = false;
    };
  }, [limit, t]);

  const sorted = useMemo(() => {
    return [...(Array.isArray(products) ? products : [])].sort(
      (a, b) => Number(b?.rating || 0) - Number(a?.rating || 0),
    );
  }, [products]);

  const top3 = useMemo(() => sorted.slice(0, 3), [sorted]);
  const rest = useMemo(() => sorted.slice(3), [sorted]);

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4 md:mb-6">
        <div className="min-w-0">
          <h2 className="text-base md:text-lg font-bold text-[#1a4d2e]">
            {t("product_ratings")}
          </h2>
          <p className="text-xs md:text-sm text-gray-500">
            {t("manage_product_ratings")}
          </p>
        </div>

        <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
          <Star className="w-5 h-5 text-amber-600" />
        </div>
      </div>

      {/* Body states */}
      {loading ? (
        <div className="h-80 flex items-center justify-center">
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>{t("loading")}</span>
          </div>
        </div>
      ) : error ? (
        <div className="h-80 flex items-center justify-center text-red-600">
          {error}
        </div>
      ) : sorted.length === 0 ? (
        <div className="h-80 flex items-center justify-center text-gray-500">
          {t("no_products")}
        </div>
      ) : (
        <div className="rounded-xl border border-gray-100 overflow-hidden">
          <div className="h-80 overflow-y-auto divide-y divide-gray-100 bg-white">
            {[...top3, ...rest].map((p, idx) => {
              const level = getLevel(p.rating);
              const levelLabel = t(level);

              const r = clampRating(p.rating);
              const pct = (r / 5) * 100;
              const rank = idx + 1;
              const rankLabel = rank <= 3 ? `TOP ${rank}` : `#${rank}`;

              return (
                <div
                  key={p.id}
                  className="p-4 flex items-center gap-3 hover:bg-gray-50 transition"
                >
                  <div className="w-14 text-center shrink-0">
                    <span className="text-xs md:text-sm font-extrabold text-gray-400">
                      {rankLabel}
                    </span>
                  </div>

                  <ProductThumb src={p.imageUrl} alt={p.name} />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p
                        className="font-bold text-[#1a4d2e] whitespace-normal break-normal leading-snug"
                        title={p.name || ""}
                      >
                        {p.name || "—"}
                      </p>

                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${levelBadgeClass(level)}`}
                      >
                        {levelLabel}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center gap-2">
                      <StarsRow value={r} />
                      <span className="text-sm font-semibold text-gray-700">
                        {r.toFixed(1)}
                      </span>
                    </div>

                    <div className="mt-2 h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className={`h-full ${ratingBarClass(level)}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function ProductRatingPage() {
  return <ProductRatingWidget />;
}

export default ProductRatingPage;
