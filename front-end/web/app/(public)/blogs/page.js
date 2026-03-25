"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { blogAPI } from "@/lib/api";
import {
  Search,
  X,
  Calendar,
  Book,
  ChevronRight,
  AlertCircle,
  Frown,
  ChevronDown,
  Tag,
  List,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function BlogPage() {
  const { t } = useLanguage();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await blogAPI.getAllBlogs({ sort: sortOrder });
        if (result.code === 200 && result.data) {
          const blogsWithCount = result.data.map((blog) => ({
            ...blog,
            knowledgeBlocksCount: blog.knowledgeBlocks?.length || 0,
          }));
          setBlogs(blogsWithCount);
        } else {
          setError(t("blog_login_required_title"));
        }
      } catch (err) {
        console.error("Error fetching blogs:", err);
        setError(t("blog_login_required_title"));
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, [sortOrder, t]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isSortDropdownOpen &&
        !event.target.closest(".sort-dropdown-container")
      ) {
        setIsSortDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSortDropdownOpen]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const normalize = (str) =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const filteredBlogs = blogs.filter((blog) =>
    normalize(blog.title).includes(normalize(searchTerm)),
  );

  const sortOptions = [
    { value: "newest", label: t("blog_sort_newest") },
    { value: "oldest", label: t("blog_sort_oldest") },
  ];

  const getCurrentSortLabel = () => {
    return (
      sortOptions.find((opt) => opt.value === sortOrder)?.label ||
      t("blog_sort_label")
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-emerald-500 pt-32 pb-16 px-4">
        <div className="max-w-350 mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t("blog_page_title")}
          </h1>
          <p className="text-emerald-100 text-lg max-w-2xl mx-auto mb-8">
            {t("blog_page_subtitle")}
          </p>
          <div className="max-w-2xl mx-auto">
            <div className="relative group">
              <input
                type="text"
                placeholder={t("blog_search_placeholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-4 pl-14 rounded-2xl border-2 border-white/30 focus:border-white focus:outline-none text-gray-900 placeholder-gray-500 bg-white transition-all duration-300"
              />
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600 group-focus-within:text-emerald-700 transition-colors" />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Blog List Section */}
      <section className="py-16 px-4">
        <div className="max-w-350 mx-auto">
          {loading ? (
            <div className="flex flex-col justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
              <p className="text-gray-600">{t("blog_loading")}</p>
            </div>
          ) : error ? (
            <div className="flex flex-col justify-center items-center py-20">
              <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-emerald-100">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-emerald-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {t("blog_login_required_title")}
                </h3>
                <p className="text-gray-500 text-sm mb-6">
                  {t("blog_login_required_desc")}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href="/login"
                    className="px-6 py-2.5 bg-emerald-600 text-white rounded-full font-medium hover:bg-emerald-700 transition-colors text-sm"
                  >
                    {t("blog_login_btn2")}
                  </Link>
                  <Link
                    href="/register"
                    className="px-6 py-2.5 border border-emerald-600 text-emerald-600 rounded-full font-medium hover:bg-emerald-50 transition-colors text-sm"
                  >
                    {t("blog_register_btn2")}
                  </Link>
                </div>
              </div>
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div className="text-center py-20">
              <Frown className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">{t("blog_not_found")}</p>
            </div>
          ) : (
            <>
              {/* Sort bar */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-gray-600">
                  {t("blog_found")}{" "}
                  <span className="font-semibold text-emerald-600">
                    {filteredBlogs.length}
                  </span>{" "}
                  {t("blog_found_items")}
                </p>
                <div className="flex flex-wrap gap-3 items-center">
                  <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                    {t("blog_sort_label")}
                  </span>
                  <div className="relative sort-dropdown-container">
                    <button
                      onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                      className="min-w-40 px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg text-gray-900 font-medium hover:border-emerald-500 transition-all duration-200 flex items-center justify-between gap-2 text-sm"
                    >
                      <span>{getCurrentSortLabel()}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-500 transition-all duration-200 ${isSortDropdownOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {isSortDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 w-full bg-white border-2 border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
                        {sortOptions.map((option, index) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setSortOrder(option.value);
                              setIsSortDropdownOpen(false);
                            }}
                            className={`w-full px-4 py-2.5 text-left text-sm transition-all duration-150 ${
                              sortOrder === option.value
                                ? "bg-emerald-50 text-emerald-700 font-semibold"
                                : "text-gray-700 hover:bg-gray-50"
                            } ${index !== sortOptions.length - 1 ? "border-b border-gray-100" : ""}`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredBlogs.map((blog) => (
                  <Link
                    key={blog._id}
                    href={`/blogs/${blog._id}`}
                    className="group"
                  >
                    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                      <div className="p-4 pb-0">
                        <div
                          className="relative rounded-xl overflow-hidden bg-gray-100"
                          style={{ aspectRatio: "16/9" }}
                        >
                          {blog.image ? (
                            <Image
                              src={blog.image}
                              alt={blog.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="h-full bg-linear-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                              <svg
                                className="w-20 h-20 text-white opacity-50"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-1 group-hover:text-emerald-600 transition-colors">
                          {blog.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-1">
                          {blog.content}
                        </p>
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(blog.created_at)}</span>
                          </div>
                          {blog.knowledgeBlocksCount > 0 && (
                            <div className="flex items-center gap-1 text-sm text-emerald-600 font-medium">
                              <Book className="w-4 h-4" />
                              <span>
                                {blog.knowledgeBlocksCount} {t("blog_chapters")}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="mt-4 flex items-center text-emerald-600 font-medium group-hover:text-emerald-700">
                          <span>{t("blog_read_more")}</span>
                          <ChevronRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
