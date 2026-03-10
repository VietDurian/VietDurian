import { useState } from "react";
import {
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

// ── Mock Messages ──
const INITIAL_MESSAGES = [
  {
    id: "1",
    text: "Ổ tốt quá! Chị đang lo ngại vụ này giá xuống. Anh bán cho vừa nào?",
    sender: "them",
    time: "10:17",
  },
  {
    id: "2",
    text: "Em bán cho vựa Minh Phát bên Cai Lậy, giá khá ổn, 95k/kg Musang King.",
    sender: "me",
    time: "10:20",
  },
  {
    id: "3",
    type: "shared-post",
    title: "Kỹ thuật bón phân cho sầu riêng Musang King đúng t...",
    tag: "Kỹ thuật",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400",
    sender: "them",
    time: "10:22",
  },
  {
    id: "4",
    text: "Bài hay đó chị, em đọc rồi. Áp dụng được nhiều cái bổ ích lắm.",
    sender: "me",
    time: "10:25",
  },
  {
    id: "5",
    text: "Vườn của anh năm nay được mùa không?",
    sender: "them",
    time: "10:32",
  },
];

// ── Message Bubble ──
function MessageBubble({ msg, avatar }) {
  const isMe = msg.sender === "me";

  if (msg.type === "shared-post") {
    return (
      <View style={[styles.row, isMe ? styles.rowMe : styles.rowThem]}>
        {!isMe && <Image source={{ uri: avatar }} style={styles.msgAvatar} />}
        <View style={[styles.postCard, isMe && { marginLeft: 40 }]}>
          <Image source={{ uri: msg.image }} style={styles.postImage} />
          <View style={styles.postBody}>
            <View style={styles.postTag}>
              <Text style={styles.postTagText}>{msg.tag}</Text>
            </View>
            <Text style={styles.postTitle} numberOfLines={2}>
              {msg.title}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.row, isMe ? styles.rowMe : styles.rowThem]}>
      {!isMe && <Image source={{ uri: avatar }} style={styles.msgAvatar} />}
      <View>
        <View
          style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}
        >
          <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>
            {msg.text}
          </Text>
        </View>
        <Text style={[styles.msgTime, isMe && styles.msgTimeMe]}>
          {msg.time}
        </Text>
      </View>
    </View>
  );
}

// ── Main Screen ──
export default function ChatDetailScreen() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);

  const contact = {
    name: "Trần Thị Lan",
    avatar: "https://i.pravatar.cc/100?img=47",
    isOnline: true,
  };

  const handleSend = (text) => {
    const newMsg = {
      id: Date.now().toString(),
      text,
      sender: "me",
      time: new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ChatHeader
        name={contact.name}
        avatar={contact.avatar}
        isOnline={contact.isOnline}
      />

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MessageBubble msg={item} avatar={contact.avatar} />
        )}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
      />

      <ChatInput onSend={handleSend} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  messageList: { padding: 16, gap: 12 },

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
  msgTime: { fontSize: 11, color: "#9CA3AF", marginTop: 4, marginLeft: 4 },
  msgTimeMe: { textAlign: "right", marginRight: 4 },

  // Shared post card
  postCard: {
    width: 220,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  postImage: { width: "100%", height: 110 },
  postBody: { padding: 10, gap: 6 },
  postTag: {
    alignSelf: "flex-start",
    backgroundColor: "#D1FAE5",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  postTagText: { fontSize: 11, color: "#16A34A", fontWeight: "600" },
  postTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
    lineHeight: 18,
  },
});
