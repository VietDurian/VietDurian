"use client";
import Navbar from "@/components/Navbar";
import {
  X,
  ImageIcon,
  BookOpen,
  Plus,
  ChevronRight,
  CheckCircle,
  Trash2,
  Edit2,
  Calendar,
  Book,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { blogAPI } from "@/lib/api";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";

// ==================== CONFIRM MODAL ====================
const ConfirmModal = ({ isOpen, onClose, onConfirm, message }) => {
  const { t } = useLanguage();
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <p className="text-gray-800 text-sm mb-6 text-center">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition text-sm"
          >
            {t("blog_mgmt_cancel")}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition text-sm"
          >
            {t("blog_mgmt_delete")}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== MODAL COMPONENT ====================
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-1002 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white text-black w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden">
        <div className="relative flex items-center justify-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-center flex-1">{title}</h2>
          <button
            onClick={onClose}
            className="absolute right-4 p-2 bg-gray-200 hover:bg-gray-300 rounded-full transition"
            aria-label="Đóng"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>
        <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

// ==================== STEP INDICATOR ====================
const StepIndicator = ({ currentStep }) => {
  const { t } = useLanguage();
  const steps = [
    { number: 1, title: t("blog_edit_step1_title") },
    { number: 2, title: t("blog_edit_step2_title") },
  ];
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${currentStep >= step.number ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-500"}`}
            >
              {currentStep > step.number ? (
                <CheckCircle size={20} />
              ) : (
                step.number
              )}
            </div>
            <span
              className={`text-xs mt-2 font-medium ${currentStep >= step.number ? "text-emerald-500" : "text-gray-500"}`}
            >
              {step.title}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`w-24 h-1 mx-4 transition-all ${currentStep > step.number ? "bg-emerald-500" : "bg-gray-200"}`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

// ==================== IMAGE UPLOAD COMPONENT ====================
const ImageUpload = ({ image, onImageChange, onImageRemove, label }) => {
  const { t } = useLanguage();
  const fileInputRef = useRef(null);
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      {!image ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all"
        >
          <ImageIcon className="mx-auto text-gray-400 mb-2" size={40} />
          <p className="text-sm font-medium text-gray-600">
            {t("blog_edit_image_upload_click")}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {t("blog_edit_image_upload_hint")}
          </p>
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden border-2 border-gray-200">
          <Image
            src={image}
            alt="Preview"
            width={96}
            height={96}
            className="w-full h-64 object-cover bg-gray-50"
          />
          <button
            type="button"
            onClick={onImageRemove}
            className="absolute top-3 right-3 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-all"
          >
            <X size={18} />
          </button>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onImageChange}
      />
    </div>
  );
};

// ==================== KNOWLEDGE BLOCK CARD ====================
const KnowledgeBlockCard = ({
  block,
  index,
  onEdit,
  onDelete,
  displayIndex,
}) => {
  const showIndex = displayIndex !== undefined ? displayIndex : index + 1;
  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-emerald-400 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">
            {showIndex}
          </div>
          <h4 className="font-bold text-gray-900 text-lg line-clamp-1">
            {block.title}
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(index)}
            className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
            title="Sửa"
          >
            <Edit2 size={18} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(index)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Xóa"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
      {block.image && (
        <div className="mb-3 rounded-lg overflow-hidden">
          <Image
            src={block.image}
            alt={block.title}
            width={96}
            height={96}
            className="w-full h-40 object-cover"
          />
        </div>
      )}
      <p className="text-gray-600 text-sm line-clamp-3 whitespace-pre-wrap">
        {block.content}
      </p>
    </div>
  );
};

// ==================== BLOG CARD ====================
const BlogCard = ({
  blog,
  onEdit,
  onDelete,
  onAddBlock,
  onView,
  onDeleteConfirm,
}) => {
  const { t } = useLanguage();
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 group">
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
            <div className="h-full bg-emerald-500 flex items-center justify-center">
              <BookOpen className="w-20 h-20 text-white opacity-50" />
            </div>
          )}
          <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddBlock(blog);
              }}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-all"
              title={t("blog_mgmt_add_chapter_btn")}
            >
              <Plus size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(blog);
              }}
              className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg shadow-lg transition-all"
              title={t("blog_mgmt_edit_btn")}
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteConfirm(blog._id);
              }}
              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-lg transition-all"
              title={t("blog_mgmt_delete_btn")}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
      <div className="p-5">
        <div onClick={() => onView(blog)} className="cursor-pointer">
          <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-1 hover:text-emerald-500 transition-colors">
            {blog.title}
          </h3>
        </div>
        <p className="text-gray-600 text-sm mb-4 line-clamp-1">
          {blog.content}
        </p>
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(blog.created_at)}</span>
          </div>
          {blog.knowledgeBlocks?.length > 0 && (
            <div className="flex items-center gap-1 text-sm text-emerald-500 font-medium">
              <Book className="w-4 h-4" />
              <span>
                {blog.knowledgeBlocks.length} {t("blog_mgmt_chapters")}
              </span>
            </div>
          )}
        </div>
        <div
          onClick={() => onView(blog)}
          className="mt-4 flex items-center text-emerald-500 font-medium hover:text-emerald-600 cursor-pointer group"
        >
          <span>{t("blog_mgmt_view_detail")}</span>
          <ChevronRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN COMPONENT ====================
