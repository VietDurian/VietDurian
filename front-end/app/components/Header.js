import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "@/store/useAppStore";

export default function Header() {
  const { setTab, activeTab } = useAppStore(); // ← dùng setTab + activeTab

  return (
    <View style={styles.header}>
      <View>
        <Image
          source={require("../assets/VietDurian-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <View style={styles.headerActions}>
        {/* Chat */}
        <TouchableOpacity
          style={styles.notifBtn}
          onPress={() => setTab("chat-list")}
        >
          <Ionicons
            name={
              activeTab === "chat-list" ? "chatbubble" : "chatbubble-outline"
            }
            size={22}
            color={activeTab === "chat-list" ? "#16A34A" : "#374151"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  logoIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
  },
  logoEmoji: { fontSize: 16 },
  logoText: { fontSize: 17, fontWeight: "700", color: "#1B6B3A" },
  notifBtn: { position: "relative", padding: 4 },
  headerActions: {
    flexDirection: "row",
    gap: 5,
  },
  logo: {
    width: 100,
    height: 32,
  },
});
