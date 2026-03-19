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
import { useEffect, useMemo, useRef, useState } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { axiosInstance } from "@/lib/axios";

const AI_REQUEST_TIMEOUT_MS = 10000;
const MAX_UPLOAD_DIMENSION = 1280;
const AI_BASE_URL_CACHE_KEY = "last_success_ai_base_url";

const EXT_TO_MIME = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/heic",
  heif: "image/heif",
};

const inferMimeTypeFromFilename = (filename) => {
  if (!filename || typeof filename !== "string") return null;
  const ext = filename.includes(".") ? filename.split(".").pop()?.toLowerCase() : "";
  return EXT_TO_MIME[ext] || null;
};

const buildResizeAction = (asset) => {
  const width = Number(asset?.width) || 0;
  const height = Number(asset?.height) || 0;
  const longestEdge = Math.max(width, height);

  if (!width || !height || longestEdge <= MAX_UPLOAD_DIMENSION) return [];

  if (width >= height) {
    return [{ resize: { width: MAX_UPLOAD_DIMENSION } }];
  }

  return [{ resize: { height: MAX_UPLOAD_DIMENSION } }];
};

const getExpoDevHost = () => {
  const hostUri =
    Constants?.expoConfig?.hostUri ||
    Constants?.manifest2?.extra?.expoGo?.debuggerHost ||
    Constants?.manifest?.debuggerHost ||
    "";

  if (!hostUri || typeof hostUri !== "string") return null;
  const host = hostUri.split(":")[0];
  return host || null;
};

const parseBaseUrl = (raw) => {
  const base = String(raw || "").replace(/\/$/, "");
  const m = base.match(/^(https?:\/\/)([^/:]+)(?::(\d+))?(\/.*)?$/i);
  if (!m) {
    return {
      protocol: "http://",
      host: null,
      port: 8080,
      path: "/api/v1",
      base,
    };
  }

  return {
    protocol: m[1] || "http://",
    host: m[2] || null,
    port: m[3] ? Number(m[3]) : 8080,
    path: m[4] || "/api/v1",
    base,
  };
};

const normalizeAssetForUpload = async (asset) => {
  const originalFilename = asset?.fileName || asset?.uri?.split("/").pop() || "scan.jpg";
  const safeBaseName = originalFilename.replace(/\.[^/.]+$/, "") || "scan";
  const _inferredMime = inferMimeTypeFromFilename(originalFilename);

  // Always normalize to JPEG and downscale large images to avoid long uploads.
  const actions = buildResizeAction(asset);
  const converted = await ImageManipulator.manipulateAsync(
    asset.uri,
    actions,
    { compress: 0.72, format: ImageManipulator.SaveFormat.JPEG },
  );

  return {
    uri: converted.uri,
    fileName: `${safeBaseName}.jpg`,
    mimeType: "image/jpeg",
  };
};

const getAiBaseUrls = async () => {
  const parsed = parseBaseUrl(axiosInstance.defaults.baseURL || "");
  const cachedBase = String((await AsyncStorage.getItem(AI_BASE_URL_CACHE_KEY)) || "").replace(/\/$/, "");
  const expoHost = getExpoDevHost();

  const hosts = [parsed.host, expoHost, "10.0.2.2", "127.0.0.1", "localhost"].filter(
    (v, i, arr) => v && arr.indexOf(v) === i,
  );

  const fallbackPorts = [parsed.port, 8080, 8081, 8082, 8083].filter(
    (p, i, arr) => Number.isFinite(p) && arr.indexOf(p) === i,
  );

  const generated = [];
  for (const host of hosts) {
    for (const port of fallbackPorts) {
      generated.push(`${parsed.protocol}${host}:${port}${parsed.path}`);
    }
  }

  return [...new Set([cachedBase, parsed.base, ...generated].filter(Boolean))];
};

