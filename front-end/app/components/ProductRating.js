import {
    StyleSheet, Text, View, ScrollView, TouchableOpacity,
    TextInput, Modal, Alert, ActivityIndicator,
    KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import { useState, useEffect } from "react";
import { useRatingStore } from "../store/useRatingStore";

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
// Tất cả card đều có shadow xanh giống nhau
// Card của mình: thêm nút edit/delete
function ReviewCard({ review, isOwn, onPress, onEdit, onDelete }) {
    return (
        <TouchableOpacity
            activeOpacity={0.85}
            style={styles.reviewCard}
            onPress={onPress}
        >
            {/* Header: tên + ngày */}
            <View style={styles.reviewCardHeader}>
                <Text style={styles.reviewUserName} numberOfLines={1}>
                    {review.userName}
                </Text>
                <Text style={styles.reviewDate}>{review.date}</Text>
            </View>

            {/* Stars + edit/delete chỉ trên card của mình */}
            <View style={styles.reviewStarsRow}>
                <StarRow rating={review.rating} size={14} />
                {isOwn && (
                    <View style={{ flexDirection: "row", gap: 6 }}>
                        <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={(e) => { e?.stopPropagation?.(); onEdit(); }}
                        >
                            <Feather name="edit-2" size={12} color="#059669" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionBtn, styles.actionBtnRed]}
                            onPress={(e) => { e?.stopPropagation?.(); onDelete(); }}
                        >
                            <Feather name="trash-2" size={12} color="#EF4444" />
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Comment preview 1 dòng */}
            <Text style={styles.reviewComment} numberOfLines={1}>
                {review.comment}
            </Text>
        </TouchableOpacity>
    );
}

