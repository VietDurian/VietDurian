import { useState, useRef, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    TextInput,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "../store/useAppStore";

// ── Mock Data ──────────────────────────────────────────────────────────────────
const MOCK_COMMENTS = [
    {
        _id: "c1",
        content: "Bài viết rất hay! Cảm ơn bạn đã chia sẻ kinh nghiệm quý báu này.",
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        author_id: {
            _id: "u1",
            full_name: "Nguyễn Văn An",
            username: "nguyenvanan",
            avatar: "https://i.pravatar.cc/100?img=8",
        },
        children: [
            {
                _id: "c1r1",
                content: "Đồng ý! Mình cũng áp dụng thử và thấy hiệu quả lắm.",
                created_at: new Date(Date.now() - 3600000).toISOString(),
                author_id: {
                    _id: "u2",
                    full_name: "Trần Thị Lan",
                    username: "trantilan",
                    avatar: "https://i.pravatar.cc/100?img=5",
                },
                children: [],
            },
        ],
    },
    {
        _id: "c2",
        content: "Cho mình hỏi kỹ thuật này áp dụng cho giống sầu riêng Musang King được không vậy bạn?",
        created_at: new Date(Date.now() - 7200000).toISOString(),
        author_id: {
            _id: "u3",
            full_name: "Lê Minh Tuấn",
            username: "leminhtuấn",
            avatar: "https://i.pravatar.cc/100?img=11",
        },
        children: [],
    },
    {
        _id: "c3",
        content: "Mình đã thử phương pháp này được 2 vụ rồi, kết quả tốt hơn hẳn so với cách cũ. Bà con nên thử!",
        created_at: new Date(Date.now() - 86400000).toISOString(),
        author_id: {
            _id: "u4",
            full_name: "Phạm Thu Hà",
            username: "phamthuha",
            avatar: "https://i.pravatar.cc/100?img=16",
        },
        children: [],
    },
];

// Mock reactions per comment
const MOCK_REACTIONS = {
    c1: { total: 12, breakdown: { like: 8, love: 3, haha: 1, angry: 0 }, userReaction: "love" },
    c1r1: { total: 4, breakdown: { like: 4, love: 0, haha: 0, angry: 0 }, userReaction: null },
    c2: { total: 2, breakdown: { like: 1, love: 0, haha: 1, angry: 0 }, userReaction: null },
    c3: { total: 7, breakdown: { like: 5, love: 2, haha: 0, angry: 0 }, userReaction: "like" },
};

// Mock current user
const MOCK_AUTH_USER = {
    _id: "me",
    full_name: "Bạn",
    avatar: "https://i.pravatar.cc/100?img=20",
};

// ── Constants ──────────────────────────────────────────────────────────────────
const REACTION_TYPES = [
    { type: "like", icon: "thumbs-up", color: "#3b82f6", label: "Thích" },
    { type: "love", icon: "heart", color: "#ef4444", label: "Yêu thích" },
    { type: "haha", icon: "happy", color: "#eab308", label: "Haha" },
    { type: "angry", icon: "flame", color: "#f97316", label: "Phẫn nộ" },
];

const REACTION_MAP = {
    like: { icon: "thumbs-up", color: "#3b82f6", label: "Thích" },
    love: { icon: "heart", color: "#ef4444", label: "Yêu thích" },
    haha: { icon: "happy", color: "#eab308", label: "Haha" },
    angry: { icon: "flame", color: "#f97316", label: "Phẫn nộ" },
};

// ── Helpers ────────────────────────────────────────────────────────────────────
function getTimeAgo(dateString) {
    const now = Date.now();
    const diff = Math.floor((now - new Date(dateString).getTime()) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
    return `${Math.floor(diff / 604800)}w`;
}

function getMostReactedType(breakdown) {
    if (!breakdown) return null;
    return Object.entries(breakdown)
        .filter(([, v]) => v > 0)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || null;
}

// ── Reaction Picker (inline popup) ────────────────────────────────────────────
function ReactionPicker({ onSelect, onRemove, userReaction, visible }) {
    if (!visible) return null;
    return (
        <View style={styles.reactionPicker}>
            {REACTION_TYPES.map((r) => (
                <TouchableOpacity
                    key={r.type}
                    style={[
                        styles.reactionPickerBtn,
                        userReaction === r.type && styles.reactionPickerBtnActive,
                    ]}
                    onPress={() => userReaction === r.type ? onRemove() : onSelect(r.type)}
                    activeOpacity={0.8}
                >
                    <Ionicons name={r.icon} size={22} color={r.color} />
                </TouchableOpacity>
            ))}
        </View>
    );
}

// ── Reaction Summary ───────────────────────────────────────────────────────────
function ReactionSummary({ reactions, onPress }) {
    if (!reactions || reactions.total === 0) return null;
    const top = getMostReactedType(reactions.breakdown);
    const cfg = top ? REACTION_MAP[top] : null;
    return (
        <TouchableOpacity style={styles.reactionSummary} onPress={onPress} activeOpacity={0.8}>
            {cfg && <Ionicons name={cfg.icon} size={14} color={cfg.color} />}
            <Text style={styles.reactionSummaryText}>{reactions.total}</Text>
        </TouchableOpacity>
    );
}

// ── Reaction Detail Modal ──────────────────────────────────────────────────────
function ReactionDetailModal({ visible, reactions, onClose }) {
    if (!visible || !reactions) return null;
    return (
        <View style={styles.reactionDetailOverlay}>
            <TouchableOpacity style={styles.reactionDetailBackdrop} onPress={onClose} activeOpacity={1} />
            <View style={styles.reactionDetailBox}>
                <View style={styles.reactionDetailHeader}>
                    <Text style={styles.reactionDetailTitle}>Reactions</Text>
                    <TouchableOpacity onPress={onClose} hitSlop={8}>
                        <Ionicons name="close" size={22} color="#374151" />
                    </TouchableOpacity>
                </View>
                {/* Breakdown row */}
                <View style={styles.reactionDetailBreakdown}>
                    {REACTION_TYPES.map((r) => {
                        const count = reactions.breakdown?.[r.type] || 0;
                        if (count === 0) return null;
                        return (
                            <View key={r.type} style={styles.reactionDetailItem}>
                                <Ionicons name={r.icon} size={24} color={r.color} />
                                <Text style={styles.reactionDetailCount}>{count}</Text>
                                <Text style={styles.reactionDetailLabel}>{r.label}</Text>
                            </View>
                        );
                    })}
                </View>
            </View>
        </View>
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
    reactions,
    onToggleReaction,
    openPicker,
    setOpenPicker,
    onShowReactions,
}) {
    const isOwn = comment.author_id?._id === authUser?._id;
    const commentReactions = reactions[comment._id];
    const userReaction = commentReactions?.userReaction || null;
    const pickerVisible = openPicker === comment._id;

    const reactionCfg = userReaction ? REACTION_MAP[userReaction] : null;

    return (
        <View style={[styles.commentItem, isReply && styles.commentItemReply]}>
            {/* Avatar */}
            <Image
                source={{ uri: comment.author_id?.avatar || "https://i.pravatar.cc/100" }}
                style={[styles.commentAvatar, isReply && styles.commentAvatarSmall]}
            />

            <View style={styles.commentBody}>
                {/* Bubble */}
                <View style={styles.commentBubble}>
                    <Text style={styles.commentAuthor}>
                        {comment.author_id?.full_name || comment.author_id?.username || "Người dùng"}
                    </Text>
                    <Text style={styles.commentText}>{comment.content}</Text>
                </View>

                {/* Reaction summary on bubble bottom-right */}
                <ReactionSummary
                    reactions={commentReactions}
                    onPress={() => onShowReactions(comment._id)}
                />

                {/* Action row */}
                <View style={styles.commentActions}>
                    <Text style={styles.commentTime}>{getTimeAgo(comment.created_at)}</Text>

                    {/* Like / Reaction button */}
                    <TouchableOpacity
                        onPress={() => setOpenPicker(pickerVisible ? null : comment._id)}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.commentActionText, reactionCfg && { color: reactionCfg.color, fontWeight: "700" }]}>
                            {reactionCfg ? reactionCfg.label : "Thích"}
                        </Text>
                    </TouchableOpacity>

                    {/* Reply (not for nested replies) */}
                    {!isReply && (
                        <TouchableOpacity onPress={() => onReply(comment)} activeOpacity={0.8}>
                            <Text style={styles.commentActionText}>Trả lời</Text>
                        </TouchableOpacity>
                    )}

                    {/* Own comment: edit + delete */}
                    {isOwn && (
                        <>
                            <TouchableOpacity onPress={() => onEdit(comment)} activeOpacity={0.8}>
                                <Text style={styles.commentActionText}>Sửa</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => onDelete(comment._id)} activeOpacity={0.8}>
                                <Text style={[styles.commentActionText, { color: "#ef4444" }]}>Xóa</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                {/* Reaction picker */}
                <ReactionPicker
                    visible={pickerVisible}
                    userReaction={userReaction}
                    onSelect={(type) => {
                        onToggleReaction(comment._id, type);
                        setOpenPicker(null);
                    }}
                    onRemove={() => {
                        onToggleReaction(comment._id, null);
                        setOpenPicker(null);
                    }}
                />

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
    // TODO khi kết nối API: dùng selectedPostId để fetch comments
    // useEffect(() => { fetchComments(selectedPostId); }, [selectedPostId]);

    const [comments, setComments] = useState(MOCK_COMMENTS);
    const [reactions, setReactions] = useState(MOCK_REACTIONS);
    const [inputText, setInputText] = useState("");
    const [replyingTo, setReplyingTo] = useState(null);   // comment object
    const [editingComment, setEditingComment] = useState(null); // comment object
    const [openPicker, setOpenPicker] = useState(null);   // comment _id
    const [reactionModalData, setReactionModalData] = useState(null); // { commentId, reactions }
    const [loading] = useState(false);

    const inputRef = useRef(null);

    // ── Helpers ─────────────────────────────────────────────────────────────────
    const totalCount = useCallback(() => {
        let count = 0;
        const walk = (list) => { list.forEach((c) => { count++; walk(c.children || []); }); };
        walk(comments);
        return count;
    }, [comments]);

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

    const handleSend = () => {
        if (!inputText.trim()) return;

        if (editingComment) {
            // Edit existing
            const updateContent = (list) =>
                list.map((c) =>
                    c._id === editingComment._id
                        ? { ...c, content: inputText.trim() }
                        : { ...c, children: updateContent(c.children || []) }
                );
            setComments(updateContent(comments));
            setEditingComment(null);
        } else {
            const newComment = {
                _id: `c${Date.now()}`,
                content: inputText.trim(),
                created_at: new Date().toISOString(),
                author_id: MOCK_AUTH_USER,
                children: [],
            };

            if (replyingTo) {
                // Add as reply
                const addReply = (list) =>
                    list.map((c) =>
                        c._id === replyingTo._id
                            ? { ...c, children: [...(c.children || []), newComment] }
                            : { ...c, children: addReply(c.children || []) }
                    );
                setComments(addReply(comments));
                setReplyingTo(null);
            } else {
                setComments([...comments, newComment]);
            }
        }

        setInputText("");
    };

    const handleDelete = (commentId) => {
        const removeComment = (list) =>
            list
                .filter((c) => c._id !== commentId)
                .map((c) => ({ ...c, children: removeComment(c.children || []) }));
        setComments(removeComment(comments));
    };

    const handleToggleReaction = (commentId, type) => {
        setReactions((prev) => {
            const current = prev[commentId] || { total: 0, breakdown: { like: 0, love: 0, haha: 0, angry: 0 }, userReaction: null };
            const prevType = current.userReaction;

            let newBreakdown = { ...current.breakdown };
            let newTotal = current.total;
            let newUserReaction = null;

            if (prevType) {
                // Remove old reaction
                newBreakdown[prevType] = Math.max(0, (newBreakdown[prevType] || 0) - 1);
                newTotal = Math.max(0, newTotal - 1);
            }

            if (type && type !== prevType) {
                // Add new reaction
                newBreakdown[type] = (newBreakdown[type] || 0) + 1;
                newTotal += 1;
                newUserReaction = type;
            }

            return {
                ...prev,
                [commentId]: { total: newTotal, breakdown: newBreakdown, userReaction: newUserReaction },
            };
        });
    };

    const handleShowReactions = (commentId) => {
        setReactionModalData({ commentId, data: reactions[commentId] });
    };

    // ── Render ───────────────────────────────────────────────────────────────────
    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={8} activeOpacity={0.8}>
                    <Ionicons name="arrow-back" size={22} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Bình luận</Text>
                <View style={styles.headerCount}>
                    <Text style={styles.headerCountText}>{totalCount()}</Text>
                </View>
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
            >
                {/* Comments List */}
                {loading ? (
                    <View style={styles.centerWrap}>
                        <ActivityIndicator size="large" color="#16a34a" />
                        <Text style={styles.loadingText}>Đang tải bình luận...</Text>
                    </View>
                ) : comments.length === 0 ? (
                    <View style={styles.centerWrap}>
                        <Ionicons name="chatbubble-outline" size={48} color="#d1d5db" />
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
                                authUser={MOCK_AUTH_USER}
                                onReply={handleReply}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                reactions={reactions}
                                onToggleReaction={handleToggleReaction}
                                openPicker={openPicker}
                                setOpenPicker={setOpenPicker}
                                onShowReactions={handleShowReactions}
                            />
                        )}
                        contentContainerStyle={styles.list}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    />
                )}

                {/* Input Area */}
                <View style={styles.inputArea}>
                    {/* Context banner: replying / editing */}
                    {(replyingTo || editingComment) && (
                        <View style={[
                            styles.contextBanner,
                            editingComment && styles.contextBannerEdit,
                        ]}>
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

                    {/* Input row */}
                    <View style={styles.inputRow}>
                        <Image
                            source={{ uri: MOCK_AUTH_USER.avatar }}
                            style={styles.inputAvatar}
                        />
                        <TextInput
                            ref={inputRef}
                            style={styles.textInput}
                            value={inputText}
                            onChangeText={setInputText}
                            placeholder={
                                editingComment
                                    ? "Chỉnh sửa bình luận..."
                                    : replyingTo
                                        ? `Trả lời ${replyingTo.author_id?.full_name || ""}...`
                                        : "Viết bình luận..."
                            }
                            placeholderTextColor="#9ca3af"
                            multiline
                            maxLength={500}
                            returnKeyType="default"
                        />
                        <TouchableOpacity
                            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
                            onPress={handleSend}
                            disabled={!inputText.trim()}
                            activeOpacity={0.85}
                        >
                            <Ionicons name="send" size={18} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>

            {/* Reaction Detail Modal */}
            <ReactionDetailModal
                visible={!!reactionModalData}
                reactions={reactionModalData?.data}
                onClose={() => setReactionModalData(null)}
            />
        </SafeAreaView>
    );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F9FAFB" },

    // Header
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
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#f3f4f6",
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: { flex: 1, fontSize: 17, fontWeight: "700", color: "#111827" },
    headerCount: {
        backgroundColor: "#d1fae5",
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 3,
    },
    headerCountText: { fontSize: 13, fontWeight: "700", color: "#065f46" },

    // States
    centerWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 24 },
    loadingText: { fontSize: 14, color: "#6b7280" },
    emptyTitle: { fontSize: 16, fontWeight: "700", color: "#374151" },
    emptyDesc: { fontSize: 13, color: "#9ca3af" },

    // List
    list: { padding: 16, paddingBottom: 8 },

    // Comment item
    commentItem: {
        flexDirection: "row",
        marginBottom: 16,
        gap: 10,
    },
    commentItemReply: {
        marginTop: 12,
        marginBottom: 0,
    },
    commentAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: "#f3f4f6",
        flexShrink: 0,
        marginTop: 2,
    },
    commentAvatarSmall: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    commentBody: { flex: 1 },

    // Bubble
    commentBubble: {
        backgroundColor: "#f3f4f6",
        borderRadius: 18,
        borderTopLeftRadius: 4,
        paddingHorizontal: 14,
        paddingVertical: 10,
        alignSelf: "flex-start",
        maxWidth: "100%",
    },
    commentAuthor: {
        fontSize: 13,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 3,
    },
    commentText: {
        fontSize: 14,
        color: "#374151",
        lineHeight: 20,
    },

    // Reaction summary (overlaps bubble bottom)
    reactionSummary: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
        alignSelf: "flex-start",
        backgroundColor: "#fff",
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        paddingHorizontal: 7,
        paddingVertical: 2,
        marginTop: -8,
        marginLeft: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 2,
        elevation: 1,
    },
    reactionSummaryText: { fontSize: 11, fontWeight: "600", color: "#6b7280" },

    // Action row
    commentActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        marginTop: 6,
        marginLeft: 4,
    },
    commentTime: { fontSize: 11, color: "#9ca3af" },
    commentActionText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#6b7280",
    },

    // Reaction picker popup
    reactionPicker: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: "#fff",
        borderRadius: 30,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        paddingHorizontal: 8,
        paddingVertical: 6,
        marginTop: 6,
        alignSelf: "flex-start",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    reactionPickerBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
    },
    reactionPickerBtnActive: {
        backgroundColor: "#f3f4f6",
    },

    // Nested replies
    repliesWrap: {
        marginTop: 4,
        paddingLeft: 4,
        borderLeftWidth: 2,
        borderLeftColor: "#f3f4f6",
    },

    // Reaction detail modal
    reactionDetailOverlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 100,
        justifyContent: "flex-end",
    },
    reactionDetailBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.4)",
    },
    reactionDetailBox: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: 32,
    },
    reactionDetailHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f3f4f6",
    },
    reactionDetailTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
    reactionDetailBreakdown: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 24,
        paddingVertical: 20,
        paddingHorizontal: 16,
    },
    reactionDetailItem: { alignItems: "center", gap: 4 },
    reactionDetailCount: { fontSize: 16, fontWeight: "800", color: "#111827" },
    reactionDetailLabel: { fontSize: 11, color: "#6b7280" },

    // Input area
    inputArea: {
        backgroundColor: "#fff",
        borderTopWidth: 1,
        borderTopColor: "#f3f4f6",
        paddingBottom: Platform.OS === "ios" ? 8 : 12,
    },

    // Context banner
    contextBanner: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#ecfdf5",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#d1fae5",
    },
    contextBannerEdit: {
        backgroundColor: "#fff7ed",
        borderBottomColor: "#fed7aa",
    },
    contextBannerText: { fontSize: 13, fontWeight: "600", color: "#374151", flex: 1 },

    inputRow: {
        flexDirection: "row",
        alignItems: "flex-end",
        paddingHorizontal: 12,
        paddingTop: 10,
        gap: 10,
    },
    inputAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 2,
        borderColor: "#f3f4f6",
        flexShrink: 0,
    },
    textInput: {
        flex: 1,
        backgroundColor: "#f3f4f6",
        borderRadius: 22,
        paddingHorizontal: 16,
        paddingVertical: Platform.OS === "ios" ? 10 : 8,
        fontSize: 14,
        color: "#111827",
        maxHeight: 120,
    },
    sendBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: "#16a34a",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },
    sendBtnDisabled: { backgroundColor: "#d1d5db" },
});