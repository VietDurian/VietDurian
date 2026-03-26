import { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
    ScrollView,
    TextInput,
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    Keyboard,
    Platform,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { usePostStore } from "../store/usePostStore";
import { useAppStore } from "../store/useAppStore";
import { useAuthStore } from "../store/useAuthStore";

// ── Constants ──────────────────────────────────────────────────────────────────
const CATEGORY_TAG_COLORS = {
    "Dịch vụ": { bg: "#dbeafe", text: "#1d4ed8" },
    "Kinh nghiệm": { bg: "#fef3c7", text: "#b45309" },
    "Sản phẩm": { bg: "#d1fae5", text: "#065f46" },
    "Thuê dịch vụ": { bg: "#ede9fe", text: "#5b21b6" },
    "Khác": { bg: "#f3f4f6", text: "#374151" },
};

const ICON_BY_CATEGORY = {
    "Dịch vụ": "construct-outline",
    "Kinh nghiệm": "book-outline",
    "Sản phẩm": "cube-outline",
    "Thuê dịch vụ": "cash-outline",
    "Khác": "grid-outline",
};

const STATUS_CONFIG = {
    pending: { icon: "time-outline", label: "Đang chờ duyệt", bg: "#fffbeb", border: "#fde68a", text: "#b45309" },
    active: { icon: "checkmark-circle-outline", label: "Đã duyệt", bg: "#ecfdf5", border: "#a7f3d0", text: "#065f46" },
    rejected: { icon: "close-circle-outline", label: "Bị từ chối", bg: "#fff1f2", border: "#fecaca", text: "#b91c1c" },
    inactive: { icon: "alert-circle-outline", label: "Ngưng hoạt động", bg: "#f9fafb", border: "#e5e7eb", text: "#6b7280" },
};

const REPORT_REASONS = [
    "Spam hoặc quảng cáo",
    "Thông tin sai lệch",
    "Nội dung không phù hợp",
    "Khác",
];

// ── Sub-components ─────────────────────────────────────────────────────────────
function CategoryBadge({ category }) {
    const colors = CATEGORY_TAG_COLORS[category];
    const icon = ICON_BY_CATEGORY[category];
    if (!colors || !icon) return null;
    return (
        <View style={[styles.catBadge, { backgroundColor: colors.bg }]}>
            <Ionicons name={icon} size={11} color={colors.text} />
            <Text style={[styles.catBadgeText, { color: colors.text }]}>{category}</Text>
        </View>
    );
}

function StatusBadge({ status }) {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    return (
        <View style={[styles.statusBadge, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
            <Ionicons name={cfg.icon} size={12} color={cfg.text} />
            <Text style={[styles.statusBadgeText, { color: cfg.text }]}>{cfg.label}</Text>
        </View>
    );
}

// ── Report Post Modal ──────────────────────────────────────────────────────────
function ReportPostModal({ visible, onClose, postId, postTitle }) {
    const { reportPost } = usePostStore();
    const [selectedReason, setSelectedReason] = useState("");
    const [customReason, setCustomReason] = useState("");
    const [imageUri, setImageUri] = useState(null);
    const [imageData, setImageData] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    // Reset khi đóng/mở
    useEffect(() => {
        if (!visible) {
            setSelectedReason("");
            setCustomReason("");
            setImageUri(null);
            setImageData(null);
            setError("");
            setSubmitted(false);
        }
    }, [visible]);

    const handlePickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Thông báo", "Cần cấp quyền truy cập thư viện ảnh!");
                return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ["images"],
                allowsEditing: true,
                quality: 0.8,
                base64: true,
            });
            if (!result.canceled && result.assets?.[0]) {
                const asset = result.assets[0];
                if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
                    setError("Ảnh không được vượt quá 5MB");
                    return;
                }
                setImageUri(asset.uri);
                setImageData(`data:image/jpeg;base64,${asset.base64}`);
                setError("");
            }
        } catch {
            setError("Không thể chọn ảnh. Vui lòng thử lại.");
        }
    };

    const getFinalReason = () => {
        if (selectedReason === "Khác") return customReason.trim();
        return selectedReason;
    };

    const handleSubmit = async () => {
        const reason = getFinalReason();
        if (!reason) {
            setError("Vui lòng chọn hoặc nhập lý do báo cáo");
            return;
        }
        setIsSubmitting(true);
        setError("");
        try {
            await reportPost(postId, reason, imageData);
            setSubmitted(true);
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Không thể gửi báo cáo, vui lòng thử lại"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const canSubmit =
        !isSubmitting &&
        !!selectedReason &&
        !(selectedReason === "Khác" && !customReason.trim());

    return (
        <Modal visible={visible} animationType="none" transparent onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={reportStyles.overlay}>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={reportStyles.sheet}>
                            {/* Header */}
                            <View style={reportStyles.header}>
                                <View style={reportStyles.headerLeft}>
                                    <View style={reportStyles.flagIconWrap}>
                                        <Ionicons name="flag" size={16} color="#f97316" />
                                    </View>
                                    <Text style={reportStyles.headerTitle}>Báo cáo bài viết</Text>
                                </View>
                                <TouchableOpacity onPress={onClose} style={reportStyles.closeBtn} hitSlop={8}>
                                    <Ionicons name="close" size={20} color="#6b7280" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView
                                style={reportStyles.body}
                                contentContainerStyle={reportStyles.bodyContent}
                                keyboardShouldPersistTaps="handled"
                                showsVerticalScrollIndicator={false}
                            >
                                {submitted ? (
                                    /* ── Success ── */
                                    <View style={reportStyles.successWrap}>
                                        <View style={reportStyles.successIcon}>
                                            <Ionicons name="checkmark" size={32} color="#f97316" />
                                        </View>
                                        <Text style={reportStyles.successTitle}>Đã gửi báo cáo</Text>
                                        <Text style={reportStyles.successDesc}>
                                            Cảm ơn bạn đã báo cáo. Chúng tôi sẽ xem xét và xử lý sớm nhất.
                                        </Text>
                                        <TouchableOpacity style={reportStyles.doneBtn} onPress={onClose} activeOpacity={0.85}>
                                            <Text style={reportStyles.doneBtnText}>Đóng</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    /* ── Form ── */
                                    <>
                                        {/* Post title preview */}
                                        {postTitle ? (
                                            <Text style={reportStyles.postPreview} numberOfLines={2}>{postTitle}</Text>
                                        ) : null}

                                        {/* Reason list */}
                                        <Text style={reportStyles.sectionLabel}>Lý do báo cáo</Text>
                                        <View style={reportStyles.reasonList}>
                                            {REPORT_REASONS.map((reason) => {
                                                const isSelected = selectedReason === reason;
                                                return (
                                                    <TouchableOpacity
                                                        key={reason}
                                                        style={[
                                                            reportStyles.reasonBtn,
                                                            isSelected && reportStyles.reasonBtnActive,
                                                        ]}
                                                        onPress={() => {
                                                            setSelectedReason(reason);
                                                            setError("");
                                                            if (reason !== "Khác") setCustomReason("");
                                                        }}
                                                        activeOpacity={0.8}
                                                    >
                                                        <Text
                                                            style={[
                                                                reportStyles.reasonBtnText,
                                                                isSelected && reportStyles.reasonBtnTextActive,
                                                            ]}
                                                        >
                                                            {reason}
                                                        </Text>
                                                        {isSelected && (
                                                            <Ionicons name="checkmark-circle" size={18} color="#f97316" />
                                                        )}
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>

                                        {/* Custom reason textarea */}
                                        {selectedReason === "Khác" && (
                                            <View style={{ marginTop: 12 }}>
                                                <Text style={reportStyles.sectionLabel}>Mô tả chi tiết</Text>
                                                <TextInput
                                                    style={reportStyles.textArea}
                                                    value={customReason}
                                                    onChangeText={(v) => { setCustomReason(v); setError(""); }}
                                                    placeholder="Nhập lý do cụ thể..."
                                                    placeholderTextColor="#9ca3af"
                                                    multiline
                                                    maxLength={500}
                                                    textAlignVertical="top"
                                                />
                                                <Text style={reportStyles.charCount}>{customReason.length}/500</Text>
                                            </View>
                                        )}

                                        {/* Image upload */}
                                        <View style={{ marginTop: 12 }}>
                                            <Text style={reportStyles.sectionLabel}>
                                                Ảnh minh chứng{" "}
                                                <Text style={reportStyles.optional}>(tuỳ chọn)</Text>
                                            </Text>
                                            {!imageUri ? (
                                                <TouchableOpacity
                                                    style={reportStyles.imagePicker}
                                                    onPress={handlePickImage}
                                                    activeOpacity={0.8}
                                                >
                                                    <Ionicons name="image-outline" size={26} color="#9ca3af" />
                                                    <Text style={reportStyles.imagePickerText}>Nhấn để tải ảnh lên</Text>
                                                    <Text style={reportStyles.imagePickerHint}>PNG, JPG tối đa 5MB</Text>
                                                </TouchableOpacity>
                                            ) : (
                                                <View style={reportStyles.imagePreviewWrap}>
                                                    <Image
                                                        source={{ uri: imageUri }}
                                                        style={reportStyles.imagePreview}
                                                        resizeMode="cover"
                                                    />
                                                    <TouchableOpacity
                                                        style={reportStyles.imageRemoveBtn}
                                                        onPress={() => { setImageUri(null); setImageData(null); }}
                                                    >
                                                        <Ionicons name="close" size={14} color="#fff" />
                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                        </View>

                                        {/* Error */}
                                        {error ? (
                                            <View style={reportStyles.errorRow}>
                                                <Ionicons name="alert-circle" size={16} color="#ef4444" />
                                                <Text style={reportStyles.errorText}>{error}</Text>
                                            </View>
                                        ) : null}

                                        {/* Submit button */}
                                        <TouchableOpacity
                                            style={[reportStyles.submitBtn, !canSubmit && reportStyles.submitBtnDisabled]}
                                            onPress={handleSubmit}
                                            disabled={!canSubmit}
                                            activeOpacity={0.85}
                                        >
                                            {isSubmitting ? (
                                                <ActivityIndicator size="small" color="#fff" />
                                            ) : (
                                                <>
                                                    <Ionicons name="flag" size={16} color="#fff" />
                                                    <Text style={reportStyles.submitBtnText}>Gửi báo cáo</Text>
                                                </>
                                            )}
                                        </TouchableOpacity>
                                    </>
                                )}
                            </ScrollView>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

// ── Favorite Post Card ─────────────────────────────────────────────────────────
function FavoritePostCard({ post, onUnfavorite }) {
    const { navigate, setSelectedPostId } = useAppStore();
    const { authUser } = useAuthStore();

    const currentUserId = authUser?._id || authUser?.id;
    const isOwnPost = currentUserId && post.authorId === currentUserId;

    const [reportVisible, setReportVisible] = useState(false);

    return (
        <>
            <View style={styles.card}>
                {/* Header */}
                <View style={styles.cardHeader}>
                    <Image
                        source={{ uri: post.userAvatar || "https://i.pravatar.cc/100" }}
                        style={styles.cardAvatar}
                    />
                    <View style={styles.cardAuthorInfo}>
                        <View style={styles.cardNameRow}>
                            <Text style={styles.cardAuthorName} numberOfLines={1}>{post.userName}</Text>
                            <CategoryBadge category={post.category} />
                            <StatusBadge status={post.status} />
                        </View>
                        <Text style={styles.cardMetaText} numberOfLines={1}>
                            {post.userHandle ? post.userHandle : ""}
                            {post.userHandle && post.timestamp ? "  ·  " : ""}
                            {post.timestamp}
                        </Text>
                    </View>

                    {/* Flag button — chỉ hiện với post của người khác */}
                    {!isOwnPost && (
                        <TouchableOpacity
                            style={styles.flagBtn}
                            onPress={() => setReportVisible(true)}
                            hitSlop={8}
                        >
                            <Ionicons name="flag-outline" size={18} color="#9ca3af" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Title */}
                {post.title ? <Text style={styles.cardTitle}>{post.title}</Text> : null}

                {/* Content */}
                <Text style={styles.cardContent} numberOfLines={4}>{post.content}</Text>

                {/* Contact */}
                {post.contact ? (
                    <View style={styles.contactRow}>
                        <Text style={styles.contactLabel}>Liên hệ: </Text>
                        <Text style={styles.contactValue}>{post.contact}</Text>
                    </View>
                ) : null}

                {/* Image */}
                {post.image ? (
                    <View style={styles.cardImageWrap}>
                        <Image source={{ uri: post.image }} style={styles.cardImage} resizeMode="cover" />
                    </View>
                ) : null}

                {/* Actions */}
                <View style={styles.cardActions}>
                    {/* Heart — filled red, tap to unfavorite instantly */}
                    <TouchableOpacity
                        style={[styles.actionBtn, styles.actionBtnLiked]}
                        onPress={() => onUnfavorite(post.id)}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="heart" size={22} color="#ef4444" />
                    </TouchableOpacity>

                    {/* Comment icon — navigate to CommentScreen */}
                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => {
                            setSelectedPostId(post.id);
                            navigate("comment");
                        }}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="chatbubble-outline" size={22} color="#6b7280" />
                        {post.comments > 0 && (
                            <Text style={styles.actionCount}>{post.comments}</Text>
                        )}
                    </TouchableOpacity>

                    {/* Contact */}
                    <TouchableOpacity style={styles.contactBtn} activeOpacity={0.85}>
                        <Text style={styles.contactBtnText}>Liên Hệ</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Report Modal */}
            <ReportPostModal
                visible={reportVisible}
                onClose={() => setReportVisible(false)}
                postId={post.id}
                postTitle={post.title || post.content?.slice(0, 80)}
            />
        </>
    );
}

// ── FavoritePostsTab (main export) ─────────────────────────────────────────────
export default function FavoritePostsTab() {
    const { favorites, favoritesLoading, favoritesError, fetchFavorites, removeFavorite } = usePostStore();

    useEffect(() => {
        fetchFavorites();
    }, []);

    if (favoritesLoading) {
        return (
            <View style={styles.centerWrap}>
                <ActivityIndicator size="large" color="#10b981" />
                <Text style={styles.loadingText}>Đang tải bài viết yêu thích...</Text>
            </View>
        );
    }

    if (favoritesError) {
        return (
            <View style={styles.centerWrap}>
                <Ionicons name="alert-circle-outline" size={40} color="#ef4444" />
                <Text style={styles.errorText}>{favoritesError}</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={fetchFavorites} activeOpacity={0.85}>
                    <Text style={styles.retryBtnText}>Thử lại</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (favorites.length === 0) {
        return (
            <View style={styles.emptyWrap}>
                <View style={styles.emptyIconWrap}>
                    <Ionicons name="heart-outline" size={48} color="#f9a8d4" />
                </View>
                <Text style={styles.emptyTitle}>Chưa có bài viết yêu thích</Text>
                <Text style={styles.emptyDesc}>Các bài viết bạn yêu thích sẽ xuất hiện ở đây.</Text>
            </View>
        );
    }

    return (
        <View>
            {/* Header count */}
            <View style={styles.favHeader}>
                <Ionicons name="heart" size={20} color="#f43f5e" />
                <Text style={styles.favHeaderText}>Bài viết yêu thích</Text>
                <View style={styles.favCount}>
                    <Text style={styles.favCountText}>{favorites.length}</Text>
                </View>
            </View>

            {/* List */}
            {favorites.map((fav) => (
                <FavoritePostCard
                    key={fav.favId}
                    post={fav}
                    onUnfavorite={removeFavorite}
                />
            ))}
        </View>
    );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    centerWrap: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
        gap: 12,
    },
    loadingText: { fontSize: 14, color: "#6b7280" },
    errorText: { fontSize: 14, color: "#ef4444", textAlign: "center" },
    retryBtn: { backgroundColor: "#10b981", borderRadius: 10, paddingHorizontal: 20, paddingVertical: 9 },
    retryBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },

    // Fav header
    favHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 14,
    },
    favHeaderText: { fontSize: 15, fontWeight: "700", color: "#111827", flex: 1 },
    favCount: {
        backgroundColor: "#ffe4e6",
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 3,
    },
    favCountText: { fontSize: 13, fontWeight: "700", color: "#f43f5e" },

    // Card
    card: {
        backgroundColor: "#fff",
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        marginBottom: 14,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "flex-start",
        padding: 16,
        paddingBottom: 10,
        gap: 12,
    },
    cardAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 2,
        borderColor: "#f3f4f6",
    },
    cardAuthorInfo: { flex: 1 },
    cardNameRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        flexWrap: "wrap",
        marginBottom: 3,
    },
    cardAuthorName: { fontSize: 14, fontWeight: "700", color: "#111827" },
    cardMetaText: { fontSize: 12, color: "#9ca3af" },

    catBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 20,
    },
    catBadgeText: { fontSize: 11, fontWeight: "700" },

    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 20,
        borderWidth: 1,
    },
    statusBadgeText: { fontSize: 11, fontWeight: "600" },

    // Flag button
    flagBtn: {
        padding: 6,
        borderRadius: 20,
    },

    cardTitle: {
        fontSize: 15,
        fontWeight: "800",
        color: "#111827",
        lineHeight: 22,
        paddingHorizontal: 16,
        paddingBottom: 6,
    },
    cardContent: {
        fontSize: 14,
        color: "#4b5563",
        lineHeight: 21,
        paddingHorizontal: 16,
        paddingBottom: 10,
    },
    contactRow: {
        flexDirection: "row",
        paddingHorizontal: 16,
        paddingBottom: 10,
    },
    contactLabel: { fontSize: 13, fontWeight: "600", color: "#6b7280" },
    contactValue: { fontSize: 13, fontWeight: "700", color: "#059669" },
    cardImageWrap: {
        marginHorizontal: 16,
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#e5e7eb",
    },
    cardImage: { width: "100%", height: 200 },

    cardActions: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: "#f3f4f6",
    },
    actionBtn: { flexDirection: "row", alignItems: "center", gap: 5, padding: 8, borderRadius: 10 },
    actionBtnLiked: { backgroundColor: "#fff1f2" },
    actionCount: { fontSize: 13, fontWeight: "600", color: "#6b7280" },
    contactBtn: {
        backgroundColor: "#16a34a",
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 8,
    },
    contactBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },

    // Empty
    emptyWrap: {
        alignItems: "center",
        paddingVertical: 60,
        gap: 12,
    },
    emptyIconWrap: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#fff1f2",
        alignItems: "center",
        justifyContent: "center",
    },
    emptyTitle: { fontSize: 17, fontWeight: "700", color: "#111827" },
    emptyDesc: { fontSize: 13, color: "#9ca3af", textAlign: "center", lineHeight: 20, maxWidth: 260 },
});

