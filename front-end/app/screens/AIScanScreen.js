import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "@/store/useAppStore";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useRef, useState } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { axiosInstance } from "@/lib/axios";

const getAiBaseUrls = () => {
  const base = String(axiosInstance.defaults.baseURL || "").replace(/\/$/, "");
  const m = base.match(/^(https?:\/\/[^/:]+)(?::(\d+))?(\/.*)?$/i);
  if (!m) return base ? [base] : [];

  const host = m[1];
  const basePort = m[2] ? Number(m[2]) : null;
  const path = m[3] || "/api/v1";

  // Backend can auto-shift port if 8080 is busy; keep fallback ports broad.
  const fallbackPorts = [8082, ...Array.from({ length: 11 }, (_, i) => 8080 + i)];
  const ports = [basePort, ...fallbackPorts].filter(
    (p, i, arr) => Number.isFinite(p) && arr.indexOf(p) === i,
  );

  const urls = base ? [base] : [];
  for (const port of ports) {
    urls.push(`${host}:${port}${path}`);
  }

  return [...new Set(urls)];
};

const postAiPredict = async ({ baseUrl, formData, token }) => {
  const response = await fetch(`${baseUrl}/ai/predict`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const err = new Error(data?.message || `HTTP ${response.status}`);
    err.response = { status: response.status, data };
    throw err;
  }

  return data;
};

