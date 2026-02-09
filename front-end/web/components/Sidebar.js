"use client";
import React, { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";

import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeleton/SidebarSkeleton";
import { Archive, Ellipsis } from "lucide-react";

const Sidebar = () => {
  const {
    loadContacts,
    users,
    selectedUser,
    setSelectedUser,
    isUsersLoading,
    removeContact,
  } = useChatStore();

  const { onlineUsers } = useAuthStore();

  const [openChatOption, setOpenChatOption] = useState(false);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  if (isUsersLoading) return <SidebarSkeleton />;
  return (
    <aside className="h-full w-25 lg:w-90 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="hidden lg:flex flex-col border-b border-base-300 w-full p-5">
        <div className="relative flex justify-between items-center gap-2">
          <span className="font-bold text-2xl hidden lg:block">Đoạn chat</span>
          <Ellipsis
            onClick={() => setOpenChatOption((prev) => !prev)}
            size={32}
            className="bg-gray-200 hover:bg-gray-300 rounded-full p-1 cursor-pointer"
          />
          {/* Chat Option Dropdown */}
          {openChatOption && (
            <div className="absolute top-10 -right-72 w-80 p-2 bg-white shadow-lg rounded-xl border border-gray-300 z-50 animate-fadeIn">
              <button className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-200 rounded-lg cursor-pointer">
                <Archive />
                Đoạn chat đã lưu trữ
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="overflow-y-auto w-full p-2">
        {users.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`
              w-full p-3 flex items-center gap-3 rounded-lg
              hover:bg-base-300 transition-colors cursor-pointer justify-center lg:justify-start
              ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}
            `}
          >
            <div className="avatar">
              <img
                src={user.avatar || "images/avatar.jpg"}
                alt={user.full_name}
                className="size-12 lg:size-15 object-cover rounded-full"
              />
              {onlineUsers.includes(user._id) && (
                <span
                  className="absolute bottom-0 right-0 size-3 bg-green-500 
                  rounded-full ring-2 ring-zinc-900"
                />
              )}
            </div>

            {/* User info - only visible on larger screens */}
            <div className="hidden lg:block text-left min-w-0">
              <div className="font-medium truncate">{user.full_name}</div>
              <div className="text-sm text-zinc-400">
                {onlineUsers.includes(user._id) ? "Online" : "Offline"}
              </div>
            </div>

            <div className="ml-auto hidden lg:flex">
              <button
                className="text-xs text-zinc-400 hover:text-red-500 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  removeContact(user._id);
                }}
              >
                Gỡ
              </button>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
