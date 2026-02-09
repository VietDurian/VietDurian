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
import { blogAPI } from "@/lib/api";

// ==================== STEP INDICATOR ====================
const StepIndicator = ({ currentStep }) => {
  const steps = [
    { number: 1, title: "Thông tin blog" },
    { number: 2, title: "Thêm chương" },
  ];

  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${currentStep >= step.number
                ? "bg-emerald-600 text-white"
                : "bg-gray-200 text-gray-500"
                }`}
            >
              {currentStep > step.number ? (
                <CheckCircle size={20} />
              ) : (
                step.number
              )}
            </div>
            <span
              className={`text-xs mt-2 font-medium ${currentStep >= step.number
                ? "text-emerald-600"
                : "text-gray-500"
                }`}
            >
              {step.title}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`w-24 h-1 mx-4 transition-all ${currentStep > step.number ? "bg-emerald-600" : "bg-gray-200"
                }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

// ==================== IMAGE UPLOAD COMPONENT ====================
const ImageUpload = ({ image, onImageChange, onImageRemove, label }) => {
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
            Nhấp để chọn ảnh
          </p>
          <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF tối đa 5MB</p>
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden border-2 border-gray-200">
          <img
            src={image}
            alt="Preview"
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
const KnowledgeBlockCard = ({ block, index, onEdit, onDelete }) => {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-emerald-400 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
            {index + 1}
          </div>
          <h4 className="font-bold text-gray-900 text-lg line-clamp-1">
            {block.title}
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(index)}
            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
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
          <img
            src={block.image}
            alt={block.title}
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
const BlogCard = ({ blog, onEdit, onDelete, onAddBlock, onView }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200">
      {/* Blog Image */}
      <div className="relative h-48 overflow-hidden">
        {blog.image ? (
          <>
            <Image
              src={blog.image}
              alt={blog.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          </>
        ) : (
          <div className="relative h-full bg-gradient-to-br from-emerald-400 to-emerald-600">
            <div className="absolute inset-0 flex items-center justify-center">
              <BookOpen className="w-20 h-20 text-white opacity-50" />
            </div>
          </div>
        )}

        {/* Action Buttons Overlay */}
        <div className="absolute top-3 right-3 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddBlock(blog);
            }}
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-all"
            title="Thêm chương"
          >
            <Plus size={18} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(blog);
            }}
            className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-lg transition-all"
            title="Chỉnh sửa"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm("Bạn có chắc chắn muốn xóa blog này?")) {
                onDelete(blog._id);
              }
            }}
            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-lg transition-all"
            title="Xóa"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Blog Content */}
      <div className="p-5">
        <div onClick={() => onView(blog)} className="cursor-pointer">
          <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-emerald-600 transition-colors">
            {blog.title}
          </h3>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{blog.content}</p>

        {/* Meta Info */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(blog.created_at)}</span>
          </div>

          {blog.knowledgeBlocks?.length > 0 && (
            <div className="flex items-center gap-1 text-sm text-emerald-600 font-medium">
              <Book className="w-4 h-4" />
              <span>{blog.knowledgeBlocks.length} chương</span>
            </div>
          )}
        </div>

        {/* View Details Link */}
        <div
          onClick={() => onView(blog)}
          className="mt-4 flex items-center text-emerald-600 font-medium hover:text-emerald-700 cursor-pointer group"
        >
          <span>Xem chi tiết</span>
          <ChevronRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN COMPONENT ====================
