/**
 * ProductRating.js (component)
 * - Fix bàn phím che modal: dùng KeyboardAvoidingView + ScrollView bên trong modal
 * - Tích hợp backend qua useProductStore
 * - Dãy sao tương tác lớn bên ngoài → bấm → mở modal
 * - Horizontal scroll cards
 * - Rating modal + Detail modal
 */

import {
    StyleSheet, Text, View, ScrollView, TouchableOpacity,
    TextInput, Modal, Alert, Dimensions, Platform,
    KeyboardAvoidingView,
} from "react-native";
import { useState, useEffect } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import { useProductStore } from "../store/useProductStore";
import { useAppStore } from "../store/useAppStore";

const { width: SCREEN_W } = Dimensions.get("window");

// ── Mock fallback (dùng khi backend chưa có) ─────────────────────────────────
const MOCK_USER_ID = "u_me";
const MOCK_STATS = { averageRating: 4.7, totalRatings: 4 };
const MOCK_OWN = {
    id: "r_own", userName: "Tôi", userId: MOCK_USER_ID, rating: 4,
    comment: "Ngon lắm, hạt lép, cơm vàng ươm. Sẽ mua lại lần sau.", date: "20/05/2024",
};
const MOCK_OTHERS = [
    { id: "r1", userName: "Trần Thị B", userId: "u2", rating: 5, comment: "Sầu riêng rất ngon, múi dày, vị béo ngậy. Đóng gói cẩn thận, giao hàng nhanh. Sẽ ủng hộ thêm lần sau!", date: "15/05/2024" },
    { id: "r2", userName: "Lê Văn C", userId: "u3", rating: 4, comment: "Chất lượng tốt, giá hợp lý. Hương thơm đặc trưng của Ri6.", date: "10/05/2024" },
    { id: "r3", userName: "Phạm Thị D", userId: "u4", rating: 5, comment: "Tuyệt vời! Đúng như quảng cáo. Sẽ giới thiệu cho bạn bè.", date: "05/05/2024" },
];
// ─────────────────────────────────────────────────────────────────────────────

// ── Sub-components ────────────────────────────────────────────────────────────

/** Sao tĩnh nhỏ */
function StarRow({ rating, size = 18 }) {
    return (
        <View style={{ flexDirection: "row", gap: 1 }}>
            {[1, 2, 3, 4, 5].map((s) => (
                <Ionicons
                    key={s}
                    name={s <= Math.floor(rating) ? "star" : "star-outline"}
                    size={size}
                    color={s <= Math.floor(rating) ? "#FBBF24" : "#D1D5DB"}
                />
            ))}
        </View>
    );
}

/**
 * Dãy sao tương tác lớn (ngoài màn hình)
 * Bấm 1 sao → setCurrentRating(s) → gọi onStarClick(s)
 */
function InteractiveStars({ currentRating, onStarClick }) {
    const [hovered, setHovered] = useState(0);
    return (
        <View style={styles.interactStarsRow}>
            {[1, 2, 3, 4, 5].map((s) => (
                <TouchableOpacity
                    key={s}
                    onPress={() => onStarClick(s)}
                    onPressIn={() => setHovered(s)}
                    onPressOut={() => setHovered(0)}
                    hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
                >
                    <Ionicons
                        name={s <= (hovered || currentRating) ? "star" : "star-outline"}
                        size={38}
                        color={s <= (hovered || currentRating) ? "#FBBF24" : "#D1D5DB"}
                    />
                </TouchableOpacity>
            ))}
        </View>
    );
}

/**
 * Review card — w≈300 border-2 border-emerald-600
 * boxShadow: 3px 3px 0px #10b981
 */
