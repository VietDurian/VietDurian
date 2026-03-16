import { useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePostStore } from "../store/usePostStore";
import { useAppStore } from "../store/useAppStore";

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

// ── Favorite Post Card ─────────────────────────────────────────────────────────
function FavoritePostCard({ post, onUnfavorite }) {
    const { navigate, setSelectedPostId } = useAppStore();
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