export default function BlogManagementContent() {
  const { user } = useAuth();

  // View state
  const [view, setView] = useState("list"); // list | create | edit | addBlock | detail

  // Blog list state
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Create/Edit blog state
  const [currentStep, setCurrentStep] = useState(1);
  const [editingBlog, setEditingBlog] = useState(null);
  const [blogTitle, setBlogTitle] = useState("");
  const [blogContent, setBlogContent] = useState("");
  const [blogImage, setBlogImage] = useState("");
  const [blogImageData, setBlogImageData] = useState("");
  const [blogImageChanged, setBlogImageChanged] = useState(false); // Track if image changed

  // Knowledge blocks state
  const [knowledgeBlocks, setKnowledgeBlocks] = useState([]);
  const [isAddingBlock, setIsAddingBlock] = useState(false);
  const [editingBlockIndex, setEditingBlockIndex] = useState(null);

  // Block form state
  const [blockTitle, setBlockTitle] = useState("");
  const [blockContent, setBlockContent] = useState("");
  const [blockImage, setBlockImage] = useState("");
  const [blockImageData, setBlockImageData] = useState("");
  const [blockImageChanged, setBlockImageChanged] = useState(false); // Track if block image changed

  // Add block to existing blog state
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [newBlocks, setNewBlocks] = useState([]);

  // Blog detail state
  const [viewingBlog, setViewingBlog] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // ==================== FETCH BLOGS ====================
  useEffect(() => {
    const fetchUserBlogs = async () => {
      if (!user?._id && !user?.id) return;

      try {
        setLoading(true);
        setError("");

        const userId = user._id || user.id;

        // Call real API with author_id filter to get only current user's blogs
        const result = await blogAPI.getAllBlogs({
          author_id: userId,
          sort: "newest"
        });

        if (result.code === 200 && result.data) {
          setBlogs(result.data);
        } else {
          setError("Không thể tải danh sách blog");
        }
      } catch (err) {
        console.error("Error fetching blogs:", err);
        setError("Không thể tải danh sách blog");
      } finally {
        setLoading(false);
      }
    };

    if (view === "list") {
      fetchUserBlogs();
    }
  }, [user, view]);

  // ==================== IMAGE HANDLERS ====================
  const handleBlogImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Ảnh quá lớn. Tối đa 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result?.toString() || "";
      setBlogImageData(result);
      setBlogImage(result);
      setBlogImageChanged(true); // Mark image as changed
    };
    reader.readAsDataURL(file);
  };

  const handleBlockImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Ảnh quá lớn. Tối đa 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result?.toString() || "";
      setBlockImageData(result);
      setBlockImage(result);
      setBlockImageChanged(true); // Mark block image as changed
    };
    reader.readAsDataURL(file);
  };

  // ==================== CREATE BLOG HANDLERS ====================
  const handleCreateBlog = () => {
    resetForm();
    setView("create");
    setCurrentStep(1);
  };

  const canProceedToStep2 = () => {
    return (
      blogTitle.trim() !== "" &&
      blogContent.trim() !== "" &&
      blogImageData !== ""
    );
  };

  const handleProceedToStep2 = () => {
    if (!canProceedToStep2()) {
      setError("Vui lòng điền đầy đủ thông tin blog và chọn ảnh");
      return;
    }
    setError("");
    setCurrentStep(2);
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

  // ==================== BLOCK HANDLERS ====================
  const handleSaveBlock = () => {
    if (!blockTitle.trim() || !blockContent.trim() || !blockImageData) {
      setError("Vui lòng điền đầy đủ thông tin chương và chọn ảnh");
      return;
    }

    const newBlock = {
      title: blockTitle.trim(),
      content: blockContent.trim(),
      image: blockImageData,
      imageChanged: blockImageChanged, // Track if image changed for edit
    };

    if (view === "addBlock") {
      // Adding to existing blog
      if (editingBlockIndex !== null) {
        const updatedBlocks = [...newBlocks];
        updatedBlocks[editingBlockIndex] = newBlock;
        setNewBlocks(updatedBlocks);
        setEditingBlockIndex(null);
      } else {
        setNewBlocks([...newBlocks, newBlock]);
      }
    } else {
      // Creating new blog or editing blog
      if (editingBlockIndex !== null) {
        const updatedBlocks = [...knowledgeBlocks];
        // Preserve _id if editing existing block
        if (updatedBlocks[editingBlockIndex]._id) {
          newBlock._id = updatedBlocks[editingBlockIndex]._id;
        }
        updatedBlocks[editingBlockIndex] = newBlock;
        setKnowledgeBlocks(updatedBlocks);
        setEditingBlockIndex(null);
      } else {
        setKnowledgeBlocks([...knowledgeBlocks, newBlock]);
      }
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
    setBlockTitle(block.title);
    setBlockContent(block.content);
    setBlockImage(block.image);
    setBlockImageData(block.image);
    setBlockImageChanged(false); // Reset - user needs to upload new image to change
    setEditingBlockIndex(index);
    setIsAddingBlock(true);
  };

  const handleDeleteBlock = async (index) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa chương này?")) {
      return;
    }

    try {
      const blocks = view === "addBlock" ? newBlocks : knowledgeBlocks;
      const block = blocks[index];

      // Nếu block đã tồn tại trên server (có _id), gọi API xóa
      if (block._id) {
        const result = await blogAPI.deleteKnowledgeBlock(block._id);

        if (result.code === 200) {
          // Xóa thành công trên server, cập nhật state local
          if (view === "addBlock") {
            setNewBlocks(newBlocks.filter((_, i) => i !== index));
          } else {
            setKnowledgeBlocks(knowledgeBlocks.filter((_, i) => i !== index));
          }
          alert("Xóa chương thành công!");
        } else {
          alert("Không thể xóa chương");
        }
      } else {
        // Block chưa lưu trên server, chỉ xóa trong state local
        if (view === "addBlock") {
          setNewBlocks(newBlocks.filter((_, i) => i !== index));
        } else {
          setKnowledgeBlocks(knowledgeBlocks.filter((_, i) => i !== index));
        }
      }
    } catch (error) {
      console.error("Error deleting block:", error);
      alert(error.message || "Không thể xóa chương");
    }
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

  // ==================== SUBMIT HANDLERS ====================
  const handleSubmitBlog = async () => {
    if (knowledgeBlocks.length === 0) {
      setError("Vui lòng thêm ít nhất một chương");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      if (view === "edit" && editingBlog) {
        // ============ UPDATE EXISTING BLOG ============

        // 1. Update blog parent info (only if changed)
        const blogUpdateData = {
          title: blogTitle,
          content: blogContent,
        };

        // Only include image if it changed
        if (blogImageChanged) {
          blogUpdateData.image = blogImageData;
        }

        const blogResult = await blogAPI.updateBlog(editingBlog._id, blogUpdateData);

        if (blogResult.code !== 200) {
          throw new Error("Không thể cập nhật thông tin blog");
        }

        // 2. Handle knowledge blocks
        const originalBlocks = editingBlog.knowledgeBlocks || [];
        const currentBlocks = knowledgeBlocks;

        // Update or create blocks
        for (let i = 0; i < currentBlocks.length; i++) {
          const block = currentBlocks[i];

          if (block._id) {
            // Existing block - update it
            const blockUpdateData = {
              title: block.title,
              content: block.content,
            };

            // Only include image if it changed
            if (block.imageChanged) {
              blockUpdateData.image = block.image;
            }

            await blogAPI.updateKnowledgeBlock(block._id, blockUpdateData);
          } else {
            // New block - create it
            await blogAPI.addKnowledgeBlock(editingBlog._id, {
              title: block.title,
              content: block.content,
              image: block.image,
            });
          }
        }

        // Delete blocks that were removed
        const currentBlockIds = currentBlocks
          .filter(b => b._id)
          .map(b => b._id);

        for (const originalBlock of originalBlocks) {
          if (!currentBlockIds.includes(originalBlock._id)) {
            await blogAPI.deleteKnowledgeBlock(originalBlock._id);
          }
        }

        alert("Blog đã được cập nhật thành công!");
      } else {
        // ============ CREATE NEW BLOG ============
        const blogData = {
          title: blogTitle,
          content: blogContent,
          image: blogImageData,
          knowledgeBlocks: knowledgeBlocks.map(block => ({
            title: block.title,
            content: block.content,
            image: block.image,
          })),
        };

        const result = await blogAPI.createBlog(blogData);

        if (result.code !== 201) {
          throw new Error("Không thể tạo blog");
        }

        alert("Blog đã được tạo thành công!");
      }

      setView("list");
      resetForm();
    } catch (err) {
      console.error("Error saving blog:", err);
      setError(err.message || "Có lỗi xảy ra khi lưu blog");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitNewBlocks = async () => {
    if (newBlocks.length === 0) {
      setError("Vui lòng thêm ít nhất một chương mới");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Add blocks one by one
      for (const block of newBlocks) {
        await blogAPI.addKnowledgeBlock(selectedBlog._id, {
          title: block.title,
          content: block.content,
          image: block.image,
        });
      }

      alert(`Đã thêm ${newBlocks.length} chương mới vào blog!`);
      setView("list");
      resetForm();
    } catch (err) {
      console.error("Error adding blocks:", err);
      setError(err.message || "Có lỗi xảy ra khi thêm chương");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==================== BLOG ACTIONS ====================
  const handleEditBlog = (blog) => {
    setEditingBlog(blog);
    setBlogTitle(blog.title);
    setBlogContent(blog.content);
    setBlogImage(blog.image);
    setBlogImageData(blog.image);
    setBlogImageChanged(false); // Reset - existing image
    setKnowledgeBlocks(blog.knowledgeBlocks || []);
    setView("edit");
    setCurrentStep(2);
  };

  const handleDeleteBlog = async (blogId) => {
    try {
      const result = await blogAPI.deleteBlog(blogId);

      if (result.code === 200) {
        setBlogs((prev) => prev.filter((blog) => blog._id !== blogId));
        alert("Xóa blog thành công!");
      } else {
        alert("Không thể xóa blog");
      }
    } catch (err) {
      console.error("Error deleting blog:", err);
      alert(err.message || "Không thể xóa blog");
    }
  };

  const handleAddBlockToBlog = (blog) => {
    setSelectedBlog(blog);
    setNewBlocks([]);
    setView("addBlock");
  };

  const handleViewBlog = async (blog) => {
    try {
      setLoading(true);
      setError("");

      // Fetch full blog details
      const result = await blogAPI.getBlogById(blog._id);

      if (result.code === 200 && result.data) {
        setViewingBlog(result.data);
        setView("detail");
      } else {
        setError("Không thể tải chi tiết blog");
      }
    } catch (err) {
      console.error("Error fetching blog detail:", err);
      setError(err.message || "Không thể tải chi tiết blog");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToList = () => {
    resetForm();
    setView("list");
  };

  // ==================== RENDER ====================
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* ========== LIST VIEW ========== */}
      {view === "list" && (
        <>
          <section className="bg-gradient-to-r from-emerald-700 to-emerald-900 pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    Blog Của Tôi
                  </h1>
                  <p className="text-emerald-100 text-lg">
                    Quản lý và chia sẻ kiến thức của bạn
                  </p>
                </div>
                <button
                  onClick={handleCreateBlog}
                  className="bg-white hover:bg-emerald-50 text-emerald-700 px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg"
                >
                  <Plus size={20} />
                  Tạo Blog Mới
                </button>
              </div>
            </div>
          </section>

          <section className="py-12 px-4">
            <div className="max-w-7xl mx-auto">
              {loading ? (
                <div className="flex flex-col justify-center items-center py-20">
                  <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
                  <p className="text-gray-600">Đang tải blog...</p>
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
                    <BookOpen className="w-16 h-16 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Chưa có blog nào
                  </h3>
                  <p className="text-gray-500 text-lg mb-6">
                    Hãy tạo blog đầu tiên của bạn ngay hôm nay!
                  </p>
                  <button
                    onClick={handleCreateBlog}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold transition-all inline-flex items-center gap-2"
                  >
                    <Plus size={20} />
                    Tạo Blog Mới
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <p className="text-gray-600">
                      Tổng cộng{" "}
                      <span className="font-semibold text-emerald-600">
                        {blogs.length}
                      </span>{" "}
                      blog
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {blogs.map((blog) => (
                      <BlogCard
                        key={blog._id}
                        blog={blog}
                        onEdit={handleEditBlog}
                        onDelete={handleDeleteBlog}
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

      {/* ========== CREATE/EDIT BLOG VIEW ========== */}
      {(view === "create" || view === "edit") && (
        <>
          <section className="bg-gradient-to-r from-emerald-700 to-emerald-900 pt-24 pb-12">
            <div className="max-w-4xl mx-auto px-4">
              <button
                onClick={handleBackToList}
                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-6"
              >
                <ArrowLeft size={20} />
                <span className="font-medium">Quay lại</span>
              </button>
              <div className="text-center">
                <BookOpen className="w-16 h-16 text-white mx-auto mb-4" />
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {view === "edit" ? "Chỉnh sửa Blog" : "Tạo Blog Mới"}
                </h1>
                <p className="text-emerald-100 text-lg">
                  Chia sẻ kiến thức của bạn với cộng đồng
                </p>
              </div>
            </div>
          </section>

          <section className="py-12 px-4">
            <div className="max-w-4xl mx-auto">
              <StepIndicator currentStep={currentStep} />

              {error && (
                <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3">
                  <X className="text-red-600 flex-shrink-0" size={20} />
                  <p className="text-red-700 font-medium">{error}</p>
                  <button
                    onClick={() => setError("")}
                    className="ml-auto text-red-600 hover:text-red-800"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}

              {/* STEP 1 */}
              {currentStep === 1 && (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <BookOpen className="text-emerald-600" size={28} />
                    Thông tin Blog
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Tiêu đề Blog <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={blogTitle}
                        onChange={(e) => setBlogTitle(e.target.value)}
                        placeholder="Nhập tiêu đề blog..."
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                        maxLength={200}
                      />
                      <div className="text-xs text-gray-500 text-right mt-1">
                        {blogTitle.length}/200
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Giới thiệu <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={blogContent}
                        onChange={(e) => setBlogContent(e.target.value)}
                        placeholder="Giới thiệu tổng quan về blog..."
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent resize-none"
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
                        onClick={handleProceedToStep2}
                        disabled={!canProceedToStep2()}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        Tiếp theo
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  {/* Blog Preview */}
                  <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-emerald-200">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle className="text-emerald-600" size={24} />
                      <h3 className="text-lg font-bold text-gray-900">
                        Thông tin Blog
                      </h3>
                      <button
                        onClick={() => setCurrentStep(1)}
                        className="ml-auto text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                      >
                        Chỉnh sửa
                      </button>
                    </div>
                    <div className="flex gap-4">
                      {blogImage && (
                        <img
                          src={blogImage}
                          alt={blogTitle}
                          className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
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

                  {/* Knowledge Blocks */}
                  <div className="bg-white rounded-2xl shadow-lg p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <BookOpen className="text-emerald-600" size={28} />
                        Các chương ({knowledgeBlocks.length})
                      </h2>
                      {!isAddingBlock && (
                        <button
                          onClick={() => setIsAddingBlock(true)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2"
                        >
                          <Plus size={20} />
                          Thêm chương
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

                    {isAddingBlock && (
                      <div className="border-2 border-emerald-200 rounded-xl p-6 bg-emerald-50">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                          {editingBlockIndex !== null
                            ? "Chỉnh sửa chương"
                            : "Thêm chương mới"}
                        </h3>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Tiêu đề chương{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={blockTitle}
                              onChange={(e) => setBlockTitle(e.target.value)}
                              placeholder="Nhập tiêu đề chương..."
                              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-white"
                              maxLength={200}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Nội dung chương{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <textarea
                              value={blockContent}
                              onChange={(e) => setBlockContent(e.target.value)}
                              placeholder="Nhập nội dung chương..."
                              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent resize-none bg-white"
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
                                Ảnh chương{" "}
                                <span className="text-red-500">*</span>
                              </>
                            }
                          />

                          <div className="flex gap-3 justify-end pt-4">
                            <button
                              type="button"
                              onClick={handleCancelBlock}
                              className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                            >
                              Hủy
                            </button>
                            <button
                              type="button"
                              onClick={handleSaveBlock}
                              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-all"
                            >
                              {editingBlockIndex !== null ? "Cập nhật" : "Thêm"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {knowledgeBlocks.length === 0 && !isAddingBlock && (
                      <div className="text-center py-12">
                        <BookOpen
                          className="mx-auto text-gray-300 mb-4"
                          size={64}
                        />
                        <p className="text-gray-500 text-lg mb-4">
                          Chưa có chương nào
                        </p>
                        <button
                          onClick={() => setIsAddingBlock(true)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all inline-flex items-center gap-2"
                        >
                          <Plus size={20} />
                          Thêm chương đầu tiên
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
                    >
                      Quay lại
                    </button>
                    <button
                      onClick={handleSubmitBlog}
                      disabled={knowledgeBlocks.length === 0 || isSubmitting}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Đang lưu...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={20} />
                          {view === "edit" ? "Cập nhật Blog" : "Tạo Blog"}
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
          <section className="bg-gradient-to-r from-emerald-700 to-emerald-900 pt-24 pb-12">
            <div className="max-w-5xl mx-auto px-4">
              <button
                onClick={handleBackToList}
                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-6"
              >
                <ArrowLeft size={20} />
                <span className="font-medium">Quay lại</span>
              </button>

              <div className="text-center">
                <BookOpen className="w-16 h-16 text-white mx-auto mb-4" />
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  Thêm Chương Mới
                </h1>
                <p className="text-emerald-100 text-lg">
                  Mở rộng nội dung blog của bạn
                </p>
              </div>
            </div>
          </section>

          <section className="py-12 px-4">
            <div className="max-w-5xl mx-auto space-y-6">
              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3">
                  <X className="text-red-600 flex-shrink-0" size={20} />
                  <p className="text-red-700 font-medium">{error}</p>
                  <button
                    onClick={() => setError("")}
                    className="ml-auto text-red-600 hover:text-red-800"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}

              {/* Blog Info */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-emerald-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <BookOpen className="text-emerald-600" size={24} />
                  Thông tin Blog
                </h3>
                <div className="flex gap-4">
                  {selectedBlog?.image && (
                    <img
                      src={selectedBlog.image}
                      alt={selectedBlog.title}
                      className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-xl mb-2">
                      {selectedBlog?.title}
                    </h4>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {selectedBlog?.content}
                    </p>
                    <div className="text-sm text-emerald-600 font-medium">
                      {selectedBlog?.knowledgeBlocks?.length || 0} chương hiện tại
                    </div>
                  </div>
                </div>
              </div>

              {/* Existing Blocks Preview */}
              {selectedBlog?.knowledgeBlocks &&
                selectedBlog.knowledgeBlocks.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      Các chương hiện có (
                      {selectedBlog.knowledgeBlocks.length})
                    </h3>
                    <div className="space-y-3">
                      {selectedBlog.knowledgeBlocks.map((block, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="w-6 h-6 bg-gray-400 text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
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

              {/* New Blocks Section */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Plus className="text-emerald-600" size={28} />
                    Chương mới ({newBlocks.length})
                  </h2>
                  {!isAddingBlock && (
                    <button
                      onClick={() => setIsAddingBlock(true)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2"
                    >
                      <Plus size={20} />
                      Thêm chương
                    </button>
                  )}
                </div>

                {newBlocks.length > 0 && (
                  <div className="grid grid-cols-1 gap-4 mb-6">
                    {newBlocks.map((block, index) => (
                      <KnowledgeBlockCard
                        key={index}
                        block={block}
                        index={
                          (selectedBlog?.knowledgeBlocks?.length || 0) + index
                        }
                        onEdit={handleEditBlock}
                        onDelete={handleDeleteBlock}
                      />
                    ))}
                  </div>
                )}

                {isAddingBlock && (
                  <div className="border-2 border-emerald-200 rounded-xl p-6 bg-emerald-50">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      {editingBlockIndex !== null
                        ? "Chỉnh sửa chương"
                        : "Thêm chương mới"}
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Tiêu đề chương{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={blockTitle}
                          onChange={(e) => setBlockTitle(e.target.value)}
                          placeholder="Nhập tiêu đề chương..."
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-white"
                          maxLength={200}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Nội dung chương{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={blockContent}
                          onChange={(e) => setBlockContent(e.target.value)}
                          placeholder="Nhập nội dung chương..."
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent resize-none bg-white"
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
                            Ảnh chương <span className="text-red-500">*</span>
                          </>
                        }
                      />

                      <div className="flex gap-3 justify-end pt-4">
                        <button
                          type="button"
                          onClick={handleCancelBlock}
                          className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                        >
                          Hủy
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveBlock}
                          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-all"
                        >
                          {editingBlockIndex !== null ? "Cập nhật" : "Thêm"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {newBlocks.length === 0 && !isAddingBlock && (
                  <div className="text-center py-12">
                    <Plus className="mx-auto text-gray-300 mb-4" size={64} />
                    <p className="text-gray-500 text-lg mb-4">
                      Chưa có chương mới nào
                    </p>
                    <button
                      onClick={() => setIsAddingBlock(true)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all inline-flex items-center gap-2"
                    >
                      <Plus size={20} />
                      Thêm chương đầu tiên
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center">
                <button
                  onClick={handleBackToList}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmitNewBlocks}
                  disabled={newBlocks.length === 0 || isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      Lưu {newBlocks.length} chương mới
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ========== BLOG DETAIL VIEW ========== */}
      {view === "detail" && viewingBlog && (
        <>
          <section className="bg-gradient-to-r from-emerald-700 to-emerald-900 pt-20 pb-12">
            <div className="max-w-[1400px] mx-auto">
              <div className="px-4">
                <button
                  onClick={handleBackToList}
                  className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors group mb-8 -ml-4"
                >
                  <ArrowLeft
                    className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform"
                  />
                  <span className="font-medium">Quay lại danh sách</span>
                </button>
              </div>

              <div className="max-w-[1000px] mx-auto text-center px-4">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  {viewingBlog.title}
                </h1>
                <div className="flex items-center justify-center gap-4 text-emerald-100 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    <span>
                      {new Date(viewingBlog.created_at).toLocaleDateString(
                        "vi-VN"
                      )}
                    </span>
                  </div>
                  {viewingBlog.knowledgeBlocks &&
                    viewingBlog.knowledgeBlocks.length > 0 && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-2">
                          <Book className="w-5 h-5" />
                          <span>{viewingBlog.knowledgeBlocks.length} chương</span>
                        </div>
                      </>
                    )}
                </div>
              </div>
            </div>
          </section>

          <section className="py-12 px-4">
            <div className="max-w-[1500px] mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-8">
                {/* Sidebar - Table of Contents */}
                {viewingBlog.knowledgeBlocks &&
                  viewingBlog.knowledgeBlocks.length > 0 && (
                    <div className="lg:sticky lg:top-24 h-fit">
                      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 uppercase text-sm tracking-wide">
                          <BookOpen className="w-4 h-4 text-emerald-600" />
                          Mục lục
                        </h3>
                        <nav className="space-y-1">
                          {viewingBlog.knowledgeBlocks.map((block, index) => (
                            <div
                              key={block._id || index}
                              className="flex items-center gap-3 px-4 py-5 text-sm font-medium rounded-lg border-l-4 border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                            >
                              <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-gray-100 text-gray-500">
                                {index + 1}
                              </span>
                              <span className="truncate">{block.title}</span>
                            </div>
                          ))}
                        </nav>
                      </div>
                    </div>
                  )}

                {/* Main Content */}
                <div className="space-y-8">
                  {/* Introduction */}
                  <div className="bg-white rounded-xl shadow-md p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      Giới thiệu
                    </h2>
                    <p className="text-gray-700 leading-relaxed text-lg">
                      {viewingBlog.content}
                    </p>
                  </div>

                  {/* Knowledge Blocks */}
                  {viewingBlog.knowledgeBlocks &&
                    viewingBlog.knowledgeBlocks.map((block, index) => (
                      <div
                        key={block._id || index}
                        className="bg-white rounded-xl shadow-md overflow-hidden"
                      >
                        {/* Block Image */}
                        {block.image && (
                          <div className="relative h-80 w-full">
                            <Image
                              src={block.image}
                              alt={block.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}

                        {/* Block Content */}
                        <div className="p-8">
                          <div className="flex items-start gap-4 mb-4">
                            <div className="flex-shrink-0 w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold">
                              {index + 1}
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 flex-1">
                              {block.title}
                            </h2>
                          </div>
                          <div className="text-gray-700 leading-relaxed text-lg ml-14 whitespace-pre-line">
                            {block.content}
                          </div>
                        </div>
                      </div>
                    ))}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between items-center pt-8">
                    <button
                      onClick={handleBackToList}
                      className="flex items-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full font-medium transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      Quay lại danh sách
                    </button>

                    <button
                      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                      className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-medium transition-colors"
                    >
                      Lên đầu trang
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
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}