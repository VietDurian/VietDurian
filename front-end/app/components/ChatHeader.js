import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "@/store/useAppStore";

export default function ChatHeader({ name, avatar, isOnline }) {
  const { navigate } = useAppStore();

  return (
    <View style={styles.header}>
      {/* Back */}
      <TouchableOpacity
        onPress={() => navigate("chat-list")}
        style={styles.backBtn}
      >
        <Ionicons name="arrow-back" size={22} color="#111827" />
      </TouchableOpacity>

      {/* Avatar + Info */}
      <View style={styles.userInfo}>
        <View style={styles.avatarWrapper}>
          <Image source={{ uri: avatar }} style={styles.avatar} />
          {isOnline && <View style={styles.onlineDot} />}
        </View>
        <View>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.status}>
            {isOnline ? "Đang hoạt động" : "Offline"}
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="call-outline" size={22} color="#374151" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="ellipsis-vertical" size={22} color="#374151" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    gap: 10,
  },
  backBtn: { padding: 4 },
  userInfo: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  avatarWrapper: { position: "relative" },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  onlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: "#22C55E",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  name: { fontSize: 15, fontWeight: "700", color: "#111827" },
  status: { fontSize: 12, color: "#22C55E", fontWeight: "500" },
  actions: { flexDirection: "row", gap: 4 },
  actionBtn: { padding: 6 },
});
