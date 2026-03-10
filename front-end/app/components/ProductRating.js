import {
    StyleSheet, Text, View, ScrollView, TouchableOpacity,
    TextInput, Modal, Alert, Dimensions,
} from "react-native";
import { useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";

const { width: SCREEN_W } = Dimensions.get("window");

// ── Mock data ─────────────────────────────────────────────────────────────────
const MOCK_USER_ID = "u_me";

const MOCK_REVIEWS = [
    {
        id: "r1", userName: "Trần Thị B", userId: "u2", rating: 5,
        comment: "Sầu riêng rất ngon, múi dày, vị béo ngậy. Đóng gói cẩn thận, giao hàng nhanh. Sẽ ủng hộ thêm lần sau!",
        date: "15/05/2024",
    },
    {
        id: "r2", userName: "Lê Văn C", userId: "u3", rating: 4,
        comment: "Chất lượng tốt, giá hợp lý. Hương thơm đặc trưng của Ri6. Tuy nhiên trái hơi nhỏ so với mô tả.",
        date: "10/05/2024",
    },
    {
        id: "r3", userName: "Phạm Thị D", userId: "u4", rating: 5,
        comment: "Tuyệt vời! Đúng như quảng cáo. Sẽ giới thiệu cho bạn bè.",
        date: "05/05/2024",
    },
];

const MOCK_OWN = {
    id: "r_own", userName: "Tôi", userId: MOCK_USER_ID, rating: 4,
    comment: "Ngon lắm, hạt lép, cơm vàng ươm. Sẽ mua lại lần sau.",
    date: "20/05/2024",
};

const MOCK_STATS = { averageRating: 4.7, totalRatings: 4 };
// ─────────────────────────────────────────────────────────────────────────────

/** Sao tĩnh nhỏ — dùng trong card và overview */
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
 * Dãy sao tương tác lớn — text-5xl cursor-pointer hover:scale-110 của web
 * Bấm sao → mở modal viết đánh giá luôn (giống handleStarClick web)
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
                    hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                >
                    <Ionicons
                        name={s <= (hovered || currentRating) ? "star" : "star-outline"}
                        size={40}
                        color={s <= (hovered || currentRating) ? "#FBBF24" : "#D1D5DB"}
                    />
                </TouchableOpacity>
            ))}
        </View>
    );
}

/**
 * Review card — w-[320px] h-[140px] border-2 border-emerald-600
 * boxShadow: '3px 3px 0px #10b981'
 */
function ReviewCard({ review, isOwn, onPress, onEdit, onDelete }) {
    return (
        <TouchableOpacity
            style={[styles.reviewCard, isOwn && styles.reviewCardOwn]}
            onPress={onPress}
            activeOpacity={0.88}
        >
            {/* Header: tên trái + ngày phải — justify-between */}
            <View style={styles.rcHeader}>
                <Text style={styles.rcName} numberOfLines={1}>{review.userName}</Text>
                <Text style={styles.rcDate}>{review.date}</Text>
            </View>

            {/* Stars + edit/delete buttons — justify-between */}
            <View style={styles.rcMid}>
                <StarRow rating={review.rating} size={16} />
                {isOwn && (
                    <View style={{ flexDirection: "row", gap: 5 }}>
                        <TouchableOpacity
                            style={styles.rcActionBtn}
                            onPress={(e) => { e?.stopPropagation?.(); onEdit?.(); }}
                        >
                            <Feather name="edit-2" size={11} color="#059669" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.rcActionBtn, { borderColor: "#FCA5A5" }]}
                            onPress={(e) => { e?.stopPropagation?.(); onDelete?.(); }}
                        >
                            <Feather name="trash-2" size={11} color="#EF4444" />
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Comment — line-clamp-1 */}
            <Text style={styles.rcComment} numberOfLines={1}>{review.comment}</Text>
        </TouchableOpacity>
    );
}

