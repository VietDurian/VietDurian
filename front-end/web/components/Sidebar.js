// QuyNTCE180596
"use client";
import React, { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";

import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeleton/SidebarSkeleton";
import { Archive, Ellipsis, EllipsisIcon, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";

// This component is a sidebar for the chat
const Sidebar = () => {
  const {
    loadContacts,
    users,
    selectedUser,
    setSelectedUser,
    isUsersLoading,
    deleteConversation,
  } = useChatStore();

  const { onlineUsers, socket } = useAuthStore();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const router = useRouter();

  const [openChatOption, setOpenChatOption] = useState(false);
  const [openConversationOption, setOpenConversationOption] = useState(null);

  const chatOptionRef = useRef(null);
  const conversationOptionRef = useRef(null);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = () => {
      loadContacts();
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, loadContacts]);

  // Popup closes when clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (chatOptionRef.current && !chatOptionRef.current.contains(e.target)) {
        setOpenChatOption(false);
      }

      if (
        conversationOptionRef.current &&
        !conversationOptionRef.current.contains(e.target)
      ) {
        setOpenConversationOption(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isUsersLoading) return <SidebarSkeleton />;
  return (
    <aside className="h-full w-25 lg:w-90 border-r border-base-300 flex flex-col transition-all duration-200">
      {/* Sidebar header */}
      <div className="hidden lg:flex flex-col w-full p-4">
        <div className="relative flex justify-between items-center gap-2">
          <span className="font-bold text-2xl hidden lg:block">Đoạn chat</span>
          <Ellipsis
            onClick={() => setOpenChatOption((prev) => !prev)}
            size={32}
            className="bg-gray-200 hover:bg-gray-300 rounded-full p-1 cursor-pointer select-none"
          />
          {/* Chat Option Dropdown */}
          {openChatOption && (
            <div
              ref={chatOptionRef}
              className="absolute top-10 -right-72 w-80 p-2 bg-white shadow-lg rounded-md border border-gray-300 z-50 animate-fadeIn"
            >
              <button className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-200 rounded-lg cursor-pointer select-none">
                <Archive />
                Đoạn chat đã lưu trữ
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Sidebar search bar */}
      <div className="w-full px-4">
        <div className="relative">
          {/* Search Icon */}
          <Search
            size={18}
            strokeWidth={2}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          {/* Input */}
          <input
            type="text"
            placeholder="Tìm kiếm đoạn chat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2 bg-gray-100 rounded-full focus:outline-none"
          />

          {/* Clear Button */}
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>
      {/* Sidebar tabs */}
      <div className="flex gap-2 p-4 ">
        <button
          onClick={() => setTab("all")}
          className={`px-3 py-1.5 rounded-full text-sm font-bold transition cursor-pointer
      ${
        tab === "all"
          ? "bg-emerald-100 text-emerald-700 "
          : "text-gray-500 hover:bg-gray-100"
      }`}
        >
          Tất cả
        </button>

        <button
          onClick={() => setTab("unread")}
          className={`px-3 py-1.5 rounded-full text-sm font-bold transition cursor-pointer
      ${
        tab === "unread"
          ? "bg-emerald-100 text-emerald-700 "
          : "text-gray-500 hover:bg-gray-100"
      }`}
        >
          Chưa đọc
        </button>
      </div>

      {/* Sidebar conversations */}
      <div className="overflow-y-auto w-full p-2 pt-0  h-full">
        {users.map((user) => (
          <div
            key={user._id}
            className={`
      relative group
      w-full p-3 flex items-center gap-3 rounded-lg
      hover:bg-base-300 transition-colors cursor-pointer justify-center lg:justify-start
      ${
        selectedUser?._id === user._id
          ? "bg-emerald-100/60 hover:bg-emerald-50"
          : "hover:bg-base-300"
      }
    `}
            onClick={() => {
              setSelectedUser(user);
              router.push(`/chat/${user._id}`);
            }}
          >
            {/* User avatar */}
            <div className="avatar relative">
              <img
                src={user.avatar || "/images/avatar.jpg"}
                alt={user.full_name}
                className="size-12 lg:size-15 object-cover rounded-full"
              />
              {onlineUsers.includes(user._id) && (
                <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900" />
              )}
            </div>

            {/* User info */}
            <div className="hidden lg:block text-left min-w-0 flex-1">
              <div className="text-black font-bold truncate">
                {user.full_name}
              </div>
              <div className="text-sm text-zinc-400">
                {onlineUsers.includes(user._id) ? "Online" : "Offline"}
              </div>
            </div>

            {/* ... Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenConversationOption((prev) =>
                  prev === user._id ? null : user._id,
                );
              }}
              className={`
    hidden lg:flex items-center justify-center p-1 rounded-full 
    hover:bg-gray-200 transition
    opacity-0 group-hover:opacity-100
    ${openConversationOption === user._id ? "opacity-100" : ""}
  `}
            >
              <Ellipsis size={20} />
            </button>

            {/* Dropdown menu */}
            {openConversationOption === user._id && (
              <div
                ref={conversationOptionRef}
                className="absolute right-3 top-15 w-40 bg-white border border-gray-300 shadow-lg rounded-md z-50 animate-fadeIn"
              >
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    await deleteConversation(user._id);
                    setOpenConversationOption(null);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                >
                  ❌ Xóa cuộc trò chuyện
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log("Archive", user._id);
                    setOpenConversationOption(null);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                >
                  📦 Lưu trữ
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
