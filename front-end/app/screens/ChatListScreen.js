import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "../store/useAppStore";

// ── Mock Data ──
const CHATS = [
  {
    id: "1",
    name: "Trần Thị Lan",
    avatar: "https://i.pravatar.cc/100?img=47",
    message: "Vườn của anh năm nay được mùa khô...",
    time: "10:32",
    unread: 3,
    online: true,
  },
  {
    id: "2",
    name: "Phạm Thu Hà",
    avatar: "https://i.pravatar.cc/100?img=5",
    message: "Cảm ơn anh đã chia sẻ bài viết!",
    time: "Hôm qua",
    unread: 0,
    online: false,
  },
  {
    id: "3",
    name: "Lê Minh Tuấn",
    avatar: "https://i.pravatar.cc/100?img=11",
    message: "Giá Ri6 ở khu vực anh bao nhiêu vậy?",
    time: "Hôm qua",
    unread: 1,
    online: true,
  },
  {
    id: "4",
    name: "Võ Đức Hùng",
    avatar: "https://i.pravatar.cc/100?img=8",
    message: "Ok anh, hẹn gặp tại hội chợ nông nghiệp!",
    time: "12/03",
    unread: 0,
    online: false,
  },
  {
    id: "5",
    name: "Nguyễn Văn An",
    avatar: "https://i.pravatar.cc/100?img=3",
    message: "Anh cho hỏi giống Musang King ở đâu?",
    time: "10/03",
    unread: 0,
    online: false,
  },
  {
    id: "6",
    name: "Bùi Thị Mai",
    avatar: "https://i.pravatar.cc/100?img=20",
    message: "Em cần tư vấn về phân bón cho vườn",
    time: "08/03",
    unread: 0,
    online: true,
  },
];

// ── Chat Item ──
function ChatItem({ item }) {
  const { navigate } = useAppStore();
  const hasUnread = item.unread > 0;

  return (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => navigate("chat-detail")}
      activeOpacity={0.7}
    >
      {/* Avatar */}
      <View style={styles.avatarWrapper}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        {item.online && <View style={styles.onlineDot} />}
      </View>

      {/* Content */}
      <View style={styles.chatContent}>
        <View style={styles.chatTopRow}>
          <Text style={[styles.chatName, hasUnread && styles.chatNameUnread]}>
            {item.name}
          </Text>
          <Text style={[styles.chatTime, hasUnread && styles.chatTimeUnread]}>
            {item.time}
          </Text>
        </View>
        <View style={styles.chatBottomRow}>
          <Text
            style={[styles.chatMessage, hasUnread && styles.chatMessageUnread]}
            numberOfLines={1}
          >
            {item.message}
          </Text>
          {hasUnread && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ── Main Screen ──
export default function ChatListScreen() {
  return (
    <View style={styles.container}>

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <Ionicons
          name="search-outline"
          size={18}
          color="#9CA3AF"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm cuộc trò chuyện..."
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Chat List */}
      <FlatList
        data={CHATS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ChatItem item={item} />}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },

  // Search
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 10,
    paddingHorizontal: 12,
    height: 42,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: "#111827" },

  // Chat Item
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  avatarWrapper: { position: "relative" },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  onlineDot: {
    position: "absolute",
    bottom: 1,
    right: 1,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: "#22C55E",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },

  // Chat content
  chatContent: { flex: 1 },
  chatTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  chatName: { fontSize: 15, fontWeight: "500", color: "#111827" },
  chatNameUnread: { fontWeight: "700" },
  chatTime: { fontSize: 12, color: "#9CA3AF" },
  chatTimeUnread: { color: "#16A34A", fontWeight: "600" },
  chatBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chatMessage: { fontSize: 13, color: "#9CA3AF", flex: 1, marginRight: 8 },
  chatMessageUnread: { color: "#374151", fontWeight: "500" },

  // Badge
  badge: {
    backgroundColor: "#16A34A",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  badgeText: { color: "#FFFFFF", fontSize: 11, fontWeight: "700" },

  // Separator
  separator: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginLeft: 80,
  },
});
