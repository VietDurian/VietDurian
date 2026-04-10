import { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "../store/useAuthStore";

export default function VerifyEmailScreen() {
  const { navigate } = useAppStore();
  const {
    verifyEmail,
    resendVerificationOtp,
    setPendingVerificationEmail,
    pendingVerificationEmail,
    isVerifyingEmail,
    isResendingOtp,
  } = useAuthStore();

  const [otp, setOtp] = useState("");
  const email = useMemo(
    () => pendingVerificationEmail?.trim().toLowerCase() || "",
    [pendingVerificationEmail],
  );

  const handleVerify = async () => {
    const normalizedOtp = otp.trim();

    if (!email) {
      Toast.show({
        type: "error",
        text1: "Không tìm thấy email xác thực. Vui lòng đăng nhập lại",
      });
      navigate("login");
      return;
    }

    if (!/^\d{6}$/.test(normalizedOtp)) {
      Toast.show({
        type: "error",
        text1: "OTP phải gồm đúng 6 chữ số",
      });
      return;
    }

    const result = await verifyEmail({ email, otp: normalizedOtp });
    if (result) {
      setPendingVerificationEmail("");
      Toast.show({
        type: "success",
        text1: "Xác thực thành công, vui lòng đăng nhập",
      });
      navigate("login");
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      Toast.show({
        type: "error",
        text1: "Không tìm thấy email để gửi lại OTP",
      });
      return;
    }

    await resendVerificationOtp(email);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ justifyContent: "center", alignItems: "center" }}>
          <Image
            source={require("../assets/VietDurian-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.heading}>Xác thực email</Text>
        <Text style={styles.subheading}>
          {email
            ? `Nhập OTP đã gửi đến ${email}`
            : "Nhập OTP đã được gửi đến email của bạn"}
        </Text>

        <View style={styles.card}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Mã OTP <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="shield-checkmark-outline"
                size={18}
                color="#9CA3AF"
              />
              <TextInput
                style={styles.input}
                placeholder="Nhập mã OTP gồm 6 chữ số"
                placeholderTextColor="#9CA3AF"
                value={otp}
                onChangeText={(text) => setOtp(text.replace(/\D/g, ""))}
                keyboardType="number-pad"
                maxLength={6}
                onSubmitEditing={handleVerify}
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.verifyBtn}
            onPress={handleVerify}
            disabled={isVerifyingEmail}
            activeOpacity={0.85}
          >
            <Text style={styles.verifyBtnText}>
              {isVerifyingEmail ? "Đang xác thực..." : "Xác thực"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleResendOtp}
            disabled={isResendingOtp}
            style={styles.resendBtn}
          >
            <Text style={styles.resendText}>
              {isResendingOtp ? "Đang gửi lại OTP..." : "Gửi lại OTP"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigate("login")}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={16} color="#16A34A" />
            <Text style={styles.backText}>Quay lại đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F4F0",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 32,
  },
  logo: {
    width: 100,
    height: 80,
  },
  heading: {
    fontSize: 30,
    fontWeight: "800",
    color: "#16A34A",
    textAlign: "center",
    marginBottom: 10,
  },
  subheading: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 22,
    marginBottom: 28,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  fieldGroup: { gap: 6 },
  label: { fontSize: 14, fontWeight: "600", color: "#374151" },
  required: { color: "#EF4444" },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 50,
    gap: 10,
    backgroundColor: "#FAFAFA",
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
  },
  verifyBtn: {
    marginTop: 6,
    height: 52,
    borderRadius: 12,
    backgroundColor: "#16A34A",
    alignItems: "center",
    justifyContent: "center",
  },
  verifyBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  resendBtn: {
    alignSelf: "center",
    paddingTop: 6,
  },
  resendText: { color: "#16A34A", fontSize: 14, fontWeight: "600" },
  backBtn: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  backText: { color: "#16A34A", fontSize: 14, fontWeight: "600" },
});
