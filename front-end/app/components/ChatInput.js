import { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

export default function ChatInput({ onSend }) {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Thông báo", "Vui lòng cấp quyền thư viện ảnh để tiếp tục.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    if (!asset.base64) {
      Alert.alert("Thông báo", "Không thể đọc dữ liệu ảnh.");
      return;
    }

    const mime = asset.mimeType || "image/jpeg";
    const base64Image = `data:${mime};base64,${asset.base64}`;
    setImagePreview(base64Image);
  };

  const handleRemoveImage = () => {
    setImagePreview("");
  };

  const handleSend = async () => {
    if ((!text.trim() && !imagePreview) || isSending) return;

    try {
      setIsSending(true);
      await onSend?.({
        text: text.trim(),
        image: imagePreview || undefined,
      });
      setText("");
      setImagePreview("");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      {!!imagePreview && (
        <View style={styles.previewWrap}>
          <Image source={{ uri: imagePreview }} style={styles.previewImage} />
          <TouchableOpacity
            style={styles.previewRemoveBtn}
            onPress={handleRemoveImage}
            activeOpacity={0.85}
          >
            <Ionicons name="close" size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.container}>
        {/* Image select */}
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={handleImagePick}
          disabled={isSending}
        >
          <Ionicons
            name="image"
            size={24}
            color={imagePreview ? "#16A34A" : "#9CA3AF"}
          />
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
          editable={!isSending}
        />

        {/* Send */}
        <TouchableOpacity
          style={[
            styles.sendBtn,
            (text.trim() || imagePreview || isSending) && styles.sendBtnActive,
          ]}
          onPress={handleSend}
          disabled={isSending}
          activeOpacity={0.8}
        >
          {isSending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons
              name="send"
              size={18}
              color={text.trim() || imagePreview ? "#FFFFFF" : "#9CA3AF"}
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 8,
  },
  previewWrap: {
    width: 90,
    height: 90,
    marginLeft: 12,
    marginBottom: 8,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  previewRemoveBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(17, 24, 39, 0.85)",
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingBottom: 10,
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
