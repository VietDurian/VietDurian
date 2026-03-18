import {
  ActivityIndicator,
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
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useEffect, useMemo, useState } from "react";

const formatName = (user) => user?.full_name || user?.name || "Người dùng";

const formatTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ── Chat Item ──
function ChatItem({ item, isOnline, onPress }) {
  const { navigate } = useAppStore();
  const name = formatName(item);
  const previewText =
    item?.lastMessage?.text || item?.email || "Nhấn để bắt đầu trò chuyện";
  const timeText = formatTime(
    item?.lastMessage?.createdAt || item?.updated_at || item?.created_at,
  );
  const unread = Number(item?.unreadCount || 0);
  const hasUnread = unread > 0;

  return (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => {
        onPress(item);
        navigate("chat-detail");
      }}
      activeOpacity={0.7}
    >
      {/* Avatar */}
      <View style={styles.avatarWrapper}>
        <Image
          source={{
            uri: item?.avatar || "https://i.pravatar.cc/100?img=1",
          }}
          style={styles.avatar}
        />
        {isOnline && <View style={styles.onlineDot} />}
      </View>

      {/* Content */}
      <View style={styles.chatContent}>
        <View style={styles.chatTopRow}>
          <Text style={[styles.chatName, hasUnread && styles.chatNameUnread]}>
            {name}
          </Text>
          <Text style={[styles.chatTime, hasUnread && styles.chatTimeUnread]}>
            {timeText}
          </Text>
        </View>
        <View style={styles.chatBottomRow}>
          <Text
            style={[styles.chatMessage, hasUnread && styles.chatMessageUnread]}
            numberOfLines={1}
          >
            {previewText}
          </Text>
          {hasUnread && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ── Main Screen ──
export default function ChatListScreen() {
  const [searchText, setSearchText] = useState("");
  const { socket, onlineUsers } = useAuthStore();
  const { users, loadContacts, setSelectedUser, isUsersLoading } =
    useChatStore();

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = () => {
      loadContacts();
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, loadContacts]);

  const filteredChats = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    if (!keyword) return users;

    return (users || []).filter((user) => {
      const fullName = (user?.full_name || user?.name || "").toLowerCase();
      const email = (user?.email || "").toLowerCase();
      return fullName.includes(keyword) || email.includes(keyword);
    });
  }, [users, searchText]);

  const renderEmpty = () => {
    if (isUsersLoading) {
      return (
        <View style={styles.stateBox}>
          <ActivityIndicator size="small" color="#16A34A" />
          <Text style={styles.stateText}>Đang tải danh sách trò chuyện...</Text>
        </View>
      );
    }

    return (
      <View style={styles.stateBox}>
        <Text style={styles.stateText}>Chưa có cuộc trò chuyện nào</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
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
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Chat List */}
      <FlatList
        data={filteredChats}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <ChatItem
            item={item}
            isOnline={onlineUsers.includes(item._id)}
            onPress={setSelectedUser}
          />
        )}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
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

  stateBox: {
    paddingVertical: 28,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  stateText: { color: "#6B7280", fontSize: 13 },

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
