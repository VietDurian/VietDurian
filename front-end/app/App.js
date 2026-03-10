import { useAppStore } from "./store/useAppStore";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import HomeScreen from "./screens/HomeScreen";
import BlogsScreen from "./screens/BlogsScreen";
import ProductsScreen from "./screens/ProductsScreen";
import ProfileScreen from "./screens/ProfileScreen";
import ChatListScreen from "./screens/ChatListScreen";
import ChatDetailScreen from "./screens/ChatDetailScreen";
import NotificationsScreen from "./screens/NotificationsScreen";

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
    case "products":
      return <ProductsScreen />;
    case "profile":
      return <ProfileScreen />;
    case "chat-list":
      return <ChatListScreen />;
    case "chat-detail":
      return <ChatDetailScreen />;
    case "notifications":
      return <NotificationsScreen />;
    default:
      return <LoginScreen />;
  }
}

export default function App() {
  return <ScreenRouter />;
}
