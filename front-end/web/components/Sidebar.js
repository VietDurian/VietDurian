// QuyNTCE180596
"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";

import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeleton/SidebarSkeleton";
import { Ellipsis, Search, Trash2, X } from "lucide-react";
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
  const router = useRouter();

  const [openConversationOption, setOpenConversationOption] = useState(null);
  const [deleteTargetUser, setDeleteTargetUser] = useState(null);
  const [isDeletingConversation, setIsDeletingConversation] = useState(false);

  const conversationOptionRef = useRef(null);

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return users;

    return users.filter((user) => {
      const name = (user.full_name || "").toLowerCase();
      const email = (user.email || "").toLowerCase();
      return name.includes(keyword) || email.includes(keyword);
    });
  }, [users, search]);

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

  const handleConfirmDeleteConversation = async () => {
    if (!deleteTargetUser?._id || isDeletingConversation) return;

    try {
      setIsDeletingConversation(true);
      await deleteConversation(deleteTargetUser._id);
      setDeleteTargetUser(null);
      setOpenConversationOption(null);
    } finally {
      setIsDeletingConversation(false);
    }
  };

  if (isUsersLoading) return <SidebarSkeleton />;
  return (
    <aside className="h-full w-80 border-r border-gray-200 flex flex-col bg-white">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-[#1a4d2e]">Đoạn chat</h2>
        <p className="text-sm text-gray-500">Trao đổi và hỗ trợ người dùng</p>
      </div>

      <div className="p-3 border-b border-gray-100">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="placeholder:text-gray-400 text-black w-full rounded-full border border-gray-200 py-2 pl-9 pr-9 text-sm outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="overflow-y-auto w-full h-full p-2">
        {filteredUsers.length === 0 ? (
          <div className="p-3 text-sm text-gray-500">
            Không có cuộc trò chuyện phù hợp.
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user._id}
              className={`relative group w-full p-3 flex items-center gap-3 rounded-lg border-b border-gray-100 transition-colors cursor-pointer ${
                selectedUser?._id === user._id
                  ? "bg-emerald-50"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => {
                setSelectedUser(user);
                router.push(`/chat/${user._id}`);
              }}
            >
              <div className="relative shrink-0">
                <img
                  src={user.avatar || "/images/avatar.jpg"}
                  alt={user.full_name}
                  className="w-11 h-11 object-cover rounded-full"
                />
                {onlineUsers.includes(user._id) && (
                  <span className="absolute -right-0.5 -bottom-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                )}
              </div>

              <div className="text-left min-w-0 flex-1">
                <div className="text-sm font-semibold text-gray-900 truncate">
                  {user.full_name}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {user.email ||
                    (onlineUsers.includes(user._id) ? "Online" : "Offline")}
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenConversationOption((prev) =>
                    prev === user._id ? null : user._id,
                  );
                }}
                className={`hidden lg:flex items-center justify-center p-1 rounded-full hover:bg-gray-200 transition opacity-0 group-hover:opacity-100 ${
                  openConversationOption === user._id ? "opacity-100" : ""
                }`}
              >
                <Ellipsis size={18} />
              </button>

              {openConversationOption === user._id && (
                <div
                  ref={conversationOptionRef}
                  className="absolute right-3 top-14 w-52 bg-white border border-gray-300 shadow-lg rounded-md z-50 p-2"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTargetUser(user);
                      setOpenConversationOption(null);
                    }}
                    className="w-full items-center gap-2 hover:bg-gray-100 text-sm text-black flex text-nowrap p-2 rounded-sm cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    Xóa cuộc trò chuyện
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {deleteTargetUser && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 p-4"
          onClick={() => {
            if (isDeletingConversation) return;
            setDeleteTargetUser(null);
          }}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Xóa cuộc trò chuyện?
            </h3>
            <p className="text-sm text-gray-600 mb-5">
              Bạn có chắc muốn xóa cuộc trò chuyện với{" "}
              {deleteTargetUser.full_name}? Hành động này chỉ áp dụng cho tài
              khoản của bạn.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTargetUser(null)}
                disabled={isDeletingConversation}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmDeleteConversation}
                disabled={isDeletingConversation}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeletingConversation ? "Đang xóa..." : "Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
