import { useAppStore } from "./store/useAppStore";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";

function ScreenRouter() {
  const { currentScreen } = useAppStore();

  switch (currentScreen) {
    case "login":
      return <LoginScreen />;
    case "register":
      return <RegisterScreen />;
    default:
      return <LoginScreen />;
  }
}

export default function App() {
  return <ScreenRouter />;
}
