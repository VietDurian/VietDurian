import { useState } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ChatInput({ onSend }) {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim()) return;
    onSend?.(text.trim());
    setText("");
  };

  return (
    <View style={styles.container}>
      {/* Attachment */}
      <TouchableOpacity style={styles.iconBtn}>
        <Ionicons name="attach-outline" size={24} color="#9CA3AF" />
      </TouchableOpacity>

      {/* Input */}
      <TextInput
        style={styles.input}
        placeholder="Nhắn tin..."
        placeholderTextColor="#9CA3AF"
        value={text}
        onChangeText={setText}
        multiline
        maxLength={500}
      />

      {/* Send */}
      <TouchableOpacity
        style={[styles.sendBtn, text.trim() && styles.sendBtnActive]}
        onPress={handleSend}
        activeOpacity={0.8}
      >
        <Ionicons
          name="send"
          size={18}
          color={text.trim() ? "#FFFFFF" : "#9CA3AF"}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    gap: 8,
  },
  iconBtn: { padding: 6, marginBottom: 2 },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 0,
  },
  sendBtnActive: { backgroundColor: "#16A34A" },
});