export default function BlogManagementContent() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();

  const [view, setView] = useState("list");
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    message: "",
    onConfirm: null,
  });
  const openConfirm = (message, onConfirm) =>
    setConfirmModal({ isOpen: true, message, onConfirm });
  const closeConfirm = () =>
    setConfirmModal({ isOpen: false, message: "", onConfirm: null });

  const [currentStep, setCurrentStep] = useState(1);
  const [editingBlog, setEditingBlog] = useState(null);
  const [blogTitle, setBlogTitle] = useState("");
  const [blogContent, setBlogContent] = useState("");
  const [blogImage, setBlogImage] = useState("");
  const [blogImageData, setBlogImageData] = useState("");
  const [blogImageChanged, setBlogImageChanged] = useState(false);

  const [knowledgeBlocks, setKnowledgeBlocks] = useState([]);
  const [isAddingBlock, setIsAddingBlock] = useState(false);
  const [editingBlockIndex, setEditingBlockIndex] = useState(null);

  const [blockTitle, setBlockTitle] = useState("");
  const [blockContent, setBlockContent] = useState("");
  const [blockImage, setBlockImage] = useState("");
  const [blockImageData, setBlockImageData] = useState("");
  const [blockImageChanged, setBlockImageChanged] = useState(false);

  const [selectedBlog, setSelectedBlog] = useState(null);
  const [newBlocks, setNewBlocks] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (view !== "list") return;
    const fetchUserBlogs = async () => {
      if (!user?._id && !user?.id) return;
      try {
        setLoading(true);
        setError("");
        const result = await blogAPI.getAllBlogs({
          author_id: user._id || user.id,
          sort: "newest",
        });
        if (result.code === 200 && result.data) setBlogs(result.data);
        else setError(t("blog_mgmt_load_fail"));
      } catch (err) {
        console.error("Error fetching blogs:", err);
        setError(t("blog_mgmt_load_fail"));
      } finally {
        setLoading(false);
      }
    };
    fetchUserBlogs();
  }, [user, view, t]);

  const handleBlogImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError(t("blog_edit_image_too_large"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const r = reader.result?.toString() || "";
      setBlogImageData(r);
      setBlogImage(r);
      setBlogImageChanged(true);
    };
    reader.readAsDataURL(file);
  };

  const handleBlockImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError(t("blog_edit_image_too_large"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const r = reader.result?.toString() || "";
      setBlockImageData(r);
      setBlockImage(r);
      setBlockImageChanged(true);
    };
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setBlogTitle("");
    setBlogContent("");
    setBlogImage("");
    setBlogImageData("");
    setBlogImageChanged(false);
    setKnowledgeBlocks([]);
    setNewBlocks([]);
    setBlockTitle("");
    setBlockContent("");
    setBlockImage("");
    setBlockImageData("");
    setBlockImageChanged(false);
    setIsAddingBlock(false);
    setEditingBlockIndex(null);
    setEditingBlog(null);
    setSelectedBlog(null);
    setError("");
  };

  const canProceedToStep2 = () =>
    blogTitle.trim() !== "" &&
    blogContent.trim() !== "" &&
    blogImageData !== "";

  const handleSaveBlock = () => {
    if (!blockTitle.trim() || !blockContent.trim() || !blockImageData) {
      setError(t("block_save_required"));
      return;
    }
    const newBlock = {
      title: blockTitle.trim(),
      content: blockContent.trim(),
      image: blockImageData,
      imageChanged: blockImageChanged,
    };
    if (view === "addBlock") {
      if (editingBlockIndex !== null) {
        const u = [...newBlocks];
        u[editingBlockIndex] = newBlock;
        setNewBlocks(u);
        setEditingBlockIndex(null);
      } else setNewBlocks([...newBlocks, newBlock]);
    } else {
      if (editingBlockIndex !== null) {
        const u = [...knowledgeBlocks];
        if (u[editingBlockIndex]._id) newBlock._id = u[editingBlockIndex]._id;
        u[editingBlockIndex] = newBlock;
        setKnowledgeBlocks(u);
        setEditingBlockIndex(null);
      } else setKnowledgeBlocks([...knowledgeBlocks, newBlock]);
    }
    setBlockTitle("");
    setBlockContent("");
    setBlockImage("");
    setBlockImageData("");
    setBlockImageChanged(false);
    setIsAddingBlock(false);
    setError("");
  };

  const handleEditBlock = (index) => {
    const blocks = view === "addBlock" ? newBlocks : knowledgeBlocks;
    const block = blocks[index];
    if (!block) return;
    setBlockTitle(block.title);
    setBlockContent(block.content);
    setBlockImage(block.image);
    setBlockImageData(block.image);
    setBlockImageChanged(false);
    setEditingBlockIndex(index);
    setIsAddingBlock(true);
  };

  const handleDeleteBlock = (index) => {
    openConfirm(t("blog_mgmt_delete_block_confirm"), async () => {
      closeConfirm();
      try {
        const blocks = view === "addBlock" ? newBlocks : knowledgeBlocks;
        const block = blocks[index];
        if (block?._id) {
          const result = await blogAPI.deleteKnowledgeBlock(block._id);
          if (result.code === 200) {
            if (view === "addBlock")
              setNewBlocks(newBlocks.filter((_, i) => i !== index));
            else
              setKnowledgeBlocks(knowledgeBlocks.filter((_, i) => i !== index));
          } else {
            toast.error(t("blog_mgmt_delete_block_fail"));
          }
        } else {
          if (view === "addBlock")
            setNewBlocks(newBlocks.filter((_, i) => i !== index));
          else
            setKnowledgeBlocks(knowledgeBlocks.filter((_, i) => i !== index));
        }
      } catch (err) {
        console.error("Error deleting block:", err);
        toast.error(err.message || t("blog_mgmt_delete_block_fail"));
      }
    });
  };

  const handleCancelBlock = () => {
    setBlockTitle("");
    setBlockContent("");
    setBlockImage("");
    setBlockImageData("");
    setBlockImageChanged(false);
    setIsAddingBlock(false);
    setEditingBlockIndex(null);
    setError("");
  };

  const handleSubmitBlog = async () => {
    if (knowledgeBlocks.length === 0) {
      setError(t("blog_edit_chapter_required"));
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      const blogUpdateData = { title: blogTitle, content: blogContent };
      if (blogImageChanged) blogUpdateData.image = blogImageData;
      const blogResult = await blogAPI.updateBlog(
        editingBlog._id,
        blogUpdateData,
      );
      if (blogResult.code !== 200)
        throw new Error(t("blog_edit_update_info_fail"));

      const originalBlocks = editingBlog.knowledgeBlocks || [];
      for (const block of knowledgeBlocks) {
        if (block._id) {
          const u = { title: block.title, content: block.content };
          if (block.imageChanged) u.image = block.image;
          await blogAPI.updateKnowledgeBlock(block._id, u);
        } else {
          await blogAPI.addKnowledgeBlock(editingBlog._id, {
            title: block.title,
            content: block.content,
            image: block.image,
          });
        }
      }
      const currentIds = knowledgeBlocks.filter((b) => b._id).map((b) => b._id);
      for (const ob of originalBlocks) {
        if (ob._id && !currentIds.includes(ob._id)) {
          try {
            await blogAPI.deleteKnowledgeBlock(ob._id);
          } catch (e) {
            console.error(e);
          }
        }
      }
      toast.success(t("blog_edit_update_success"));
      setView("list");
      resetForm();
    } catch (err) {
      console.error("Error saving blog:", err);
      setError(err.message || t("blog_edit_update_fail"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitNewBlocks = async () => {
    if (newBlocks.length === 0) {
      setError(t("add_block_required"));
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      for (const block of newBlocks) {
        await blogAPI.addKnowledgeBlock(selectedBlog._id, {
          title: block.title,
          content: block.content,
          image: block.image,
        });
      }
      toast.success(
        `${t("add_block_success")} ${newBlocks.length} ${t("add_block_success_suffix")}`,
      );
      setView("list");
      resetForm();
    } catch (err) {
      console.error("Error adding blocks:", err);
      setError(err.message || t("add_block_fail"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditBlog = (blog) => {
    setEditingBlog(blog);
    setBlogTitle(blog.title);
    setBlogContent(blog.content);
    setBlogImage(blog.image);
    setBlogImageData(blog.image);
    setBlogImageChanged(false);
    setKnowledgeBlocks(blog.knowledgeBlocks || []);
    setView("edit");
    setCurrentStep(2);
  };

  const handleDeleteBlog = (blogId) => {
    openConfirm(t("blog_mgmt_delete_blog_confirm"), async () => {
      closeConfirm();
      try {
        const result = await blogAPI.deleteBlog(blogId);
        if (result.code === 200) {
          setBlogs((prev) => prev.filter((b) => b._id !== blogId));
          toast.success(t("blog_mgmt_delete_blog_success"));
        } else {
          toast.error(t("blog_mgmt_delete_blog_fail"));
        }
      } catch (err) {
        console.error("Error deleting blog:", err);
        toast.error(err.message || t("blog_mgmt_delete_blog_fail"));
      }
    });
  };

  const handleAddBlockToBlog = (blog) => {
    setSelectedBlog(blog);
    setNewBlocks([]);
    setView("addBlock");
  };

  const handleViewBlog = (blog) => {
    router.push(`/profile/blogs/${blog._id}`);
  };

  const handleBackToList = () => {
    resetForm();
    setView("list");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* ========== LIST VIEW ========== */}
      {view === "list" && (
        <>
          <section className="pt-12 pb-8 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="bg-emerald-500 rounded-3xl shadow-xl p-8 md:p-12">
                <div className="flex items-center justify-between flex-wrap gap-6">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                      {t("blog_mgmt_title")}
                    </h1>
                    <p className="text-emerald-50 text-lg">
                      {t("blog_mgmt_subtitle")}
                    </p>
                  </div>
                  <Link
                    href="/profile/blogs/create"
                    className="bg-white hover:bg-emerald-50 text-emerald-500 px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg"
                  >
                    <Plus size={20} />
                    {t("blog_mgmt_create_btn")}
                  </Link>
                </div>
              </div>
            </div>
          </section>
          <section className="py-12 px-4">
            <div className="max-w-7xl mx-auto">
              {loading ? (
                <div className="flex flex-col justify-center items-center py-20">
                  <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
                  <p className="text-gray-600">{t("blog_mgmt_loading")}</p>
                </div>
              ) : error ? (
                <div className="flex flex-col justify-center items-center py-20">
                  <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md">
                    <AlertCircle className="w-6 h-6 text-red-600 mx-auto mb-3" />
                    <p className="text-red-700 mb-4">{error}</p>
                  </div>
                </div>
              ) : blogs.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-32 h-32 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="w-16 h-16 text-emerald-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {t("blog_mgmt_empty_title")}
                  </h3>
                  <p className="text-gray-500 text-lg mb-6">
                    {t("blog_mgmt_empty_desc")}
                  </p>
                  <Link
                    href="/profile/blogs/create"
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold transition-all inline-flex items-center gap-2"
                  >
                    <Plus size={20} />
                    {t("blog_mgmt_create_btn")}
                  </Link>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <p className="text-gray-600">
                      {t("blog_mgmt_total")}{" "}
                      <span className="font-semibold text-emerald-500">
                        {blogs.length}
                      </span>{" "}
                      {t("blog_mgmt_total_label")}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {blogs.map((blog) => (
                      <BlogCard
                        key={blog._id}
                        blog={blog}
                        onEdit={handleEditBlog}
                        onDelete={handleDeleteBlog}
                        onDeleteConfirm={handleDeleteBlog}
                        onAddBlock={handleAddBlockToBlog}
                        onView={handleViewBlog}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </section>
        </>
      )}

      {/* ========== EDIT BLOG VIEW ========== */}
      {view === "edit" && (
        <>
          <section className="pt-10 pb-8 px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-emerald-500 rounded-3xl shadow-xl p-8">
                <button
                  onClick={handleBackToList}
                  className="flex items-center gap-2 text-white/90 hover:text-white transition-colors mb-8 font-medium cursor-pointer"
                >
                  <ArrowLeft size={20} />
                  <span>{t("blog_edit_back")}</span>
                </button>
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-10 h-10 text-white" />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {t("blog_edit_title")}
                  </h1>
                  <p className="text-emerald-50 text-lg">
                    {t("blog_edit_subtitle")}
                  </p>
                </div>
              </div>
            </div>
          </section>
          <section className="py-12 px-4">
            <div className="max-w-4xl mx-auto">
              <StepIndicator currentStep={currentStep} />
              {error && (
                <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3">
                  <X className="text-red-600 shrink-0" size={20} />
                  <p className="text-red-700 font-medium">{error}</p>
                  <button
                    onClick={() => setError("")}
                    className="ml-auto text-red-600 hover:text-red-800"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
              {currentStep === 1 && (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <BookOpen className="text-emerald-500" size={28} />
                    {t("blog_edit_info_title")}
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("blog_edit_blog_title_label")}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={blogTitle}
                        onChange={(e) => setBlogTitle(e.target.value)}
                        placeholder={t("blog_edit_blog_title_placeholder")}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        maxLength={200}
                      />
                      <div className="text-xs text-gray-500 text-right mt-1">
                        {blogTitle.length}/200
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("blog_edit_blog_intro_label")}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={blogContent}
                        onChange={(e) => setBlogContent(e.target.value)}
                        placeholder={t("blog_edit_blog_intro_placeholder")}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                        rows={6}
                        maxLength={1000}
                      />
                      <div className="text-xs text-gray-500 text-right mt-1">
                        {blogContent.length}/1000
                      </div>
                    </div>
                    <ImageUpload
                      image={blogImage}
                      onImageChange={handleBlogImageChange}
                      onImageRemove={() => {
                        setBlogImage("");
                        setBlogImageData("");
                      }}
                      label={
                        <>
                          Ảnh đại diện <span className="text-red-500">*</span>
                        </>
                      }
                    />
                    <div className="flex justify-end pt-4">
                      <button
                        onClick={() => {
                          if (!canProceedToStep2()) {
                            setError(t("blog_edit_required"));
                            return;
                          }
                          setError("");
                          setCurrentStep(2);
                        }}
                        disabled={!canProceedToStep2()}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {t("blog_edit_next_btn")}
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-emerald-200">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle className="text-emerald-500" size={24} />
                      <h3 className="text-lg font-bold text-gray-900">
                        {t("blog_edit_info_title")}
                      </h3>
                      <button
                        onClick={() => setCurrentStep(1)}
                        className="ml-auto text-emerald-500 hover:text-emerald-600 text-sm font-medium"
                      >
                        {t("blog_edit_step_edit")}
                      </button>
                    </div>
                    <div className="flex gap-4">
                      {blogImage && (
                        <Image
                          src={blogImage}
                          alt={blogTitle}
                          width={96}
                          height={96}
                          className="w-32 h-32 object-cover rounded-lg shrink-0"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-xl mb-2">
                          {blogTitle}
                        </h4>
                        <p className="text-gray-600 text-sm line-clamp-3">
                          {blogContent}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-lg p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <BookOpen className="text-emerald-500" size={28} />
                        {t("blog_edit_chapters_title")} (
                        {knowledgeBlocks.length})
                      </h2>
                      {!isAddingBlock && (
                        <button
                          onClick={() => setIsAddingBlock(true)}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2"
                        >
                          <Plus size={20} />
                          {t("blog_edit_add_chapter_btn")}
                        </button>
                      )}
                    </div>
                    {knowledgeBlocks.length > 0 && (
                      <div className="grid grid-cols-1 gap-4 mb-6">
                        {knowledgeBlocks.map((block, index) => (
                          <KnowledgeBlockCard
                            key={index}
                            block={block}
                            index={index}
                            onEdit={handleEditBlock}
                            onDelete={handleDeleteBlock}
                          />
                        ))}
                      </div>
                    )}
                    {knowledgeBlocks.length === 0 && !isAddingBlock && (
                      <div className="text-center py-12">
                        <BookOpen
                          className="mx-auto text-gray-300 mb-4"
                          size={64}
                        />
                        <p className="text-gray-500 text-lg mb-4">
                          {t("blog_edit_no_chapters")}
                        </p>
                        <button
                          onClick={() => setIsAddingBlock(true)}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-semibold transition-all inline-flex items-center gap-2"
                        >
                          <Plus size={20} />
                          {t("blog_edit_add_first_chapter")}
                        </button>
                      </div>
                    )}
                  </div>
                  <Modal
                    isOpen={isAddingBlock}
                    onClose={handleCancelBlock}
                    title={
                      editingBlockIndex !== null
                        ? t("block_modal_edit_title")
                        : t("block_modal_add_title")
                    }
                  >
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {t("block_title_label")}{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={blockTitle}
                          onChange={(e) => setBlockTitle(e.target.value)}
                          placeholder={t("block_title_placeholder")}
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                          maxLength={200}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {t("block_content_label")}{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={blockContent}
                          onChange={(e) => setBlockContent(e.target.value)}
                          placeholder={t("block_content_placeholder")}
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none bg-white"
                          rows={6}
                          maxLength={5000}
                        />
                        <div className="text-xs text-gray-500 text-right mt-1">
                          {blockContent.length}/5000
                        </div>
                      </div>
                      <ImageUpload
                        image={blockImage}
                        onImageChange={handleBlockImageChange}
                        onImageRemove={() => {
                          setBlockImage("");
                          setBlockImageData("");
                        }}
                        label={
                          <>
                            {t("block_image_label")}{" "}
                            <span className="text-red-500">*</span>
                          </>
                        }
                      />
                      <div className="pt-4">
                        <button
                          type="button"
                          onClick={handleSaveBlock}
                          disabled={
                            !blockTitle.trim() ||
                            !blockContent.trim() ||
                            !blockImageData
                          }
                          className="w-full bg-emerald-500 text-white font-bold py-3 rounded-lg hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {editingBlockIndex !== null
                            ? t("block_update_btn")
                            : t("block_add_btn")}
                        </button>
                      </div>
                    </div>
                  </Modal>
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
                    >
                      {t("blog_edit_back_btn")}
                    </button>
                    <button
                      onClick={handleSubmitBlog}
                      disabled={knowledgeBlocks.length === 0 || isSubmitting}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {t("blog_edit_saving")}
                        </>
                      ) : (
                        <>
                          <CheckCircle size={20} />
                          {t("blog_edit_update_btn")}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {/* ========== ADD BLOCK VIEW ========== */}
      {view === "addBlock" && (
        <>
          <section className="pt-10 pb-8 px-4">
            <div className="max-w-5xl mx-auto">
              <div className="bg-emerald-500 rounded-3xl shadow-xl p-8">
                <button
                  onClick={handleBackToList}
                  className="flex items-center gap-2 text-white/90 hover:text-white transition-colors mb-8 font-medium cursor-pointer"
                >
                  <ArrowLeft size={20} />
                  <span>{t("add_block_back")}</span>
                </button>
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-10 h-10 text-white" />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {t("add_block_title")}
                  </h1>
                  <p className="text-emerald-50 text-lg">
                    {t("add_block_subtitle")}
                  </p>
                </div>
              </div>
            </div>
          </section>
          <section className="py-12 px-4">
            <div className="max-w-5xl mx-auto space-y-6">
              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3">
                  <X className="text-red-600 shrink-0" size={20} />
                  <p className="text-red-700 font-medium">{error}</p>
                  <button
                    onClick={() => setError("")}
                    className="ml-auto text-red-600 hover:text-red-800"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
              <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-emerald-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <BookOpen className="text-emerald-500" size={24} />
                  {t("add_block_blog_info")}
                </h3>
                <div className="flex gap-4">
                  {selectedBlog?.image && (
                    <Image
                      src={selectedBlog.image}
                      alt={selectedBlog.title}
                      width={96}
                      height={96}
                      className="w-32 h-32 object-cover rounded-lg shrink-0"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-xl mb-2">
                      {selectedBlog?.title}
                    </h4>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {selectedBlog?.content}
                    </p>
                    <div className="text-sm text-emerald-500 font-medium">
                      {selectedBlog?.knowledgeBlocks?.length || 0}{" "}
                      {t("add_block_current_chapters")}
                    </div>
                  </div>
                </div>
              </div>
              {selectedBlog?.knowledgeBlocks &&
                selectedBlog.knowledgeBlocks.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      {t("add_block_existing_title")} (
                      {selectedBlog.knowledgeBlocks.length})
                    </h3>
                    <div className="space-y-3">
                      {selectedBlog.knowledgeBlocks.map((block, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="w-6 h-6 bg-gray-400 text-white rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                            {index + 1}
                          </div>
                          <span className="text-gray-700 font-medium">
                            {block.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Plus className="text-emerald-500" size={28} />
                    {t("add_block_new_title")} ({newBlocks.length})
                  </h2>
                  {!isAddingBlock && (
                    <button
                      onClick={() => setIsAddingBlock(true)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2"
                    >
                      <Plus size={20} />
                      {t("blog_edit_add_chapter_btn")}
                    </button>
                  )}
                </div>
                {newBlocks.length > 0 && (
                  <div className="grid grid-cols-1 gap-4 mb-6">
                    {newBlocks.map((block, index) => (
                      <KnowledgeBlockCard
                        key={index}
                        block={block}
                        index={index}
                        displayIndex={
                          (selectedBlog?.knowledgeBlocks?.length || 0) +
                          index +
                          1
                        }
                        onEdit={handleEditBlock}
                        onDelete={handleDeleteBlock}
                      />
                    ))}
                  </div>
                )}
                {newBlocks.length === 0 && !isAddingBlock && (
                  <div className="text-center py-12">
                    <Plus className="mx-auto text-gray-300 mb-4" size={64} />
                    <p className="text-gray-500 text-lg mb-4">
                      {t("add_block_no_new")}
                    </p>
                    <button
                      onClick={() => setIsAddingBlock(true)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-semibold transition-all inline-flex items-center gap-2"
                    >
                      <Plus size={20} />
                      {t("add_block_add_first")}
                    </button>
                  </div>
                )}
              </div>
              <Modal
                isOpen={isAddingBlock}
                onClose={handleCancelBlock}
                title={
                  editingBlockIndex !== null
                    ? t("block_modal_edit_title")
                    : t("block_modal_add_title")
                }
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t("block_title_label")}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={blockTitle}
                      onChange={(e) => setBlockTitle(e.target.value)}
                      placeholder={t("block_title_placeholder")}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                      maxLength={200}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t("block_content_label")}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={blockContent}
                      onChange={(e) => setBlockContent(e.target.value)}
                      placeholder={t("block_content_placeholder")}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none bg-white"
                      rows={6}
                      maxLength={5000}
                    />
                    <div className="text-xs text-gray-500 text-right mt-1">
                      {blockContent.length}/5000
                    </div>
                  </div>
                  <ImageUpload
                    image={blockImage}
                    onImageChange={handleBlockImageChange}
                    onImageRemove={() => {
                      setBlockImage("");
                      setBlockImageData("");
                    }}
                    label={
                      <>
                        {t("block_image_label")}{" "}
                        <span className="text-red-500">*</span>
                      </>
                    }
                  />
                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={handleSaveBlock}
                      disabled={
                        !blockTitle.trim() ||
                        !blockContent.trim() ||
                        !blockImageData
                      }
                      className="w-full bg-emerald-500 text-white font-bold py-3 rounded-lg hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {editingBlockIndex !== null
                        ? t("block_update_btn")
                        : t("block_add_btn")}
                    </button>
                  </div>
                </div>
              </Modal>
              <div className="flex justify-between items-center">
                <button
                  onClick={handleBackToList}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
                >
                  {t("add_block_cancel")}
                </button>
                <button
                  onClick={handleSubmitNewBlocks}
                  disabled={newBlocks.length === 0 || isSubmitting}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t("add_block_saving")}
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      {t("add_block_save_btn")} {newBlocks.length}{" "}
                      {t("add_block_new_chapters_label")}
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>
        </>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirm}
        onConfirm={confirmModal.onConfirm}
        message={confirmModal.message}
      />
    </div>
  );
}
