"use client";
import React from "react";
import { X, AlertCircle, CheckCircle2, Info } from "lucide-react";

const VARIANT = {
  error: {
    icon: AlertCircle,
    base: "bg-red-50 border-red-200 text-red-800",
    badge: "bg-red-100 text-red-700",
  },
  success: {
    icon: CheckCircle2,
    base: "bg-emerald-50 border-emerald-200 text-emerald-800",
    badge: "bg-emerald-100 text-emerald-700",
  },
  info: {
    icon: Info,
    base: "bg-blue-50 border-blue-200 text-blue-800",
    badge: "bg-blue-100 text-blue-700",
  },
};

export default function Notification({
  type = "info",
  title,
  message,
  onClose,
  className = "",
}) {
  const variant = VARIANT[type] || VARIANT.info;
  const Icon = variant.icon;

  if (!message) return null;

  return (
    <div
      role="alert"
      className={`absolute top-5 right-5 z-100 border rounded-xl px-4 py-3 flex gap-3 items-start shadow-sm ${variant.base} ${className}`}
    >
      <div
        className={`mt-0.5 inline-flex items-center justify-center h-8 w-8 rounded-full ${variant.badge}`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 text-sm">
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        <p className="leading-relaxed">{message}</p>
      </div>
      {onClose && (
        <button
          type="button"
          aria-label="Đóng thông báo"
          onClick={onClose}
          className="text-current/70 hover:text-current transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
