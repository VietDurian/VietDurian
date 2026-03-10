import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  StyleSheet,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "@/store/useAppStore";

// ── Step Indicator ──
function StepIndicator({ current, total }) {
  return (
    <View style={styles.stepRow}>
      {Array.from({ length: total }).map((_, i) => {
        const step = i + 1;
        const isDone = step < current;
        const isActive = step === current;
        return (
          <View key={i} style={styles.stepItem}>
            <View
              style={[
                styles.stepCircle,
                isActive && styles.stepCircleActive,
                isDone && styles.stepCircleDone,
              ]}
            >
              {isDone ? (
                <Ionicons name="checkmark" size={14} color="#fff" />
              ) : (
                <Text
                  style={[
                    styles.stepNum,
                    (isActive || isDone) && styles.stepNumActive,
                  ]}
                >
                  {step}
                </Text>
              )}
            </View>
            {i < total - 1 && (
              <View style={[styles.stepLine, isDone && styles.stepLineDone]} />
            )}
          </View>
        );
      })}
    </View>
  );
}

// ── Input Field ──
function Field({
  label,
  iconName,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  showToggle,
  onToggle,
  keyboardType,
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>
        {label} <Text style={styles.required}>*</Text>
      </Text>
      <View style={styles.inputWrapper}>
        <Ionicons name={iconName} size={18} color="#9CA3AF" />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType || "default"}
          autoCapitalize="none"
        />
        {showToggle !== undefined && (
          <TouchableOpacity onPress={onToggle}>
            <Ionicons
              name={showToggle ? "eye-outline" : "eye-off-outline"}
              size={18}
              color="#9CA3AF"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ── Role Card ──
const ROLES = [
  {
    key: "trader",
    label: "Trader",
    icon: "briefcase-outline",
    color: "#FEF3C7",
    iconColor: "#D97706",
  },
  {
    key: "farmer",
    label: "Farmer",
    icon: "leaf-outline",
    color: "#D1FAE5",
    iconColor: "#16A34A",
  },
  {
    key: "service",
    label: "Service Provider",
    icon: "construct-outline",
    color: "#E0F2FE",
    iconColor: "#0284C7",
  },
  {
    key: "content",
    label: "Content Expert",
    icon: "create-outline",
    color: "#F3E8FF",
    iconColor: "#9333EA",
  },
];

function RoleCard({ role, selected, onSelect }) {
  return (
    <TouchableOpacity
      style={[styles.roleCard, selected && styles.roleCardSelected]}
      onPress={() => onSelect(role.key)}
      activeOpacity={0.8}
    >
      <View
        style={[
          styles.roleIconWrapper,
          { backgroundColor: role.color },
          selected && styles.roleIconWrapperSelected,
        ]}
      >
        <Ionicons
          name={role.icon}
          size={28}
          color={selected ? "#16A34A" : role.iconColor}
        />
      </View>
      <Text style={[styles.roleLabel, selected && styles.roleLabelSelected]}>
        {role.label}
      </Text>
      {selected && (
        <View style={styles.roleCheck}>
          <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
        </View>
      )}
    </TouchableOpacity>
  );
}

// ── Main Screen ──
export default function RegisterScreen() {
  const { navigate, login } = useAppStore();
  const [step, setStep] = useState(1);

  // Step 1
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Step 2
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Step 3
  const [selectedRole, setSelectedRole] = useState(null);

  const stepTitles = ["Thông tin cá nhân", "Tạo mật khẩu", "Chọn vai trò"];

  return (
    <KeyboardAvoidingView style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={{ alignItems: "center", marginBottom: 12 }}>
          <Image
            source={require("../assets/VietDurian-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Step 3 has its own header style */}
        <>
          <Text style={styles.heading}>Đăng Ký tài khoản</Text>
          <StepIndicator current={step} total={3} />
          <Text style={styles.stepLabel}>{stepTitles[step - 1]}</Text>
        </>

        {/* Card */}
        <View style={styles.card}>
          {/* ── STEP 1 ── */}
          {step === 1 && (
            <>
              <Field
                label="Họ Tên"
                iconName="person-outline"
                placeholder="Nhập họ và tên"
                value={name}
                onChangeText={setName}
              />
              <Field
                label="Email"
                iconName="mail-outline"
                placeholder="Nhập email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />
              <Field
                label="Số điện thoại"
                iconName="call-outline"
                placeholder="Nhập số điện thoại"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => setStep(2)}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryBtnText}>Tiếp theo</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </TouchableOpacity>
            </>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <>
              <Field
                label="Mật Khẩu"
                iconName="lock-closed-outline"
                placeholder="Nhập mật khẩu"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                showToggle={showPass}
                onToggle={() => setShowPass(!showPass)}
              />
              <Field
                label="Xác nhận mật khẩu"
                iconName="lock-closed-outline"
                placeholder="Nhập lại mật khẩu"
                value={confirmPass}
                onChangeText={setConfirmPass}
                secureTextEntry={!showConfirm}
                showToggle={showConfirm}
                onToggle={() => setShowConfirm(!showConfirm)}
              />
              <View style={styles.btnRow}>
                <TouchableOpacity
                  style={styles.outlineBtn}
                  onPress={() => setStep(1)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="arrow-back" size={18} color="#16A34A" />
                  <Text style={styles.outlineBtnText}>Quay lại</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.primaryBtn, { flex: 1 }]}
                  onPress={() => setStep(3)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.primaryBtnText}>Tiếp theo</Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* ── STEP 3 ── */}
          {step === 3 && (
            <>
              <View style={styles.rolesGrid}>
                {ROLES.map((role) => (
                  <RoleCard
                    key={role.key}
                    role={role}
                    selected={selectedRole === role.key}
                    onSelect={setSelectedRole}
                  />
                ))}
              </View>
              <View style={styles.btnRow}>
                <TouchableOpacity
                  style={styles.outlineBtn}
                  onPress={() => setStep(2)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="arrow-back" size={18} color="#16A34A" />
                  <Text style={styles.outlineBtnText}>Quay lại</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.primaryBtn, { flex: 1 }]}
                  onPress={() => navigate("home")}
                  activeOpacity={0.85}
                >
                  <Text style={styles.primaryBtnText}>Đăng Ký</Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Divider + Google (all steps) */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>HOẶC</Text>
            <View style={styles.dividerLine} />
          </View>
          <TouchableOpacity style={styles.googleBtn} activeOpacity={0.85}>
            <Text style={styles.googleIcon}>G</Text>
            <Text style={styles.googleBtnText}>Đăng nhập bằng Google</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Đã có tài khoản? </Text>
          <TouchableOpacity onPress={() => navigate("login")}>
            <Text style={styles.footerLink}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F4F0" },
  content: {
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 32,
    backgroundColor: "#F0F4F0",
  },

  // Dots
  dotsContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 22,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#16A34A",
    opacity: 0.15,
  },

  logo: { width: 100, height: 80 },

  heading: {
    fontSize: 28,
    fontWeight: "800",
    color: "#16A34A",
    textAlign: "center",
    marginBottom: 20,
  },

  // Step indicator
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  stepItem: { flexDirection: "row", alignItems: "center" },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  stepCircleActive: { backgroundColor: "#16A34A" },
  stepCircleDone: { backgroundColor: "#16A34A" },
  stepNum: { fontSize: 14, fontWeight: "700", color: "#9CA3AF" },
  stepNumActive: { color: "#FFFFFF" },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 4,
  },
  stepLineDone: { backgroundColor: "#16A34A" },
  stepLabel: {
    textAlign: "center",
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
    marginBottom: 16,
  },

  // Step 3 header
  step3Header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 2,
  },
  step3Title: { fontSize: 22, fontWeight: "800", color: "#111827" },
  backLink: { flexDirection: "row", alignItems: "center", gap: 2 },
  backLinkText: { color: "#16A34A", fontSize: 14, fontWeight: "600" },

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
  input: { flex: 1, fontSize: 14, color: "#111827" },

  // Roles grid
  rolesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  roleCard: {
    width: "47%",
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    padding: 16,
    alignItems: "center",
    gap: 10,
    position: "relative",
  },
  roleCardSelected: {
    borderColor: "#16A34A",
    backgroundColor: "#F0FDF4",
  },
  roleIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  roleIconWrapperSelected: {
    backgroundColor: "#D1FAE5",
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
    lineHeight: 20,
  },
  roleLabelSelected: { color: "#16A34A" },
  roleCheck: {
    position: "absolute",
    top: 8,
    right: 8,
  },

  // Buttons
  primaryBtn: {
    height: 52,
    borderRadius: 12,
    backgroundColor: "#16A34A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryBtnDisabled: { backgroundColor: "#9CA3AF" },
  primaryBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  btnRow: { flexDirection: "row", gap: 10 },
  outlineBtn: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#16A34A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    gap: 6,
  },
  outlineBtnText: { color: "#16A34A", fontSize: 15, fontWeight: "600" },

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
  googleIcon: { fontSize: 16, fontWeight: "700", color: "#4285F4" },
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
});
