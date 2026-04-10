import { useRef, useState } from "react";
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
  maxLength,
  onFocus,
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
          maxLength={maxLength}
          onFocus={onFocus}
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
  const { navigate } = useAppStore();
  const {
    signup,
    checkEmailExists,
    verifyEmail,
    resendVerificationOtp,
    isSigningUp,
    isVerifyingEmail,
    isResendingOtp,
  } = useAuthStore();
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

  // Step 4
  const [otp, setOtp] = useState("");
  const scrollRef = useRef(null);

  const totalSteps = 4;
  const stepTitles = [
    "Thông tin cá nhân",
    "Tạo mật khẩu",
    "Chọn vai trò",
    "Xác thực email",
  ];

  const normalizeRole = (role) => {
    if (role === "service") return "serviceProvider";
    if (role === "content") return "contentExpert";
    return role;
  };

  const handleStep1Next = async () => {
    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone.replace(/\D/g, "");

    if (!trimmedName || trimmedName.length < 2) {
      Toast.show({ type: "error", text1: "Vui lòng nhập họ tên hợp lệ" });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      Toast.show({ type: "error", text1: "Email không đúng định dạng" });
      return;
    }

    if (!/^0\d{9}$/.test(normalizedPhone)) {
      Toast.show({
        type: "error",
        text1: "Số điện thoại phải gồm 10 số và bắt đầu bằng số 0",
      });
      return;
    }

    const exists = await checkEmailExists(normalizedEmail);
    if (exists === true) {
      Toast.show({ type: "error", text1: "Email đã được sử dụng" });
      return;
    }

    if (exists === null) {
      Toast.show({
        type: "error",
        text1: "Không thể kiểm tra email. Vui lòng thử lại",
      });
      return;
    }

    setName(trimmedName);
    setEmail(normalizedEmail);
    setPhone(normalizedPhone);
    setStep(2);
  };

  const handleStep2Next = () => {
    if (!password) {
      Toast.show({ type: "error", text1: "Vui lòng nhập mật khẩu" });
      return;
    }

    if (!isStrongPassword(password)) {
      Toast.show({
        type: "error",
        text1: "Mật khẩu chưa đáp ứng các yêu cầu",
      });
      return;
    }

    if (password !== confirmPass) {
      Toast.show({ type: "error", text1: "Mật khẩu xác nhận không khớp" });
      return;
    }

    setStep(3);
  };

  const handleRegister = async () => {
    if (!selectedRole) {
      Toast.show({ type: "error", text1: "Vui lòng chọn vai trò" });
      return;
    }

    const registerPayload = {
      full_name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      phone: phone.trim(),
      role: normalizeRole(selectedRole),
    };

    const result = await signup(registerPayload);
    if (result) {
      setOtp("");
      setStep(4);
    }
  };

  const handleVerifyOtp = async () => {
    const normalizedOtp = otp.trim();
    if (!/^\d{6}$/.test(normalizedOtp)) {
      Toast.show({ type: "error", text1: "OTP phải gồm đúng 6 chữ số" });
      return;
    }

    const result = await verifyEmail({
      email: email.trim().toLowerCase(),
      otp: normalizedOtp,
    });
    if (result) {
      Toast.show({
        type: "success",
        text1: "Xác thực thành công, vui lòng đăng nhập",
      });
      navigate("login");
    }
  };

  const handleResendOtp = async () => {
    await resendVerificationOtp(email.trim().toLowerCase());
  };

  const scrollToInput = () => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 16 : 0}
    >
      <ScrollView
        ref={scrollRef}
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
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
          <StepIndicator current={step} total={totalSteps} />
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
                onFocus={scrollToInput}
              />
              <Field
                label="Email"
                iconName="mail-outline"
                placeholder="Nhập email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                onFocus={scrollToInput}
              />
              <Field
                label="Số điện thoại"
                iconName="call-outline"
                placeholder="Nhập số điện thoại"
                value={phone}
                onChangeText={(text) =>
                  setPhone(text.replace(/\D/g, "").slice(0, 10))
                }
                keyboardType="phone-pad"
                maxLength={10}
                onFocus={scrollToInput}
              />
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleStep1Next}
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
                onFocus={scrollToInput}
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
                onFocus={scrollToInput}
              />

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
                  onPress={handleStep2Next}
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
                  style={[
                    styles.primaryBtn,
                    { flex: 1 },
                    isSigningUp && styles.primaryBtnDisabled,
                  ]}
                  onPress={handleRegister}
                  disabled={isSigningUp}
                  activeOpacity={0.85}
                >
                  <Text style={styles.primaryBtnText}>
                    {isSigningUp ? "Đang đăng ký..." : "Đăng Ký"}
                  </Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* ── STEP 4 ── */}
          {step === 4 && (
            <>
              <Text style={styles.otpHint}>
                Mã OTP đã được gửi đến email {email}. Vui lòng nhập để hoàn tất
                đăng ký.
              </Text>
              <Field
                label="Mã OTP"
                iconName="shield-checkmark-outline"
                placeholder="Nhập mã OTP gồm 6 chữ số"
                value={otp}
                onChangeText={(text) => setOtp(text.replace(/\D/g, ""))}
                keyboardType="number-pad"
                maxLength={6}
                onFocus={scrollToInput}
              />

              <View style={styles.btnRow}>
                <TouchableOpacity
                  style={styles.outlineBtn}
                  onPress={() => setStep(3)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="arrow-back" size={18} color="#16A34A" />
                  <Text style={styles.outlineBtnText}>Quay lại</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.primaryBtn,
                    { flex: 1 },
                    isVerifyingEmail && styles.primaryBtnDisabled,
                  ]}
                  onPress={handleVerifyOtp}
                  disabled={isVerifyingEmail}
                  activeOpacity={0.85}
                >
                  <Text style={styles.primaryBtnText}>
                    {isVerifyingEmail ? "Đang xác thực..." : "Xác thực"}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.resendBtn}
                onPress={handleResendOtp}
                disabled={isResendingOtp}
                activeOpacity={0.8}
              >
                <Text style={styles.resendBtnText}>
                  {isResendingOtp ? "Đang gửi lại OTP..." : "Gửi lại OTP"}
                </Text>
              </TouchableOpacity>
            </>
          )}
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
  otpHint: {
    color: "#4B5563",
    fontSize: 13,
    lineHeight: 20,
  },
  resendBtn: {
    alignSelf: "center",
    paddingVertical: 4,
  },
  resendBtnText: {
    color: "#16A34A",
    fontSize: 14,
    fontWeight: "600",
  },
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
