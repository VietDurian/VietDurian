import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import BottomTabBar from "../components/BottomTabBar";
import Header from "../components/Header";

// ── Mock Data ──
const INITIAL_NOTIFICATIONS = [
  {
    id: "1",
    type: "like",
    avatar: "https://i.pravatar.cc/100?img=11",
    name: "Lê Minh Tuấn",
    action: "đã thích bài viết của bạn.",
    time: "2 phút trước",
    read: false,
  },
  {
    id: "2",
    type: "comment",
    avatar: "https://i.pravatar.cc/100?img=5",
    name: "Phạm Thu Hà",
    action: 'đã bình luận: "Bài viết rất hữu ích, cảm ơn anh!"',
    time: "15 phút trước",
    read: false,
  },
  {
    id: "3",
    type: "follow",
    avatar: "https://i.pravatar.cc/100?img=8",
    name: "Nguyễn Văn An",
    action: "đã bắt đầu theo dõi bạn.",
    time: "1 giờ trước",
    read: false,
  },
  {
    id: "4",
    type: "share",
    avatar: "https://i.pravatar.cc/100?img=47",
    name: "Trần Thị Lan",
    action: "đã chia sẻ bài viết của bạn.",
    time: "3 giờ trước",
    read: true,
  },
  {
    id: "5",
    type: "like",
    avatar: "https://i.pravatar.cc/100?img=20",
    name: "Bùi Thị Mai",
    action: "đã thích bình luận của bạn.",
    time: "Hôm qua",
    read: true,
  },
  {
    id: "6",
    type: "comment",
    avatar: "https://i.pravatar.cc/100?img=3",
    name: "Võ Đức Hùng",
    action: 'đã bình luận: "Giá thị trường đang biến động mạnh anh ơi!"',
    time: "Hôm qua",
    read: true,
  },
  {
    id: "7",
    type: "system",
    avatar: null,
    name: "VietDurian",
    action: "Chào mừng bạn đến với cộng đồng nhà vườn VietDurian! 🌿",
    time: "2 ngày trước",
    read: true,
  },
];

const TYPE_ICON = {
  like: { name: "heart", color: "#EF4444", bg: "#FEE2E2" },
  comment: { name: "chatbubble", color: "#3B82F6", bg: "#DBEAFE" },
  follow: { name: "person-add", color: "#8B5CF6", bg: "#EDE9FE" },
  share: { name: "share-social", color: "#F59E0B", bg: "#FEF3C7" },
  system: { name: "leaf", color: "#16A34A", bg: "#D1FAE5" },
};

// ── Notification Item ──
function NotifItem({ item, onRead }) {
  return (
    <TouchableOpacity
      style={[styles.notifItem, !item.read && styles.notifItemUnread]}
      onPress={() => onRead(item.id)}
      activeOpacity={0.7}
    >
      {/* Avatar + type icon */}
      <View style={styles.avatarWrapper}>
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.systemAvatar]}>
            <Ionicons name="leaf" size={22} color="#16A34A" />
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.notifContent}>
        <Text style={styles.notifText} numberOfLines={2}>
          <Text style={styles.notifName}>{item.name} </Text>
          {item.action}
        </Text>
        <Text style={styles.notifTime}>{item.time}</Text>
      </View>

      {/* Unread dot */}
      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
}

// ── Main Screen ──
export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const markOneRead = (id) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );

  return (
    <SafeAreaView style={styles.container}>
      <Header />

      {/* Title row */}
      <View style={styles.titleRow}>
        <View style={styles.titleLeft}>
          <Text style={styles.title}>Thông báo</Text>
          {unreadCount > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead} style={styles.readAllBtn}>
            <Ionicons name="checkmark-done-outline" size={16} color="#16A34A" />
            <Text style={styles.readAllText}>Đọc tất cả</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* List */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotifItem item={item} onRead={markOneRead} />
        )}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name="notifications-off-outline"
              size={48}
              color="#D1D5DB"
            />
            <Text style={styles.emptyText}>Không có thông báo mới</Text>
          </View>
        }
      />

      <BottomTabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },

  // Title row
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  titleLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { fontSize: 18, fontWeight: "700", color: "#111827" },
  countBadge: {
    backgroundColor: "#EF4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  countBadgeText: { color: "#FFFFFF", fontSize: 11, fontWeight: "700" },
  readAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#F0FDF4",
  },
  readAllText: { color: "#16A34A", fontSize: 13, fontWeight: "600" },

  // Notif item
  notifItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    gap: 12,
  },
  notifItemUnread: { backgroundColor: "#F0FDF4" },

  // Avatar
  avatarWrapper: { position: "relative" },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  systemAvatar: {
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
  },
  typeIcon: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },

  // Content
  notifContent: { flex: 1 },
  notifText: { fontSize: 14, color: "#374151", lineHeight: 20 },
  notifName: { fontWeight: "700", color: "#111827" },
  notifTime: { fontSize: 12, color: "#9CA3AF", marginTop: 4 },

  // Unread dot
  unreadDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#16A34A",
  },

  separator: { height: 1, backgroundColor: "#F3F4F6" },

  // Empty
  emptyState: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyText: { color: "#9CA3AF", fontSize: 14 },
});
