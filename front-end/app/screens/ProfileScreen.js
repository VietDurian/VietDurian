import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import FavoritePostsTab from "../components/FavoritePostsTab";
import { useProfileStore } from "../store/useProfileStore";
import { useAuthStore } from "../store/useAuthStore";

// ─── Config ───────────────────────────────────────────────────────────────────
const ROLE_CONFIG = {
  trader: { label: "Thương nhân", bg: ["#3b82f6", "#6366f1"] },
  farmer: { label: "Nông dân", bg: ["#10b981", "#059669"] },
  contentExpert: { label: "Chuyên gia", bg: ["#8b5cf6", "#ec4899"] },
  serviceProvider: { label: "Nhà cung cấp dịch vụ", bg: ["#f97316", "#ef4444"] },
};

const PASSWORD_RULES = [
  { id: "length", test: (p) => p.length >= 12, label: "Ít nhất 12 ký tự" },
  { id: "upper", test: (p) => /[A-Z]/.test(p), label: "Có chữ in hoa" },
  { id: "lower", test: (p) => /[a-z]/.test(p), label: "Có chữ thường" },
  { id: "number", test: (p) => /\d/.test(p), label: "Có ít nhất một số" },
  { id: "special", test: (p) => /[!@#$%^&*(),.?":{}|<>\[\]\\';`~+=\-_/]/.test(p), label: "Có ký tự đặc biệt (@, #, $...)" },
];

// ─── TabButton ────────────────────────────────────────────────────────────────
const TabButton = ({ iconName, label, active, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.tabBtn, active && styles.tabBtnActive]}
    activeOpacity={0.8}
  >
    <Ionicons name={iconName} size={18} color={active ? "#fff" : "#6b7280"} />
    <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
  </TouchableOpacity>
);

// ─── InfoField ────────────────────────────────────────────────────────────────
const InfoField = ({ iconName, label, value, verified }) => (
  <View style={styles.infoCard}>
    <View style={styles.infoIconWrap}>
      <Ionicons name={iconName} size={20} color="#10b981" />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={1}>{value}</Text>
    </View>
    {verified && (
      <Ionicons name="checkmark-circle" size={20} color="#10b981" />
    )}
  </View>
);

// ─── RoleBadge ────────────────────────────────────────────────────────────────
const RoleBadge = ({ role }) => {
  const config = ROLE_CONFIG[role] || { label: role, bg: ["#6b7280", "#4b5563"] };
  return (
    <View style={[styles.roleBadge, { backgroundColor: config.bg[0] }]}>
      <Ionicons name="ribbon" size={13} color="#fff" />
      <Text style={styles.roleBadgeText}>{config.label}</Text>
    </View>
  );
};

// ─── StatusRow ────────────────────────────────────────────────────────────────
const StatusRow = ({ iconName, label, value, valueColor }) => (
  <View style={styles.statusRow}>
    <View style={styles.statusRowLeft}>
      <Ionicons name={iconName} size={20} color="#10b981" />
      <Text style={styles.statusRowLabel}>{label}</Text>
    </View>
    <Text style={[styles.statusRowValue, valueColor ? { color: valueColor } : null]}>
      {value}
    </Text>
  </View>
);

// ─── PasswordRuleItem ─────────────────────────────────────────────────────────
const PasswordRuleItem = ({ rule, password }) => {
  const valid = rule.test(password);
  return (
    <View style={styles.ruleRow}>
      <Ionicons
        name={valid ? "checkmark-circle" : "ellipse-outline"}
        size={15}
        color={valid ? "#10b981" : "#d1d5db"}
      />
      <Text style={[styles.ruleText, valid && styles.ruleTextValid]}>{rule.label}</Text>
    </View>
  );
};

// ─── SecurityTab ─────────────────────────────────────────────────────────────
const PasswordInput = ({ field, label, placeholder, form, setForm, show, setShow }) => (
  <View style={{ marginBottom: 14 }}>
    <Text style={styles.inputLabel}>{label}</Text>
    <View style={styles.passwordWrap}>
      <TextInput
        style={styles.passwordInput}
        value={form[field]}
        onChangeText={(v) => setForm((p) => ({ ...p, [field]: v }))}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        secureTextEntry={!show[field]}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TouchableOpacity
        onPress={() => setShow((p) => ({ ...p, [field]: !p[field] }))}
        hitSlop={8}
      >
        <Ionicons name={show[field] ? "eye-off-outline" : "eye-outline"} size={20} color="#6b7280" />
      </TouchableOpacity>
    </View>
  </View>
);

const SecurityTab = () => {
  const { isChangingPassword, changePassword } = useProfileStore();
  const [form, setForm] = useState({ current: "", newPwd: "", confirm: "" });
  const [show, setShow] = useState({ current: false, newPwd: false, confirm: false });

  const allRulesPass = PASSWORD_RULES.every((r) => r.test(form.newPwd));
  const passwordsMatch = form.newPwd === form.confirm && form.confirm !== "";
  const canSubmit = allRulesPass && passwordsMatch && form.current !== "" && !isChangingPassword;

  const handleSubmit = async () => {
    const result = await changePassword(form.current, form.newPwd);
    if (result.success) {
      Alert.alert("Thành công", "Đổi mật khẩu thành công!");
      setForm({ current: "", newPwd: "", confirm: "" });
    } else {
      Alert.alert("Lỗi", result.message || "Đổi mật khẩu thất bại!");
    }
  };

  return (
    <View style={{ gap: 14 }}>
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Ionicons name="lock-closed-outline" size={20} color="#10b981" />
          <Text style={styles.sectionTitle}>Đổi mật khẩu</Text>
        </View>
        <PasswordInput field="current" label="Mật khẩu hiện tại" placeholder="Nhập mật khẩu hiện tại" form={form} setForm={setForm} show={show} setShow={setShow} />
        <PasswordInput field="newPwd" label="Mật khẩu mới" placeholder="Nhập mật khẩu mới" form={form} setForm={setForm} show={show} setShow={setShow} />
        <PasswordInput field="confirm" label="Xác nhận mật khẩu mới" placeholder="Nhập lại mật khẩu mới" form={form} setForm={setForm} show={show} setShow={setShow} />

        {form.confirm !== "" && (
          <View style={styles.matchRow}>
            <Ionicons
              name={passwordsMatch ? "checkmark-circle" : "close-circle"}
              size={15}
              color={passwordsMatch ? "#10b981" : "#ef4444"}
            />
            <Text style={[styles.matchText, { color: passwordsMatch ? "#10b981" : "#ef4444" }]}>
              {passwordsMatch ? "Mật khẩu khớp" : "Mật khẩu không khớp"}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.saveBtn, !canSubmit && styles.saveBtnDisabled, { marginTop: 4 }]}
          onPress={handleSubmit}
          disabled={!canSubmit}
          activeOpacity={0.85}
        >
          {isChangingPassword ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="lock-closed" size={16} color="#fff" />
              <Text style={styles.saveBtnText}>Cập nhật mật khẩu</Text>
            </>
          )}
        </TouchableOpacity>

        {form.newPwd !== "" && (
          <View style={styles.rulesBox}>
            <Text style={styles.rulesTitle}>Yêu cầu mật khẩu:</Text>
            {PASSWORD_RULES.map((r) => (
              <PasswordRuleItem key={r.id} rule={r} password={form.newPwd} />
            ))}
          </View>
        )}
      </View>

      <View style={styles.tipsCard}>
        <View style={styles.sectionHeader}>
          <Ionicons name="bulb-outline" size={20} color="#d97706" />
          <Text style={[styles.sectionTitle, { color: "#92400e" }]}>Mẹo bảo mật</Text>
        </View>
        {[
          "Sử dụng mật khẩu mạnh với ít nhất 12 ký tự",
          "Kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt",
          "Không sử dụng thông tin cá nhân dễ đoán",
          "Thay đổi mật khẩu định kỳ để bảo vệ tài khoản",
        ].map((tip, i) => (
          <View key={i} style={styles.tipRow}>
            <Text style={styles.tipDot}>•</Text>
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// ─── EditModal ────────────────────────────────────────────────────────────────
const EditModal = ({ visible, profileData, onClose, onSaved }) => {
  const fileInputRef = React.useRef(null);
  const { isSaving, updateProfile } = useProfileStore();
  const [editForm, setEditForm] = useState({ full_name: "", phone: "", avatar: "" });
  const [phoneError, setPhoneError] = useState("");

  useEffect(() => {
    if (visible && profileData) {
      setEditForm({
        full_name: profileData.full_name,
        phone: profileData.phone,
        avatar: profileData.avatar,
      });
      setPhoneError("");
    }
  }, [visible, profileData]);

  const handlePhoneChange = (value) => {
    setEditForm((p) => ({ ...p, phone: value }));
    const regex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (!value.trim()) setPhoneError("Vui lòng nhập số điện thoại");
    else if (!regex.test(value)) setPhoneError("Số không hợp lệ (10 số, bắt đầu 03/05/07/08/09)");
    else setPhoneError("");
  };

  const handlePickAvatar = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Thông báo", "Cần cấp quyền truy cập thư viện ảnh!");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });
      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
          Alert.alert("Thông báo", "Ảnh quá lớn. Tối đa 5MB!");
          return;
        }
        const base64Uri = `data:image/jpeg;base64,${asset.base64}`;
        setEditForm((p) => ({ ...p, avatar: base64Uri }));
      }
    } catch (err) {
      Alert.alert("Lỗi", "Không thể chọn ảnh. Vui lòng thử lại.");
    }
  };

  const canSave =
    !phoneError &&
    editForm.full_name.trim() &&
    editForm.phone.trim() &&
    (editForm.full_name !== profileData?.full_name ||
      editForm.phone !== profileData?.phone ||
      editForm.avatar !== profileData?.avatar);

  const handleSave = async () => {
    Keyboard.dismiss();
    const result = await updateProfile(editForm);
    if (result.success) {
      Alert.alert("Thành công", "Cập nhật thông tin thành công!");
      onSaved?.();
      onClose();
    } else {
      Alert.alert("Lỗi", result.message || "Cập nhật thất bại!");
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); onClose(); }}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.modalBox}>
                <View style={styles.modalHeader}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <Feather name="edit-2" size={18} color="#fff" />
                    <Text style={styles.modalTitle}>Chỉnh sửa thông tin</Text>
                  </View>
                  <TouchableOpacity onPress={onClose} hitSlop={8}>
                    <Ionicons name="close" size={22} color="#fff" />
                  </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.modalBody} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                  <View style={styles.avatarPickerWrap}>
                    <TouchableOpacity onPress={handlePickAvatar} activeOpacity={0.85}>
                      <Image source={{ uri: editForm.avatar || profileData?.avatar }} style={styles.editAvatar} />
                      <View style={styles.cameraBtn}>
                        <Ionicons name="camera" size={15} color="#fff" />
                      </View>
                    </TouchableOpacity>
                    <Text style={styles.avatarHint}>Nhấn ảnh để thay đổi (tối đa 5MB)</Text>
                  </View>

                  <View style={{ marginBottom: 14 }}>
                    <Text style={styles.inputLabel}>Họ và tên <Text style={{ color: "#ef4444" }}>*</Text></Text>
                    <TextInput
                      style={styles.input}
                      value={editForm.full_name}
                      onChangeText={(v) => setEditForm((p) => ({ ...p, full_name: v }))}
                      placeholder="Nhập họ và tên"
                      placeholderTextColor="#9ca3af"
                      returnKeyType="next"
                    />
                  </View>

                  <View style={{ marginBottom: 8 }}>
                    <Text style={styles.inputLabel}>Số điện thoại <Text style={{ color: "#ef4444" }}>*</Text></Text>
                    <TextInput
                      style={[styles.input, phoneError ? styles.inputError : null]}
                      value={editForm.phone}
                      onChangeText={handlePhoneChange}
                      placeholder="Nhập số điện thoại"
                      placeholderTextColor="#9ca3af"
                      keyboardType="phone-pad"
                      returnKeyType="done"
                      onSubmitEditing={Keyboard.dismiss}
                    />
                    {phoneError ? (
                      <View style={styles.errorRow}>
                        <Ionicons name="close-circle" size={13} color="#ef4444" />
                        <Text style={styles.errorText}>{phoneError}</Text>
                      </View>
                    ) : null}
                  </View>
                </ScrollView>

                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={[styles.saveBtn, (!canSave || isSaving) && styles.saveBtnDisabled]}
                    disabled={!canSave || isSaving}
                    onPress={handleSave}
                    activeOpacity={0.85}
                  >
                    {isSaving ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle" size={18} color="#fff" />
                        <Text style={styles.saveBtnText}>Lưu thay đổi</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { profileData, profileLoading, profileError, fetchProfile } = useProfileStore();
  const { logout } = useAuthStore();

  useEffect(() => { fetchProfile(); }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric", month: "long", day: "numeric",
    });
  };

  const handleLogout = () => {
    Alert.alert(
      "Đăng xuất",
      "Bạn có chắc muốn đăng xuất không?",
      [
        { text: "Hủy", style: "cancel" },
        { text: "Đăng xuất", style: "destructive", onPress: logout },
      ]
    );
  };

  if (profileLoading && !profileData) {
    return (
      <View style={styles.container}>
        <View style={styles.centerWrap}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.loadingText}>Đang tải thông tin...</Text>
        </View>
      </View>
    );
  }
  if (profileError && !profileData) {
    return (
      <View style={styles.container}>
        <View style={styles.centerWrap}>
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text style={styles.errorStateText}>{profileError}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchProfile}>
            <Text style={styles.retryBtnText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* Hero */}
      <View style={styles.heroBanner}>
        <View style={styles.heroInner}>
          <View style={{ position: "relative" }}>
            <Image source={{ uri: profileData?.avatar }} style={styles.avatar} />
            <View style={styles.verifiedBadge}>
              <Ionicons
                name={profileData?.is_verified ? "checkmark-circle" : "close-circle"}
                size={18}
                color={profileData?.is_verified ? "#10b981" : "#9ca3af"}
              />
            </View>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.heroName} numberOfLines={1}>{profileData?.full_name}</Text>
            <Text style={styles.heroEmail} numberOfLines={1}>{profileData?.email}</Text>
            <RoleBadge role={profileData?.role} />
          </View>

          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => setIsEditModalOpen(true)}
            activeOpacity={0.85}
          >
            <Feather name="edit-2" size={14} color="#10b981" />
            <Text style={styles.editBtnText}>Chỉnh sửa</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TabButton iconName="person-outline" label="Hồ sơ" active={activeTab === "profile"} onPress={() => setActiveTab("profile")} />
        <TabButton iconName="heart-outline" label="Yêu thích" active={activeTab === "favorites"} onPress={() => setActiveTab("favorites")} />
        <TabButton iconName="shield-outline" label="Bảo mật" active={activeTab === "security"} onPress={() => setActiveTab("security")} />
      </View>

      {/* Content */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab === "profile" && (
          <>
            <View style={styles.section}>
              <InfoField iconName="person-outline" label="Họ và tên" value={profileData?.full_name} />
              <InfoField iconName="mail-outline" label="Email" value={profileData?.email} verified={profileData?.is_verified} />
              <InfoField iconName="call-outline" label="Số điện thoại" value={profileData?.phone} />
              <InfoField iconName="calendar-outline" label="Ngày tham gia" value={formatDate(profileData?.created_at)} />
            </View>

            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="shield-outline" size={20} color="#10b981" />
                <Text style={styles.sectionTitle}>Trạng thái tài khoản</Text>
              </View>
              <StatusRow
                iconName="checkmark-circle-outline"
                label="Trạng thái"
                value={profileData?.is_banned ? "Bị khóa" : "Hoạt động"}
                valueColor={profileData?.is_banned ? "#ef4444" : "#10b981"}
              />
              <View style={styles.statusDivider} />
              <StatusRow
                iconName="mail-outline"
                label="Xác thực email"
                value={profileData?.is_verified ? "Đã xác thực" : "Chưa xác thực"}
                valueColor={profileData?.is_verified ? "#10b981" : "#f59e0b"}
              />
              <View style={styles.statusDivider} />
              <StatusRow
                iconName="time-outline"
                label="Cập nhật lần cuối"
                value={formatDate(profileData?.updated_at)}
              />
            </View>

            {/* ─── Logout Button ─── */}
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={handleLogout}
              activeOpacity={0.85}
            >
              <View style={styles.logoutIconWrap}>
                <Ionicons name="log-out-outline" size={20} color="#ef4444" />
              </View>
              <Text style={styles.logoutBtnText}>Đăng xuất</Text>
              <Ionicons name="chevron-forward" size={18} color="#ef4444" style={{ marginLeft: "auto" }} />
            </TouchableOpacity>
          </>
        )}

        {activeTab === "favorites" && (
          <FavoritePostsTab
            onContact={(favorite) => {
              const authorId = favorite.post_id?.author_id?._id;
              console.log("Navigate to chat with:", authorId);
            }}
          />
        )}

        {activeTab === "security" && <SecurityTab />}
      </ScrollView>

      <EditModal
        visible={isEditModalOpen}
        profileData={profileData}
        onClose={() => setIsEditModalOpen(false)}
        onSaved={() => { }}
      />

    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },

  centerWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 24 },
  loadingText: { fontSize: 14, color: "#6b7280" },
  errorStateText: { fontSize: 14, color: "#ef4444", textAlign: "center" },
  retryBtn: { marginTop: 8, backgroundColor: "#10b981", borderRadius: 10, paddingHorizontal: 24, paddingVertical: 10 },
  retryBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },

  heroBanner: { backgroundColor: "#10b981", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
  heroInner: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatar: { width: 68, height: 68, borderRadius: 34, borderWidth: 3, borderColor: "#fff" },
  verifiedBadge: {
    position: "absolute", bottom: -2, right: -2, backgroundColor: "#fff",
    borderRadius: 12, width: 22, height: 22, alignItems: "center", justifyContent: "center",
  },
  heroName: { color: "#fff", fontSize: 17, fontWeight: "700", marginBottom: 2 },
  heroEmail: { color: "#d1fae5", fontSize: 12, marginBottom: 8 },
  roleBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: "flex-start",
  },
  roleBadgeText: { color: "#fff", fontSize: 11, fontWeight: "600" },
  editBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "#fff", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
  },
  editBtnText: { color: "#10b981", fontSize: 12, fontWeight: "700" },

  tabBar: {
    flexDirection: "row", gap: 6, padding: 8,
    backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#e5e7eb",
  },
  tabBtn: {
    flex: 1, flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 10,
  },
  tabBtnActive: { backgroundColor: "#10b981" },
  tabLabel: { fontSize: 12, fontWeight: "600", color: "#6b7280" },
  tabLabelActive: { color: "#fff" },

  scrollContent: { padding: 16, gap: 14, paddingBottom: 32 },

  section: { gap: 10 },
  infoCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: "#fff", borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: "#e5e7eb",
  },
  infoIconWrap: { backgroundColor: "#ecfdf5", borderRadius: 10, padding: 10 },
  infoLabel: { fontSize: 12, color: "#6b7280", fontWeight: "500", marginBottom: 2 },
  infoValue: { fontSize: 15, fontWeight: "600", color: "#111827", flex: 1 },

  sectionCard: {
    backgroundColor: "#fff", borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: "#e5e7eb",
  },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#111827" },

  statusRow: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", paddingVertical: 10,
  },
  statusRowLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  statusRowLabel: { fontSize: 14, color: "#374151", fontWeight: "500" },
  statusRowValue: { fontSize: 14, fontWeight: "700", color: "#111827" },
  statusDivider: { height: 1, backgroundColor: "#f3f4f6" },

  tipsCard: {
    backgroundColor: "#fffbeb", borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: "#fde68a",
  },
  tipRow: { flexDirection: "row", gap: 8, marginBottom: 6 },
  tipDot: { color: "#d97706", fontSize: 14, marginTop: 1 },
  tipText: { fontSize: 13, color: "#78350f", flex: 1, lineHeight: 20 },

  rulesBox: { marginTop: 14, backgroundColor: "#f9fafb", borderRadius: 12, padding: 12, gap: 6 },
  rulesTitle: { fontSize: 13, fontWeight: "700", color: "#374151", marginBottom: 4 },
  ruleRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  ruleText: { fontSize: 13, color: "#9ca3af" },
  ruleTextValid: { color: "#10b981" },
  matchRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  matchText: { fontSize: 13 },

  passwordWrap: {
    flexDirection: "row", alignItems: "center",
    borderWidth: 1, borderColor: "#d1d5db", borderRadius: 12,
    paddingHorizontal: 14, backgroundColor: "#fff",
  },
  passwordInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: "#111827" },

  modalOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center", alignItems: "center", padding: 20,
  },
  modalBox: {
    backgroundColor: "#fff", borderRadius: 20,
    width: "100%", maxHeight: "85%", overflow: "hidden",
  },
  modalHeader: {
    backgroundColor: "#10b981", flexDirection: "row",
    alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 16,
  },
  modalTitle: { color: "#fff", fontSize: 17, fontWeight: "700" },
  modalBody: { padding: 20, paddingBottom: 8 },
  avatarPickerWrap: { alignItems: "center", marginBottom: 20 },
  editAvatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: "#10b981" },
  cameraBtn: {
    position: "absolute", bottom: 0, right: 0,
    backgroundColor: "#10b981", borderRadius: 20,
    width: 32, height: 32, alignItems: "center", justifyContent: "center",
  },
  avatarHint: { fontSize: 12, color: "#9ca3af", marginTop: 8, textAlign: "center" },
  inputLabel: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: "#d1d5db", borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: "#111827", backgroundColor: "#fff",
  },
  inputError: { borderColor: "#ef4444" },
  errorRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 5 },
  errorText: { fontSize: 12, color: "#ef4444" },
  modalFooter: {
    padding: 16, borderTopWidth: 1, borderTopColor: "#e5e7eb", backgroundColor: "#f9fafb",
  },
  saveBtn: {
    backgroundColor: "#10b981", borderRadius: 12,
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 14, minHeight: 50,
  },
  saveBtnDisabled: { opacity: 0.45 },
  saveBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },

  // ─── Logout ───
  logoutBtn: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: "#fff", borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: "#fecaca",
  },
  logoutIconWrap: {
    backgroundColor: "#fef2f2", borderRadius: 10, padding: 10,
  },
  logoutBtnText: { fontSize: 15, fontWeight: "700", color: "#ef4444" },
});