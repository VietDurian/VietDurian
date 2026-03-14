import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import Header from "../components/Header";
import BottomTabBar from "../components/BottomTabBar";

// ─── Mock data (xoá khi gắn API) ─────────────────────────────────────────────
const MOCK_PROFILE = {
  full_name: "Nguyễn Văn An",
  email: "nguyenvanan@email.com",
  phone: "0912345678",
  avatar: "https://i.pravatar.cc/150?img=12",
  role: "farmer",
  is_verified: true,
  is_banned: false,
  created_at: "2023-06-15T00:00:00Z",
  updated_at: "2024-11-20T00:00:00Z",
};

// ─── Role config ──────────────────────────────────────────────────────────────
const ROLE_CONFIG = {
  trader: { label: "Thương nhân" },
  farmer: { label: "Nông dân" },
  contentExpert: { label: "Chuyên gia" },
  serviceProvider: { label: "Nhà cung cấp dịch vụ" },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

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

const InfoField = ({ iconName, label, value, verified }) => (
  <View style={styles.infoCard}>
    <View style={styles.infoIconWrap}>
      <Ionicons name={iconName} size={20} color="#10b981" />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.infoLabel}>{label}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <Text style={styles.infoValue}>{value}</Text>
        {verified && <Ionicons name="checkmark-circle" size={15} color="#10b981" />}
      </View>
    </View>
  </View>
);

const RoleBadge = ({ role }) => {
  const config = ROLE_CONFIG[role] || { label: role };
  return (
    <View style={styles.roleBadge}>
      <Ionicons name="ribbon-outline" size={13} color="#fff" />
      <Text style={styles.roleBadgeText}>{config.label}</Text>
    </View>
  );
};

const StatusCard = ({ iconName, label, value }) => (
  <View style={styles.statusCard}>
    <Ionicons name={iconName} size={22} color="#10b981" />
    <View style={{ marginTop: 8 }}>
      <Text style={styles.statusLabel}>{label}</Text>
      <Text style={styles.statusValue}>{value}</Text>
    </View>
  </View>
);

// ─── Placeholder tabs ─────────────────────────────────────────────────────────

const FavoritesTab = () => (
  <View style={styles.placeholderWrap}>
    <Ionicons name="heart-outline" size={48} color="#d1d5db" />
    <Text style={styles.placeholderText}>Bài viết yêu thích sẽ hiển thị ở đây</Text>
  </View>
);