export default function AIScanScreen() {
  const { navigate } = useAppStore();
  const [pickedImageUri, setPickedImageUri] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState(null);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [editorVisible, setEditorVisible] = useState(false);
  const [editorImage, setEditorImage] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const cameraRef = useRef(null);
  const [cameraPermission, requestCameraAccess] = useCameraPermissions();

  useEffect(() => {
    const ensureCameraPermission = async () => {
      const result = await requestCameraAccess();
      if (!result?.granted) {
        Alert.alert(
          "Cần quyền camera",
          "Vui lòng cấp quyền camera để chụp ảnh quét AI.",
        );
      }
    };

    ensureCameraPermission();
  }, [requestCameraAccess]);

  const uploadImageToAI = async (asset) => {
    if (!asset?.uri) return;

    setPickedImageUri(asset.uri);
    setScanResult(null);
    setScanError(null);
    setIsAnalyzing(true);

    try {
      const filename = asset.fileName || asset.uri.split("/").pop() || "scan.jpg";
      const ext = filename.includes(".") ? filename.split(".").pop() : "jpg";
      const mimeType = asset.mimeType || `image/${ext === "jpg" ? "jpeg" : ext}`;

      const buildFormData = () => {
        const formData = new FormData();
        formData.append("image", {
          uri: asset.uri,
          name: filename,
          type: mimeType,
        });
        return formData;
      };

      const baseUrls = getAiBaseUrls();
      const token = await AsyncStorage.getItem("auth_token");
      let data = null;
      let lastError = null;
      const triedUrls = [];

      for (const baseUrl of baseUrls) {
        triedUrls.push(baseUrl);
        try {
          data = await postAiPredict({
            baseUrl,
            formData: buildFormData(),
            token,
          });
          break;
        } catch (err) {
          lastError = err;
        }
      }

      if (!data) {
        const err = lastError || new Error("Không thể kết nối máy chủ AI");
        err.triedUrls = triedUrls;
        throw err;
      }

      if (!data?.success) {
        throw new Error(data?.message || "Không thể phân tích ảnh lúc này");
      }

      setScanResult(data.data);
    } catch (error) {
      const isNetworkError = error?.message === "Network Error" && !error?.response;
      const message =
        (isNetworkError
          ? "Không thể kết nối máy chủ AI. Vui lòng kiểm tra backend đang chạy (port 8080-8090)."
          : null) ||
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Không thể phân tích ảnh lúc này";
      setScanError(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const openGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Thiếu quyền", "Cần cấp quyền truy cập thư viện ảnh.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      setEditorImage(result.assets[0]);
      setEditorVisible(true);
    }
  };

  const cropEditorImage = async () => {
    if (!editorImage?.uri || isCropping) return;

    setIsCropping(true);
    try {
      const width = Number(editorImage.width) || 0;
      const height = Number(editorImage.height) || 0;

      if (!width || !height) {
        Alert.alert("Không thể cắt ảnh", "Thiếu thông tin kích thước ảnh.");
        return;
      }

      const targetRatio = 4 / 3;
      let cropWidth = width;
      let cropHeight = Math.floor(width / targetRatio);

      if (cropHeight > height) {
        cropHeight = height;
        cropWidth = Math.floor(height * targetRatio);
      }

      const originX = Math.floor((width - cropWidth) / 2);
      const originY = Math.floor((height - cropHeight) / 2);

      const cropped = await ImageManipulator.manipulateAsync(
        editorImage.uri,
        [{ crop: { originX, originY, width: cropWidth, height: cropHeight } }],
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG },
      );

      setEditorImage((prev) => ({
        ...(prev || {}),
        uri: cropped.uri,
        width: cropped.width,
        height: cropped.height,
        mimeType: "image/jpeg",
      }));
    } catch {
      Alert.alert("Lỗi cắt ảnh", "Không thể cắt ảnh lúc này.");
    } finally {
      setIsCropping(false);
    }
  };

  const confirmEditorImage = async () => {
    if (!editorImage) return;
    setEditorVisible(false);
    await uploadImageToAI(editorImage);
  };

  const openCamera = async () => {
    if (pickedImageUri) {
      // Retake mode: return to live camera first.
      setPickedImageUri(null);
      setScanResult(null);
      setScanError(null);
      return;
    }

    if (!cameraPermission?.granted) {
      const result = await requestCameraAccess();
      if (!result?.granted) {
        Alert.alert("Thiếu quyền", "Cần cấp quyền camera để chụp ảnh.");
        return;
      }
    }

    if (!cameraRef.current) {
      Alert.alert("Không thể mở camera", "Camera chưa sẵn sàng, vui lòng thử lại.");
      return;
    }

    try {
      const captured = await cameraRef.current.takePictureAsync({
        quality: 1,
      });
      if (captured?.uri) {
        await uploadImageToAI({
          uri: captured.uri,
          fileName: `scan-${Date.now()}.jpg`,
          mimeType: "image/jpeg",
        });
      }
    } catch {
      Alert.alert("Lỗi camera", "Không thể chụp ảnh lúc này.");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <Modal visible={editorVisible} transparent animationType="fade">
        <View style={styles.editorOverlay}>
          <View style={styles.editorTopBar}>
            <TouchableOpacity
              style={styles.editorIconBtn}
              onPress={() => setEditorVisible(false)}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.editorRightActions}>
              <TouchableOpacity
                style={styles.editorIconBtn}
                onPress={cropEditorImage}
                disabled={isCropping}
              >
                {isCropping ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Ionicons name="crop-outline" size={24} color="#FFFFFF" />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.editorIconBtn}
                onPress={confirmEditorImage}
              >
                <Ionicons name="checkmark" size={26} color="#22C55E" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.editorImageWrap}>
            {editorImage?.uri ? (
              <Image source={{ uri: editorImage.uri }} style={styles.editorImage} />
            ) : null}
          </View>
        </View>
      </Modal>

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
        {pickedImageUri ? (
          <Image source={{ uri: pickedImageUri }} style={styles.capturedImage} />
        ) : cameraPermission?.granted ? (
          <CameraView
            ref={cameraRef}
            style={styles.cameraPreview}
            facing="back"
            enableTorch={flashEnabled}
          />
        ) : (
          <View style={styles.cameraFallback}>
            <Text style={styles.cameraFallbackText}>Camera chưa được cấp quyền</Text>
            <TouchableOpacity
              style={styles.permissionBtn}
              onPress={requestCameraAccess}
            >
              <Text style={styles.permissionBtnText}>Cấp quyền camera</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.scanDarkOverlay} pointerEvents="none" />

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
          {pickedImageUri
            ? "Ảnh đã chụp - bấm nút camera để chụp lại"
            : "Hướng camera vào lá hoặc trái sầu riêng"}
        </Text>
      </View>

      {(isAnalyzing || scanError || scanResult) && (
        <View style={styles.resultPanel}>
          {isAnalyzing && (
            <View style={styles.resultRow}>
              <ActivityIndicator color="#16A34A" />
              <Text style={styles.resultText}>AI đang phân tích ảnh...</Text>
            </View>
          )}

          {scanError && !isAnalyzing && (
            <Text style={[styles.resultText, styles.errorText]}>{scanError}</Text>
          )}

          {scanResult && !isAnalyzing && !scanError && (
            <>
              <Text style={styles.resultTitle}>
                Kết quả: {scanResult.predicted_class_vi || scanResult.predicted_class}
              </Text>
              {typeof scanResult.confidence === "number" && (
                <Text style={styles.resultText}>
                  Độ tin cậy: {(Number(scanResult.confidence) * 100).toFixed(2)}%
                </Text>
              )}
              {Array.isArray(scanResult?.solutions) && scanResult.solutions.length > 0 && (
                <View style={styles.solutionWrap}>
                  <Text style={styles.solutionTitle}>Giải pháp đề xuất:</Text>
                  {scanResult.solutions.slice(0, 3).map((item, idx) => (
                    <Text key={`${item}-${idx}`} style={styles.solutionItem}>• {item}</Text>
                  ))}
                </View>
              )}
            </>
          )}
        </View>
      )}

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
            onPress={openCamera}
            style={styles.captureBtn}
            activeOpacity={0.8}
            disabled={isAnalyzing}
          >
            <View style={styles.captureBtnInner}>
              <Ionicons name="camera" size={30} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => setFlashEnabled((prev) => !prev)}
          >
            <View style={[styles.actionIcon, flashEnabled && styles.actionIconActive]}>
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
    overflow: "hidden",
  },

  cameraPreview: {
    ...StyleSheet.absoluteFillObject,
  },

  capturedImage: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: "cover",
  },

  cameraFallback: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "#0B0B0B",
  },
  cameraFallbackText: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 14,
  },
  permissionBtn: {
    backgroundColor: "#16A34A",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  permissionBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  scanDarkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
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

  resultPanel: {
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "rgba(15,23,42,0.82)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    gap: 6,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  resultTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  resultText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
    lineHeight: 18,
  },
  errorText: {
    color: "#FCA5A5",
  },
  solutionWrap: {
    marginTop: 4,
    gap: 4,
  },
  solutionTitle: {
    color: "#86EFAC",
    fontSize: 12,
    fontWeight: "700",
  },
  solutionItem: {
    color: "rgba(255,255,255,0.86)",
    fontSize: 12,
    lineHeight: 17,
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
  actionIconActive: {
    backgroundColor: "rgba(22,163,74,0.6)",
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

  editorOverlay: {
    flex: 1,
    backgroundColor: "#0B0B0B",
  },
  editorTopBar: {
    paddingTop: 28,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  editorRightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  editorIconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  editorImageWrap: {
    flex: 1,
    backgroundColor: "#000",
  },
  editorImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
});
