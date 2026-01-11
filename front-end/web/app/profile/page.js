"use client";
import { useEffect, useState } from "react";
import ContentExpertProfileContent from "./component/ContentExpertProfileContent";
import FarmerProfileContent from "./component/FarmerProfileContent";
import ServiceProviderProfileContent from "./component/ServiceProviderProfileContent";
import TraderProfileContent from "./component/TraderProfileContent";
import Navbar from "@/components/Navbar";

export default function ProfilePage() {
  const [authUser, setAuthUser] = useState(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("auth_user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setAuthUser(parsedUser);
      }
    } catch (error) {
      console.error("Failed to parse auth_user from localStorage", error);
    }
  }, []);

  if (authUser === null) {
    return <Navbar />;
  }
  switch (authUser.role) {
    case "trader":
      return <TraderProfileContent />;
    case "farmer":
      return <FarmerProfileContent />;
    case "serviceProvider":
      return <ServiceProviderProfileContent />;
    case "contentExpert":
      return <ContentExpertProfileContent />;
  }
}