// ── Report Modal Styles ────────────────────────────────────────────────────────
const reportStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    sheet: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: "88%",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f3f4f6",
    },
    headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
    flagIconWrap: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#fff7ed",
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
    closeBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#f3f4f6",
        alignItems: "center",
        justifyContent: "center",
    },

    body: { flexShrink: 1 },
    bodyContent: { padding: 20, paddingBottom: 36 },

    postPreview: {
        fontSize: 13,
        color: "#6b7280",
        backgroundColor: "#f9fafb",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 16,
        lineHeight: 19,
    },

    sectionLabel: {
        fontSize: 13,
        fontWeight: "700",
        color: "#374151",
        marginBottom: 10,
    },
    optional: { fontSize: 12, fontWeight: "400", color: "#9ca3af" },

    reasonList: { gap: 8 },
    reasonBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: "#e5e7eb",
        backgroundColor: "#fff",
    },
    reasonBtnActive: {
        borderColor: "#f97316",
        backgroundColor: "#fff7ed",
    },
    reasonBtnText: { fontSize: 14, fontWeight: "500", color: "#374151" },
    reasonBtnTextActive: { color: "#c2410c", fontWeight: "600" },

    textArea: {
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 14,
        color: "#111827",
        backgroundColor: "#fff",
        minHeight: 90,
    },
    charCount: { fontSize: 11, color: "#9ca3af", textAlign: "right", marginTop: 4 },

    imagePicker: {
        borderWidth: 2,
        borderStyle: "dashed",
        borderColor: "#d1d5db",
        borderRadius: 12,
        paddingVertical: 24,
        alignItems: "center",
        gap: 6,
        backgroundColor: "#fafafa",
    },
    imagePickerText: { fontSize: 13, fontWeight: "600", color: "#6b7280" },
    imagePickerHint: { fontSize: 11, color: "#9ca3af" },

    imagePreviewWrap: {
        borderRadius: 12,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#e5e7eb",
        position: "relative",
    },
    imagePreview: { width: "100%", height: 160 },
    imageRemoveBtn: {
        position: "absolute",
        top: 8,
        right: 8,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "#ef4444",
        alignItems: "center",
        justifyContent: "center",
    },

    errorRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "#fef2f2",
        borderWidth: 1,
        borderColor: "#fecaca",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginTop: 12,
    },
    errorText: { fontSize: 13, color: "#ef4444", flex: 1 },

    submitBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "#f97316",
        borderRadius: 14,
        paddingVertical: 16,
        marginTop: 20,
    },
    submitBtnDisabled: { opacity: 0.5 },
    submitBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },

    // Success
    successWrap: { alignItems: "center", paddingVertical: 20, gap: 12 },
    successIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "#fff7ed",
        alignItems: "center",
        justifyContent: "center",
    },
    successTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
    successDesc: { fontSize: 14, color: "#6b7280", textAlign: "center", lineHeight: 20, maxWidth: 280 },
    doneBtn: {
        marginTop: 8,
        backgroundColor: "#f97316",
        borderRadius: 12,
        paddingHorizontal: 32,
        paddingVertical: 12,
    },
    doneBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
});