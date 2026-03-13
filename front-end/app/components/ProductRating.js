import {
    StyleSheet, Text, View, ScrollView, TouchableOpacity,
    TextInput, Modal, Alert, ActivityIndicator,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import { useState, useEffect } from "react";

// ── Mock data để test UI (xoá khi tích hợp API) ──────────────────────────────
const MOCK_REVIEWS = [
    {
        id: "r1",
        userName: "Nguyễn Văn A",
        avatar: null,
        rating: 4,
        comment: "Sầu riêng rất ngon, múi dày, hạt nhỏ! Giao hàng nhanh và đóng gói cẩn thận.",
        date: "12/03/2025",
        userId: "u1",
    },
    {
        id: "r2",
        userName: "Trần Thị B",
        avatar: null,
        rating: 5,
        comment: "Chất lượng tuyệt vời, mua lần 2 rồi vẫn ưng lắm!",
        date: "05/03/2025",
        userId: "u2",
    },
    {
        id: "r3",
        userName: "Lê Văn C",
        avatar: null,
        rating: 4,
        comment: "Ngon nhưng hơi to, khó ăn một mình.",
        date: "01/03/2025",
        userId: "u3",
    },
];
const MOCK_USER_ID = "u1"; // giả lập user đang đăng nhập
// ─────────────────────────────────────────────────────────────────────────────

// ── StarRow (display only) ────────────────────────────────────────────────────
function StarRow({ rating, size = 16 }) {
    return (
        <View style={{ flexDirection: "row", gap: 2 }}>
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

// ── StarInput (interactive) ───────────────────────────────────────────────────
function StarInput({ value, onChange, size = 38 }) {
    return (
        <View style={{ flexDirection: "row", gap: 6 }}>
            {[1, 2, 3, 4, 5].map((s) => (
                <TouchableOpacity key={s} onPress={() => onChange(s)} activeOpacity={0.7}>
                    <Ionicons
                        name={s <= value ? "star" : "star-outline"}
                        size={size}
                        color={s <= value ? "#FBBF24" : "#D1D5DB"}
                    />
                </TouchableOpacity>
            ))}
        </View>
    );
}

// ── ReviewCard ────────────────────────────────────────────────────────────────
function ReviewCard({ review, isOwn, onPress, onEdit, onDelete }) {
    return (
        <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.reviewCard, isOwn && styles.reviewCardOwn]}
            onPress={onPress}
        >
            {/* Header: tên + ngày */}
            <View style={styles.reviewCardHeader}>
                <Text style={styles.reviewUserName} numberOfLines={1}>{review.userName}</Text>
                <Text style={styles.reviewDate}>{review.date}</Text>
            </View>

            {/* Stars + nút edit/delete (chỉ hiện nếu là review của mình) */}
            <View style={styles.reviewStarsRow}>
                <StarRow rating={review.rating} size={14} />
                {isOwn && (
                    <View style={{ flexDirection: "row", gap: 6 }}>
                        <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={(e) => { e.stopPropagation?.(); onEdit(); }}
                        >
                            <Feather name="edit-2" size={13} color="#059669" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionBtn, styles.actionBtnRed]}
                            onPress={(e) => { e.stopPropagation?.(); onDelete(); }}
                        >
                            <Feather name="trash-2" size={13} color="#EF4444" />
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Comment preview */}
            <Text style={styles.reviewComment} numberOfLines={1}>{review.comment}</Text>
        </TouchableOpacity>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ProductRating({ productId, userId = MOCK_USER_ID }) {
    const [userRating, setUserRating] = useState(0);
    const [averageRating, setAverageRating] = useState(0);
    const [totalRatings, setTotalRatings] = useState(0);
    const [userOwnRating, setUserOwnRating] = useState(null);
    const [otherReviews, setOtherReviews] = useState([]);
    const [loading, setLoading] = useState(false);

    const [isRatingModalVisible, setIsRatingModalVisible] = useState(false);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingRatingId, setEditingRatingId] = useState(null);
    const [ratingContent, setRatingContent] = useState("");
    const [selectedReview, setSelectedReview] = useState(null);

    // ── TODO: thay bằng fetchRatings() từ API khi tích hợp ──────────────────
    useEffect(() => {
        loadMockData();
    }, [productId]);

    const loadMockData = () => {
        // Tính average từ mock
        const avg = MOCK_REVIEWS.reduce((sum, r) => sum + r.rating, 0) / MOCK_REVIEWS.length;
        setAverageRating(avg);
        setTotalRatings(MOCK_REVIEWS.length);

        if (userId) {
            const own = MOCK_REVIEWS.find((r) => r.userId === userId) ?? null;
            const others = MOCK_REVIEWS.filter((r) => r.userId !== userId);
            setUserOwnRating(own);
            setOtherReviews(others);
        } else {
            setUserOwnRating(null);
            setOtherReviews(MOCK_REVIEWS);
        }
    };
    // ─────────────────────────────────────────────────────────────────────────

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleStarInputPress = (value) => {
        setUserRating(value);
        setIsRatingModalVisible(true);
    };

    const handleCloseRatingModal = () => {
        setIsRatingModalVisible(false);
        setRatingContent("");
        setUserRating(0);
        setIsEditMode(false);
        setEditingRatingId(null);
    };

    const handleSubmitRating = () => {
        if (!userId) {
            Alert.alert("Thông báo", "Vui lòng đăng nhập để đánh giá");
            handleCloseRatingModal();
            return;
        }
        if (userRating === 0) {
            Alert.alert("Thông báo", "Vui lòng chọn số sao đánh giá");
            return;
        }
        if (!ratingContent.trim() || ratingContent.trim().length < 10) {
            Alert.alert("Thông báo", "Vui lòng nhập nội dung đánh giá (tối thiểu 10 ký tự)");
            return;
        }

        // TODO: gọi API tạo / cập nhật rating ở đây
        // isEditMode ? ratingAPI.updateRating(...) : ratingAPI.createRating(...)
        Alert.alert("Thành công", isEditMode ? "Cập nhật đánh giá thành công!" : "Gửi đánh giá thành công!");
        handleCloseRatingModal();
    };

    const handleDeleteRating = (ratingId) => {
        Alert.alert(
            "Xác nhận",
            "Bạn có chắc muốn xóa đánh giá này?",
            [
                { text: "Huỷ", style: "cancel" },
                {
                    text: "Xoá",
                    style: "destructive",
                    onPress: () => {
                        // TODO: gọi ratingAPI.deleteRating(ratingId)
                        setIsDetailModalVisible(false);
                        Alert.alert("Đã xoá", "Đã xoá đánh giá thành công!");
                    },
                },
            ]
        );
    };

    const handleReviewCardPress = (review, isEdit = false) => {
        setSelectedReview(review);
        if (isEdit) {
            setIsEditMode(true);
            setEditingRatingId(review.id);
            setUserRating(review.rating);
            setRatingContent(review.comment);
            setIsRatingModalVisible(true);
        } else {
            setIsDetailModalVisible(true);
        }
    };

    const handleCloseDetailModal = () => {
        setIsDetailModalVisible(false);
        setSelectedReview(null);
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <View style={styles.container}>
            {/* ── Section title ─────────────────────────────── */}
            <Text style={styles.sectionTitle}>Đánh giá</Text>

            {/* ── Rating overview ───────────────────────────── */}
            <View style={styles.overviewRow}>
                <Text style={styles.avgScore}>{averageRating > 0 ? averageRating.toFixed(1) : "0.0"}</Text>
                <View style={{ gap: 4 }}>
                    <StarRow rating={averageRating} size={20} />
                    <Text style={styles.totalText}>{totalRatings} Đánh giá</Text>
                </View>
            </View>

            {/* ── Interactive stars (tap to open modal) ─────── */}
            <View style={styles.inputStarsRow}>
                <StarInput value={userRating} onChange={handleStarInputPress} size={38} />
            </View>

            {/* ── Reviews horizontal list ────────────────────── */}
            {(userOwnRating || otherReviews.length > 0) ? (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.reviewsScroll}
                >
                    {/* Own review first */}
                    {userOwnRating && (
                        <ReviewCard
                            review={userOwnRating}
                            isOwn={true}
                            onPress={() => handleReviewCardPress(userOwnRating, false)}
                            onEdit={() => handleReviewCardPress(userOwnRating, true)}
                            onDelete={() => handleDeleteRating(userOwnRating.id)}
                        />
                    )}
                    {/* Others */}
                    {otherReviews.slice(0, userOwnRating ? 3 : 4).map((review) => (
                        <ReviewCard
                            key={review.id}
                            review={review}
                            isOwn={false}
                            onPress={() => handleReviewCardPress(review, false)}
                        />
                    ))}
                </ScrollView>
            ) : (
                <View style={styles.emptyBox}>
                    <Ionicons name="chatbubble-outline" size={32} color="#D1D5DB" />
                    <Text style={styles.emptyText}>Chưa có đánh giá nào.{"\n"}Hãy là người đầu tiên đánh giá sản phẩm này!</Text>
                </View>
            )}

            {/* ── Rating Modal ───────────────────────────────── */}
            <Modal
                visible={isRatingModalVisible}
                transparent
                animationType="fade"
                onRequestClose={handleCloseRatingModal}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={handleCloseRatingModal}
                >
                    <TouchableOpacity activeOpacity={1} style={styles.modalCard} onPress={() => { }}>
                        {/* Header */}
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {isEditMode ? "CHỈNH SỬA ĐÁNH GIÁ" : "ĐÁNH GIÁ SẢN PHẨM"}
                            </Text>
                            <TouchableOpacity onPress={handleCloseRatingModal}>
                                <Ionicons name="close" size={24} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>

                        {/* Stars */}
                        <View style={styles.modalStarsRow}>
                            <StarInput value={userRating} onChange={setUserRating} size={44} />
                        </View>
                        <View style={styles.divider} />

                        {/* Textarea */}
                        <Text style={styles.modalLabel}>
                            Chia sẻ trải nghiệm của bạn về sản phẩm này
                        </Text>
                        <TextInput
                            style={styles.textarea}
                            multiline
                            numberOfLines={5}
                            placeholder="Hãy chia sẻ cảm nhận của bạn về chất lượng, hương vị, hoặc bất cứ điều gì khác..."
                            placeholderTextColor="#9CA3AF"
                            value={ratingContent}
                            onChangeText={setRatingContent}
                            textAlignVertical="top"
                        />

                        {/* Buttons */}
                        <View style={styles.modalBtns}>
                            <TouchableOpacity
                                style={styles.submitBtn}
                                onPress={handleSubmitRating}
                            >
                                <Text style={styles.submitBtnText}>
                                    {isEditMode ? "Cập nhật" : "Gửi đánh giá"}
                                </Text>
                            </TouchableOpacity>
                            {isEditMode && (
                                <TouchableOpacity
                                    style={styles.deleteBtn}
                                    onPress={() => {
                                        handleCloseRatingModal();
                                        handleDeleteRating(editingRatingId);
                                    }}
                                >
                                    <Text style={styles.deleteBtnText}>Xoá</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>

            {/* ── Detail Modal ───────────────────────────────── */}
            <Modal
                visible={isDetailModalVisible}
                transparent
                animationType="fade"
                onRequestClose={handleCloseDetailModal}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={handleCloseDetailModal}
                >
                    <TouchableOpacity activeOpacity={1} style={styles.modalCard} onPress={() => { }}>
                        {/* Header */}
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>CHI TIẾT ĐÁNH GIÁ</Text>
                            <TouchableOpacity onPress={handleCloseDetailModal}>
                                <Ionicons name="close" size={24} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>

                        {selectedReview && (
                            <>
                                {/* User + date */}
                                <View style={[styles.detailUserRow, styles.dividerBottom]}>
                                    <Text style={styles.detailUserName}>{selectedReview.userName}</Text>
                                    <Text style={styles.detailDate}>{selectedReview.date}</Text>
                                </View>

                                {/* Stars */}
                                <View style={{ marginVertical: 12 }}>
                                    <StarRow rating={selectedReview.rating} size={20} />
                                </View>

                                {/* Comment full */}
                                <View style={styles.detailCommentBox}>
                                    <Text style={styles.detailCommentText}>{selectedReview.comment}</Text>
                                </View>

                                {/* Edit/Delete — chỉ hiện nếu là review của mình */}
                                {selectedReview.userId === userId && (
                                    <View style={[styles.modalBtns, styles.dividerTop]}>
                                        <TouchableOpacity
                                            style={styles.submitBtn}
                                            onPress={() => {
                                                handleCloseDetailModal();
                                                handleReviewCardPress(selectedReview, true);
                                            }}
                                        >
                                            <Text style={styles.submitBtnText}>Chỉnh sửa</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.deleteBtn}
                                            onPress={() => handleDeleteRating(selectedReview.id)}
                                        >
                                            <Text style={styles.deleteBtnText}>Xoá</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </>
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
        paddingHorizontal: 16,
        paddingVertical: 20,
    },

    sectionTitle: {
        fontSize: 22,
        fontWeight: "800",
        color: "#111827",
        marginBottom: 16,
    },

    // Overview
    overviewRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        marginBottom: 16,
    },
    avgScore: {
        fontSize: 52,
        fontWeight: "800",
        color: "#111827",
        lineHeight: 56,
    },
    totalText: {
        fontSize: 14,
        color: "#6B7280",
        marginTop: 2,
    },

    // Interactive stars
    inputStarsRow: {
        marginBottom: 20,
    },

    // Review cards
    reviewsScroll: {
        gap: 12,
        paddingBottom: 4,
    },
    reviewCard: {
        width: 220,
        minHeight: 110,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: "#059669",
        padding: 12,
        backgroundColor: "#FFF",
        justifyContent: "space-between",
    },
    reviewCardOwn: {
        // Thêm shadow nhẹ để phân biệt card của mình
        shadowColor: "#059669",
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 0,
        elevation: 2,
    },
    reviewCardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 6,
    },
    reviewUserName: {
        fontSize: 13,
        fontWeight: "700",
        color: "#111827",
        flex: 1,
        marginRight: 8,
    },
    reviewDate: {
        fontSize: 11,
        color: "#9CA3AF",
        flexShrink: 0,
    },
    reviewStarsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 6,
    },
    reviewComment: {
        fontSize: 12,
        color: "#9CA3AF",
    },

    // Action buttons (edit/delete on own card)
    actionBtn: {
        width: 26,
        height: 26,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "#059669",
        alignItems: "center",
        justifyContent: "center",
    },
    actionBtnRed: {
        borderColor: "#EF4444",
    },

    // Empty state
    emptyBox: {
        borderWidth: 1.5,
        borderStyle: "dashed",
        borderColor: "#D1D5DB",
        borderRadius: 12,
        paddingVertical: 36,
        alignItems: "center",
        gap: 10,
        backgroundColor: "#F9FAFB",
    },
    emptyText: {
        fontSize: 13,
        color: "#9CA3AF",
        textAlign: "center",
        lineHeight: 20,
    },

    // Modal shared
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    modalCard: {
        backgroundColor: "#FFF",
        borderRadius: 20,
        width: "100%",
        maxWidth: 400,
        padding: 20,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 15,
        fontWeight: "800",
        color: "#111827",
        flex: 1,
    },

    // Rating modal
    modalStarsRow: {
        alignItems: "center",
        marginBottom: 16,
    },
    divider: {
        height: 1,
        backgroundColor: "#E5E7EB",
        marginBottom: 14,
    },
    dividerBottom: {
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
        paddingBottom: 12,
        marginBottom: 0,
    },
    dividerTop: {
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
        paddingTop: 14,
        marginTop: 4,
    },
    modalLabel: {
        fontSize: 13,
        color: "#6B7280",
        marginBottom: 10,
    },
    textarea: {
        borderWidth: 1.5,
        borderColor: "#D1D5DB",
        borderRadius: 10,
        padding: 12,
        fontSize: 14,
        color: "#111827",
        backgroundColor: "#F9FAFB",
        minHeight: 110,
        marginBottom: 16,
    },
    modalBtns: {
        flexDirection: "row",
        gap: 10,
    },
    submitBtn: {
        flex: 1,
        borderWidth: 2,
        borderColor: "#059669",
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: "center",
    },
    submitBtnText: {
        fontSize: 13,
        fontWeight: "700",
        color: "#059669",
    },
    deleteBtn: {
        flex: 1,
        backgroundColor: "#DC2626",
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: "center",
    },
    deleteBtnText: {
        fontSize: 13,
        fontWeight: "700",
        color: "#FFF",
    },

    // Detail modal
    detailUserRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    detailUserName: {
        fontSize: 16,
        fontWeight: "800",
        color: "#111827",
    },
    detailDate: {
        fontSize: 13,
        color: "#6B7280",
    },
    detailCommentBox: {
        backgroundColor: "#F9FAFB",
        borderRadius: 10,
        padding: 14,
        minHeight: 100,
        marginBottom: 8,
    },
    detailCommentText: {
        fontSize: 14,
        color: "#374151",
        lineHeight: 22,
    },
});