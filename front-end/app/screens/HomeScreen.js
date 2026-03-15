import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import BottomTabBar from "../components/BottomTabBar";
import Header from "../components/Header";

// ── Constants ──────────────────────────────────────────────────────────────────
const POST_CATEGORIES = ["Tất cả", "Dịch vụ", "Kinh nghiệm", "Sản phẩm", "Thuê dịch vụ", "Khác"];

const CATEGORY_CONFIG = {
  "Dịch vụ": { icon: "construct-outline", gradient: ["#3b82f6", "#06b6d4"], label: "Dịch vụ" },
  "Kinh nghiệm": { icon: "book-outline", gradient: ["#f59e0b", "#f97316"], label: "Kinh nghiệm" },
  "Sản phẩm": { icon: "cube-outline", gradient: ["#10b981", "#14b8a6"], label: "Sản phẩm" },
  "Thuê dịch vụ": { icon: "cash-outline", gradient: ["#8b5cf6", "#7c3aed"], label: "Thuê dịch vụ" },
  "Khác": { icon: "grid-outline", gradient: ["#6b7280", "#475569"], label: "Khác" },
};

const CATEGORY_TAG_COLORS = {
  "Dịch vụ": { bg: "#dbeafe", text: "#1d4ed8" },
  "Kinh nghiệm": { bg: "#fef3c7", text: "#b45309" },
  "Sản phẩm": { bg: "#d1fae5", text: "#065f46" },
  "Thuê dịch vụ": { bg: "#ede9fe", text: "#5b21b6" },
  "Khác": { bg: "#f3f4f6", text: "#374151" },
};

// ── Mock Data ──────────────────────────────────────────────────────────────────
const MOCK_POSTS = [
  {
    id: "1",
    authorId: "u1",
    userName: "Nguyễn Văn An",
    userHandle: "nguyenvanan@gmail.com",
    userAvatar: "https://i.pravatar.cc/100?img=8",
    timestamp: "1 giờ trước",
    category: "Sản phẩm",
    title: "Bán sầu riêng Ri6 chín cây, giá tốt tại vườn Bình Phước",
    content: "Vườn nhà mình có sầu riêng Ri6 đang cho thu hoạch. Trái đều, ngọt, cơm dày. Giá tại vườn: 65.000đ/kg. Liên hệ đặt trước để có hàng chất lượng nhất nhé bà con!",
    contact: "0901234567",
    image: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=600",
    likes: 24,
    comments: 8,
    isLiked: false,
  },
  {
    id: "2",
    authorId: "u2",
    userName: "Trần Thị Lan",
    userHandle: "trantilan@gmail.com",
    userAvatar: "https://i.pravatar.cc/100?img=5",
    timestamp: "3 giờ trước",
    category: "Kinh nghiệm",
    title: "Kỹ thuật xử lý ra hoa sầu riêng nghịch vụ hiệu quả",
    content: "Sau nhiều năm trồng sầu riêng, mình đúc kết được kỹ thuật xiết nước và phun KNO3 để kích thích ra hoa nghịch vụ. Tỉ lệ thành công trên 80%. Chia sẻ để bà con cùng áp dụng.",
    contact: "0912345678",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600",
    likes: 51,
    comments: 15,
    isLiked: true,
  },
  {
    id: "3",
    authorId: "u3",
    userName: "Lê Minh Tuấn",
    userHandle: "leminhtuấn@gmail.com",
    userAvatar: "https://i.pravatar.cc/100?img=11",
    timestamp: "1 ngày trước",
    category: "Dịch vụ",
    title: "Nhận phun thuốc, diệt sâu bệnh cho vườn sầu riêng – Đồng Nai",
    content: "Kinh nghiệm 7 năm trong nghề phun thuốc BVTV. Có đầy đủ trang thiết bị, bình phun áp suất cao. Cam kết hiệu quả, an toàn. Phục vụ khu vực Đồng Nai, Bình Dương, Long An.",
    contact: "0987654321",
    image: null,
    likes: 12,
    comments: 3,
    isLiked: false,
  },
  {
    id: "4",
    authorId: "u4",
    userName: "Phạm Thu Hà",
    userHandle: "phamthuha@gmail.com",
    userAvatar: "https://i.pravatar.cc/100?img=16",
    timestamp: "2 ngày trước",
    category: "Thuê dịch vụ",
    title: "Cần thuê 5 nhân công thu hoạch sầu riêng gấp tại Tiền Giang",
    content: "Vườn 2ha sầu riêng đang chín rộ, cần gấp 5-7 nhân công thu hoạch trong 3 ngày. Bao ăn ở, thù lao thỏa thuận. Có xe đưa đón từ trung tâm thị xã.",
    contact: "0876543210",
    image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600",
    likes: 7,
    comments: 11,
    isLiked: false,
  },
];

