import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import Toast from "react-native-toast-message";
import { useAppStore } from "./store/useAppStore";
import { useAuthStore } from "./store/useAuthStore";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import HomeScreen from "./screens/HomeScreen";
import BlogsScreen from "./screens/BlogsScreen";
import BlogDetailScreen from "./screens/BlogDetailScreen";
import ProductsScreen from "./screens/ProductsScreen";
import ProductDetailScreen from "./screens/ProductDetailScreen";
import ProfileScreen from "./screens/ProfileScreen";
import ChatListScreen from "./screens/ChatListScreen";
import ChatDetailScreen from "./screens/ChatDetailScreen";
import NotificationsScreen from "./screens/NotificationsScreen";
import AIScanScreen from "./screens/AIScanScreen";

function ScreenRouter() {
  const { currentScreen } = useAppStore();

  switch (currentScreen) {
    case "login":
      return <LoginScreen />;
    case "register":
      return <RegisterScreen />;
    case "home":
      return <HomeScreen />;
    case "blogs":
      return <BlogsScreen />;
    case "blog-detail":
      return <BlogDetailScreen />;
    case "products":
      return <ProductsScreen />;
    case "product-detail":
      return <ProductDetailScreen />;
    case "profile":
      return <ProfileScreen />;
    case "chat-list":
      return <ChatListScreen />;
    case "chat-detail":
      return <ChatDetailScreen />;
    case "notifications":
      return <NotificationsScreen />;
    case "AI":
      return <AIScanScreen />;
    default:
      return <LoginScreen />;
  }
}

export default function App() {
  const { checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F0F4F0",
        }}
      >
        <ActivityIndicator size="large" color="#16A34A" />
      </View>
    );
  }

  return (
    <>
      <ScreenRouter />
      <Toast />
    </>
  );
}