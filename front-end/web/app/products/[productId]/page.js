"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { productAPI, ratingAPI } from "@/lib/api";
import ProductRating from "@/components/ProductRating";
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
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";

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
  const params = useParams();
  const productId = params?.productId;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState("description");
  const [imageError, setImageError] = useState(false);
  const [userId, setUserId] = useState(null);
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
    const id = getUserId();
    setUserId(id);
  }, []);

  // Thêm useEffect fetch rating
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
          setError("Không tìm thấy sản phẩm");
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.");
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex flex-col justify-center items-center py-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin sản phẩm...</p>
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
              <h3 className="text-lg font-semibold text-red-900">Lỗi</h3>
            </div>
            <p className="text-red-700 mb-4">
              {error || "Không tìm thấy sản phẩm"}
            </p>
            <Link
              href="/products"
              className="inline-block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Quay lại danh sách
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
              Trang chủ
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link
              href="/products"
              className="hover:text-emerald-600 transition-colors"
            >
              Sản phẩm
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

                {/* Thumbnail images */}
                {/* {product.images && product.images.length > 1 && (
                                    <div className="flex gap-2 mt-4">
                                        {product.images.map((image, index) => (
                                            <button
                                                key={index}
                                                onClick={() => {
                                                    setSelectedImage(index);
                                                    setImageError(false);
                                                }}
                                                className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === index
                                                    ? "border-emerald-600"
                                                    : "border-gray-200 hover:border-gray-300"
                                                    }`}
                                            >
                                                <Image
                                                    src={image.url}
                                                    alt={`${product.name} ${index + 1}`}
                                                    fill
                                                    unoptimized
                                                    className="object-cover"
                                                    onError={(e) => {
                                                        e.target.src = "/images/Durian1.jpg";
                                                    }}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )} */}
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
                            className={`w-5 h-5 ${
                              star <= Math.floor(rating)
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
                      <span>{product.view_count} lượt xem</span>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50 rounded-xl p-6">
                  <p className="text-sm text-gray-600 mb-2">Giá tham khảo</p>
                  <span className="text-4xl font-bold text-emerald-600">
                    {formatPrice(product.price)}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="w-6 h-6 text-emerald-600" />
                    <div>
                      <span className="text-sm text-gray-600">Xuất xứ:</span>
                      <span className="ml-2 font-semibold text-gray-900">
                        {product.origin}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Weight className="w-6 h-6 text-emerald-600" />
                    <div>
                      <span className="text-sm text-gray-600">
                        Trọng lượng:
                      </span>
                      <span className="ml-2 font-semibold text-gray-900">
                        {product.weight}kg / trái
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Package className="w-6 h-6 text-emerald-600" />
                    <div>
                      <span className="text-sm text-gray-600">Trạng thái:</span>
                      <span className="ml-2 font-semibold text-green-600">
                        {product.status === "active" ? "Đang bán" : "Ngừng bán"}
                      </span>
                    </div>
                  </div>

                  {product.type_id && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Tag className="w-6 h-6 text-emerald-600" />
                      <div>
                        <span className="text-sm text-gray-600">
                          Loại sản phẩm:
                        </span>
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
                        <span className="text-sm text-gray-600">Mùa vụ:</span>
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
                    <svg
                      className="w-6 h-6"
                      viewBox="0 0 48 48"
                      fill="currentColor"
                    >
                      <path d="M24 4C12.95 4 4 12.95 4 24c0 4.52 1.52 8.69 4.08 12.06L4.5 43.5l7.92-3.42C15.76 42.57 19.74 44 24 44c11.05 0 20-8.95 20-20S35.05 4 24 4zm0 36c-3.86 0-7.45-1.31-10.29-3.51l-.74-.57-5.66 2.44 2.5-5.45-.62-.79C6.65 29.16 5.5 26.67 5.5 24c0-10.22 8.28-18.5 18.5-18.5S42.5 13.78 42.5 24 34.22 42.5 24 42.5z" />
                      <path d="M32.5 27.5c-.41 0-.83-.1-1.21-.31l-5.54-3.07c-.68-.38-1.11-1.11-1.11-1.91v-6.46c0-1.19.97-2.16 2.16-2.16h.41c1.19 0 2.16.97 2.16 2.16v5.28l4.34 2.4c1.03.57 1.39 1.87.82 2.9-.39.7-1.12 1.17-1.93 1.17h-.1z" />
                    </svg>
                    Liên hệ qua Zalo
                  </button>
                  <button
                    onClick={(e) => handleContact(e, product)}
                    className="px-6 py-4 border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                    title="Nhắn tin với người bán"
                  >
                    <MessageCircle className="w-6 h-6" />
                  </button>
                </div>

                {product.user_id && (
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                      Thông tin người bán:
                    </h3>
                    <div className="flex items-center gap-4">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200">
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
                          {product.user_id.full_name || "Người bán"}
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
                  className={`px-8 py-4 font-semibold transition-colors ${
                    activeTab === "description"
                      ? "text-emerald-600 border-b-2 border-emerald-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Mô tả sản phẩm
                </button>
                <button
                  onClick={() => setActiveTab("specifications")}
                  className={`px-8 py-4 font-semibold transition-colors ${
                    activeTab === "specifications"
                      ? "text-emerald-600 border-b-2 border-emerald-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Thông số kỹ thuật
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
                        <span className="font-semibold text-gray-700">
                          Tên sản phẩm:
                        </span>
                        <span className="text-gray-900">{product.name}</span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-gray-200">
                        <span className="font-semibold text-gray-700">
                          Xuất xứ:
                        </span>
                        <span className="text-gray-900">{product.origin}</span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-gray-200">
                        <span className="font-semibold text-gray-700">
                          Trọng lượng:
                        </span>
                        <span className="text-gray-900">
                          {product.weight}kg / trái
                        </span>
                      </div>
                      {product.harvest_start_date && (
                        <div className="flex justify-between py-3 border-b border-gray-200">
                          <span className="font-semibold text-gray-700">
                            Mùa vụ bắt đầu:
                          </span>
                          <span className="text-gray-900">
                            {formatDate(product.harvest_start_date)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between py-3 border-b border-gray-200">
                        <span className="font-semibold text-gray-700">
                          Trạng thái:
                        </span>
                        <span className="text-green-600 font-semibold">
                          {product.status === "active"
                            ? "Đang bán"
                            : "Ngừng bán"}
                        </span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-gray-200">
                        <span className="font-semibold text-gray-700">
                          Lượt xem:
                        </span>
                        <span className="text-gray-900">
                          {product.view_count}
                        </span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-gray-200">
                        <span className="font-semibold text-gray-700">
                          Đánh giá:
                        </span>
                        <span className="text-gray-900">
                          {rating.toFixed(1)} / 5.0
                        </span>
                      </div>
                      {product.harvest_end_date && (
                        <div className="flex justify-between py-3 border-b border-gray-200">
                          <span className="font-semibold text-gray-700">
                            Mùa vụ kết thúc:
                          </span>
                          <span className="text-gray-900">
                            {formatDate(product.harvest_end_date)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
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
