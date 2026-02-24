"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";

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

  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
