import { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    Modal,
    TextInput,
    ActivityIndicator,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// ── Constants ──────────────────────────────────────────────────────────────────
const CATEGORY_CONFIG = {
    "Dịch vụ": { icon: "construct-outline", bg: "#dbeafe", text: "#1d4ed8" },
    "Kinh nghiệm": { icon: "book-outline", bg: "#fef3c7", text: "#b45309" },
    "Sản phẩm": { icon: "cube-outline", bg: "#d1fae5", text: "#065f46" },
    "Thuê dịch vụ": { icon: "cash-outline", bg: "#ede9fe", text: "#5b21b6" },
    "Khác": { icon: "grid-outline", bg: "#f3f4f6", text: "#374151" },
};

const STATUS_CONFIG = {
    pending: { icon: "time-outline", label: "Đang chờ duyệt", bg: "#fffbeb", border: "#fde68a", text: "#b45309" },
    active: { icon: "checkmark-circle-outline", label: "Đã duyệt", bg: "#ecfdf5", border: "#a7f3d0", text: "#065f46" },
    rejected: { icon: "close-circle-outline", label: "Bị từ chối", bg: "#fff1f2", border: "#fecaca", text: "#b91c1c" },
    inactive: { icon: "alert-circle-outline", label: "Ngưng hoạt động", bg: "#f9fafb", border: "#e5e7eb", text: "#6b7280" },
};

// ── Mock Data ──────────────────────────────────────────────────────────────────
const MOCK_FAVORITES = [
    {
        _id: "fav1",
        status: "active",
        post_id: {
            _id: "p1",
            title: "Bán sầu riêng Ri6 chín cây, giá tốt tại vườn",
            content: "Vườn nhà mình có sầu riêng Ri6 đang cho thu hoạch. Trái đều, ngọt, cơm dày. Giá tại vườn: 65.000đ/kg.",
            contact: "0901234567",
            category: "Sản phẩm",
            image: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=600",
            likes_count: 24,
            comments_count: 8,
            created_at: new Date(Date.now() - 3600000).toISOString(),
            author_id: {
                _id: "u1",
                full_name: "Nguyễn Văn An",
                email: "nguyenvanan@gmail.com",
                avatar: "https://i.pravatar.cc/100?img=8",
            },
        },
    },
    {
        _id: "fav2",
        status: "active",
        post_id: {
            _id: "p2",
            title: "Kỹ thuật xử lý ra hoa sầu riêng nghịch vụ hiệu quả",
            content: "Sau nhiều năm trồng sầu riêng, mình đúc kết được kỹ thuật xiết nước và phun KNO3 để kích thích ra hoa nghịch vụ. Tỉ lệ thành công trên 80%.",
            contact: "0912345678",
            category: "Kinh nghiệm",
            image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600",
            likes_count: 51,
            comments_count: 15,
            created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
            author_id: {
                _id: "u2",
                full_name: "Trần Thị Lan",
                email: "trantilan@gmail.com",
                avatar: "https://i.pravatar.cc/100?img=5",
            },
        },
    },
    {
        _id: "fav3",
        status: "pending",
        post_id: {
            _id: "p3",
            title: "Nhận phun thuốc, diệt sâu bệnh cho vườn sầu riêng",
            content: "Kinh nghiệm 7 năm trong nghề phun thuốc BVTV. Có đầy đủ trang thiết bị. Phục vụ khu vực Đồng Nai, Bình Dương, Long An.",
            contact: "0987654321",
            category: "Dịch vụ",
            image: null,
            likes_count: 12,
            comments_count: 3,
            created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
            author_id: {
                _id: "u3",
                full_name: "Lê Minh Tuấn",
                email: "leminhtuấn@gmail.com",
                avatar: "https://i.pravatar.cc/100?img=11",
            },
        },
    },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatTimestamp(dateString) {
    if (!dateString) return "Không rõ";
    try {
        return new Date(dateString).toLocaleDateString("vi-VN", {
            day: "2-digit", month: "2-digit", year: "numeric",
        });
    } catch { return "Không rõ"; }
}

// ── Status Badge ───────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    return (
        <View style={[styles.statusBadge, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
            <Ionicons name={cfg.icon} size={12} color={cfg.text} />
            <Text style={[styles.statusBadgeText, { color: cfg.text }]}>{cfg.label}</Text>
        </View>
    );
}

// ── Category Badge ─────────────────────────────────────────────────────────────
function CategoryBadge({ category }) {
    const cfg = CATEGORY_CONFIG[category];
    if (!cfg) return null;
    return (
        <View style={[styles.categoryBadge, { backgroundColor: cfg.bg }]}>
            <Ionicons name={cfg.icon} size={11} color={cfg.text} />
            <Text style={[styles.categoryBadgeText, { color: cfg.text }]}>{category}</Text>
        </View>
    );
}

// ── Confirm Modal ──────────────────────────────────────────────────────────────
function ConfirmModal({ visible, onClose, onConfirm, message }) {
    if (!visible) return null;
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.confirmBox}>
                    <View style={styles.confirmIconWrap}>
                        <Ionicons name="trash-outline" size={28} color="#ef4444" />
                    </View>
                    <Text style={styles.confirmTitle}>Xác nhận xóa</Text>
                    <Text style={styles.confirmMessage}>{message}</Text>
                    <View style={styles.confirmBtns}>
                        <TouchableOpacity style={styles.confirmCancelBtn} onPress={onClose} activeOpacity={0.85}>
                            <Text style={styles.confirmCancelText}>Hủy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.confirmDeleteBtn} onPress={onConfirm} activeOpacity={0.85}>
                            <Ionicons name="trash-outline" size={16} color="#fff" />
                            <Text style={styles.confirmDeleteText}>Xóa</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

// ── Favorite Post Card ─────────────────────────────────────────────────────────
function FavoritePostCard({ favorite, onUnfavorite, onContact }) {
    const [isLiked, setIsLiked] = useState(true);
    const [showMenu, setShowMenu] = useState(false);
    const post = favorite.post_id;
    const author = post?.author_id || {};

    if (!post) return null;

    return (
        <View style={styles.card}>
            {/* Header */}
            <View style={styles.cardHeader}>
                <TouchableOpacity style={styles.cardAvatarWrap}>
                    <Image source={{ uri: author.avatar || "https://i.pravatar.cc/100" }} style={styles.cardAvatar} />
                </TouchableOpacity>

                <View style={styles.cardAuthorInfo}>
                    <View style={styles.cardNameRow}>
                        <Text style={styles.cardAuthorName}>{author.full_name || "Người dùng"}</Text>
                        <CategoryBadge category={post.category} />
                        <StatusBadge status={favorite.status} />
                    </View>
                    <Text style={styles.cardMetaText} numberOfLines={1}>
                        {author.email || ""}
                        {author.email && post.created_at ? "  ·  " : ""}
                        {formatTimestamp(post.created_at)}
                    </Text>
                </View>

                {/* Menu button */}
                <TouchableOpacity
                    style={styles.menuBtn}
                    onPress={() => setShowMenu(!showMenu)}
                    hitSlop={8}
                >
                    <Ionicons name="ellipsis-horizontal" size={20} color="#9ca3af" />
                </TouchableOpacity>
            </View>

            {/* Dropdown menu */}
            {showMenu && (
                <View style={styles.dropdownMenu}>
                    <TouchableOpacity
                        style={styles.dropdownItem}
                        onPress={() => {
                            setShowMenu(false);
                            onUnfavorite?.(post._id);
                        }}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="heart-dislike-outline" size={16} color="#ef4444" />
                        <Text style={[styles.dropdownItemText, { color: "#ef4444" }]}>Bỏ yêu thích</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Title */}
            {post.title ? <Text style={styles.cardTitle}>{post.title}</Text> : null}

            {/* Content */}
            <Text style={styles.cardContent} numberOfLines={3}>{post.content}</Text>

            {/* Contact */}
            {post.contact ? (
                <View style={styles.contactRow}>
                    <Text style={styles.contactLabel}>Liên hệ: </Text>
                    <Text style={styles.contactValue}>{post.contact}</Text>
                </View>
            ) : null}

            {/* Image */}
            {post.image ? (
                <View style={styles.cardImageWrapper}>
                    <Image source={{ uri: post.image }} style={styles.cardImage} resizeMode="cover" />
                </View>
            ) : null}

            {/* Actions */}
            <View style={styles.cardActions}>
                <TouchableOpacity
                    style={[styles.actionBtn, isLiked && styles.actionBtnLiked]}
                    onPress={() => setIsLiked(!isLiked)}
                    activeOpacity={0.8}
                >
                    <Ionicons
                        name={isLiked ? "heart" : "heart-outline"}
                        size={20}
                        color={isLiked ? "#ef4444" : "#6b7280"}
                    />
                    {post.likes_count > 0 && (
                        <Text style={[styles.actionCount, isLiked && { color: "#ef4444" }]}>
                            {post.likes_count}
                        </Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn} activeOpacity={0.8}>
                    <Ionicons name="chatbubble-outline" size={20} color="#6b7280" />
                    {post.comments_count > 0 && (
                        <Text style={styles.actionCount}>{post.comments_count}</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.contactBtn}
                    onPress={() => onContact?.(favorite)}
                    activeOpacity={0.85}
                >
                    <Text style={styles.contactBtnText}>Liên Hệ</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

// ── FavoritePostsTab (main export) ─────────────────────────────────────────────
export default function FavoritePostsTab({ onContact }) {
    // Replace MOCK_FAVORITES with API data later
    const [favorites, setFavorites] = useState(MOCK_FAVORITES);
    const [confirmVisible, setConfirmVisible] = useState(false);
    const [pendingRemoveId, setPendingRemoveId] = useState(null);

    const handleUnfavoritePress = (postId) => {
        setPendingRemoveId(postId);
        setConfirmVisible(true);
    };

    const handleConfirmRemove = () => {
        // TODO: call favoriteAPI.removeFavorite(pendingRemoveId)
        setFavorites((prev) => prev.filter((f) => f.post_id?._id !== pendingRemoveId));
        setConfirmVisible(false);
        setPendingRemoveId(null);
    };

    if (favorites.length === 0) {
        return (
            <View style={styles.emptyWrap}>
                <View style={styles.emptyIconWrap}>
                    <Ionicons name="heart-outline" size={48} color="#f9a8d4" />
                </View>
                <Text style={styles.emptyTitle}>Chưa có bài viết yêu thích</Text>
                <Text style={styles.emptyDesc}>
                    Các bài viết bạn yêu thích sẽ xuất hiện ở đây.
                </Text>
            </View>
        );
    }

    return (
        <>
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
                    key={fav._id}
                    favorite={fav}
                    onUnfavorite={handleUnfavoritePress}
                    onContact={onContact}
                />
            ))}

            <ConfirmModal
                visible={confirmVisible}
                onClose={() => { setConfirmVisible(false); setPendingRemoveId(null); }}
                onConfirm={handleConfirmRemove}
                message="Bạn có chắc muốn bỏ yêu thích bài viết này không?"
            />
        </>
    );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    // Fav header
    favHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 14,
    },
    favHeaderText: { fontSize: 16, fontWeight: "700", color: "#111827", flex: 1 },
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
    cardAvatarWrap: {},
    cardAvatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: "#f3f4f6" },
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

    menuBtn: { padding: 4 },

    // Dropdown menu
    dropdownMenu: {
        position: "absolute",
        top: 52,
        right: 16,
        zIndex: 10,
        backgroundColor: "#fff",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 6,
        minWidth: 160,
    },
    dropdownItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    dropdownItemText: { fontSize: 14, fontWeight: "600" },

    // Badges
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
    categoryBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 20,
    },
    categoryBadgeText: { fontSize: 11, fontWeight: "700" },

    // Content
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
        alignItems: "center",
        paddingHorizontal: 16,
        paddingBottom: 10,
    },
    contactLabel: { fontSize: 13, fontWeight: "600", color: "#6b7280" },
    contactValue: { fontSize: 13, fontWeight: "700", color: "#059669" },
    cardImageWrapper: {
        marginHorizontal: 16,
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#e5e7eb",
    },
    cardImage: { width: "100%", height: 200 },

    // Actions
    cardActions: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: "#f3f4f6",
    },
    actionBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 10,
    },
    actionBtnLiked: { backgroundColor: "#fff1f2" },
    actionCount: { fontSize: 13, fontWeight: "600", color: "#6b7280" },
    contactBtn: {
        backgroundColor: "#16a34a",
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 8,
    },
    contactBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },

    // Empty state
    emptyWrap: {
        alignItems: "center",
        justifyContent: "center",
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
    emptyTitle: { fontSize: 17, fontWeight: "700", color: "#111827", textAlign: "center" },
    emptyDesc: { fontSize: 13, color: "#9ca3af", textAlign: "center", lineHeight: 20, maxWidth: 260 },

    // Confirm Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    confirmBox: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 24,
        width: "100%",
        maxWidth: 320,
        alignItems: "center",
        gap: 10,
    },
    confirmIconWrap: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#fff1f2",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 4,
    },
    confirmTitle: { fontSize: 16, fontWeight: "800", color: "#111827" },
    confirmMessage: { fontSize: 14, color: "#6b7280", textAlign: "center", lineHeight: 20 },
    confirmBtns: { flexDirection: "row", gap: 10, marginTop: 10, width: "100%" },
    confirmCancelBtn: {
        flex: 1,
        borderWidth: 2,
        borderColor: "#e5e7eb",
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: "center",
    },
    confirmCancelText: { fontSize: 14, fontWeight: "700", color: "#374151" },
    confirmDeleteBtn: {
        flex: 1,
        backgroundColor: "#ef4444",
        borderRadius: 12,
        paddingVertical: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
    },
    confirmDeleteText: { fontSize: 14, fontWeight: "700", color: "#fff" },
});