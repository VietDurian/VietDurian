"use client";
import AsideBar from "@/components/AsideBar";
import Navbar from "@/components/Navbar";
import {
  Camera,
  Gift,
  Heart,
  ImageIcon,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Share2,
  Smile,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

export default function FarmerProfileContent() {
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  return (
    <div>
      <Navbar />
      <main className="text-center mt-50">Details</main>
    </div>
  );
}