const postAiPredict = async ({ baseUrl, formData, token }) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AI_REQUEST_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(`${baseUrl}/ai/predict`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
      signal: controller.signal,
    });
  } catch (err) {
    if (err?.name === "AbortError") {
      const timeoutErr = new Error("Yeu cau quet AI bi timeout");
      timeoutErr.code = "AI_TIMEOUT";
      throw timeoutErr;
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

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

const shouldRetryAiRequest = (error) => {
  const status = error?.response?.status;

  // No HTTP status usually means DNS/LAN/socket failure.
  if (!status) return true;

  // Retry only transient upstream/server conditions.
  if (status >= 500 || status === 408 || status === 429) return true;

  // Do not retry business/client errors like 400/401/403/404/422.
  return false;
};

const isNotDurianImageMessage = (value) => {
  const text = String(value || "");
  return /chua phai anh sau rieng|chưa phải ảnh sầu riêng|lien quan den sau rieng|liên quan đến sầu riêng/i.test(
    text,
  );
};

const normalizeText = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const isNonDiseaseLabel = (label) => {
  const normalized = normalizeText(label);
  return (
    normalized.includes("healthy") ||
    normalized.includes("khỏe mạnh") ||
    normalized.includes("khoe manh") ||
    normalized.includes("binh thuong") ||
    normalized.includes("bình thường")
  );
};

export default function AIScanScreen() {
  const { navigate } = useAppStore();
  const [pickedImageUri, setPickedImageUri] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState(null);
  const [editorVisible, setEditorVisible] = useState(false);
  const [editorImage, setEditorImage] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [cameraFacing, setCameraFacing] = useState("back");
  const cameraRef = useRef(null);
  const [cameraPermission, requestCameraAccess] = useCameraPermissions();
  const isNotDurianWarning = isNotDurianImageMessage(scanError);

  const relatedDiseases = useMemo(() => {
    if (!Array.isArray(scanResult?.top_k)) return [];

    const predictedSet = new Set([
      normalizeText(scanResult?.predicted_class),
      normalizeText(scanResult?.predicted_class_en),
      normalizeText(scanResult?.predicted_class_vi),
    ]);

    return scanResult.top_k
      .map((item) => {
        const probability = Number(item?.probability);
        if (!Number.isFinite(probability)) return null;

        const label =
          item?.class_name_vi || item?.class_name_en || item?.class_name || "Không xác định";

        const aliases = [
          normalizeText(item?.class_name),
          normalizeText(item?.class_name_en),
          normalizeText(item?.class_name_vi),
          normalizeText(label),
        ];

        const isPredictedClass = aliases.some((name) => predictedSet.has(name));
        if (isPredictedClass || isNonDiseaseLabel(label)) return null;

        return {
          id: item?.class_name_en || item?.class_name || item?.class_name_vi || "unknown",
          label,
          probability: Math.max(0, Math.min(1, probability)),
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 4);
  }, [scanResult]);

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

    setScanResult(null);
    setScanError(null);
    setIsAnalyzing(true);

    try {
      const normalizedAsset = await normalizeAssetForUpload(asset);
      setPickedImageUri(normalizedAsset.uri);

      const filename = normalizedAsset.fileName;
      const mimeType = normalizedAsset.mimeType || "image/jpeg";

      const buildFormData = () => {
        const formData = new FormData();
        formData.append("image", {
          uri: normalizedAsset.uri,
          name: filename,
          type: mimeType,
        });
        return formData;
      };

      const baseUrls = await getAiBaseUrls();
      const token = await AsyncStorage.getItem("auth_token");
      let data = null;
      let lastError = null;
      const triedUrls = [];
      let successBaseUrl = null;

      for (const baseUrl of baseUrls) {
        triedUrls.push(baseUrl);
        try {
          data = await postAiPredict({
            baseUrl,
            formData: buildFormData(),
            token,
          });
          successBaseUrl = baseUrl;
          break;
        } catch (err) {
          // Any HTTP status means this endpoint is reachable; cache it.
          if (err?.response?.status) {
            successBaseUrl = baseUrl;
            axiosInstance.defaults.baseURL = baseUrl;
            await AsyncStorage.setItem(AI_BASE_URL_CACHE_KEY, baseUrl);
          }

          if (!shouldRetryAiRequest(err)) {
            err.triedUrls = triedUrls;
            throw err;
          }
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

      if (successBaseUrl) {
        axiosInstance.defaults.baseURL = successBaseUrl;
        await AsyncStorage.setItem(AI_BASE_URL_CACHE_KEY, successBaseUrl);
      }

      setScanResult(data.data);
    } catch (error) {
      const isTimeoutError = error?.code === "AI_TIMEOUT";
      const status = error?.response?.status;
      const detail = error?.response?.data;
      const isNetworkError = !status && !isTimeoutError;
      const message =
        (isTimeoutError
          ? "He thong AI phan hoi cham. Vui long thu lai voi anh ro net hon."
          : null) ||
        (isNetworkError
          ? "Khong the ket noi may chu AI. Vui long kiem tra backend va dien thoai cung Wi-Fi, backend dang mo cong 8080-8083."
          : null) ||
        (status === 422
          ? "Ảnh tải lên chưa được xác định là liên quan đến sầu riêng. Vui lòng chụp rõ lá, thân hoặc trái sầu riêng."
          : null) ||
        detail?.message ||
        detail?.error ||
        error?.message ||
        "Khong the phan tich anh luc nay";
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
        quality: 0.75,
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
            facing={cameraFacing}
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
            <View
              style={[
                styles.alertWrap,
                isNotDurianWarning ? styles.warningWrap : styles.errorWrap,
              ]}
            >
              <View style={styles.alertHeaderRow}>
                <Ionicons
                  name="warning-outline"
                  size={16}
                  color={isNotDurianWarning ? "#92400E" : "#DC2626"}
                />
                <Text
                  style={[
                    styles.alertTitle,
                    isNotDurianWarning ? styles.warningTitle : styles.errorTitle,
                  ]}
                >
                  {isNotDurianWarning
                    ? "Ảnh chưa phù hợp để chẩn đoán"
                    : "Không thể phân tích ảnh"}
                </Text>
              </View>

              <Text
                style={[
                  styles.resultText,
                  isNotDurianWarning ? styles.warningText : styles.errorText,
                ]}
              >
                {scanError}
              </Text>

              {isNotDurianWarning && (
                <Text style={[styles.resultText, styles.warningHint]}>
                  Gợi ý: Chụp cận cảnh lá hoặc vùng bệnh trên cây sầu riêng, tránh nền nhiều chi tiết.
                </Text>
              )}
            </View>
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

              {relatedDiseases.length > 0 && (
                <View style={styles.relatedWrap}>
                  <Text style={styles.relatedTitle}>Các bệnh AI chẩn đoán có liên quan</Text>
                  {relatedDiseases.map((disease, index) => (
                    <View key={`${disease.id}-${index}`} style={styles.relatedItem}>
                      <View style={styles.relatedRow}>
                        <Text style={styles.relatedLabel} numberOfLines={1}>
                          {index + 1}. {disease.label}
                        </Text>
                        <Text style={styles.relatedPercent}>
                          {(disease.probability * 100).toFixed(2)}%
                        </Text>
                      </View>
                      <View style={styles.relatedBarTrack}>
                        <View
                          style={[
                            styles.relatedBarFill,
                            { width: `${Math.max(2, disease.probability * 100)}%` },
                          ]}
                        />
                      </View>
                    </View>
                  ))}
                </View>
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
            onPress={() =>
              setCameraFacing((prev) => (prev === "back" ? "front" : "back"))
            }
            disabled={isAnalyzing}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="camera-reverse-outline" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.actionLabel}>Đổi camera</Text>
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
  alertWrap: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    gap: 6,
  },
  alertHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  warningWrap: {
    borderColor: "#FDE68A",
    backgroundColor: "rgba(254,243,199,0.16)",
  },
  errorWrap: {
    borderColor: "rgba(239,68,68,0.4)",
    backgroundColor: "rgba(127,29,29,0.2)",
  },
  warningTitle: {
    color: "#FCD34D",
  },
  errorTitle: {
    color: "#FECACA",
  },
  warningText: {
    color: "#FDE68A",
  },
  errorText: {
    color: "#FCA5A5",
  },
  warningHint: {
    color: "#BBF7D0",
    fontSize: 12,
  },
  relatedWrap: {
    marginTop: 6,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(134,239,172,0.35)",
    backgroundColor: "rgba(6,78,59,0.2)",
    gap: 8,
  },
  relatedTitle: {
    color: "#A7F3D0",
    fontSize: 12,
    fontWeight: "700",
  },
  relatedItem: {
    gap: 4,
  },
  relatedRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  relatedLabel: {
    flex: 1,
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
  },
  relatedPercent: {
    color: "#6EE7B7",
    fontSize: 12,
    fontWeight: "700",
  },
  relatedBarTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
    overflow: "hidden",
  },
  relatedBarFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#34D399",
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
