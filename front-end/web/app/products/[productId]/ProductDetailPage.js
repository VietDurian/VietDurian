"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { productAPI, ratingAPI } from "@/lib/api";
import ProductRating from "@/components/ProductRating";
import DiaryPublicModel from "@/components/DiaryPublicModel";
import {
  ChevronRight,
  Eye,
  MapPin,
  Weight,
  Package,
  Tag,
  MessageCircle,
  Star,
  AlertCircle,
  Calendar,
  MessageCircleMore,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";
import { useLanguage } from "@/context/LanguageContext";

const getUserId = () => {
  if (typeof window === "undefined") return null;

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  };

  let userId = getCookie("user_id") || localStorage.getItem("user_id");

  if (!userId) {
    const accessToken =
      getCookie("accessToken") || localStorage.getItem("auth_token");
    if (accessToken) {
      try {
        const base64Url = accessToken.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join(""),
        );
        const decoded = JSON.parse(jsonPayload);
        userId = decoded.userId || decoded.id || decoded.sub;
      } catch (e) {
        console.error("Error decoding token:", e);
      }
    }
  }

  return userId;
};

export default function ProductDetailPage() {
  const { t } = useLanguage();
  const params = useParams();
  const productId = params?.productId;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState("description");
  const [imageError, setImageError] = useState(false);
  const [userId] = useState(() => getUserId());
  const [liveRating, setLiveRating] = useState(null);
  const { authUser } = useAuthStore();
  const { setSelectedUser, addContact } = useChatStore();
  const router = useRouter();

  const handleImageError = () => {
    setImageError(true);
  };

  const handleContact = (event, product) => {
    event.preventDefault();
    event.stopPropagation();

    if (!authUser) {
      router.push("/login");
      return;
    }

    const owner = product.user_id || product.user || {};
    const receiverId = typeof owner === "object" ? owner._id : owner;

    if (!receiverId) return;

    const chatUser = {
      _id: receiverId,
      full_name: owner.full_name || "Người bán",
      avatar: owner.avatar || "images/avatar.jpg",
    };

    addContact(chatUser);
    setSelectedUser(chatUser);

    router.push(`/chat/${receiverId}`);
  };

  useEffect(() => {
    const fetchLiveRating = async () => {
      if (!productId) return;
      try {
        const response = await ratingAPI.getRatingsByProductId(productId, {
          limit: 1,
        });
        if (response.success && response.statistics) {
          const avg = parseFloat(response.statistics.averageRating || 0);
          setLiveRating(avg);
        }
      } catch (err) {
        console.error("Error fetching live rating:", err);
      }
    };
    fetchLiveRating();
  }, [productId]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await productAPI.getProductById(productId);

        if (response.success) {
          setProduct(response.data);
        } else {
          setError(t('product_detail_not_found'));
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(t('product_detail_error_load'));
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const formatPrice = (price) => {
    const numericPrice =
      typeof price === "object" && price.$numberDecimal
        ? parseFloat(price.$numberDecimal)
        : parseFloat(price);

    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(numericPrice);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getDiaryId = () => {
    if (!product?.diary_id) return null;
    return typeof product.diary_id === "object"
      ? product.diary_id?._id
      : product.diary_id;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex flex-col justify-center items-center py-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
          <p className="text-gray-600">{t('product_detail_loading')}</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex flex-col justify-center items-center py-32">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-semibold text-red-900">{t('product_detail_error_title')}</h3>
            </div>
            <p className="text-red-700 mb-4">
              {error || t('product_detail_not_found')}
            </p>
            <Link
              href="/products"
              className="inline-block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              {t('product_detail_back_to_list')}
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const rating =
    liveRating !== null
      ? liveRating
      : typeof product.rating === "object" && product.rating.$numberDecimal
        ? parseFloat(product.rating.$numberDecimal)
        : parseFloat(product.rating || 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="bg-white border-b border-gray-200 pt-24 pb-4 px-4">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-emerald-600 transition-colors">
              {t('product_detail_breadcrumb_home')}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link
              href="/products"
              className="hover:text-emerald-600 transition-colors"
            >
              {t('product_detail_breadcrumb_products')}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">{product.name}</span>
          </div>
        </div>
      </div>

      <section className="py-12 px-4">
        <div className="max-w-[1400px] mx-auto">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
              <div className="flex flex-col h-full">
                <div className="relative flex-1 rounded-xl overflow-hidden bg-gray-100 shadow-md min-h-[600px]">
                  {product.images && product.images.length > 0 ? (
                    <Image
                      src={
                        imageError
                          ? "/images/Durian1.jpg"
                          : product.images[selectedImage].url
                      }
                      alt={product.name}
                      fill
                      unoptimized
                      className="object-cover"
                      onError={handleImageError}
                    />
                  ) : (
                    <Image
                      src="/images/Durian1.jpg"
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
              </div>

              <div className="flex flex-col h-full space-y-6">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                    {product.name}
                  </h1>

                  <div className="flex items-center gap-6 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${star <= Math.floor(rating)
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                              }`}
                          />
                        ))}
                      </div>
                      <span className="text-lg font-semibold text-gray-700">
                        {rating.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Eye className="w-5 h-5" />
                      <span>{product.view_count} {t('product_detail_views')}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50 rounded-xl p-6">
                  <p className="text-sm text-gray-600 mb-2">{t('product_detail_ref_price')}</p>
                  <span className="text-4xl font-bold text-emerald-600">
                    {formatPrice(product.price)}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="w-6 h-6 text-emerald-600" />
                    <div>
                      <span className="text-sm text-gray-600">{t('product_detail_origin')}</span>
                      <span className="ml-2 font-semibold text-gray-900">
                        {product.origin}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Weight className="w-6 h-6 text-emerald-600" />
                    <div>
                      <span className="text-sm text-gray-600">{t('product_detail_weight')}</span>
                      <span className="ml-2 font-semibold text-gray-900">
                        {product.weight}{t('product_detail_weight_unit')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Package className="w-6 h-6 text-emerald-600" />
                    <div>
                      <span className="text-sm text-gray-600">{t('product_detail_status')}</span>
                      <span className="ml-2 font-semibold text-green-600">
                        {product.status === "active" ? t('product_detail_status_active') : t('product_detail_status_inactive')}
                      </span>
                    </div>
                  </div>

                  {product.type_id && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Tag className="w-6 h-6 text-emerald-600" />
                      <div>
                        <span className="text-sm text-gray-600">{t('product_detail_type')}</span>
                        <span className="ml-2 font-semibold text-gray-900">
                          {product.type_id.name}
                        </span>
                      </div>
                    </div>
                  )}

                  {(product.harvest_start_date || product.harvest_end_date) && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="w-6 h-6 text-emerald-600" />
                      <div>
                        <span className="text-sm text-gray-600">{t('product_detail_season')}</span>
                        <span className="ml-2 font-semibold text-gray-900">
                          {formatDate(product.harvest_start_date)} -{" "}
                          {formatDate(product.harvest_end_date)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() =>
                      window.open(
                        `https://zalo.me/${product.user_id?.phone || ""}`,
                        "_blank",
                      )
                    }
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageCircleMore className="w-6 h-6" />
                    {t('product_detail_contact_zalo')}
                  </button>
                  <button
                    onClick={(e) => handleContact(e, product)}
                    className="px-6 py-4 border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                    title={t('product_detail_contact_zalo')}
                  >
                    <MessageCircle className="w-6 h-6" />
                  </button>
                </div>

                {product.user_id && (
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                      {t('product_detail_seller_info')}
                    </h3>
                    <div className="flex items-center gap-4">
                      <div
                        className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 cursor-pointer"
                        onClick={() =>
                          router.push(`/profile/${product.user_id._id}`)
                        }
                      >
                        {product.user_id.avatar ? (
                          <Image
                            src={product.user_id.avatar}
                            alt={product.user_id.full_name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-emerald-600 text-white font-bold text-lg">
                            {product.user_id.full_name?.charAt(0) || "U"}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {product.user_id.full_name || t('product_detail_seller_default')}
                        </p>
                        {product.user_id.email && (
                          <p className="text-sm text-gray-600">
                            {product.user_id.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab("description")}
                  className={`px-8 py-4 font-semibold transition-colors ${activeTab === "description"
                      ? "text-emerald-600 border-b-2 border-emerald-600"
                      : "text-gray-600 hover:text-gray-900"
                    }`}
                >
                  {t('product_detail_tab_description')}
                </button>
                <button
                  onClick={() => setActiveTab("specifications")}
                  className={`px-8 py-4 font-semibold transition-colors ${activeTab === "specifications"
                      ? "text-emerald-600 border-b-2 border-emerald-600"
                      : "text-gray-600 hover:text-gray-900"
                    }`}
                >
                  {t('product_detail_tab_specs')}
                </button>
                <button
                  onClick={() => setActiveTab("diary")}
                  className={`px-8 py-4 font-semibold transition-colors ${activeTab === "diary"
                      ? "text-emerald-600 border-b-2 border-emerald-600"
                      : "text-gray-600 hover:text-gray-900"
                    }`}
                >
                  {t('product_detail_tab_diary')}
                </button>
              </div>

              <div className="p-8">
                {activeTab === "description" && (
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed text-lg">
                      {product.description}
                    </p>
                  </div>
                )}

                {activeTab === "specifications" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex justify-between py-3 border-b border-gray-200">
                        <span className="font-semibold text-gray-700">{t('product_detail_spec_name')}</span>
                        <span className="text-gray-900">{product.name}</span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-gray-200">
                        <span className="font-semibold text-gray-700">{t('product_detail_spec_origin')}</span>
                        <span className="text-gray-900">{product.origin}</span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-gray-200">
                        <span className="font-semibold text-gray-700">{t('product_detail_spec_weight')}</span>
                        <span className="text-gray-900">
                          {product.weight}{t('product_detail_weight_unit')}
                        </span>
                      </div>
                      {product.harvest_start_date && (
                        <div className="flex justify-between py-3 border-b border-gray-200">
                          <span className="font-semibold text-gray-700">{t('product_detail_spec_season_start')}</span>
                          <span className="text-gray-900">
                            {formatDate(product.harvest_start_date)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between py-3 border-b border-gray-200">
                        <span className="font-semibold text-gray-700">{t('product_detail_spec_status')}</span>
                        <span className="text-green-600 font-semibold">
                          {product.status === "active"
                            ? t('product_detail_status_active')
                            : t('product_detail_status_inactive')}
                        </span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-gray-200">
                        <span className="font-semibold text-gray-700">{t('product_detail_spec_views')}</span>
                        <span className="text-gray-900">
                          {product.view_count}
                        </span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-gray-200">
                        <span className="font-semibold text-gray-700">{t('product_detail_spec_rating')}</span>
                        <span className="text-gray-900">
                          {rating.toFixed(1)} / 5.0
                        </span>
                      </div>
                      {product.harvest_end_date && (
                        <div className="flex justify-between py-3 border-b border-gray-200">
                          <span className="font-semibold text-gray-700">{t('product_detail_spec_season_end')}</span>
                          <span className="text-gray-900">
                            {formatDate(product.harvest_end_date)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "diary" && (
                  <DiaryPublicModel diaryId={getDiaryId()} />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <ProductRating productId={productId} userId={userId} />
      <Footer />
    </div>
  );
}