function ReviewCard({ review, isOwn, onPress, onEdit, onDelete }) {
    return (
        <TouchableOpacity
            style={[styles.reviewCard, isOwn && styles.reviewCardOwn]}
            onPress={onPress}
            activeOpacity={0.88}
        >
            {/* Header: tên trái + ngày phải */}
            <View style={styles.rcHeader}>
                <Text style={styles.rcName} numberOfLines={1}>{review.userName}</Text>
                <Text style={styles.rcDate}>{review.date}</Text>
            </View>

            {/* Stars + action buttons */}
            <View style={styles.rcMid}>
                <StarRow rating={review.rating} size={15} />
                {isOwn && (
                    <View style={{ flexDirection: "row", gap: 5 }}>
                        <TouchableOpacity
                            style={styles.rcActionBtn}
                            onPress={() => onEdit?.()}
                        >
                            <Feather name="edit-2" size={11} color="#059669" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.rcActionBtn, { borderColor: "#FCA5A5" }]}
                            onPress={() => onDelete?.()}
                        >
                            <Feather name="trash-2" size={11} color="#EF4444" />
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Comment truncate */}
            <Text style={styles.rcComment} numberOfLines={1}>{review.comment}</Text>
        </TouchableOpacity>
    );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ProductRating({ productId }) {

    // Store
    const {
        ratings, ratingStats, userOwnRating, ratingsLoading,
        fetchRatings, createRating, updateRating, deleteRating,
    } = useProductStore();

    // Lấy userId từ auth store nếu có
    // const { authUser } = useAuthStore();
    // const currentUserId = authUser?._id ?? MOCK_USER_ID;
    const currentUserId = MOCK_USER_ID; // đổi thành authUser._id khi có auth

    // Fallback khi store rỗng
    const stats = ratingStats ?? MOCK_STATS;
    const ownRating = userOwnRating ?? MOCK_OWN;
    const otherReviews = ratings.filter((r) => r.userId !== currentUserId).length > 0
        ? ratings.filter((r) => r.userId !== currentUserId)
        : MOCK_OTHERS;

    // Modal state
    const [ratingModalVisible, setRatingModalVisible] = useState(false);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingRatingId, setEditingRatingId] = useState(null);
    const [selectedReview, setSelectedReview] = useState(null);

    // Form
    const [userRating, setUserRating] = useState(0);
    const [ratingContent, setRatingContent] = useState("");
    const [hoveredStar, setHoveredStar] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    // Fetch ratings
    useEffect(() => {
        if (productId) fetchRatings(productId, currentUserId);
    }, [productId]);

    // ── Handlers ─────────────────────────────────────────

    /** Bấm sao ngoài → set sao → mở modal ngay */
    const handleStarClick = (s) => {
        setUserRating(s);
        setIsEditMode(false);
        setEditingRatingId(null);
        setRatingContent("");
        setRatingModalVisible(true);
    };

    const openEdit = (review) => {
        setIsEditMode(true);
        setEditingRatingId(review.id);
        setUserRating(review.rating);
        setRatingContent(review.comment);
        setDetailModalVisible(false);
        setRatingModalVisible(true);
    };

    const openDetail = (review) => {
        setSelectedReview(review);
        setDetailModalVisible(true);
    };

    const closeRatingModal = () => {
        setRatingModalVisible(false);
        setRatingContent("");
        setUserRating(0);
        setHoveredStar(0);
        setIsEditMode(false);
        setEditingRatingId(null);
    };

    const closeDetailModal = () => {
        setDetailModalVisible(false);
        setSelectedReview(null);
    };

    const handleSubmit = async () => {
        if (userRating === 0) {
            Alert.alert("Thông báo", "Vui lòng chọn số sao đánh giá");
            return;
        }
        if (!ratingContent.trim() || ratingContent.trim().length < 10) {
            Alert.alert("Thông báo", "Vui lòng nhập nội dung tối thiểu 10 ký tự");
            closeRatingModal();
            return;
        }
        setSubmitting(true);
        try {
            let result;
            if (isEditMode && editingRatingId) {
                result = await updateRating(editingRatingId, productId, { stars: userRating, content: ratingContent.trim() }, currentUserId);
            } else {
                result = await createRating(productId, { stars: userRating, content: ratingContent.trim() }, currentUserId);
            }
            if (!result.success) {
                Alert.alert("Lỗi", result.message ?? "Không thể gửi đánh giá");
            }
        } finally {
            setSubmitting(false);
            closeRatingModal();
        }
    };

    const handleDelete = (ratingId) => {
        Alert.alert("Xác nhận", "Bạn có chắc muốn xóa đánh giá này?", [
            { text: "Hủy", style: "cancel" },
            {
                text: "Xóa", style: "destructive",
                onPress: async () => {
                    closeDetailModal();
                    await deleteRating(ratingId, productId, currentUserId);
                },
            },
        ]);
    };

    /** Sao tương tác bên trong modal */
    const renderModalStars = () => (
        <View style={styles.modalStarsRow}>
            {[1, 2, 3, 4, 5].map((s) => {
                const filled = hoveredStar ? s <= hoveredStar : s <= userRating;
                return (
                    <TouchableOpacity
                        key={s}
                        onPress={() => setUserRating(s)}
                        onPressIn={() => setHoveredStar(s)}
                        onPressOut={() => setHoveredStar(0)}
                        hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
                    >
                        <Ionicons
                            name={filled ? "star" : "star-outline"}
                            size={44}
                            color={filled ? "#FBBF24" : "#D1D5DB"}
                        />
                    </TouchableOpacity>
                );
            })}
        </View>
    );

    // ── Render ────────────────────────────────────────────
    return (
        <View style={styles.container}>

            {/* ── Section header ────────────────────────────── */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Đánh giá</Text>

                {/* Overview: số to + stars + total */}
                <View style={styles.overviewRow}>
                    <Text style={styles.avgScore}>
                        {stats.averageRating > 0 ? Number(stats.averageRating).toFixed(1) : "0.0"}
                    </Text>
                    <View style={styles.overviewRight}>
                        <StarRow rating={stats.averageRating} size={20} />
                        <Text style={styles.totalRatings}>{stats.totalRatings} Đánh giá</Text>
                    </View>
                </View>

                {/* Dãy sao tương tác lớn — bấm để viết đánh giá */}
                <InteractiveStars currentRating={userRating} onStarClick={handleStarClick} />
            </View>

            {/* ── Review cards — horizontal scroll ──────────── */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.cardsRow}
            >
                {ownRating && (
                    <ReviewCard
                        review={ownRating} isOwn
                        onPress={() => openDetail(ownRating)}
                        onEdit={() => openEdit(ownRating)}
                        onDelete={() => handleDelete(ownRating.id)}
                    />
                )}
                {otherReviews.slice(0, ownRating ? 3 : 4).map((r) => (
                    <ReviewCard
                        key={r.id} review={r} isOwn={false}
                        onPress={() => openDetail(r)}
                    />
                ))}
                {otherReviews.length === 0 && !ownRating && (
                    <View style={styles.emptyCard}>
                        <Ionicons name="chatbubble-outline" size={28} color="#D1D5DB" />
                        <Text style={styles.emptyText}>
                            Chưa có đánh giá nào.{"\n"}Hãy là người đầu tiên!
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* ══════════════════════════════════════════════════
          RATING MODAL
          Fix bàn phím: KeyboardAvoidingView bọc ngoài,
          ScrollView bên trong để nội dung không bị che
          ══════════════════════════════════════════════════ */}
            <Modal
                visible={ratingModalVisible}
                animationType="slide"
                transparent
                onRequestClose={closeRatingModal}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={closeRatingModal}
                >
                    {/* KeyboardAvoidingView đẩy sheet lên khi bàn phím hiện */}
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={{ width: "100%" }}
                        keyboardVerticalOffset={0}
                    >
                        <TouchableOpacity activeOpacity={1} style={styles.modalSheet}>

                            {/* Header */}
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>
                                    {isEditMode ? "CHỈNH SỬA ĐÁNH GIÁ" : "ĐÁNH GIÁ SẢN PHẨM"}
                                </Text>
                                <TouchableOpacity onPress={closeRatingModal}>
                                    <Text style={styles.modalClose}>×</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Nội dung có thể scroll khi bàn phím che */}
                            <ScrollView
                                keyboardShouldPersistTaps="handled"
                                showsVerticalScrollIndicator={false}
                            >
                                {/* Stars lớn */}
                                <View style={styles.modalStarsBlock}>
                                    {renderModalStars()}
                                </View>

                                <View style={styles.modalBody}>
                                    <Text style={styles.modalTextLabel}>
                                        Chia sẻ trải nghiệm của bạn về sản phẩm này
                                    </Text>
                                    <TextInput
                                        style={styles.modalTextarea}
                                        placeholder="Hãy chia sẻ cảm nhận về chất lượng, hương vị, hoặc bất cứ điều gì khác..."
                                        placeholderTextColor="#9CA3AF"
                                        multiline
                                        numberOfLines={5}
                                        textAlignVertical="top"
                                        value={ratingContent}
                                        onChangeText={setRatingContent}
                                        // KHÔNG dùng autoFocus để tránh bàn phím bật ngay khi mở modal
                                        autoFocus={false}
                                    />

                                    <View style={styles.modalActions}>
                                        <TouchableOpacity
                                            style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
                                            onPress={handleSubmit}
                                            disabled={submitting}
                                        >
                                            <Text style={styles.submitBtnText}>
                                                {submitting ? "Đang gửi..." : isEditMode ? "Cập nhật" : "Gửi đánh giá"}
                                            </Text>
                                        </TouchableOpacity>
                                        {isEditMode && (
                                            <TouchableOpacity
                                                style={styles.deleteBtn}
                                                onPress={() => { closeRatingModal(); handleDelete(editingRatingId); }}
                                            >
                                                <Text style={styles.deleteBtnText}>Xóa</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            </ScrollView>
                        </TouchableOpacity>
                    </KeyboardAvoidingView>
                </TouchableOpacity>
            </Modal>

            {/* ══════════════════════════════════════════════════
          DETAIL MODAL
          ══════════════════════════════════════════════════ */}
            <Modal
                visible={detailModalVisible}
                animationType="fade"
                transparent
                onRequestClose={closeDetailModal}
            >
                <TouchableOpacity
                    style={styles.detailOverlay}
                    activeOpacity={1}
                    onPress={closeDetailModal}
                >
                    <TouchableOpacity activeOpacity={1} style={styles.detailSheet}>

                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>CHI TIẾT ĐÁNH GIÁ</Text>
                            <TouchableOpacity onPress={closeDetailModal}>
                                <Text style={styles.modalClose}>×</Text>
                            </TouchableOpacity>
                        </View>

                        {selectedReview && (
                            <View style={styles.detailBody}>
                                {/* Name + date */}
                                <View style={styles.detailUserRow}>
                                    <Text style={styles.detailUserName}>{selectedReview.userName}</Text>
                                    <Text style={styles.detailDate}>{selectedReview.date}</Text>
                                </View>

                                <View style={{ marginBottom: 14 }}>
                                    <StarRow rating={selectedReview.rating} size={22} />
                                </View>

                                {/* Comment box */}
                                <View style={styles.detailCommentBox}>
                                    <Text style={styles.detailComment}>{selectedReview.comment}</Text>
                                </View>

                                {/* Edit + Delete — chỉ với review của mình */}
                                {selectedReview.userId === currentUserId && (
                                    <View style={styles.detailActions}>
                                        <TouchableOpacity
                                            style={styles.detailEditBtn}
                                            onPress={() => openEdit(selectedReview)}
                                        >
                                            <Text style={styles.detailEditBtnText}>Chỉnh sửa</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.detailDeleteBtn}
                                            onPress={() => handleDelete(selectedReview.id)}
                                        >
                                            <Text style={styles.detailDeleteBtnText}>Xóa</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        )}
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>

        </View>
    );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { backgroundColor: "#FFF", marginTop: 8, paddingBottom: 12 },

    section: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 18 },
    sectionTitle: { fontSize: 26, fontWeight: "800", color: "#111827", marginBottom: 18 },

    // Overview
    overviewRow: { flexDirection: "row", alignItems: "center", gap: 18, marginBottom: 18 },
    avgScore: { fontSize: 56, fontWeight: "900", color: "#111827", lineHeight: 62 },
    overviewRight: { gap: 7 },
    totalRatings: { fontSize: 14, color: "#6B7280", marginTop: 3 },

    // Interactive stars
    interactStarsRow: { flexDirection: "row", gap: 8 },

    // Cards row
    cardsRow: { paddingHorizontal: 20, gap: 14, paddingBottom: 8 },

    // Card
    reviewCard: {
        width: 296, minHeight: 130,
        backgroundColor: "#FFF",
        borderRadius: 12, borderWidth: 2, borderColor: "#059669",
        padding: 14,
        shadowColor: "#10b981",
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 1, shadowRadius: 0, elevation: 0,
    },
    reviewCardOwn: { backgroundColor: "#F0FDF4" },

    rcHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 7 },
    rcName: { fontSize: 13, fontWeight: "600", color: "#111827", flex: 1, marginRight: 6 },
    rcDate: { fontSize: 10, color: "#9CA3AF" },

    rcMid: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 7 },
    rcActionBtn: {
        width: 24, height: 24, borderRadius: 5,
        borderWidth: 1, borderColor: "#D1FAE5",
        alignItems: "center", justifyContent: "center",
    },
    rcComment: { fontSize: 11, color: "#9CA3AF", lineHeight: 16 },

    // Empty
    emptyCard: {
        width: SCREEN_W - 40, paddingVertical: 36, paddingHorizontal: 20,
        alignItems: "center", justifyContent: "center",
        backgroundColor: "#F9FAFB", borderRadius: 12,
        borderWidth: 2, borderStyle: "dashed", borderColor: "#D1D5DB",
        gap: 8,
    },
    emptyText: { fontSize: 13, color: "#9CA3AF", textAlign: "center", lineHeight: 20 },

    // ── Rating Modal ───────────────────────────────────
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "flex-end",   // sheet từ đáy lên
    },
    modalSheet: {
        backgroundColor: "#FFF",
        borderTopLeftRadius: 22, borderTopRightRadius: 22,
        // maxHeight để không che hết màn hình
        maxHeight: "90%",
    },
    modalHeader: {
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        paddingHorizontal: 22, paddingVertical: 18,
        borderBottomWidth: 1, borderBottomColor: "#E5E7EB",
    },
    modalTitle: { fontSize: 16, fontWeight: "800", color: "#111827" },
    modalClose: { fontSize: 28, color: "#9CA3AF", lineHeight: 32 },

    // Stars block
    modalStarsBlock: {
        paddingVertical: 20, paddingHorizontal: 22,
        borderBottomWidth: 1, borderBottomColor: "#E5E7EB",
        alignItems: "center",
    },
    modalStarsRow: { flexDirection: "row", gap: 10, justifyContent: "center" },

    // Body
    modalBody: { paddingHorizontal: 22, paddingTop: 18, paddingBottom: 30 },
    modalTextLabel: { fontSize: 14, fontWeight: "500", color: "#6B7280", marginBottom: 12 },
    modalTextarea: {
        borderWidth: 2, borderColor: "#E5E7EB", borderRadius: 10,
        padding: 13, fontSize: 14, color: "#111827",
        backgroundColor: "#F9FAFB",
        minHeight: 120,   // minHeight thay vì height cố định
        marginBottom: 18,
    },

    modalActions: { flexDirection: "row", justifyContent: "center", gap: 12 },
    submitBtn: {
        flex: 1, maxWidth: 200,
        borderWidth: 2, borderColor: "#059669",
        borderRadius: 10, paddingVertical: 12, alignItems: "center",
    },
    submitBtnText: { fontSize: 14, fontWeight: "700", color: "#059669" },
    deleteBtn: {
        flex: 1, maxWidth: 200,
        backgroundColor: "#DC2626",
        borderRadius: 10, paddingVertical: 12, alignItems: "center",
    },
    deleteBtnText: { fontSize: 14, fontWeight: "700", color: "#FFF" },

    // ── Detail Modal ───────────────────────────────────
    detailOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",   // dialog giữa màn hình
        paddingHorizontal: 16,
    },
    detailSheet: {
        backgroundColor: "#FFF",
        borderRadius: 20, overflow: "hidden",
    },
    detailBody: { padding: 22 },

    detailUserRow: {
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        borderBottomWidth: 1, borderBottomColor: "#E5E7EB",
        paddingBottom: 12, marginBottom: 14,
    },
    detailUserName: { fontSize: 18, fontWeight: "700", color: "#111827" },
    detailDate: { fontSize: 13, color: "#9CA3AF" },

    detailCommentBox: {
        backgroundColor: "#F9FAFB", borderRadius: 10,
        padding: 14, minHeight: 100, marginBottom: 18,
    },
    detailComment: { fontSize: 14, color: "#374151", lineHeight: 22 },

    detailActions: {
        flexDirection: "row", gap: 12,
        borderTopWidth: 1, borderTopColor: "#E5E7EB", paddingTop: 14,
    },
    detailEditBtn: {
        flex: 1, borderWidth: 2, borderColor: "#059669",
        borderRadius: 10, paddingVertical: 12, alignItems: "center",
    },
    detailEditBtnText: { fontSize: 14, fontWeight: "700", color: "#059669" },
    detailDeleteBtn: { flex: 1, backgroundColor: "#DC2626", borderRadius: 10, paddingVertical: 12, alignItems: "center" },
    detailDeleteBtnText: { fontSize: 14, fontWeight: "700", color: "#FFF" },
});