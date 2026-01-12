"use client";
import Navbar from "@/components/Navbar";
import ContentExpertProfileContent from "./component/ContentExpertProfileContent";
import FarmerProfileContent from "./component/FarmerProfileContent";
import ServiceProviderProfileContent from "./component/ServiceProviderProfileContent";
import TraderProfileContent from "./component/TraderProfileContent";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";

function ProfileContent() {
  const { user } = useAuth();

  switch (user.role) {
    case "trader":
      return <TraderProfileContent />;
    case "farmer":
      return <FarmerProfileContent />;
    case "serviceProvider":
      return <ServiceProviderProfileContent />;
    case "contentExpert":
      return <ContentExpertProfileContent />;
    default:
      return <Navbar />;
  }
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
