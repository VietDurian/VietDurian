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
import { useAppStore } from "@/store/useAppStore";

export default function LoginScreen() {
  const { navigate, login } = useAppStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

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
        <Text style={styles.heading}>Chào mừng quay trở lại</Text>
        <Text style={styles.subheading}>
          Đăng nhập để tiếp tục hành trình cùng chúng tôi
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

          {/* Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Mật Khẩu <Text style={styles.required}>*</Text>
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

          {/* Forgot */}
          <TouchableOpacity
            onPress={() => navigate("forgot-password")}
            style={styles.forgotBtn}
          >
            <Text style={styles.forgotText}>Quên mật khẩu?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={login}
            activeOpacity={0.85}
          >
            <Text style={styles.loginBtnText}>Đăng Nhập</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>HOẶC</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Button */}
          <TouchableOpacity style={styles.googleBtn} activeOpacity={0.85}>
            <Text style={styles.googleIcon}>G</Text>
            <Text style={styles.googleBtnText}>Đăng nhập bằng Google</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Chưa có tài khoản? </Text>
          <TouchableOpacity onPress={() => navigate("register")}>
            <Text style={styles.footerLink}>Đăng ký</Text>
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