const SecurityTab = () => (
  <View style={styles.placeholderWrap}>
    <Ionicons name="shield-outline" size={48} color="#d1d5db" />
    <Text style={styles.placeholderText}>Tính năng bảo mật sẽ hiển thị ở đây</Text>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState("profile");
  const [profileData] = useState(MOCK_PROFILE);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: MOCK_PROFILE.full_name,
    phone: MOCK_PROFILE.phone,
    avatar: MOCK_PROFILE.avatar,
  });
  const [phoneError, setPhoneError] = useState("");

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const handlePhoneChange = (value) => {
    setEditForm((prev) => ({ ...prev, phone: value }));
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (!value.trim()) {
      setPhoneError("Vui lòng nhập số điện thoại");
    } else if (!phoneRegex.test(value)) {
      setPhoneError("Số không hợp lệ (10 số, bắt đầu 03/05/07/08/09)");
    } else {
      setPhoneError("");
    }
  };

  const canSave =
    !phoneError &&
    editForm.full_name.trim() &&
    editForm.phone.trim() &&
    (editForm.full_name !== profileData.full_name ||
      editForm.phone !== profileData.phone ||
      editForm.avatar !== profileData.avatar);

  return (
    <SafeAreaView style={styles.container}>
      <Header />

      {/* ── Hero banner ── */}
      <View style={styles.heroBanner}>
        <View style={styles.heroInner}>
          <View style={{ position: "relative" }}>
            <Image source={{ uri: profileData.avatar }} style={styles.avatar} />
            <View style={styles.verifiedBadge}>
              <Ionicons
                name={profileData.is_verified ? "checkmark-circle" : "close-circle"}
                size={18}
                color={profileData.is_verified ? "#10b981" : "#9ca3af"}
              />
            </View>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.heroName}>{profileData.full_name}</Text>
            <Text style={styles.heroEmail}>{profileData.email}</Text>
            <RoleBadge role={profileData.role} />
          </View>

          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => setIsEditModalOpen(true)}
            activeOpacity={0.85}
          >
            <Feather name="edit-2" size={14} color="#10b981" />
            <Text style={styles.editBtnText}>Sửa</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Tab navigation ── */}
      <View style={styles.tabBar}>
        <TabButton
          iconName="person-outline"
          label="Hồ sơ"
          active={activeTab === "profile"}
          onPress={() => setActiveTab("profile")}
        />
        <TabButton
          iconName="heart-outline"
          label="Yêu thích"
          active={activeTab === "favorites"}
          onPress={() => setActiveTab("favorites")}
        />
        <TabButton
          iconName="shield-outline"
          label="Bảo mật"
          active={activeTab === "security"}
          onPress={() => setActiveTab("security")}
        />
      </View>

      {/* ── Tab content ── */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "profile" && (
          <>
            <View style={styles.section}>
              <InfoField iconName="person-outline" label="Họ và tên" value={profileData.full_name} />
              <InfoField iconName="mail-outline" label="Email" value={profileData.email} verified={profileData.is_verified} />
              <InfoField iconName="call-outline" label="Số điện thoại" value={profileData.phone} />
              <InfoField iconName="calendar-outline" label="Ngày tham gia" value={formatDate(profileData.created_at)} />
            </View>

            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="shield-outline" size={20} color="#10b981" />
                <Text style={styles.sectionTitle}>Trạng thái tài khoản</Text>
              </View>
              <View style={styles.statusGrid}>
                <StatusCard
                  iconName="checkmark-circle-outline"
                  label="Trạng thái"
                  value={profileData.is_banned ? "Bị khóa" : "Hoạt động"}
                />
                <StatusCard
                  iconName="mail-outline"
                  label="Xác thực email"
                  value={profileData.is_verified ? "Đã xác thực" : "Chưa xác thực"}
                />
                <StatusCard
                  iconName="time-outline"
                  label="Cập nhật cuối"
                  value={formatDate(profileData.updated_at)}
                />
              </View>
            </View>
          </>
        )}

        {activeTab === "favorites" && <FavoritesTab />}
        {activeTab === "security" && <SecurityTab />}
      </ScrollView>

      <BottomTabBar />

      {/* ── Edit Modal ── */}
      <Modal
        visible={isEditModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsEditModalOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsEditModalOpen(false)}>
          <Pressable style={styles.modalBox} onPress={() => { }}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Feather name="edit-2" size={18} color="#fff" />
                <Text style={styles.modalTitle}>Chỉnh sửa thông tin</Text>
              </View>
              <TouchableOpacity onPress={() => setIsEditModalOpen(false)} hitSlop={8}>
                <Ionicons name="close" size={22} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
              <View style={{ alignItems: "center", marginBottom: 4 }}>
                <View style={{ position: "relative" }}>
                  <Image
                    source={{ uri: editForm.avatar || profileData.avatar }}
                    style={styles.editAvatar}
                  />
                  <TouchableOpacity style={styles.cameraBtn} activeOpacity={0.85}>
                    <Ionicons name="camera" size={15} color="#fff" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.avatarHint}>
                  Nhấn biểu tượng camera để đổi ảnh (tối đa 5MB)
                </Text>
              </View>

              <View>
                <Text style={styles.inputLabel}>
                  Họ và tên <Text style={{ color: "#ef4444" }}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  value={editForm.full_name}
                  onChangeText={(v) => setEditForm((p) => ({ ...p, full_name: v }))}
                  placeholder="Nhập họ và tên"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View>
                <Text style={styles.inputLabel}>
                  Số điện thoại <Text style={{ color: "#ef4444" }}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, phoneError ? styles.inputError : null]}
                  value={editForm.phone}
                  onChangeText={handlePhoneChange}
                  placeholder="Nhập số điện thoại"
                  placeholderTextColor="#9ca3af"
                  keyboardType="phone-pad"
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
                style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
                disabled={!canSave}
                activeOpacity={0.85}
              >
                <Ionicons name="checkmark-circle" size={18} color="#fff" />
                <Text style={styles.saveBtnText}>Lưu thay đổi</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },

  heroBanner: { backgroundColor: "#10b981", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
  heroInner: { flexDirection: "row", alignItems: "flex-start", gap: 14 },
  avatar: { width: 68, height: 68, borderRadius: 34, borderWidth: 3, borderColor: "#fff" },
  verifiedBadge: {
    position: "absolute", bottom: -2, right: -2,
    backgroundColor: "#fff", borderRadius: 12,
    width: 22, height: 22, alignItems: "center", justifyContent: "center",
  },
  heroName: { color: "#fff", fontSize: 18, fontWeight: "700", marginBottom: 2 },
  heroEmail: { color: "#d1fae5", fontSize: 12, marginBottom: 8 },
  roleBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
    alignSelf: "flex-start", backgroundColor: "rgba(255,255,255,0.2)",
  },
  roleBadgeText: { color: "#fff", fontSize: 11, fontWeight: "600" },
  editBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "#fff", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
  },
  editBtnText: { color: "#10b981", fontSize: 13, fontWeight: "600" },

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

  scrollContent: { padding: 16, gap: 14, paddingBottom: 20 },

  section: { gap: 10 },
  infoCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: "#fff", borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: "#e5e7eb",
  },
  infoIconWrap: { backgroundColor: "#ecfdf5", borderRadius: 10, padding: 10 },
  infoLabel: { fontSize: 12, color: "#6b7280", fontWeight: "500", marginBottom: 2 },
  infoValue: { fontSize: 15, fontWeight: "600", color: "#111827" },

  sectionCard: {
    backgroundColor: "#fff", borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: "#e5e7eb",
  },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
  sectionTitle: { fontSize: 15, fontWeight: "600", color: "#111827" },
  statusGrid: { flexDirection: "row", gap: 8 },
  statusCard: { flex: 1, backgroundColor: "#ecfdf5", borderRadius: 12, padding: 12 },
  statusLabel: { fontSize: 11, color: "#6b7280", marginTop: 4 },
  statusValue: { fontSize: 13, fontWeight: "600", color: "#111827", marginTop: 2 },

  placeholderWrap: { alignItems: "center", justifyContent: "center", paddingVertical: 60, gap: 12 },
  placeholderText: { fontSize: 14, color: "#9ca3af", textAlign: "center" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalBox: {
    backgroundColor: "#fff", borderTopLeftRadius: 24,
    borderTopRightRadius: 24, maxHeight: "90%", overflow: "hidden",
  },
  modalHeader: {
    backgroundColor: "#10b981", flexDirection: "row",
    alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 16,
  },
  modalTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
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
  modalFooter: { padding: 16, borderTopWidth: 1, borderTopColor: "#e5e7eb", backgroundColor: "#f9fafb" },
  saveBtn: {
    backgroundColor: "#10b981", borderRadius: 12,
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 14,
  },
  saveBtnDisabled: { opacity: 0.45 },
  saveBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});