export default function ProductRating({ productId }) {
    const [userOwnRating, setUserOwnRating] = useState(MOCK_OWN);
    const [otherReviews] = useState(MOCK_REVIEWS);
    const [stats] = useState(MOCK_STATS);

    // Modal state
    const [ratingModalVisible, setRatingModalVisible] = useState(false);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingRatingId, setEditingRatingId] = useState(null);
    const [selectedReview, setSelectedReview] = useState(null);

    // Form — giống web
    const [userRating, setUserRating] = useState(0);  // sao đang chọn trong modal
    const [hoveredStar, setHoveredStar] = useState(0);
    const [ratingContent, setRatingContent] = useState("");

    // ── Handlers ─────────────────────────────────────
    /** Bấm sao ngoài → set sao → mở modal — giống handleStarClick web */
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
        setRatingModalVisible(true);
    };

    const openDetail = (review) => {
        setSelectedReview(review);
        setDetailModalVisible(true);
    };

    const handleCloseRatingModal = () => {
        setRatingModalVisible(false);
        setRatingContent("");
        setUserRating(0);
        setHoveredStar(0);
        setIsEditMode(false);
        setEditingRatingId(null);
    };

    const handleCloseDetailModal = () => {
        setDetailModalVisible(false);
        setSelectedReview(null);
    };

    const handleSubmit = () => {
        if (!ratingContent.trim() || ratingContent.trim().length < 10) {
            Alert.alert("Thông báo", "Vui lòng nhập nội dung đánh giá (tối thiểu 10 ký tự)");
            handleCloseRatingModal();
            return;
        }
        if (userRating === 0) {
            Alert.alert("Thông báo", "Vui lòng chọn số sao đánh giá");
            return;
        }
        // TODO: call API / store action
        handleCloseRatingModal();
    };

    const handleDelete = (ratingId) => {
        Alert.alert("Xác nhận", "Bạn có chắc muốn xóa đánh giá này?", [
            { text: "Hủy", style: "cancel" },
            {
                text: "Xóa", style: "destructive",
                onPress: () => {
                    setUserOwnRating(null);
                    setDetailModalVisible(false);
                    // TODO: call API / store action
                },
            },
        ]);
    };

    /** Dãy sao tương tác BÊN TRONG MODAL — giống renderStars(userRating, true) web */
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
                        hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
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

    return (
        <View style={styles.container}>

            {/* ── Section: h2 Đánh giá ──────────────────── */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Đánh giá</Text>

                {/* Overview: số to + stars + total — flex-row gap-6 items-center */}
                <View style={styles.overviewRow}>
                    <Text style={styles.avgScore}>
                        {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "0.0"}
                    </Text>
                    <View style={styles.overviewRight}>
                        <StarRow rating={stats.averageRating} size={20} />
                        <Text style={styles.totalRatings}>{stats.totalRatings} Đánh giá</Text>
                    </View>
                </View>

                {/* Dãy sao tương tác lớn — "flex gap-3" của web
            Bấm 1 sao → mở modal viết đánh giá với sao đó đã chọn sẵn */}
                <InteractiveStars
                    currentRating={userRating}
                    onStarClick={handleStarClick}
                />
            </View>

            {/* ── Review cards — overflow-x-auto flex gap-6 ── */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.cardsRow}
            >
                {/* Card của mình — luôn đứng đầu */}
                {userOwnRating && (
                    <ReviewCard
                        review={userOwnRating}
                        isOwn
                        onPress={() => openDetail(userOwnRating)}
                        onEdit={() => openEdit(userOwnRating)}
                        onDelete={() => handleDelete(userOwnRating.id)}
                    />
                )}

                {/* Các review khác — slice(0, 3 or 4) như web */}
                {otherReviews.length > 0
                    ? otherReviews.slice(0, userOwnRating ? 3 : 4).map((r) => (
                        <ReviewCard
                            key={r.id}
                            review={r}
                            isOwn={false}
                            onPress={() => openDetail(r)}
                        />
                    ))
                    : !userOwnRating && (
                        <View style={styles.emptyCard}>
                            <Text style={styles.emptyText}>
                                Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sản phẩm này!
                            </Text>
                        </View>
                    )}
            </ScrollView>

            {/* ══════════════════════════════════════════════
          Rating Modal — giống web 1-1
          ══════════════════════════════════════════════ */}
            <Modal
                visible={ratingModalVisible}
                animationType="slide"
                transparent
                onRequestClose={handleCloseRatingModal}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={handleCloseRatingModal}
                >
                    <TouchableOpacity activeOpacity={1} style={styles.modalSheet}>

                        {/* Header — flex justify-between items-center p-8 border-b */}
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {isEditMode ? "CHỈNH SỬA ĐÁNH GIÁ" : "ĐÁNH GIÁ SẢN PHẨM"}
                            </Text>
                            <TouchableOpacity onPress={handleCloseRatingModal}>
                                <Text style={styles.modalClose}>×</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Stars lớn — flex justify-center gap-3 mb-8 pb-6 border-b */}
                        <View style={styles.modalStarsBlock}>
                            {renderModalStars()}
                        </View>

                        {/* Textarea */}
                        <View style={styles.modalBody}>
                            <Text style={styles.modalTextLabel}>
                                Chia sẻ trải nghiệm của bạn về sản phẩm này
                            </Text>
                            <TextInput
                                style={styles.modalTextarea}
                                placeholder="Hãy chia sẻ cảm nhận của bạn về chất lượng, hương vị, hoặc bất cứ điều gì khác..."
                                placeholderTextColor="#9CA3AF"
                                multiline
                                numberOfLines={5}
                                textAlignVertical="top"
                                value={ratingContent}
                                onChangeText={setRatingContent}
                            />

                            {/* Actions — flex justify-center gap-3 */}
                            <View style={styles.modalActions}>
                                <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                                    <Text style={styles.submitBtnText}>
                                        {isEditMode ? "Cập nhật" : "Gửi đánh giá"}
                                    </Text>
                                </TouchableOpacity>
                                {isEditMode && (
                                    <TouchableOpacity
                                        style={styles.deleteBtn}
                                        onPress={() => { handleCloseRatingModal(); handleDelete(editingRatingId); }}
                                    >
                                        <Text style={styles.deleteBtnText}>Xóa</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>

            {/* ══════════════════════════════════════════════
          Review Detail Modal — giống web 1-1
          ══════════════════════════════════════════════ */}
            <Modal
                visible={detailModalVisible}
                animationType="fade"
                transparent
                onRequestClose={handleCloseDetailModal}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={handleCloseDetailModal}
                >
                    <TouchableOpacity activeOpacity={1} style={styles.detailSheet}>

                        {/* Header */}
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>CHI TIẾT ĐÁNH GIÁ</Text>
                            <TouchableOpacity onPress={handleCloseDetailModal}>
                                <Text style={styles.modalClose}>×</Text>
                            </TouchableOpacity>
                        </View>

                        {selectedReview && (
                            <View style={styles.detailBody}>
                                {/* Name + date — justify-between border-b pb-4 */}
                                <View style={styles.detailUserRow}>
                                    <Text style={styles.detailUserName}>{selectedReview.userName}</Text>
                                    <Text style={styles.detailDate}>{selectedReview.date}</Text>
                                </View>

                                {/* Stars */}
                                <View style={{ marginBottom: 16 }}>
                                    <StarRow rating={selectedReview.rating} size={22} />
                                </View>

                                {/* Comment box — bg-gray-50 rounded-lg p-4 min-h-[150px] */}
                                <View style={styles.detailCommentBox}>
                                    <Text style={styles.detailComment}>{selectedReview.comment}</Text>
                                </View>

                                {/* Edit + Delete — chỉ hiện với review của mình */}
                                {selectedReview.userId === MOCK_USER_ID && (
                                    <View style={styles.detailActions}>
                                        <TouchableOpacity
                                            style={styles.detailEditBtn}
                                            onPress={() => { handleCloseDetailModal(); openEdit(selectedReview); }}
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
    container: {
        backgroundColor: "#FFF",
        marginTop: 8,
        paddingBottom: 12,
    },

    // Section header
    section: {
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 20,
    },
    sectionTitle: {
        fontSize: 28,
        fontWeight: "800",
        color: "#111827",
        marginBottom: 20,
    },

    // Overview: số to + stars + total
    overviewRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 20,
        marginBottom: 20,
    },
    avgScore: { fontSize: 60, fontWeight: "900", color: "#111827", lineHeight: 66 },
    overviewRight: { gap: 8 },
    totalRatings: { fontSize: 16, color: "#6B7280", marginTop: 4 },

    // Interactive stars — text-5xl gap-3 như web
    interactStarsRow: {
        flexDirection: "row",
        gap: 10,
    },

    // ── Review cards ──────────────────────────────
    cardsRow: {
        paddingHorizontal: 20,
        gap: 16,
        paddingBottom: 8,
    },

    // Card — w-[320px] h-[140px] border-2 border-emerald-600
    reviewCard: {
        width: 300,
        height: 140,
        backgroundColor: "#FFF",
        borderRadius: 12,
        borderWidth: 2,
        borderColor: "#059669",
        padding: 14,
        // boxShadow: '3px 3px 0px #10b981'
        shadowColor: "#10b981",
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 0,
    },
    reviewCardOwn: { backgroundColor: "#F0FDF4" },

    rcHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 6,
    },
    rcName: { fontSize: 14, fontWeight: "600", color: "#111827", flex: 1, marginRight: 8 },
    rcDate: { fontSize: 11, color: "#9CA3AF" },

    rcMid: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    rcActionBtn: {
        width: 24, height: 24, borderRadius: 5,
        borderWidth: 1, borderColor: "#D1FAE5",
        alignItems: "center", justifyContent: "center",
    },

    rcComment: { fontSize: 12, color: "#9CA3AF" },

    // Empty
    emptyCard: {
        width: SCREEN_W - 40,
        paddingVertical: 40,
        paddingHorizontal: 20,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F9FAFB",
        borderRadius: 12,
        borderWidth: 2,
        borderStyle: "dashed",
        borderColor: "#D1D5DB",
    },
    emptyText: { fontSize: 14, color: "#6B7280", textAlign: "center", lineHeight: 22 },

    // ── Modals ────────────────────────────────────
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.35)",
        justifyContent: "flex-end",
    },

    // Rating modal sheet — bg-white rounded-2xl max-w-xl
    modalSheet: {
        backgroundColor: "#FFF",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },

    // Modal header — p-8 border-b
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 24,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    modalTitle: { fontSize: 18, fontWeight: "800", color: "#111827" },
    modalClose: { fontSize: 30, color: "#9CA3AF", lineHeight: 34 },

    // Stars block — border-b pb-6 mb-8
    modalStarsBlock: {
        paddingVertical: 24,
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
        alignItems: "center",
    },
    modalStarsRow: { flexDirection: "row", gap: 12, justifyContent: "center" },

    // Body
    modalBody: { padding: 24 },
    modalTextLabel: {
        fontSize: 15,
        fontWeight: "500",
        color: "#6B7280",
        marginBottom: 14,
    },
    modalTextarea: {
        borderWidth: 2,
        borderColor: "#D1D5DB",
        borderRadius: 10,
        padding: 14,
        fontSize: 15,
        color: "#111827",
        backgroundColor: "#F9FAFB",
        height: 130,
        marginBottom: 20,
    },

    // Actions
    modalActions: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 12,
    },
    submitBtn: {
        flex: 1,
        maxWidth: 200,
        borderWidth: 2,
        borderColor: "#059669",
        borderRadius: 10,
        paddingVertical: 13,
        alignItems: "center",
    },
    submitBtnText: { fontSize: 14, fontWeight: "700", color: "#059669" },
    deleteBtn: {
        flex: 1,
        maxWidth: 200,
        backgroundColor: "#DC2626",
        borderRadius: 10,
        paddingVertical: 13,
        alignItems: "center",
    },
    deleteBtnText: { fontSize: 14, fontWeight: "700", color: "#FFF" },

    // Detail modal — dialog giữa màn hình
    detailSheet: {
        backgroundColor: "#FFF",
        marginHorizontal: 16,
        marginBottom: 40,
        borderRadius: 20,
        overflow: "hidden",
    },
    detailBody: { padding: 24 },

    // Name + date row — justify-between border-b pb-4
    detailUserRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
        paddingBottom: 14,
        marginBottom: 16,
    },
    detailUserName: { fontSize: 20, fontWeight: "700", color: "#111827" },
    detailDate: { fontSize: 14, color: "#9CA3AF" },

    // Comment box — bg-gray-50 rounded-lg p-4 min-h-[150px]
    detailCommentBox: {
        backgroundColor: "#F9FAFB",
        borderRadius: 10,
        padding: 16,
        minHeight: 140,
        marginBottom: 20,
    },
    detailComment: { fontSize: 15, color: "#374151", lineHeight: 24 },

    // Detail actions — border-t pt-4
    detailActions: {
        flexDirection: "row",
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
        paddingTop: 16,
    },
    detailEditBtn: {
        flex: 1,
        borderWidth: 2,
        borderColor: "#059669",
        borderRadius: 10,
        paddingVertical: 13,
        alignItems: "center",
    },
    detailEditBtnText: { fontSize: 14, fontWeight: "700", color: "#059669" },
    detailDeleteBtn: {
        flex: 1,
        backgroundColor: "#DC2626",
        borderRadius: 10,
        paddingVertical: 13,
        alignItems: "center",
    },
    detailDeleteBtnText: { fontSize: 14, fontWeight: "700", color: "#FFF" },
});