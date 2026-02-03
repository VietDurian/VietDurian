"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AiFloatingButton from "@/components/AiFloatingButton";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  const { authUser, checkAuth, isCheckingAuth, onlineUsers } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  // Check user's authentication
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  //  Hide on chat routes
  const hideAiButton = pathname.startsWith("/chat");

  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        {!hideAiButton && <AiFloatingButton />}
      </body>
    </html>
  );
}
