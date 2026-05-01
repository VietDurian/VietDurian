import { useState } from "react";
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

export default function ForgotPasswordScreen() {
  const { navigate } = useAppStore();
  const {
    isRequestingResetOtp,
    resendVerificationOtp,
    setPendingVerificationEmail,
    forgotPassword,
  } = useAuthStore();
  const [email, setEmail] = useState("");

  const handleSendOTP = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      Toast.show({
        type: "error",
        text1: "Vui lòng nhập email",
      });
      return;
    }

    const normalizedEmail = trimmedEmail.toLowerCase();
    setPendingVerificationEmail(normalizedEmail);
    await forgotPassword(normalizedEmail);

    navigate("verify-reset-otp");
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
        {/* Logo */}
        <View style={{ justifyContent: "center", alignItems: "center" }}>
          <Image
            source={require("../assets/VietDurian-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Heading */}
        <Text style={styles.heading}>Quên mật khẩu</Text>
        <Text style={styles.subheading}>
          Nhập email đã đăng ký để nhận mã OTP đặt lại mật khẩu
        </Text>

        {/* Card */}
        <View style={styles.card}>
          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Email <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={18} color="#9CA3AF" />
              <TextInput
                style={styles.input}
                placeholder="Nhập email"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSendOTP}
            disabled={isRequestingResetOtp}
            activeOpacity={0.85}
          >
            <Text style={styles.submitBtnText}>
              {isRequestingResetOtp ? "Đang gửi..." : "Nhận mã OTP"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Bạn đã nhớ mật khẩu? </Text>
          <TouchableOpacity onPress={() => navigate("login")}>
            <Text style={styles.footerLink}>Đăng nhập</Text>
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
  // Logo
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  logoIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
  },
  logoIconEmoji: { fontSize: 18 },
  logoText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1B6B3A",
  },
  // Heading
  heading: {
    fontSize: 30,
    fontWeight: "800",
    color: "#16A34A",
    lineHeight: 38,
    marginBottom: 10,
    textAlign: "center",
  },
  subheading: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 22,
    marginBottom: 28,
    textAlign: "center",
  },
  // Card
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  // Field
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
  // Forgot
  forgotBtn: { alignSelf: "flex-end", marginTop: -4 },
  forgotText: { color: "#16A34A", fontSize: 13, fontWeight: "500" },
  // Login button
  submitBtn: {
    height: 52,
    borderRadius: 12,
    backgroundColor: "#16A34A",
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  // Divider
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#E5E7EB" },
  dividerText: {
    color: "#9CA3AF",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1,
  },
  // Google
  googleBtn: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  googleIcon: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4285F4",
  },
  googleBtnText: { color: "#374151", fontSize: 14, fontWeight: "500" },
  // Footer
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  footerText: { color: "#6B7280", fontSize: 14 },
  footerLink: { color: "#16A34A", fontSize: 14, fontWeight: "700" },
  logo: {
    width: 100,
    height: 80,
  },
});