// ── RatingModal — có KeyboardAvoidingView fix bàn phím che modal ──────────────
function RatingModal({ visible, isEditMode, userRating, setUserRating, ratingContent, setRatingContent, submitting, onClose, onSubmit, onDelete, editingRatingId }) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            {/* Bấm ngoài modal → đóng + dismiss keyboard */}
            <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); onClose(); }}>
                <View style={styles.modalOverlay}>
                    {/* KeyboardAvoidingView đẩy modal lên khi bàn phím xuất hiện */}
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={{ width: "100%", alignItems: "center" }}
                        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 40}
                    >
                        {/* Bấm vào trong modal → KHÔNG đóng, dismiss keyboard thôi */}
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                            <View style={styles.modalCard}>

                                {/* Header */}
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>
                                        {isEditMode ? "CHỈNH SỬA ĐÁNH GIÁ" : "ĐÁNH GIÁ SẢN PHẨM"}
                                    </Text>
                                    <TouchableOpacity onPress={onClose} hitSlop={8}>
                                        <Ionicons name="close" size={22} color="#9CA3AF" />
                                    </TouchableOpacity>
                                </View>

                                {/* Sao lớn ở giữa */}
                                <View style={styles.modalStarsRow}>
                                    <StarInput value={userRating} onChange={setUserRating} size={46} />
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
                                    // Không dùng returnKeyType="done" trên multiline
                                    blurOnSubmit={false}
                                />

                                {/* Buttons */}
                                <View style={styles.modalBtns}>
                                    <TouchableOpacity
                                        style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
                                        onPress={onSubmit}
                                        disabled={submitting}
                                    >
                                        {submitting
                                            ? <ActivityIndicator size="small" color="#059669" />
                                            : <Text style={styles.submitBtnText}>
                                                {isEditMode ? "Cập nhật" : "Gửi đánh giá"}
                                            </Text>
                                        }
                                    </TouchableOpacity>
                                    {isEditMode && (
                                        <TouchableOpacity
                                            style={styles.deleteBtn}
                                            onPress={() => { onClose(); onDelete(editingRatingId); }}
                                        >
                                            <Text style={styles.deleteBtnText}>Xoá</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>

                            </View>
                        </TouchableWithoutFeedback>
                    </KeyboardAvoidingView>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ProductRating({ productId, userId }) {
    const {
        averageRating, totalRatings,
        userOwnRating, otherReviews,
        ratingsLoading, submitting,
        fetchRatings, createRating, updateRating, deleteRating, clearRatings,
    } = useRatingStore();

    // Rating modal state
    const [userRating, setUserRating] = useState(0);
    const [ratingContent, setRatingContent] = useState("");
    const [isRatingModalVisible, setIsRatingModalVisible] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingRatingId, setEditingRatingId] = useState(null);

    // Detail modal state
    const [selectedReview, setSelectedReview] = useState(null);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

    useEffect(() => {
        fetchRatings(productId, userId);
        return () => clearRatings();
    }, [productId, userId]);

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleStarInputPress = (value) => {
        setUserRating(value);
        setIsRatingModalVisible(true);
    };

    const handleCloseRatingModal = () => {
        Keyboard.dismiss();
        setIsRatingModalVisible(false);
        setRatingContent("");
        setUserRating(0);
        setIsEditMode(false);
        setEditingRatingId(null);
    };

    const handleSubmitRating = async () => {
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

        try {
            let response;
            if (isEditMode && editingRatingId) {
                response = await updateRating(editingRatingId, userRating, ratingContent);
            } else {
                response = await createRating(productId, userRating, ratingContent);
            }

            if (response.success) {
                Alert.alert(
                    "Thành công",
                    isEditMode ? "Cập nhật đánh giá thành công!" : "Gửi đánh giá thành công!"
                );
                handleCloseRatingModal();
                await fetchRatings(productId, userId);
            } else {
                throw new Error(response.message);
            }
        } catch (err) {
            console.error("[ProductRating] submit:", err.message);
            Alert.alert(
                "Lỗi",
                isEditMode
                    ? "Không thể cập nhật đánh giá. Vui lòng thử lại."
                    : "Bạn đã đánh giá sản phẩm này rồi!"
            );
            handleCloseRatingModal();
        }
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
                    onPress: async () => {
                        try {
                            const response = await deleteRating(ratingId);
                            if (response.success) {
                                setIsDetailModalVisible(false);
                                setSelectedReview(null);
                                Alert.alert("Thành công", "Xóa đánh giá thành công!");
                                await fetchRatings(productId, userId);
                            }
                        } catch (error) {
                            Alert.alert("Lỗi", "Không thể xóa đánh giá. Vui lòng thử lại.");
                        }
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

            <Text style={styles.sectionTitle}>Đánh giá</Text>

            {/* Overview */}
            <View style={styles.overviewRow}>
                <Text style={styles.avgScore}>
                    {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
                </Text>
                <View style={{ gap: 5 }}>
                    <StarRow rating={averageRating} size={22} />
                    <Text style={styles.totalText}>{totalRatings} Đánh giá</Text>
                </View>
            </View>

            {/* Sao tương tác — nhấn để mở modal */}
            <View style={styles.inputStarsWrap}>
                <StarInput value={userRating} onChange={handleStarInputPress} size={40} />
            </View>

            {/* Danh sách review cuộn ngang */}
            {ratingsLoading ? (
                <ActivityIndicator size="small" color="#059669" style={{ marginTop: 12 }} />
            ) : (userOwnRating || otherReviews.length > 0) ? (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.reviewsScroll}
                >
                    {/* Card của mình luôn đầu tiên */}
                    {userOwnRating && (
                        <ReviewCard
                            review={userOwnRating}
                            isOwn={true}
                            onPress={() => handleReviewCardPress(userOwnRating, false)}
                            onEdit={() => handleReviewCardPress(userOwnRating, true)}
                            onDelete={() => handleDeleteRating(userOwnRating.id)}
                        />
                    )}
                    {/* Có card mình → 3 người khác, không có → 4 người */}
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
                    <Text style={styles.emptyText}>
                        {"Chưa có đánh giá nào.\nHãy là người đầu tiên đánh giá sản phẩm này!"}
                    </Text>
                </View>
            )}

            {/* ── Modal: Đánh giá / Chỉnh sửa ───────────────────────────────── */}
            <RatingModal
                visible={isRatingModalVisible}
                isEditMode={isEditMode}
                userRating={userRating}
                setUserRating={setUserRating}
                ratingContent={ratingContent}
                setRatingContent={setRatingContent}
                submitting={submitting}
                onClose={handleCloseRatingModal}
                onSubmit={handleSubmitRating}
                onDelete={handleDeleteRating}
                editingRatingId={editingRatingId}
            />

            {/* ── Modal: Chi tiết đánh giá ────────────────────────────────────── */}
            <Modal
                visible={isDetailModalVisible}
                transparent
                animationType="fade"
                onRequestClose={handleCloseDetailModal}
            >
                <TouchableWithoutFeedback onPress={handleCloseDetailModal}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback onPress={() => { }}>
                            <View style={styles.modalCard}>

                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>CHI TIẾT ĐÁNH GIÁ</Text>
                                    <TouchableOpacity onPress={handleCloseDetailModal} hitSlop={8}>
                                        <Ionicons name="close" size={22} color="#9CA3AF" />
                                    </TouchableOpacity>
                                </View>

                                {selectedReview && (
                                    <>
                                        <View style={[styles.detailUserRow, styles.dividerBottom]}>
                                            <Text style={styles.detailUserName}>{selectedReview.userName}</Text>
                                            <Text style={styles.detailDate}>{selectedReview.date}</Text>
                                        </View>

                                        <View style={{ marginVertical: 14 }}>
                                            <StarRow rating={selectedReview.rating} size={22} />
                                        </View>

                                        <View style={styles.detailCommentBox}>
                                            <Text style={styles.detailCommentText}>{selectedReview.comment}</Text>
                                        </View>

                                        {/* Chỉ hiện edit/delete nếu là review của mình */}
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

                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
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
        lineHeight: 58,
    },
    totalText: {
        fontSize: 14,
        color: "#6B7280",
        marginTop: 2,
    },
    inputStarsWrap: {
        marginBottom: 20,
    },

    // Review cards — tất cả card đều có shadow xanh giống nhau
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
        backgroundColor: "#FFFFFF",
        justifyContent: "space-between",
        // Shadow xanh emerald — giống nhau cho tất cả card
        shadowColor: "#059669",
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 0,
        elevation: 3,
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

    // Edit/delete buttons trên card
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

    // Modal overlay
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    modalCard: {
        backgroundColor: "#FFFFFF",
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
        paddingVertical: 13,
        alignItems: "center",
        justifyContent: "center",
        minHeight: 46,
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
        paddingVertical: 13,
        alignItems: "center",
        justifyContent: "center",
    },
    deleteBtnText: {
        fontSize: 13,
        fontWeight: "700",
        color: "#FFFFFF",
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