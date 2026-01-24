"use client";

import Navbar from "@/components/Navbar";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (loading) return;
    if (user?.role === "admin") {
      router.push("/dashboard");
    }
  }, [loading, router, user]);

  const products = [
    {
      id: 1,
      name: "Phân Bón Hữu Cơ Premium",
      description: "Phân bón hữu cơ chất lượng cao, giúp cây sầu riêng phát triển khỏe mạnh và cho năng suất cao",
      price: "450.000đ",
      oldPrice: "550.000đ",
      sold: 234,
      likes: "1.2k",
      progress: 70,
      image: "/images/Durian3.jpg"
    },
    {
      id: 2,
      name: "Thuốc Trừ Sâu Sinh Học",
      description: "Thuốc trừ sâu sinh học an toàn, thân thiện với môi trường, bảo vệ cây trồng hiệu quả",
      price: "280.000đ",
      oldPrice: "350.000đ",
      sold: 456,
      likes: "890",
      progress: 85,
      image: "/images/Durian4.jpg"
    },
    {
      id: 3,
      name: "Giống Sầu Riêng Monthong",
      description: "Giống sầu riêng Monthong chất lượng cao, năng suất ổn định, thích hợp khí hậu Việt Nam",
      price: "1.200.000đ",
      oldPrice: "1.500.000đ",
      sold: 123,
      likes: "2.1k",
      progress: 60,
      image: "/images/Durian5.jpg"
    },
    {
      id: 4,
      name: "Hệ Thống Tưới Nhỏ Giọt",
      description: "Hệ thống tưới tự động tiết kiệm nước, tối ưu hiệu quả tưới cho vườn sầu riêng",
      price: "3.500.000đ",
      oldPrice: "4.200.000đ",
      sold: 89,
      likes: "1.5k",
      progress: 55,
      image: "/images/Durian1.jpg"
    },
    {
      id: 5,
      name: "Máy Phun Thuốc Chuyên Dụng",
      description: "Máy phun thuốc công suất cao, phun đều, tiết kiệm thời gian và công sức",
      price: "2.800.000đ",
      oldPrice: "3.500.000đ",
      sold: 167,
      likes: "780",
      progress: 75,
      image: "/images/Durian2.jpg"
    },
    {
      id: 6,
      name: "Bộ Test Đất Chuyên Nghiệp",
      description: "Bộ dụng cụ test đất giúp kiểm tra độ pH, dinh dưỡng đất chính xác",
      price: "650.000đ",
      oldPrice: "800.000đ",
      sold: 312,
      likes: "1.1k",
      progress: 80,
      image: "/images/Durian6.jpg"
    }
  ];

  const blogs = [
    {
      id: 1,
      title: "Kỹ Thuật Trồng Sầu Riêng Cho Năng Suất Cao",
      date: "31/05/2023",
      image: "/images/Durian1.jpg",
      featured: true
    },
    {
      id: 2,
      title: "Cách Phòng Trừ Sâu Bệnh Hiệu Quả Cho Sầu Riêng",
      date: "26/05/2023",
      image: "/images/Durian2.jpg",
      featured: false
    },
    {
      id: 3,
      title: "Bí Quyết Chăm Sóc Sầu Riêng Cho Trái To Đều",
      date: "24/05/2023",
      image: "/images/Durian3.jpg",
      featured: false
    },
    {
      id: 4,
      title: "Xu Hướng Thị Trường Sầu Riêng Việt Nam",
      date: "18/05/2023",
      image: "/images/Durian4.jpg",
      featured: false
    }
  ];

  const featuredBlog = blogs.find(blog => blog.featured);
  const otherBlogs = blogs.filter(blog => !blog.featured);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % (products.length - 2));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + (products.length - 2)) % (products.length - 2));
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Header Title - Outside Grid */}
      <div className="text-center pt-28 pb-4 px-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          Nền Tảng Phát Triển Sầu Riêng Việt Nam
        </h1>
      </div>

      {/* Image Grid Section with Slogan in Center */}
      <section className="px-4 lg:px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_2fr_0.8fr] gap-6">

          {/* ===== CỘT 1: DÀI TRÊN – NGẮN DƯỚI ===== */}
          <div className="flex flex-col gap-6">
            <div className="relative h-[380px] rounded-2xl overflow-hidden transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl">
              <Image
                src="/images/Durian1.jpg"
                alt="Trồng sầu riêng"
                fill
                className="object-cover"
              />
            </div>

            <div className="relative h-[220px] rounded-2xl overflow-hidden transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl">
              <Image
                src="/images/Durian2.jpg"
                alt="Chăm sóc sầu riêng"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* ===== CỘT 2: SLOGAN + BUTTONS + IMAGES ===== */}
          <div className="flex flex-col">
            {/* Slogan & Buttons */}
            <div className="text-center py-4 mb-6">
              <p className="text-gray-600 text-base max-w-2xl mx-auto mb-8">
                Từ kiến thức kỹ thuật đến sản phẩm chất lượng, cùng xây dựng ngành sầu riêng bền vững
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/san-pham"
                  className="px-8 py-3 border-2 border-emerald-600 text-emerald-600 rounded-full font-medium hover:bg-emerald-50 transition-colors min-w-[160px] text-center"
                >
                  Sản Phẩm
                </Link>
                <Link
                  href="/huong-dan"
                  className="px-8 py-3 bg-emerald-600 text-white rounded-full font-medium hover:bg-emerald-700 transition-colors min-w-[160px] text-center"
                >
                  Hướng Dẫn
                </Link>
              </div>
            </div>

            {/* Images Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end mt-auto">
              <div className="relative h-[320px] rounded-2xl overflow-hidden transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl">
                <Image
                  src="/images/Durian3.jpg"
                  alt="Lá sầu riêng"
                  fill
                  className="object-cover"
                />
              </div>

              <div className="relative h-[220px] rounded-2xl overflow-hidden transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl">
                <Image
                  src="/images/Durian4.jpg"
                  alt="Cánh đồng"
                  fill
                  className="object-cover"
                />
              </div>

              <div className="relative h-[320px] rounded-2xl overflow-hidden transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl">
                <Image
                  src="/images/Durian5.jpg"
                  alt="Rừng cây"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          {/* ===== CỘT 3: NGẮN TRÊN – DÀI DƯỚI ===== */}
          <div className="flex flex-col gap-6">
            <div className="relative h-[220px] rounded-2xl overflow-hidden transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl">
              <Image
                src="/images/Durian6.jpg"
                alt="Người trong rừng"
                fill
                className="object-cover"
              />
            </div>

            <div className="relative h-[380px] rounded-2xl overflow-hidden transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl">
              <Image
                src="/images/Durian7.jpg"
                alt="Nấm rừng"
                fill
                className="object-cover"
              />
            </div>
          </div>

        </div>
      </section>

      {/* Featured Products Section */}
      <section className="relative py-16 px-4 lg:px-6 bg-emerald-800">
        <div className="max-w-[1400px] mx-auto relative z-10">
          {/* Section Title */}
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            Sản Phẩm Nổi Bật
          </h2>

          {/* Products Carousel Container */}
          <div className="relative px-12">
            {/* Left Arrow */}
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-lime-400 hover:bg-lime-500 transition-all flex items-center justify-center shadow-lg hover:scale-105"
            >
              <svg className="w-6 h-6 text-emerald-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Products Grid */}
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 33.333}%)` }}
              >
                {products.map((product) => (
                  <div key={product.id} className="w-1/3 flex-shrink-0 px-3">
                    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow border border-gray-100">
                      <div className="p-4">
                        <div className="relative h-48 rounded-xl overflow-hidden mb-4">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex items-baseline gap-2 mb-3">
                          <span className="text-xl font-bold text-emerald-600">{product.price}</span>
                          <span className="text-xs text-gray-400 line-through">{product.oldPrice}</span>
                        </div>
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                            <span>Đã bán: {product.sold} sản phẩm</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div className="bg-lime-400 h-1.5 rounded-full" style={{ width: `${product.progress}%` }}></div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <svg className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span>{product.likes} Đánh giá</span>
                          </div>
                          <button className="px-5 py-2 bg-emerald-600 text-white rounded-full font-medium hover:bg-emerald-700 transition-colors text-sm">
                            Mua Ngay
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Arrow */}
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-lime-400 hover:bg-lime-500 transition-all flex items-center justify-center shadow-lg hover:scale-105"
            >
              <svg className="w-6 h-6 text-emerald-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-16 px-4 lg:px-6 bg-gray-50">
        <div className="max-w-[1400px] mx-auto">
          {/* Section Title */}
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
            Blog Mới
          </h2>

          {/* Blog Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Featured Blog - Left Side */}
            {featuredBlog && (
              <div className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-gray-300 transition-colors">
                <div className="relative h-[400px]">
                  <Image
                    src={featuredBlog.image}
                    alt={featuredBlog.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {featuredBlog.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{featuredBlog.date}</span>
                    <button className="text-emerald-600 font-medium hover:text-emerald-700 transition-colors">
                      Đọc thêm
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Other Blogs - Right Side */}
            <div className="flex flex-col gap-6">
              {otherBlogs.map((blog) => (
                <div
                  key={blog.id}
                  className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-gray-300 transition-colors flex"
                >
                  <div className="relative w-50 h-40 flex-shrink-0">
                    <Image
                      src={blog.image}
                      alt={blog.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4 flex flex-col justify-between flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {blog.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{blog.date}</span>
                      <button className="text-emerald-600 font-medium hover:text-emerald-700 transition-colors text-sm">
                        Đọc thêm
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}