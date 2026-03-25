"use client";
import Navbar from "@/components/Navbar";
import { ArrowLeft, Calendar, Book, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { blogAPI } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

export default function BlogDetailPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const params = useParams();
  const blogId = params?.blogId;

  const [viewingBlog, setViewingBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!blogId) return;
    const fetchBlog = async () => {
      try {
        setLoading(true);
        setError("");
        const result = await blogAPI.getBlogById(blogId);
        if (result.code === 200 && result.data) {
          setViewingBlog(result.data);
        } else {
          setError(t("blog_detail_load_fail"));
        }
      } catch (err) {
        console.error("Error fetching blog detail:", err);
        setError(err.message || t("blog_detail_load_fail"));
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [blogId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center py-20">
          <p className="text-gray-600">{t("blog_mgmt_loading")}</p>
        </div>
      </div>
    );
  }

  if (error || !viewingBlog) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center py-20">
          <p className="text-red-600">{error || t("blog_detail_load_fail")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="pt-10 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-emerald-500 rounded-3xl shadow-xl p-8">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-white/90 hover:text-white transition-colors mb-8 font-medium cursor-pointer"
            >
              <ArrowLeft size={20} />
              <span>{t("blog_detail_back")}</span>
            </button>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {viewingBlog.title}
              </h1>
              <div className="flex items-center justify-center gap-4 text-emerald-50 text-lg flex-wrap">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>
                    {new Date(viewingBlog.created_at).toLocaleDateString(
                      "vi-VN",
                    )}
                  </span>
                </div>
                {viewingBlog.knowledgeBlocks?.length > 0 && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-2">
                      <Book className="w-5 h-5" />
                      <span>
                        {viewingBlog.knowledgeBlocks.length}{" "}
                        {t("blog_mgmt_chapters")}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="text-emerald-500" size={28} />
              {t("blog_detail_intro")}
            </h2>
            <p className="text-gray-700 leading-relaxed text-lg">
              {viewingBlog.content}
            </p>
          </div>

          {viewingBlog.knowledgeBlocks?.map((block, index) => (
            <div
              key={block._id || index}
              className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200"
            >
              {block.image && (
                <div className="relative h-96 w-full">
                  <Image
                    src={block.image}
                    alt={block.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex-shrink-0 w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    {index + 1}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex-1">
                    {block.title}
                  </h2>
                </div>
                <div className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
                  {block.content}
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-center pt-8">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex items-center gap-2 px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all shadow-lg"
            >
              {t("blog_detail_scroll_top")}
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
