import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "@/store/useAppStore";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";

export default function AIScanScreen() {
  const { navigate } = useAppStore();
  const [pickedImage, setPickedImage] = useState(null);

  const openGallery = async () => {
    // Xin quyền
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Cần cấp quyền truy cập thư viện ảnh!");
      return;
    }

    // Mở gallery
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setPickedImage(result.assets[0].uri);
      // TODO: gửi ảnh lên AI để phân tích
      console.log("Ảnh đã chọn:", result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <SafeAreaView style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigate("home")}
        >
          <Ionicons name="close" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Ionicons name="leaf-outline" size={18} color="#FFFFFF" />
          <Text style={styles.headerTitleText}>Quét AI Sầu Riêng</Text>
        </View>
        <TouchableOpacity style={styles.headerBtn}>
          <Ionicons name="ellipsis-horizontal" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Subtitle */}
      <View style={styles.subtitleRow}>
        <Text style={styles.subtitle}>
          Phát hiện sâu bệnh & đánh giá chất lượng
        </Text>
        <View style={styles.tagRow}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>🍂 Sâu bệnh</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>🌱 Sinh trưởng</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>✅ Chất lượng</Text>
          </View>
        </View>
      </View>

      {/* Scanner Frame */}
      <View style={styles.scanArea}>
        {/* Corner TL */}
        <View style={[styles.corner, styles.cornerTL]} />
        {/* Corner TR */}
        <View style={[styles.corner, styles.cornerTR]} />
        {/* Corner BL */}
        <View style={[styles.corner, styles.cornerBL]} />
        {/* Corner BR */}
        <View style={[styles.corner, styles.cornerBR]} />

        {/* Center hint */}
        <Text style={styles.scanHint}>
          Hướng camera vào lá hoặc trái sầu riêng
        </Text>
      </View>

      {/* Bottom Actions */}
      <View style={styles.bottomSection}>
        {/* Action buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionItem} onPress={openGallery}>
            <View style={styles.actionIcon}>
              <Ionicons name="images-outline" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.actionLabel}>Ảnh có sẵn</Text>
          </TouchableOpacity>

          {/* Main capture button */}
          <TouchableOpacity
            onPress={() => navigate("AI-result")}
            style={styles.captureBtn}
            activeOpacity={0.8}
          >
            <View style={styles.captureBtnInner}>
              <Ionicons name="camera" size={30} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionIcon}>
              <Ionicons name="flash-outline" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.actionLabel}>Đèn flash</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1A1A1A" },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  headerTitleText: { color: "#FFFFFF", fontSize: 15, fontWeight: "600" },

  // Subtitle
  subtitleRow: { alignItems: "center", paddingVertical: 16, gap: 10 },
  subtitle: { color: "rgba(255,255,255,0.7)", fontSize: 13 },
  tagRow: { flexDirection: "row", gap: 8 },
  tag: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  tagText: { color: "#FFFFFF", fontSize: 12, fontWeight: "500" },

  // Scan area
  scanArea: {
    flex: 1,
    marginHorizontal: 40,
    marginVertical: 10,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 20,
    position: "relative",
  },

  // Corners
  corner: {
    position: "absolute",
    width: 36,
    height: 36,
    borderColor: "rgba(255,255,255,0.8)",
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 6,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 6,
  },
  cornerBL: {
    bottom: 60,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 6,
  },
  cornerBR: {
    bottom: 60,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 6,
  },

  scanHint: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    textAlign: "center",
  },

  // Bottom
  bottomSection: {
    paddingBottom: 40,
    paddingTop: 20,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 30,
  },
  actionItem: { alignItems: "center", gap: 8 },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: { color: "rgba(255,255,255,0.7)", fontSize: 12 },

  // Capture button
  captureBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  captureBtnInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#16A34A",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#16A34A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
});
