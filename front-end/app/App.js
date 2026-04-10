import { useEffect } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useAppStore } from "./store/useAppStore";
import { useAuthStore } from "./store/useAuthStore";
import Header from "./components/Header";
import BottomTabBar from "./components/BottomTabBar";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import VerifyEmailScreen from "./screens/VerifyEmailScreen";
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
import CommentScreen from "./screens/CommentScreen";

const AUTH_SCREENS = ["login", "register", "verify-email"];
const HIDE_HEADER_SCREENS = [
  "chat-detail",
  "comment",
  "blog-detail",
  "product-detail",
];

function ScreenRouter() {
  const { currentScreen, navigate } = useAppStore();
  switch (currentScreen) {
    case "login":
      return <LoginScreen />;
    case "register":
      return <RegisterScreen />;
    case "verify-email":
      return <VerifyEmailScreen />;
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
    case "comment":
      return <CommentScreen onBack={() => navigate("home")} />;
    default:
      return <LoginScreen />;
  }
}

function MainApp() {
  const { checkAuth, isCheckingAuth } = useAuthStore();
  const { currentScreen } = useAppStore();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color="#16A34A" />
      </View>
    );
  }

  const isAuthScreen = AUTH_SCREENS.includes(currentScreen);
  const hideHeader = HIDE_HEADER_SCREENS.includes(currentScreen);

  if (isAuthScreen) {
    return (
      <>
        <View
          style={[
            styles.container,
            { paddingTop: insets.top, paddingBottom: insets.bottom },
          ]}
        >
          <ScreenRouter />
        </View>
        <Toast />
      </>
    );
  }

  return (
    <>
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top - 10,
            paddingBottom: insets.bottom - 20,
          },
        ]}
      >
        {!hideHeader && <Header />}
        <View style={styles.content}>
          <ScreenRouter />
        </View>
        <BottomTabBar />
      </View>
      <Toast />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <MainApp />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F4F0",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
  },
});
