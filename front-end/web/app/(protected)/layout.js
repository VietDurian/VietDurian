"use client";

import AccessGuard from "@/components/AccessGuard";

export default function ProtectedLayout({ children }) {
  return <AccessGuard>{children}</AccessGuard>;
}
