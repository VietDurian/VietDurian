import { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    TextInput,
    FlatList,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "../store/useAppStore";
import { useCommentStore } from "../store/useCommentStore";
import { useAuthStore } from "../store/useAuthStore";

// ── Constants ──────────────────────────────────────────────────────────────────
const REACTION_TYPES = [
    { type: "like", icon: "thumbs-up", iconFilled: "thumbs-up", color: "#3b82f6", label: "Thích" },
    { type: "love", icon: "heart-outline", iconFilled: "heart", color: "#ef4444", label: "Yêu thích" },
    { type: "haha", icon: "happy-outline", iconFilled: "happy", color: "#eab308", label: "Haha" },
    { type: "angry", icon: "sad-outline", iconFilled: "sad", color: "#f97316", label: "Phẫn nộ" },
];

const REACTION_MAP = {
    like: { icon: "thumbs-up", iconFilled: "thumbs-up", color: "#3b82f6", label: "Thích" },
    love: { icon: "heart-outline", iconFilled: "heart", color: "#ef4444", label: "Yêu thích" },
    haha: { icon: "happy-outline", iconFilled: "happy", color: "#eab308", label: "Haha" },
    angry: { icon: "sad-outline", iconFilled: "sad", color: "#f97316", label: "Phẫn nộ" },
};

// ── Helpers ────────────────────────────────────────────────────────────────────
function getTimeAgo(dateString) {
    const now = Date.now();
    const diff = Math.floor((now - new Date(dateString).getTime()) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
    const weeks = Math.floor(diff / 604800);
    if (weeks < 4) return `${weeks}w`;
    const months = Math.floor(diff / 2592000);
    if (months < 12) return `${months}mo`;
    return `${Math.floor(diff / 31536000)}y`;
}

function getMostReactedType(breakdown) {
    if (!breakdown) return null;
    return Object.entries(breakdown)
        .filter(([, v]) => v > 0)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || null;
}

// ── Confirm Modal ──────────────────────────────────────────────────────────────
function ConfirmModal({ visible, message, onClose, onConfirm }) {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.confirmBox}>
                    <Text style={styles.confirmMessage}>{message}</Text>
                    <View style={styles.confirmBtns}>
                        <TouchableOpacity style={styles.confirmCancelBtn} onPress={onClose} activeOpacity={0.85}>
                            <Text style={styles.confirmCancelText}>Hủy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.confirmDeleteBtn} onPress={onConfirm} activeOpacity={0.85}>
                            <Text style={styles.confirmDeleteText}>Xóa</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

// ── Report Modal ───────────────────────────────────────────────────────────────
function ReportModal({ visible, onClose, onSubmit, submitting }) {
    const [reason, setReason] = useState("");
    useEffect(() => { if (!visible) setReason(""); }, [visible]);

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.reportBox}>
                    {/* Header */}
                    <View style={styles.reportHeader}>
                        <View style={styles.reportHeaderLeft}>
                            <View style={styles.reportIconWrap}>
                                <Ionicons name="flag-outline" size={18} color="#f97316" />
                            </View>
                            <Text style={styles.reportTitle}>Báo cáo bình luận</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} hitSlop={8}>
                            <Ionicons name="close" size={22} color="#374151" />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.reportDesc}>
                        Vui lòng cho chúng tôi biết lý do bạn báo cáo bình luận này. Chúng tôi sẽ xem xét và xử lý trong thời gian sớm nhất.
                    </Text>

                    <TextInput
                        style={styles.reportInput}
                        value={reason}
                        onChangeText={setReason}
                        placeholder="Nhập lý do báo cáo..."
                        placeholderTextColor="#9ca3af"
                        multiline
                        maxLength={500}
                    />

                    <View style={styles.reportFooter}>
                        <TouchableOpacity
                            style={[styles.reportSubmitBtn, (!reason.trim() || submitting) && styles.reportSubmitBtnDisabled]}
                            onPress={() => onSubmit(reason)}
                            disabled={!reason.trim() || submitting}
                            activeOpacity={0.85}
                        >
                            {submitting
                                ? <ActivityIndicator size="small" color="#fff" />
                                : <Text style={styles.reportSubmitText}>Gửi báo cáo</Text>
                            }
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

