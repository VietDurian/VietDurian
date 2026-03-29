"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Image as ImageIcon, Loader2, Search, Send, X } from "lucide-react";
import { toast } from "sonner";

import { useChatStore } from "@/store/useChatStore";
import { useAuthStore } from "@/store/useAuthStore";
import { formatMessageTime } from "@/lib/utils";
import Image from "next/image";

export default function AdminChatPage() {
  const {
    loadContacts,
    users,
    selectedUser,
    setSelectedUser,
    messages,
    getMessages,
    sendMessage,
    subscribeToMessages,
    unsubscribeFromMessages,
    isUsersLoading,
    isMessagesLoading,
  } = useChatStore();

  const { authUser, onlineUsers, socket } = useAuthStore();

  const [search, setSearch] = useState("");
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  useEffect(() => {
    if (!selectedUser && users.length > 0) {
      setSelectedUser(users[0]);
    }
  }, [users, selectedUser, setSelectedUser]);

  useEffect(() => {
    if (!selectedUser?._id) return;

    getMessages(selectedUser._id);
    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [
    selectedUser?._id,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = () => {
      loadContacts();
    };

    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [socket, loadContacts]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const filteredUsers = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return users;

    return users.filter((u) => {
      const name = (u.full_name || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      return name.includes(normalized) || email.includes(normalized);
    });
  }, [users, search]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Chỉ hỗ trợ file ảnh");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if ((!text.trim() && !imagePreview) || !selectedUser || isSending) return;

    try {
      setIsSending(true);
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
      });
      setText("");
      removeImage();
      loadContacts();
    } catch {
      // Error toast is already handled in store.
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="h-full w-full bg-white">
      <div className="h-full flex overflow-hidden">
        <aside className="w-full max-w-xs border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-[#1a4d2e]">
              Hỗ trợ khách hàng
            </h2>
            <p className="text-sm text-gray-500">
              Trả lời các cuộc trò chuyện với người dùng
            </p>
          </div>

          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm theo tên hoặc email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-full border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isUsersLoading ? (
              <div className="p-4 text-sm text-gray-500">
                Đang tải danh sách chat...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-4 text-sm text-gray-500">
                Chưa có hội thoại nào.
              </div>
            ) : (
              filteredUsers.map((u) => {
                const isSelected = selectedUser?._id === u._id;
                const isOnline = onlineUsers.includes(u._id);

                return (
                  <button
                    key={u._id}
                    onClick={() => setSelectedUser(u)}
                    className={`w-full px-3 py-3 flex items-center gap-3 text-left border-b border-gray-100 transition ${
                      isSelected ? "bg-emerald-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="relative shrink-0">
                      <Image
                        src={u.avatar || "/images/avatar.jpg"}
                        alt={u.full_name}
                        width={96}
                        height={96}
                        className="w-11 h-11 rounded-full object-cover"
                      />
                      {isOnline && (
                        <span className="absolute -right-0.5 -bottom-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {u.full_name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {u.email || "Người dùng"}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <section className="flex-1 flex flex-col min-w-0">
          {selectedUser ? (
            <>
              <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-3">
                <Image
                  src={selectedUser.avatar || "/images/avatar.jpg"}
                  alt={selectedUser.full_name}
                  width={96}
                  height={96}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-900">
                    {selectedUser.full_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {onlineUsers.includes(selectedUser._id) ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />{" "}
                        Đang hoạt động
                      </>
                    ) : (
                      "Ngoại tuyến"
                    )}
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                {isMessagesLoading ? (
                  <div className="text-sm text-gray-500">
                    Đang tải tin nhắn...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-sm text-gray-500">
                    Bắt đầu cuộc trò chuyện hỗ trợ với người dùng này.
                  </div>
                ) : (
                  messages.map((message) => {
                    const isMine = message.senderId === authUser?._id;

                    return (
                      <div
                        key={message._id}
                        className={`flex items-end gap-2 ${
                          isMine ? "justify-end" : "justify-start"
                        }`}
                      >
                        {!isMine && (
                          <Image
                            src={selectedUser.avatar || "/images/avatar.jpg"}
                            alt={selectedUser.full_name}
                            width={96}
                            height={96}
                            className="w-8 h-8 rounded-full object-cover shrink-0"
                          />
                        )}
                        <div
                          className={`max-w-[80%] rounded-2xl px-3 py-2 shadow-sm ${
                            isMine
                              ? "bg-emerald-600 text-white rounded-br-sm"
                              : "bg-white text-gray-900 border border-gray-100 rounded-bl-sm"
                          }`}
                        >
                          {message.image && (
                            <Image
                              src={message.image}
                              alt="Attachment"
                              width={96}
                              height={96}
                              className="max-w-56 rounded-lg mb-2"
                            />
                          )}
                          {message.text && (
                            <p className="text-sm whitespace-pre-wrap">
                              {message.text}
                            </p>
                          )}
                          <p
                            className={`text-[11px] mt-1 ${
                              isMine ? "text-emerald-100" : "text-gray-400"
                            }`}
                          >
                            {formatMessageTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-gray-200 p-3 bg-white">
                {imagePreview && (
                  <div className="mb-3 relative w-fit">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      width={96}
                      height={96}
                      className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gray-800 text-white flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                <form onSubmit={handleSend} className="flex items-center gap-2">
                  <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Nhập tin nhắn hỗ trợ..."
                    className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500"
                  />

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-10 h-10 rounded-full border border-gray-200 hover:bg-gray-50 flex items-center justify-center"
                    title="Đính kèm ảnh"
                  >
                    <ImageIcon className="w-4 h-4 text-gray-600" />
                  </button>

                  <button
                    type="submit"
                    disabled={isSending || (!text.trim() && !imagePreview)}
                    className="w-10 h-10 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    title="Gửi"
                  >
                    {isSending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 text-sm">
              Chọn một hội thoại để bắt đầu trả lời hỗ trợ.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
