"use client";
import AsideBar from "@/components/AsideBar";
import Navbar from "@/components/Navbar";
import {
  Camera,
  Gift,
  Heart,
  ImageIcon,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Share2,
  Smile,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

const ProfileCard = () => {
  return (
    <section className="w-full bg-white">
      <div className="relative border-2 border-gray-200 rounded-xl p-8 flex justify-between items-center w-full">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-black">
            Sophia Martinez
            <span className="bg-teal-600 text-white text-[10px] px-2 py-0.5 rounded-full">
              Verified
            </span>
          </h1>
          <p className="text-gray-500 text-sm">@sophiamartinez</p>
          <button className="mt-4 border border-gray-300 px-4 py-1 rounded-lg text-sm font-medium hover:bg-gray-50">
            TRADER PAGE
          </button>
        </div>
        <div className="relative">
          <img
            src="/images/avatar.jpg"
            className="w-24 h-24 rounded-full border-4 border-white shadow-sm"
          />
          <span className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-4 border-white rounded-full"></span>
        </div>
      </div>
    </section>
  );
};

const Tabs = () => {
  const [activeTab, setActiveTab] = useState("Posts");

  const TABS = ["Posts", "Blogs", "Friends"];
  return (
    <div className="w-full bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        {/* Tab Container */}
        <div className="flex gap-8">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative py-4 text-sm font-semibold transition-all duration-200 cursor-pointer outline-none
                ${
                  activeTab === tab
                    ? "text-emerald-800" // Active text color
                    : "text-gray-500 hover:text-gray-700" // Inactive text color
                }`}
            >
              {tab}

              {/* Bottom Border Indicator (Emerald green) */}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-800 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const PostComposer = ({ onOpenModal }) => {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-4 w-full max-w-4xl">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
          <img
            src="/images/avatar.jpg"
            alt="User profile"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Clicking this area opens the Post modal */}
        <div
          onClick={onOpenModal}
          className="flex-1 bg-gray-100 hover:bg-gray-200 rounded-full px-5 py-2.5 text-gray-500 cursor-pointer transition"
        >
          What&apos;s on your mind?
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-5 mt-4 px-2">
        <button className="text-slate-500 hover:text-emerald-700 transition">
          <Camera size={24} />
        </button>
        <button className="text-slate-500 hover:text-emerald-700 transition">
          <ImageIcon size={24} />
        </button>
        <button className="bg-[#064e3b] text-white px-8 py-2 rounded-lg font-bold hover:bg-[#053f30] transition shadow-sm">
          Post
        </button>
      </div>
    </div>
  );
};

const PostModal = ({ isOpen, onClose, user }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white text-black w-full max-w-125 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative flex items-center justify-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold">Tạo bài viết</h2>
          <button
            onClick={onClose}
            className="absolute right-4 p-2 bg-gray-200 hover:bg-gray-300 rounded-full transition cursor-pointer"
          >
            <X size={20} color="gray" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 flex items-center gap-3">
          <img
            src="/images/avatar.jpg"
            className="w-11 h-11 rounded-full border border-gray-600"
          />
          <div>
            <p className="font-semibold">{user?.full_name || "Quý Nguyễn"}</p>
            <button className="flex items-center gap-1 bg-gray-200 px-2 py-0.5 rounded-md text-xs mt-1">
              <Users size={12} />
              Công khai
              <span className="text-[8px]">▼</span>
            </button>
          </div>
        </div>

        {/* Text Area */}
        <div className="px-4">
          <textarea
            autoFocus
            placeholder="Bạn đang nghĩ gì?"
            className="w-full bg-transparent text-xl resize-none outline-none min-h-[150px] placeholder:text-gray-500"
          />
        </div>

        {/* Bottom Actions Box */}
        <div className="p-4">
          <div className="flex items-center justify-between border border-gray-600 rounded-lg p-3">
            <span className="font-semibold text-sm">
              Thêm vào bài viết của bạn
            </span>
            <div className="flex gap-2 text-gray-400">
              <ImageIcon className="text-green-500 cursor-pointer hover:bg-gray-200 p-1 rounded" />
              <Users className="text-blue-500 cursor-pointer hover:bg-gray-200 p-1 rounded" />
              <Smile className="text-yellow-500 cursor-pointer hover:bg-gray-200 p-1 rounded" />
              <MapPin className="text-red-500 cursor-pointer hover:bg-gray-200 p-1 rounded" />
              <Gift className="text-teal-500 cursor-pointer hover:bg-gray-200 p-1 rounded" />
              <MoreHorizontal className="cursor-pointer hover:bg-gray-200 p-1 rounded" />
            </div>
          </div>

          <button className="w-full bg-gray-200 text-gray-400 font-bold py-2 rounded-lg mt-4 cursor-not-allowed">
            Đăng
          </button>
        </div>
      </div>
    </div>
  );
};

const Post = ({ post }) => {
  return (
    <article className="bg-white border border-gray-100 rounded-xl p-4 mb-4 shadow-sm w-full">
      {/* Header: Avatar, Name, and Menu */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
            <img
              src={post.userAvatar || "/images/avatar.jpg"}
              alt={post.userName}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 leading-tight">
              {post.userName}
            </h4>
            <p className="text-gray-400 text-xs mt-0.5">
              @{post.userHandle} • {post.timestamp}
            </p>
          </div>
        </div>
        <button className="text-gray-400 hover:bg-gray-50 p-1 rounded-full transition">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Post Content */}
      <div className="text-sm text-gray-700 leading-relaxed mb-4">
        <p>{post.content}</p>
        {post.link && (
          <a
            href={post.link}
            className="text-blue-500 hover:underline block mt-2"
          >
            {post.link}
          </a>
        )}
      </div>

      {/* Post Image (Optional) */}
      {post.image && (
        <div className="rounded-xl overflow-hidden mb-4 border border-gray-100">
          <img
            src={post.image}
            alt="Post content"
            className="w-full h-auto object-cover"
          />
        </div>
      )}

      {/* Footer: Interaction Buttons */}
      <div className="pt-3 border-t border-gray-50 flex items-center justify-between px-2 text-gray-400">
        <button className="flex items-center gap-2 hover:text-red-500 transition group">
          <Heart size={18} className="group-hover:fill-current" />
          <span className="text-xs font-medium">{post.likes}</span>
        </button>

        <button className="flex items-center gap-2 hover:text-emerald-700 transition group">
          <MessageCircle size={18} />
          <span className="text-xs font-medium">{post.comments}</span>
        </button>

        <button className="flex items-center gap-2 hover:text-blue-600 transition group">
          <Share2 size={18} />
          <span className="text-xs font-medium">{post.shares}</span>
        </button>
      </div>
    </article>
  );
};

export default function TraderProfileContent() {
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  const SAMPLE_POSTS = [
    {
      userName: "Sophia Martinez",
      userHandle: "sophiamartinez",
      timestamp: "2h ago",
      content:
        "Excited to share my latest article on responsive design principles for modern web applications! It covers everything from fluid grids to adaptive images. Read it here:",
      link: "https://blog.sophiamartinez.com/responsive-design",
      likes: 124,
      comments: 18,
      shares: 7,
    },
    {
      userName: "Sophia Martinez",
      userHandle: "sophiamartinez",
      timestamp: "2h ago",
      content:
        "Excited to share my latest article on responsive design principles for modern web applications! It covers everything from fluid grids to adaptive images. Read it here:",
      link: "https://blog.sophiamartinez.com/responsive-design",
      likes: 124,
      comments: 18,
      shares: 7,
    },
    {
      userName: "Sophia Martinez",
      userHandle: "sophiamartinez",
      timestamp: "2h ago",
      content:
        "Excited to share my latest article on responsive design principles for modern web applications! It covers everything from fluid grids to adaptive images. Read it here:",
      link: "https://blog.sophiamartinez.com/responsive-design",
      likes: 124,
      comments: 18,
      shares: 7,
    },
  ];
  return (
    <div>
      <Navbar />
      <AsideBar />
      <main className="pt-18 p-5 lg:pt-20 flex flex-col justify-center items-center bg-white">
        <div className="w-full max-w-4xl">
          <ProfileCard />
        </div>
        <div className="w-full max-w-4xl">
          <Tabs />
        </div>
        <div className="w-full max-w-4xl mt-5">
          <PostComposer
            onOpenModal={() => {
              setIsPostModalOpen(true);
            }}
          />
        </div>
        <PostModal
          isOpen={isPostModalOpen}
          onClose={() => {
            setIsPostModalOpen(false);
          }}
          user={{ full_name: "Sophia Martinez" }}
        />
        <div className="w-full max-w-4xl mt-8">
          {SAMPLE_POSTS.map((post, index) => (
            <Post key={index} post={post} />
          ))}
        </div>
      </main>
    </div>
  );
}