// ── Reaction Detail Bottom Sheet ───────────────────────────────────────────────
// Giong web: hien breakdown + danh sach nguoi thả reaction
function ReactionDetailSheet({ visible, reactions, onClose }) {
    const reactionList = reactions?.reactions || [];
    const breakdown = reactions?.breakdown || {};

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <TouchableOpacity style={styles.sheetBackdrop} activeOpacity={1} onPress={onClose} />
            <View style={styles.sheetBox}>
                {/* Header */}
                <View style={styles.sheetHeader}>
                    <Text style={styles.sheetTitle}>Cảm Xúc</Text>
                    <TouchableOpacity onPress={onClose} hitSlop={8}>
                        <Ionicons name="close" size={22} color="#374151" />
                    </TouchableOpacity>
                </View>

                {/* Breakdown — icon + count + label (giong web) */}
                <View style={styles.sheetBreakdown}>
                    {REACTION_TYPES.map((r) => {
                        const count = breakdown[r.type] || 0;
                        if (count === 0) return null;
                        return (
                            <View key={r.type} style={styles.sheetBreakdownItem}>
                                <Ionicons name={r.iconFilled} size={26} color={r.color} />
                                <Text style={styles.sheetBreakdownCount}>{count}</Text>
                                <Text style={styles.sheetBreakdownLabel}>{r.label}</Text>
                            </View>
                        );
                    })}
                </View>

                {/* Users list — giong web */}
                <ScrollView style={styles.sheetUserList} showsVerticalScrollIndicator={false}>
                    {reactionList.map((rxn) => {
                        const userInfo = typeof rxn.user_id === "object" ? rxn.user_id : null;
                        const avatar = userInfo?.avatar || "https://i.pravatar.cc/100";
                        const displayName = userInfo?.full_name || userInfo?.username || "Người dùng";
                        const rxnCfg = REACTION_MAP[rxn.type];
                        return (
                            <View key={rxn._id} style={styles.sheetUserRow}>
                                <Image source={{ uri: avatar }} style={styles.sheetUserAvatar} />
                                <Text style={styles.sheetUserName} numberOfLines={1}>{displayName}</Text>
                                {rxnCfg && (
                                    <Ionicons name={rxnCfg.iconFilled} size={18} color={rxnCfg.color} />
                                )}
                            </View>
                        );
                    })}
                </ScrollView>
            </View>
        </Modal>
    );
}

// ── Reaction Picker ────────────────────────────────────────────────────────────
// Hien PHIA TREN action row, lech ve ben phai (marginLeft 40 ~ vi tri nut Thich)
function ReactionPicker({ visible, userReaction, onSelect, onRemove }) {
    if (!visible) return null;
    return (
        <View style={styles.reactionPicker}>
            {REACTION_TYPES.map((r) => (
                <TouchableOpacity
                    key={r.type}
                    style={[styles.reactionPickerBtn, userReaction === r.type && styles.reactionPickerBtnActive]}
                    onPress={() => userReaction === r.type ? onRemove() : onSelect(r.type)}
                    activeOpacity={0.75}
                >
                    <Ionicons
                        name={userReaction === r.type ? r.iconFilled : r.icon}
                        size={24}
                        color={r.color}
                    />
                </TouchableOpacity>
            ))}
            {/* Nut X de bo reaction — giong web */}
            {userReaction && (
                <TouchableOpacity
                    style={[styles.reactionPickerBtn, styles.reactionPickerRemoveBtn]}
                    onPress={onRemove}
                    activeOpacity={0.75}
                >
                    <Ionicons name="close" size={18} color="#ef4444" />
                </TouchableOpacity>
            )}
        </View>
    );
}

// ── Reaction Summary Badge ─────────────────────────────────────────────────────
function ReactionSummary({ reactions, onPress }) {
    if (!reactions || reactions.total === 0) return null;
    const top = getMostReactedType(reactions.breakdown);
    const cfg = top ? REACTION_MAP[top] : null;
    return (
        <TouchableOpacity style={styles.reactionSummary} onPress={onPress} activeOpacity={0.8}>
            {cfg && <Ionicons name={cfg.iconFilled} size={13} color={cfg.color} />}
            <Text style={styles.reactionSummaryText}>{reactions.total}</Text>
        </TouchableOpacity>
    );
}