// ── Category Badge ─────────────────────────────────────────────────────────────
function CategoryBadge({ category }) {
  const cfg = CATEGORY_CONFIG[category];
  const colors = CATEGORY_TAG_COLORS[category] || { bg: "#f3f4f6", text: "#374151" };
  if (!cfg) return null;
  return (
    <View style={[styles.categoryBadge, { backgroundColor: colors.bg }]}>
      <Ionicons name={cfg.icon} size={11} color={colors.text} />
      <Text style={[styles.categoryBadgeText, { color: colors.text }]}>{category}</Text>
    </View>
  );
}

// ── Post Card ──────────────────────────────────────────────────────────────────
function PostCard({ post, onContact }) {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [isCommentOpen, setIsCommentOpen] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.cardAuthorRow}>
          <TouchableOpacity>
            <Image source={{ uri: post.userAvatar }} style={styles.cardAvatar} />
          </TouchableOpacity>
          <View style={styles.cardAuthorInfo}>
            <View style={styles.cardAuthorNameRow}>
              <Text style={styles.cardAuthorName}>{post.userName}</Text>
              <CategoryBadge category={post.category} />
            </View>
            <Text style={styles.cardMeta} numberOfLines={1}>
              {post.userHandle}
              {post.userHandle && post.timestamp ? "  ·  " : ""}
              {post.timestamp}
            </Text>
          </View>
        </View>
      </View>

      {/* Title */}
      {post.title ? (
        <Text style={styles.cardTitle}>{post.title}</Text>
      ) : null}

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
        <View style={styles.cardImageWrapper}>
          <Image source={{ uri: post.image }} style={styles.cardImage} resizeMode="cover" />
        </View>
      ) : null}

      {/* Actions */}
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionBtn, isLiked && styles.actionBtnLiked]}
          onPress={handleLike}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isLiked ? "heart" : "heart-outline"}
            size={20}
            color={isLiked ? "#ef4444" : "#6b7280"}
          />
          {likeCount > 0 && (
            <Text style={[styles.actionCount, isLiked && { color: "#ef4444" }]}>{likeCount}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} activeOpacity={0.8}>
          <Ionicons name="chatbubble-outline" size={20} color="#6b7280" />
          {post.comments > 0 && (
            <Text style={styles.actionCount}>{post.comments}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.contactBtn}
          onPress={() => onContact?.(post)}
          activeOpacity={0.85}
        >
          <Text style={styles.contactBtnText}>Liên Hệ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Search & Filter Bar ────────────────────────────────────────────────────────
function SearchBar({ value, onChangeText, onFilterPress, filterActive }) {
  return (
    <View style={styles.searchRow}>
      <View style={styles.searchInputWrap}>
        <Ionicons name="search-outline" size={18} color="#9ca3af" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          value={value}
          onChangeText={onChangeText}
          placeholder="Tìm kiếm bài viết..."
          placeholderTextColor="#9ca3af"
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={() => onChangeText("")} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity
        style={[styles.filterBtn, filterActive && styles.filterBtnActive]}
        onPress={onFilterPress}
        activeOpacity={0.85}
      >
        <Ionicons name="options-outline" size={20} color={filterActive ? "#fff" : "#374151"} />
      </TouchableOpacity>
    </View>
  );
}

// ── Category Tabs ──────────────────────────────────────────────────────────────
function CategoryTabs({ active, onSelect }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.tabsScroll}
      contentContainerStyle={styles.tabsContent}
    >
      {POST_CATEGORIES.map((cat) => {
        const isActive = active === cat;
        return (
          <TouchableOpacity
            key={cat}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onSelect(cat)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{cat}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

// ── Sort Dropdown ──────────────────────────────────────────────────────────────
function SortBar({ value, onChange }) {
  const opts = [
    { value: "newest", label: "Mới nhất" },
    { value: "oldest", label: "Cũ nhất" },
  ];
  return (
    <View style={styles.sortRow}>
      <Text style={styles.sortLabel}>Sắp xếp: </Text>
      {opts.map((opt) => (
        <TouchableOpacity
          key={opt.value}
          style={[styles.sortBtn, value === opt.value && styles.sortBtnActive]}
          onPress={() => onChange(opt.value)}
          activeOpacity={0.8}
        >
          <Text style={[styles.sortBtnText, value === opt.value && styles.sortBtnTextActive]}>
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ── Empty State ────────────────────────────────────────────────────────────────
function EmptyState({ onClear }) {
  return (
    <View style={styles.emptyWrap}>
      <Ionicons name="image-outline" size={48} color="#d1d5db" />
      <Text style={styles.emptyTitle}>Không tìm thấy bài viết</Text>
      <Text style={styles.emptyDesc}>Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác</Text>
      <TouchableOpacity style={styles.clearBtn} onPress={onClear} activeOpacity={0.85}>
        <Text style={styles.clearBtnText}>Xóa bộ lọc</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── HomeScreen ─────────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  // Filter & sort logic (on mock data; swap for API later)
  let filtered = MOCK_POSTS.filter((p) => {
    const matchCat = activeCategory === "Tất cả" || p.category === activeCategory;
    const q = searchQuery.trim().toLowerCase();
    const matchSearch = !q || p.title?.toLowerCase().includes(q) || p.content?.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  if (sortOrder === "oldest") filtered = [...filtered].reverse();

  const hasActiveFilters = activeCategory !== "Tất cả" || sortOrder !== "newest" || searchQuery.trim() !== "";

  const handleClearFilters = () => {
    setActiveCategory("Tất cả");
    setSortOrder("newest");
    setSearchQuery("");
  };

  const handleContact = (post) => {
    // TODO: connect to chat navigation
    console.log("Contact post author:", post.authorId);
  };

  const ListHeader = () => (
    <>
      {/* Page Title */}
      <View style={styles.pageTitleRow}>
        <View>
          <Text style={styles.pageTitle}>Bài viết cộng đồng</Text>
          <Text style={styles.pageSubtitle}>Khám phá và chia sẻ kiến thức về nông nghiệp</Text>
        </View>
        {filtered.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeNum}>{filtered.length}</Text>
            <Text style={styles.countBadgeLabel}>bài viết</Text>
          </View>
        )}
      </View>

      {/* Search */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onFilterPress={() => setShowFilters(!showFilters)}
        filterActive={showFilters}
      />

      {/* Filter Panel */}
      {showFilters && (
        <View style={styles.filterPanel}>
          <SortBar value={sortOrder} onChange={setSortOrder} />
          {hasActiveFilters && (
            <TouchableOpacity style={styles.clearFiltersBtn} onPress={handleClearFilters} activeOpacity={0.8}>
              <Ionicons name="close-circle-outline" size={16} color="#ef4444" />
              <Text style={styles.clearFiltersBtnText}>Xóa bộ lọc</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Category Tabs */}
      <CategoryTabs active={activeCategory} onSelect={setActiveCategory} />
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostCard post={item} onContact={handleContact} />}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={<EmptyState onClear={handleClearFilters} />}
        contentContainerStyle={styles.feed}
        showsVerticalScrollIndicator={false}
      />

      <BottomTabBar />
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },

  // Page header
  pageTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  pageTitle: { fontSize: 22, fontWeight: "800", color: "#111827", marginBottom: 2 },
  pageSubtitle: { fontSize: 13, color: "#6b7280" },
  countBadge: {
    backgroundColor: "#d1fae5",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#a7f3d0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
  },
  countBadgeNum: { fontSize: 18, fontWeight: "800", color: "#065f46" },
  countBadgeLabel: { fontSize: 11, color: "#059669" },

  // Search bar
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#111827" },
  filterBtn: {
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  filterBtnActive: { backgroundColor: "#16a34a", borderColor: "#16a34a" },

  // Filter panel
  filterPanel: {
    marginHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  sortRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  sortLabel: { fontSize: 13, fontWeight: "600", color: "#374151" },
  sortBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  sortBtnActive: { backgroundColor: "#16a34a", borderColor: "#16a34a" },
  sortBtnText: { fontSize: 13, fontWeight: "500", color: "#374151" },
  sortBtnTextActive: { color: "#fff", fontWeight: "600" },
  clearFiltersBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  clearFiltersBtnText: { fontSize: 13, fontWeight: "600", color: "#ef4444" },

  // Category tabs
  tabsScroll: { backgroundColor: "#fff", marginBottom: 4 },
  tabsContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
  },
  tabActive: { backgroundColor: "#16a34a" },
  tabText: { fontSize: 13, fontWeight: "500", color: "#6b7280" },
  tabTextActive: { color: "#fff", fontWeight: "700" },

  // Feed
  feed: { paddingBottom: 24 },

  // Post Card
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginHorizontal: 16,
    marginTop: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: { padding: 16, paddingBottom: 10 },
  cardAuthorRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  cardAvatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: "#f3f4f6" },
  cardAuthorInfo: { flex: 1 },
  cardAuthorNameRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" },
  cardAuthorName: { fontSize: 15, fontWeight: "700", color: "#111827" },
  cardMeta: { fontSize: 12, color: "#9ca3af" },

  // Category badge (inline)
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  categoryBadgeText: { fontSize: 11, fontWeight: "700" },

  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    lineHeight: 22,
    paddingHorizontal: 16,
    paddingBottom: 8,
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
    paddingHorizontal: 32,
    gap: 10,
  },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: "#374151", textAlign: "center" },
  emptyDesc: { fontSize: 13, color: "#9ca3af", textAlign: "center", lineHeight: 20 },
  clearBtn: {
    marginTop: 8,
    backgroundColor: "#16a34a",
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  clearBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});