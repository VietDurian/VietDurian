"use client";
import { useAuthStore } from "@/store/useAuthStore";

export default function ChatLayout({ children }) {
  const { authUser } = useAuthStore();

  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <main>{children}</main>
      </body>
    </html>
  );
}