// ── Comment Item ───────────────────────────────────────────────────────────────
function CommentItem({
    comment,
    isReply = false,
    authUser,
    onReply,
    onEdit,
    onDelete,
    onReport,
    reactions,
    onToggleReaction,
    openPicker,
    setOpenPicker,
    onShowReactions,
}) {
    const authorId = typeof comment.author_id === "object"
        ? comment.author_id?._id
        : comment.author_id;
    const isOwn = authorId === authUser?._id;
    const commentReactions = reactions[comment._id];
    const userReaction = commentReactions?.userReaction || null;
    const pickerVisible = openPicker === comment._id;
    const reactionCfg = userReaction ? REACTION_MAP[userReaction] : null;

    const authorName = comment.author_id?.full_name || comment.author_id?.username || "Người dùng";
    const authorAvatar = comment.author_id?.avatar || "https://i.pravatar.cc/100";

    return (
        <View style={[styles.commentItem, isReply && styles.commentItemReply]}>
            <Image
                source={{ uri: authorAvatar }}
                style={[styles.commentAvatar, isReply && styles.commentAvatarSmall]}
            />

            <View style={styles.commentBody}>
                <View style={styles.commentBodyInner}>
                    {/* Bubble — giong web: bg-gray-50 rounded-2xl inline-block */}
                    <View style={styles.commentBubble}>
                        <Text style={styles.commentAuthor}>{authorName}</Text>
                        <Text style={styles.commentText}>{comment.content}</Text>
                    </View>

                    {/* Reaction picker — absolute, de len action row */}
                    {pickerVisible && (
                        <View style={styles.reactionPickerWrap}>
                            <ReactionPicker
                                visible
                                userReaction={userReaction}
                                onSelect={(type) => { onToggleReaction(comment._id, type); setOpenPicker(null); }}
                                onRemove={() => { onToggleReaction(comment._id, null); setOpenPicker(null); }}
                            />
                        </View>
                    )}

                    {/* Action row */}
                    <View style={styles.commentActions}>
                        <Text style={styles.commentTime}>{getTimeAgo(comment.created_at)}</Text>

                        {/* Thich */}
                        <TouchableOpacity onPress={() => setOpenPicker(pickerVisible ? null : comment._id)} activeOpacity={0.8}>
                            <Text style={[styles.commentActionBtn, reactionCfg && { color: reactionCfg.color, fontWeight: "700" }]}>
                                {reactionCfg ? reactionCfg.label : "Thích"}
                            </Text>
                        </TouchableOpacity>

                        {/* Reaction summary inline — giong web: hien icon + so sau nut Thich */}
                        {commentReactions && commentReactions.total > 0 && (
                            <TouchableOpacity
                                style={styles.reactionInlineSummary}
                                onPress={() => onShowReactions(comment._id)}
                                activeOpacity={0.8}
                            >
                                {getMostReactedType(commentReactions.breakdown) && (
                                    <Ionicons
                                        name={REACTION_MAP[getMostReactedType(commentReactions.breakdown)]?.iconFilled}
                                        size={14}
                                        color={REACTION_MAP[getMostReactedType(commentReactions.breakdown)]?.color}
                                    />
                                )}
                                <Text style={styles.reactionInlineCount}>{commentReactions.total}</Text>
                            </TouchableOpacity>
                        )}

                        {/* Trả lời */}
                        {!isReply && (
                            <TouchableOpacity onPress={() => onReply(comment)} activeOpacity={0.8}>
                                <Text style={styles.commentActionBtn}>Trả lời</Text>
                            </TouchableOpacity>
                        )}

                        {/* Sửa + Xóa */}
                        {isOwn && (
                            <>
                                <TouchableOpacity onPress={() => onEdit(comment)} activeOpacity={0.8}>
                                    <Text style={styles.commentActionBtn}>Chỉnh sửa</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => onDelete(comment._id)} activeOpacity={0.8}>
                                    <Text style={[styles.commentActionBtn, { color: "#ef4444" }]}>Xóa</Text>
                                </TouchableOpacity>
                            </>
                        )}

                        {/* Báo cáo */}
                        {!isOwn && (
                            <TouchableOpacity onPress={() => onReport(comment._id)} activeOpacity={0.8}>
                                <Text style={[styles.commentActionBtn, { color: "#f97316" }]}>Báo cáo</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                </View>{/* end commentBodyInner */}

                {/* Nested replies */}
                {comment.children?.length > 0 && (
                    <View style={styles.repliesWrap}>
                        {comment.children.map((reply) => (
                            <CommentItem
                                key={reply._id}
                                comment={reply}
                                isReply
                                authUser={authUser}
                                onReply={onReply}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onReport={onReport}
                                reactions={reactions}
                                onToggleReaction={onToggleReaction}
                                openPicker={openPicker}
                                setOpenPicker={setOpenPicker}
                                onShowReactions={onShowReactions}
                            />
                        ))}
                    </View>
                )}
            </View>
        </View>
    );
}

// ── CommentScreen ──────────────────────────────────────────────────────────────
export default function CommentScreen({ onBack }) {
    const { selectedPostId } = useAppStore();
    const { authUser } = useAuthStore();
    const {
        comments, reactions, commentsLoading, commentsError, totalCount,
        fetchComments, createComment, updateComment, deleteComment,
        toggleReaction, reportComment, clearComments,
    } = useCommentStore();

    const [inputText, setInputText] = useState("");
    const [replyingTo, setReplyingTo] = useState(null);
    const [editingComment, setEditingComment] = useState(null);
    const [openPicker, setOpenPicker] = useState(null);
    const [reactionSheet, setReactionSheet] = useState(null);
    const [sending, setSending] = useState(false);

    // Confirm delete
    const [confirmVisible, setConfirmVisible] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    // Report
    const [reportVisible, setReportVisible] = useState(false);
    const [reportingId, setReportingId] = useState(null);
    const [reportSubmitting, setReportSubmitting] = useState(false);

    const inputRef = useRef(null);

    useEffect(() => {
        if (selectedPostId) fetchComments(selectedPostId, authUser?._id);
        return () => clearComments();
    }, [selectedPostId]);

    // ── Handlers ────────────────────────────────────────────────────────────────
    const handleReply = (comment) => {
        setReplyingTo(comment);
        setEditingComment(null);
        setInputText("");
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    const handleEdit = (comment) => {
        setEditingComment(comment);
        setReplyingTo(null);
        setInputText(comment.content);
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    const handleCancelContext = () => {
        setReplyingTo(null);
        setEditingComment(null);
        setInputText("");
    };

    const handleSend = async () => {
        if (!inputText.trim() || sending) return;
        setSending(true);
        try {
            if (editingComment) {
                await updateComment(selectedPostId, editingComment._id, inputText, authUser?._id);
                setEditingComment(null);
            } else {
                await createComment(selectedPostId, inputText, replyingTo?._id || null, authUser?._id);
                setReplyingTo(null);
            }
            setInputText("");
        } catch (_) { }
        finally { setSending(false); }
    };

    // Delete: show confirm first (giong web)
    const handleDeletePress = (commentId) => {
        setDeletingId(commentId);
        setConfirmVisible(true);
    };

    const handleConfirmDelete = async () => {
        setConfirmVisible(false);
        if (!deletingId) return;
        try { await deleteComment(selectedPostId, deletingId, authUser?._id); }
        catch (_) { }
        setDeletingId(null);
    };

    // Report
    const handleReportPress = (commentId) => {
        setReportingId(commentId);
        setReportVisible(true);
    };

    const handleSubmitReport = async (reason) => {
        if (!reason.trim() || !reportingId) return;
        setReportSubmitting(true);
        try {
            await reportComment(reportingId, reason);
            setReportVisible(false);
            setReportingId(null);
        } catch (_) { }
        finally { setReportSubmitting(false); }
    };

    const reactionSheetData = reactionSheet ? reactions[reactionSheet] : null;

    // ── Render ───────────────────────────────────────────────────────────────────
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={8} activeOpacity={0.8}>
                    <Ionicons name="arrow-back" size={22} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Bình luận</Text>
                {totalCount > 0 && (
                    <View style={styles.headerCount}>
                        <Text style={styles.headerCountText}>{totalCount}</Text>
                    </View>
                )}
            </View>

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
                {commentsLoading ? (
                    <View style={styles.centerWrap}>
                        <ActivityIndicator size="large" color="#16a34a" />
                        <Text style={styles.loadingText}>Đang tải bình luận...</Text>
                    </View>
                ) : commentsError ? (
                    <View style={styles.centerWrap}>
                        <Ionicons name="alert-circle-outline" size={40} color="#ef4444" />
                        <Text style={styles.errorText}>{commentsError}</Text>
                        <TouchableOpacity style={styles.retryBtn} onPress={() => fetchComments(selectedPostId, authUser?._id)} activeOpacity={0.85}>
                            <Text style={styles.retryBtnText}>Thử lại</Text>
                        </TouchableOpacity>
                    </View>
                ) : comments.length === 0 ? (
                    <View style={styles.centerWrap}>
                        <Ionicons name="chatbubble-ellipses-outline" size={52} color="#d1d5db" />
                        <Text style={styles.emptyTitle}>Chưa có bình luận nào</Text>
                        <Text style={styles.emptyDesc}>Hãy là người đầu tiên bình luận!</Text>
                    </View>
                ) : (
                    <FlatList
                        data={comments}
                        keyExtractor={(item) => item._id}
                        renderItem={({ item }) => (
                            <CommentItem
                                comment={item}
                                authUser={authUser}
                                onReply={handleReply}
                                onEdit={handleEdit}
                                onDelete={handleDeletePress}
                                onReport={handleReportPress}
                                reactions={reactions}
                                onToggleReaction={(id, type) => toggleReaction(id, type, authUser?._id)}
                                openPicker={openPicker}
                                setOpenPicker={setOpenPicker}
                                onShowReactions={(id) => setReactionSheet(id)}
                            />
                        )}
                        contentContainerStyle={styles.list}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    />
                )}

                {/* Input area */}
                <View style={styles.inputArea}>
                    {(replyingTo || editingComment) && (
                        <View style={[styles.contextBanner, editingComment && styles.contextBannerEdit]}>
                            <Text style={styles.contextBannerText} numberOfLines={1}>
                                {editingComment
                                    ? "Đang chỉnh sửa bình luận"
                                    : `Trả lời ${replyingTo?.author_id?.full_name || "người dùng"}`}
                            </Text>
                            <TouchableOpacity onPress={handleCancelContext} hitSlop={8}>
                                <Ionicons name="close" size={18} color="#6b7280" />
                            </TouchableOpacity>
                        </View>
                    )}
                    <View style={styles.inputRow}>
                        <Image
                            source={{ uri: authUser?.avatar || "https://i.pravatar.cc/100" }}
                            style={styles.inputAvatar}
                        />
                        <TextInput
                            ref={inputRef}
                            style={styles.textInput}
                            value={inputText}
                            onChangeText={setInputText}
                            placeholder={
                                editingComment ? "Chỉnh sửa bình luận..."
                                    : replyingTo ? `Trả lời ${replyingTo.author_id?.full_name || ""}...`
                                        : "Viết bình luận..."
                            }
                            placeholderTextColor="#9ca3af"
                            multiline
                            maxLength={500}
                        />
                        <TouchableOpacity
                            style={[styles.sendBtn, (!inputText.trim() || sending) && styles.sendBtnDisabled]}
                            onPress={handleSend}
                            disabled={!inputText.trim() || sending}
                            activeOpacity={0.85}
                        >
                            {sending
                                ? <ActivityIndicator size="small" color="#fff" />
                                : <Ionicons name="send" size={18} color="#fff" />
                            }
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>

            {/* Reaction detail bottom sheet */}
            <ReactionDetailSheet
                visible={!!reactionSheet}
                reactions={reactionSheetData}
                onClose={() => setReactionSheet(null)}
            />

            {/* Confirm delete modal */}
            <ConfirmModal
                visible={confirmVisible}
                message="Ban co chac muon xoa binh luan nay? Tat ca tra loi cung se bi xoa."
                onClose={() => { setConfirmVisible(false); setDeletingId(null); }}
                onConfirm={handleConfirmDelete}
            />

            {/* Report modal */}
            <ReportModal
                visible={reportVisible}
                onClose={() => { setReportVisible(false); setReportingId(null); }}
                onSubmit={handleSubmitReport}
                submitting={reportSubmitting}
            />
        </View>
    );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F9FAFB" },

    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#f3f4f6",
        gap: 12,
    },
    backBtn: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: "#f3f4f6",
        alignItems: "center", justifyContent: "center",
    },
    headerTitle: { flex: 1, fontSize: 17, fontWeight: "700", color: "#111827" },
    headerCount: {
        backgroundColor: "#d1fae5", borderRadius: 20,
        paddingHorizontal: 10, paddingVertical: 3,
    },
    headerCountText: { fontSize: 13, fontWeight: "700", color: "#065f46" },

    centerWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 24 },
    loadingText: { fontSize: 14, color: "#6b7280" },
    errorText: { fontSize: 14, color: "#ef4444", textAlign: "center" },
    retryBtn: { backgroundColor: "#16a34a", borderRadius: 10, paddingHorizontal: 20, paddingVertical: 9 },
    retryBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
    emptyTitle: { fontSize: 16, fontWeight: "700", color: "#374151" },
    emptyDesc: { fontSize: 13, color: "#9ca3af" },

    list: { padding: 16, paddingBottom: 12 },

    // Comment item
    commentItem: { flexDirection: "row", marginBottom: 20, gap: 10 },
    commentItemReply: { marginTop: 10, marginBottom: 0 },
    commentAvatar: {
        width: 40, height: 40, borderRadius: 20,
        borderWidth: 2, borderColor: "#f3f4f6",
        flexShrink: 0, marginTop: 2,
    },
    commentAvatarSmall: { width: 32, height: 32, borderRadius: 16 },
    commentBody: { flex: 1 },
    commentBodyInner: { position: "relative" },

    // Bubble — giong web bg-gray-50 rounded-2xl inline-block
    commentBubble: {
        backgroundColor: "#f9fafb",
        borderRadius: 18, borderTopLeftRadius: 4,
        paddingHorizontal: 14, paddingVertical: 10,
        alignSelf: "flex-start", maxWidth: "100%",
        borderWidth: 1, borderColor: "#f3f4f6",
    },
    commentAuthor: { fontSize: 13, fontWeight: "700", color: "#111827", marginBottom: 3 },
    commentText: { fontSize: 14, color: "#374151", lineHeight: 20 },

    // Reaction summary badge (overlap bottom of bubble)
    reactionSummary: {
        flexDirection: "row", alignItems: "center", gap: 3,
        alignSelf: "flex-start",
        backgroundColor: "#fff", borderRadius: 20,
        borderWidth: 1, borderColor: "#e5e7eb",
        paddingHorizontal: 7, paddingVertical: 2,
        marginTop: -8, marginLeft: 10,
        shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06, shadowRadius: 2, elevation: 2,
    },
    reactionSummaryText: { fontSize: 11, fontWeight: "600", color: "#6b7280" },

    // Wrapper tuyet doi - de len action row khong day xuong (giong web absolute bottom-6 left-7)
    reactionPickerWrap: {
        position: "absolute",
        bottom: 26,
        left: 36,
        zIndex: 20,
    },
    reactionPicker: {
        flexDirection: "row", alignItems: "center", gap: 2,
        backgroundColor: "#fff",
        borderRadius: 30, borderWidth: 1, borderColor: "#e5e7eb",
        paddingHorizontal: 8, paddingVertical: 6,
        shadowColor: "#000", shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.14, shadowRadius: 12, elevation: 8,
    },
    reactionPickerBtn: {
        width: 38, height: 38, borderRadius: 19,
        alignItems: "center", justifyContent: "center",
    },
    reactionPickerBtnActive: { backgroundColor: "#f3f4f6" },
    reactionPickerRemoveBtn: {
        borderLeftWidth: 1, borderLeftColor: "#e5e7eb", marginLeft: 2,
    },

    // Action row
    commentActions: {
        flexDirection: "row", alignItems: "center",
        gap: 12, marginTop: 6, marginLeft: 4, flexWrap: "wrap",
    },
    commentTime: { fontSize: 11, color: "#9ca3af" },
    commentActionBtn: { fontSize: 12, fontWeight: "600", color: "#6b7280" },

    // Inline reaction summary next to action row
    reactionInlineSummary: {
        flexDirection: "row", alignItems: "center", gap: 3,
    },
    reactionInlineCount: { fontSize: 12, color: "#6b7280" },

    // Nested replies
    repliesWrap: {
        marginTop: 6, paddingLeft: 6,
        borderLeftWidth: 2, borderLeftColor: "#f3f4f6",
    },

    // Input area
    inputArea: {
        backgroundColor: "#fff",
        borderTopWidth: 1, borderTopColor: "#f3f4f6",
        paddingBottom: Platform.OS === "ios" ? 8 : 10,
    },
    contextBanner: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        backgroundColor: "#ecfdf5",
        paddingHorizontal: 16, paddingVertical: 8,
        borderBottomWidth: 1, borderBottomColor: "#d1fae5",
    },
    contextBannerEdit: { backgroundColor: "#fff7ed", borderBottomColor: "#fed7aa" },
    contextBannerText: { fontSize: 13, fontWeight: "600", color: "#374151", flex: 1, marginRight: 8 },
    inputRow: {
        flexDirection: "row", alignItems: "flex-end",
        paddingHorizontal: 12, paddingTop: 10, gap: 10,
    },
    inputAvatar: {
        width: 36, height: 36, borderRadius: 18,
        borderWidth: 2, borderColor: "#f3f4f6", flexShrink: 0,
    },
    textInput: {
        flex: 1, backgroundColor: "#f3f4f6",
        borderRadius: 22, paddingHorizontal: 16,
        paddingVertical: Platform.OS === "ios" ? 10 : 8,
        fontSize: 14, color: "#111827", maxHeight: 120,
        borderWidth: 1, borderColor: "#e5e7eb",
    },
    sendBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: "#16a34a",
        alignItems: "center", justifyContent: "center", flexShrink: 0,
    },
    sendBtnDisabled: { backgroundColor: "#d1d5db" },

    // Reaction detail bottom sheet
    sheetBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.25)" },
    sheetBox: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        maxHeight: "70%",
    },
    sheetHeader: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        paddingHorizontal: 20, paddingVertical: 16,
        borderBottomWidth: 1, borderBottomColor: "#f3f4f6",
    },
    sheetTitle: { fontSize: 17, fontWeight: "700", color: "#111827" },
    sheetBreakdown: {
        flexDirection: "row", justifyContent: "center", flexWrap: "wrap",
        gap: 24, paddingVertical: 20, paddingHorizontal: 16,
        borderBottomWidth: 1, borderBottomColor: "#f3f4f6",
    },
    sheetBreakdownItem: { alignItems: "center", gap: 4, minWidth: 56 },
    sheetBreakdownCount: { fontSize: 18, fontWeight: "800", color: "#111827" },
    sheetBreakdownLabel: { fontSize: 12, color: "#6b7280" },
    sheetUserList: { paddingHorizontal: 20, paddingVertical: 8 },
    sheetUserRow: {
        flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10,
    },
    sheetUserAvatar: { width: 36, height: 36, borderRadius: 18 },
    sheetUserName: { flex: 1, fontSize: 14, fontWeight: "500", color: "#111827" },

    // Modal overlay (confirm + report)
    modalOverlay: {
        flex: 1, backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center", alignItems: "center", padding: 24,
    },

    // Confirm modal
    confirmBox: {
        backgroundColor: "#fff", borderRadius: 20,
        padding: 24, width: "100%", maxWidth: 320, gap: 16,
    },
    confirmMessage: { fontSize: 14, color: "#374151", textAlign: "center", lineHeight: 20 },
    confirmBtns: { flexDirection: "row", gap: 10 },
    confirmCancelBtn: {
        flex: 1, borderWidth: 2, borderColor: "#e5e7eb",
        borderRadius: 12, paddingVertical: 12, alignItems: "center",
    },
    confirmCancelText: { fontSize: 14, fontWeight: "700", color: "#374151" },
    confirmDeleteBtn: {
        flex: 1, backgroundColor: "#ef4444",
        borderRadius: 12, paddingVertical: 12, alignItems: "center",
    },
    confirmDeleteText: { fontSize: 14, fontWeight: "700", color: "#fff" },

    // Report modal
    reportBox: {
        backgroundColor: "#fff", borderRadius: 20,
        padding: 20, width: "100%", maxWidth: 360, gap: 12,
    },
    reportHeader: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    },
    reportHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
    reportIconWrap: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: "#fff7ed",
        alignItems: "center", justifyContent: "center",
    },
    reportTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
    reportDesc: { fontSize: 13, color: "#6b7280", lineHeight: 18 },
    reportInput: {
        backgroundColor: "#f9fafb", borderRadius: 14,
        borderWidth: 1, borderColor: "#e5e7eb",
        paddingHorizontal: 14, paddingVertical: 12,
        fontSize: 14, color: "#111827", minHeight: 100, maxHeight: 200,
        textAlignVertical: "top",
    },
    reportFooter: { alignItems: "flex-end" },
    reportSubmitBtn: {
        backgroundColor: "#f97316", borderRadius: 12,
        paddingHorizontal: 20, paddingVertical: 10,
        minWidth: 100, alignItems: "center",
    },
    reportSubmitBtnDisabled: { opacity: 0.5 },
    reportSubmitText: { fontSize: 14, fontWeight: "700", color: "#fff" },
});