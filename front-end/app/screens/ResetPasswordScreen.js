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

const SPECIAL_CHAR_REGEX = /[!@#$%^&*(),.?":{}|<>[\]\\';`~+=\-_/]/;
const PASSWORD_RULES = [
  {
    id: "length",
    test: (pwd) => pwd.length >= 12,
    label: "Ít nhất 12 ký tự",
  },
  {
    id: "uppercase",
    test: (pwd) => /[A-Z]/.test(pwd),
    label: "Có chữ in hoa",
  },
  {
    id: "lowercase",
    test: (pwd) => /[a-z]/.test(pwd),
    label: "Có chữ thường",
  },
  {
    id: "number",
    test: (pwd) => /\d/.test(pwd),
    label: "Có ít nhất một số",
  },
  {
    id: "special",
    test: (pwd) => SPECIAL_CHAR_REGEX.test(pwd),
    label: "Có ký tự đặc biệt (ví dụ: @, #, $)",
  },
];

const isStrongPassword = (pwd = "") =>
  PASSWORD_RULES.every((rule) => rule.test(pwd));

export default function ResetPasswordScreen() {
  const { navigate } = useAppStore();
  const { isResettingPassword, pendingResetToken, resetPassword } =
    useAuthStore();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const handleResetPassword = async () => {
    if (!pendingResetToken) {
      Toast.show({
        type: "error",
        text1: "Thiếu token đặt lại mật khẩu",
      });
      return;
    }

    if (!password || !confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Vui lòng nhập mật khẩu mới",
      });
      return;
    }

    if (!isStrongPassword(password)) {
      Toast.show({
        type: "error",
        text1: "Mật khẩu chưa đáp ứng các yêu cầu",
      });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Mật khẩu xác nhận không khớp",
      });
      return;
    }

    const result = await resetPassword({
      token: pendingResetToken,
      newPassword: password,
      confirmPassword,
    });

    if (result) {
      navigate("login");
    }
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
        <Text style={styles.heading}>Đổi mật khẩu</Text>
        <Text style={styles.subheading}>
          Nhập mật khẩu mới và xác nhận mật khẩu mới
        </Text>

        {/* Card */}
        <View style={styles.card}>
          {/* Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Mật Khẩu mới <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={18} color="#9CA3AF" />
              <TextInput
                style={styles.input}
                placeholder="Nhập mật khẩu"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                autoCapitalize="none"
                onSubmitEditing={handleResetPassword}
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                <Ionicons
                  name={showPass ? "eye-outline" : "eye-off-outline"}
                  size={18}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>
          </View>

          {password ? (
            <View style={styles.passwordChecklist}>
              {PASSWORD_RULES.map((rule) => {
                const passed = rule.test(password);
                return (
                  <View key={rule.id} style={styles.passwordRuleRow}>
                    <Ionicons
                      name={passed ? "checkmark-circle" : "close-circle"}
                      size={16}
                      color={passed ? "#16A34A" : "#EF4444"}
                    />
                    <Text
                      style={[
                        styles.passwordRuleText,
                        passed
                          ? styles.passwordRuleTextPass
                          : styles.passwordRuleTextFail,
                      ]}
                    >
                      {rule.id === "length"
                        ? `Ít nhất 12 ký tự (hiện tại: ${password.length})`
                        : rule.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : null}
          {/* Confirm Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Xác nhận mật Khẩu mới <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={18} color="#9CA3AF" />
              <TextInput
                style={styles.input}
                placeholder="Nhập mật khẩu"
                placeholderTextColor="#9CA3AF"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPass}
                autoCapitalize="none"
                onSubmitEditing={handleResetPassword}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPass(!showConfirmPass)}
              >
                <Ionicons
                  name={showConfirmPass ? "eye-outline" : "eye-off-outline"}
                  size={18}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={handleResetPassword}
            disabled={isResettingPassword}
            activeOpacity={0.85}
          >
            <Text style={styles.loginBtnText}>
              {isResettingPassword ? "Đang đổi mật khẩu..." : "Đổi mật khẩu"}
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
  loginBtn: {
    height: 52,
    borderRadius: 12,
    backgroundColor: "#16A34A",
    alignItems: "center",
    justifyContent: "center",
  },
  loginBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
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

  passwordChecklist: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
    backgroundColor: "#FFFFFF",
  },
  passwordRuleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  passwordRuleText: {
    fontSize: 12,
    flex: 1,
  },
  passwordRuleTextPass: {
    color: "#16A34A",
  },
  passwordRuleTextFail: {
    color: "#EF4444",
  },
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
