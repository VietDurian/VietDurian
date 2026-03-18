import { useEffect, useMemo, useRef } from "react";
import {
  ActivityIndicator,
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ChatHeader from "../components/ChatHeader";
import ChatInput from "../components/ChatInput";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useAppStore } from "../store/useAppStore";

const formatTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ── Message Bubble ──
function MessageBubble({ msg, avatar, authUserId }) {
  const isMe = String(msg?.senderId) === String(authUserId);

  return (
    <View style={[styles.row, isMe ? styles.rowMe : styles.rowThem]}>
      {!isMe && <Image source={{ uri: avatar }} style={styles.msgAvatar} />}
      <View>
        <View
          style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}
        >
          {!!msg?.image && (
            <Image source={{ uri: msg.image }} style={styles.messageImage} />
          )}
          {!!msg?.text && (
            <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>
              {msg.text}
            </Text>
          )}
        </View>
        <Text style={[styles.msgTime, isMe && styles.msgTimeMe]}>
          {formatTime(msg?.createdAt)}
        </Text>
      </View>
    </View>
  );
}

// ── Main Screen ──
export default function ChatDetailScreen() {
  const flatListRef = useRef(null);
  const { navigate } = useAppStore();
  const { authUser, onlineUsers } = useAuthStore();
  const {
    selectedUser,
    messages,
    getMessages,
    sendMessage,
    isMessagesLoading,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();

  useEffect(() => {
    if (!selectedUser?._id) return;

    getMessages(selectedUser._id);
    subscribeToMessages();

    return () => {
      unsubscribeFromMessages();
    };
  }, [
    selectedUser?._id,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  useEffect(() => {
    if (!messages?.length) return;
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    });
  }, [messages]);

  const isOnline = useMemo(() => {
    if (!selectedUser?._id) return false;
    return onlineUsers.includes(selectedUser._id);
  }, [onlineUsers, selectedUser?._id]);

  const contactName =
    selectedUser?.full_name || selectedUser?.name || "Người dùng";
  const contactAvatar =
    selectedUser?.avatar || "https://i.pravatar.cc/100?img=1";

  const handleSend = async (text) => {
    await sendMessage({ text });
  };

  if (!selectedUser?._id) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>Chưa chọn cuộc trò chuyện</Text>
          <TouchableOpacity
            style={styles.backToListBtn}
            onPress={() => navigate("chat-list")}
            activeOpacity={0.8}
          >
            <Text style={styles.backToListText}>Quay lại danh sách chat</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ChatHeader
        name={contactName}
        avatar={contactAvatar}
        isOnline={isOnline}
      />

      {isMessagesLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="small" color="#16A34A" />
          <Text style={styles.loadingText}>Đang tải tin nhắn...</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          extraData={messages}
          keyExtractor={(item) =>
            item?._id || `${item?.createdAt}-${item?.senderId}`
          }
          renderItem={({ item }) => (
            <MessageBubble
              msg={item}
              avatar={contactAvatar}
              authUserId={authUser?._id}
            />
          )}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyMessagesWrap}>
              <Text style={styles.emptyMessagesText}>
                Bắt đầu cuộc trò chuyện với người dùng này.
              </Text>
            </View>
          }
        />
      )}

      <ChatInput onSend={handleSend} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  messageList: { padding: 16, gap: 12 },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  loadingText: { fontSize: 13, color: "#6B7280" },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 24,
  },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: "#111827" },
  backToListBtn: {
    backgroundColor: "#16A34A",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  backToListText: { color: "#FFFFFF", fontWeight: "600" },
  emptyMessagesWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
  },
  emptyMessagesText: { fontSize: 13, color: "#9CA3AF" },

  // Row
  row: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  rowMe: { justifyContent: "flex-end" },
  rowThem: { justifyContent: "flex-start" },

  // Avatar
  msgAvatar: { width: 32, height: 32, borderRadius: 16, marginBottom: 16 },

  // Bubble
  bubble: {
    maxWidth: 260,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleMe: { backgroundColor: "#16A34A", borderBottomRightRadius: 4 },
  bubbleThem: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  bubbleText: { fontSize: 14, color: "#111827", lineHeight: 20 },
  bubbleTextMe: { color: "#FFFFFF" },
  messageImage: {
    width: 180,
    height: 180,
    borderRadius: 12,
    marginBottom: 8,
  },
  msgTime: { fontSize: 11, color: "#9CA3AF", marginTop: 4, marginLeft: 4 },
  msgTimeMe: { textAlign: "right", marginRight: 4 },
});
