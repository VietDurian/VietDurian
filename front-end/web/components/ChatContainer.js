"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { Image as ImageIcon, Loader2, Send, X } from "lucide-react";
import { toast } from "sonner";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    sendMessage,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();

  const { authUser, onlineUsers } = useAuthStore();
  const messageEndRef = useRef();
  const fileInputRef = useRef(null);
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [isSending, setIsSending] = useState(false);

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

  // When new message is sent, scroll down
  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

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
    } catch {
      // Error toast is already handled in store.
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-white">
      {selectedUser && (
        <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-3">
          <img
            src={selectedUser.avatar || "/images/avatar.jpg"}
            alt={selectedUser.full_name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="font-semibold text-gray-900">
              {selectedUser.full_name}
            </p>
            <p className="text-xs text-gray-500">
              {onlineUsers.includes(selectedUser._id)
                ? "Đang hoạt động"
                : "Ngoại tuyến"}
            </p>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        {isMessagesLoading ? (
          <div className="text-sm text-gray-500">Đang tải tin nhắn...</div>
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-gray-500">
            Bắt đầu cuộc trò chuyện với người dùng này.
          </div>
        ) : (
          messages.map((message) => {
            const isMine = message.senderId === authUser?._id;

            return (
              <div
                key={message._id}
                className={`flex items-end gap-2 ${isMine ? "justify-end" : "justify-start"}`}
                ref={messageEndRef}
              >
                {!isMine && (
                  <img
                    src={selectedUser?.avatar || "/images/avatar.jpg"}
                    alt={selectedUser?.full_name}
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                  />
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 shadow-sm ${isMine
                      ? "bg-emerald-600 text-white rounded-br-sm"
                      : "bg-white text-gray-900 border border-gray-100 rounded-bl-sm"
                    }`}
                >
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Attachment"
                      className="max-w-56 rounded-lg mb-2"
                    />
                  )}
                  {message.text && (
                    <p className="text-sm whitespace-pre-wrap">
                      {message.text}
                    </p>
                  )}
                  <p
                    className={`text-[11px] mt-1 ${isMine ? "text-emerald-100" : "text-gray-400"}`}
                  >
                    {formatMessageTime(message.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div ref={messageEndRef} />

      <div className="border-t border-gray-200 p-3 bg-white">
        {imagePreview && (
          <div className="mb-3 relative w-fit">
            <img
              src={imagePreview}
              alt="Preview"
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
            placeholder="Nhập tin nhắn..."
            className="placeholder:text-gray-400 text-black flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500"
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
    </div>
  );
};

export default ChatContainer;
