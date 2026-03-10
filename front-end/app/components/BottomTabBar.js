import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "../store/useAppStore";

const TABS = [
  { key: "home", label: "Bài viết", icon: "home-outline", iconActive: "home" },
  {
    key: "blogs",
    label: "Blogs",
    icon: "newspaper-outline",
    iconActive: "newspaper",
  },
  { key: "AI", label: "Quét AI", icon: "scan-outline", iconActive: "scan" },
  {
    key: "products",
    label: "Sản phẩm",
    icon: "cart-outline",
    iconActive: "cart",
  },
  {
    key: "profile",
    label: "Hồ sơ",
    icon: "person-outline",
    iconActive: "person",
  },
];

export default function BottomTabBar() {
  const { activeTab, setTab } = useAppStore();

  const handleTabPress = (key) => {
    setTab(key);
  };

  return (
    <View style={styles.tabBar}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        const isAI = tab.key === "AI";

        if (isAI) {
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabItem}
              onPress={() => handleTabPress(tab.key)}
              activeOpacity={0.8}
            >
              <View
                style={[styles.aiButton, isActive && styles.aiButtonActive]}
              >
                <Ionicons
                  name={isActive ? "scan" : "scan-outline"}
                  size={26}
                  color="#FFFFFF"
                />
              </View>
              <Text
                style={[
                  styles.label,
                  styles.aiLabel,
                  isActive && styles.labelActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabItem}
            onPress={() => handleTabPress(tab.key)}
            activeOpacity={0.7}
          >
            <View style={styles.iconWrapper}>
              <Ionicons
                name={isActive ? tab.iconActive : tab.icon}
                size={22}
                color={isActive ? "#16A34A" : "#9CA3AF"}
              />
              {tab.badge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{tab.badge}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  tabItem: { flex: 1, alignItems: "center", gap: 2 },
  iconWrapper: { position: "relative" },
  label: { fontSize: 11, color: "#9CA3AF" },
  labelActive: { color: "#16A34A", fontWeight: "600" },
  aiLabel: { marginTop: 4 },
  badge: {
    position: "absolute",
    top: -4,
    right: -8,
    backgroundColor: "#EF4444",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: { color: "#FFFFFF", fontSize: 10, fontWeight: "700" },

  // AI Button
  aiButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#16A34A",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
    marginTop: -40,
    shadowColor: "#16A34A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  aiButtonActive: {
    backgroundColor: "#15803D",
  },
});
