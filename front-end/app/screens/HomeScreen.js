import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
  TextInput,
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { usePostStore } from "../store/usePostStore";
import { useAppStore } from "../store/useAppStore";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ── Constants ──────────────────────────────────────────────────────────────────
const POST_CATEGORIES = ["Tất cả", "Dịch vụ", "Kinh nghiệm", "Sản phẩm", "Thuê dịch vụ", "Khác"];

const CATEGORY_GUIDE = [
  {
    key: "Dịch vụ",
    icon: "construct-outline",
    iconColor: "#3b82f6",
    tagLine: "Tôi cung cấp dịch vụ",
    who: "Dành cho: Nhân công",
    desc: "Nhân công đăng bài chào dịch vụ: phun thuốc, diệt sâu, thu hoạch, chăm sóc vườn...",
    badgeBg: "#dbeafe", badgeText: "#1d4ed8",
    activeBg: "#eff6ff", activeBorder: "#93c5fd",
  },
  {
    key: "Kinh nghiệm",
    icon: "book-outline",
    iconColor: "#f59e0b",
    tagLine: "Chia sẻ kiến thức",
    who: "Dành cho: Tất cả mọi người",
    desc: "Chia sẻ mẹo trồng trọt, cách xử lý sâu bệnh, kinh nghiệm canh tác thực tế.",
    badgeBg: "#fef3c7", badgeText: "#b45309",
    activeBg: "#fffbeb", activeBorder: "#fcd34d",
  },
  {
    key: "Sản phẩm",
    icon: "cube-outline",
    iconColor: "#10b981",
    tagLine: "Mua bán nông sản",
    who: "Dành cho: Người bán",
    desc: "Rao bán sầu riêng, phân bón, thuốc trừ sâu, cây giống và các nông sản khác.",
    badgeBg: "#d1fae5", badgeText: "#065f46",
    activeBg: "#ecfdf5", activeBorder: "#6ee7b7",
  },
  {
    key: "Thuê dịch vụ",
    icon: "cash-outline",
    iconColor: "#8b5cf6",
    tagLine: "Tôi cần thuê người",
    who: "Dành cho: Chủ vườn / Nông dân",
    desc: "Chủ vườn đăng tin tìm nhân công: cần người phun thuốc, hái quả, chăm sóc vườn.",
    badgeBg: "#ede9fe", badgeText: "#5b21b6",
    activeBg: "#f5f3ff", activeBorder: "#c4b5fd",
  },
  {
    key: "Khác",
    icon: "grid-outline",
    iconColor: "#6b7280",
    tagLine: "Nội dung khác",
    who: "Dành cho: Tất cả",
    desc: "Hỏi đáp, thông báo, tin tức nông nghiệp và các chủ đề chưa phân loại.",
    badgeBg: "#f3f4f6", badgeText: "#374151",
    activeBg: "#f9fafb", activeBorder: "#d1d5db",
  },
];

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

// ── Category Badge (inline in card) ───────────────────────────────────────────
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

// ── Category Guide Section ─────────────────────────────────────────────────────
function CategoryGuideSection({ selectedCategory, onCategoryChange }) {
  const [expanded, setExpanded] = useState(false);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((v) => !v);
  };

  return (
    <View style={styles.guideWrap}>
      <TouchableOpacity style={styles.guideHeader} onPress={toggle} activeOpacity={0.85}>
        <View style={styles.guideHeaderLeft}>
          <View style={styles.guideIconWrap}>
            <Ionicons name="information-circle-outline" size={20} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.guideHeaderTitle}>Hướng dẫn danh mục bài viết</Text>
            <Text style={styles.guideHeaderSub}>Bấm để xem từng danh mục dùng để làm gì</Text>
          </View>
        </View>
        <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={20} color="#6b7280" />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.guideGrid}>
          {CATEGORY_GUIDE.map((cat) => {
            const isActive = selectedCategory === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                style={[
                  styles.guideCard,
                  isActive && { backgroundColor: cat.activeBg, borderColor: cat.activeBorder },
                ]}
                onPress={() => onCategoryChange(isActive ? "Tất cả" : cat.key)}
                activeOpacity={0.85}
              >
                <View style={styles.guideCardTop}>
                  <View style={[styles.guideCardIcon, { backgroundColor: cat.iconColor }]}>
                    <Ionicons name={cat.icon} size={20} color="#fff" />
                  </View>
                  <View style={[styles.guideTagLineBadge, { backgroundColor: cat.badgeBg }]}>
                    <Text style={[styles.guideTagLineText, { color: cat.badgeText }]} numberOfLines={1}>
                      {cat.tagLine}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.guideCardName, { color: cat.badgeText }]}>{cat.key}</Text>
                <Text style={styles.guideCardWho}>{cat.who}</Text>
                <Text style={styles.guideCardDesc} numberOfLines={3}>{cat.desc}</Text>

                <View style={styles.guideFilterHint}>
                  <Ionicons name="funnel-outline" size={12} color={cat.badgeText} />
                  <Text style={[styles.guideFilterHintText, { color: cat.badgeText }]}>
                    {isActive ? "Đang lọc danh mục này" : "Bấm để lọc danh mục"}
                  </Text>
                </View>

                {isActive && (
                  <View style={[styles.guideActiveOverlay, { backgroundColor: cat.iconColor }]} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

// ── Post Card ──────────────────────────────────────────────────────────────────
function PostCard({ post, onToggleLike, onComment }) {
  return (
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
        {/* Like — icon only, no count */}
        <TouchableOpacity
          style={[styles.actionBtn, post.isLiked && styles.actionBtnLiked]}
          onPress={() => onToggleLike(post.id)}
          activeOpacity={0.8}
        >
          <Ionicons
            name={post.isLiked ? "heart" : "heart-outline"}
            size={22}
            color={post.isLiked ? "#ef4444" : "#6b7280"}
          />
        </TouchableOpacity>

        {/* Comment — navigate to CommentScreen + show count */}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onComment(post.id)}
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
  );
}

// ── Search Bar ─────────────────────────────────────────────────────────────────
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
          returnKeyType="search"
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

// ── Sort Bar ───────────────────────────────────────────────────────────────────
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

// ── Empty / Error States ───────────────────────────────────────────────────────
function EmptyState({ onClear }) {
  return (
    <View style={styles.emptyWrap}>
      <Ionicons name="image-outline" size={48} color="#d1d5db" />
      <Text style={styles.emptyTitle}>Không tìm thấy bài viết</Text>
      <Text style={styles.emptyDesc}>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</Text>
      <TouchableOpacity style={styles.clearBtn} onPress={onClear} activeOpacity={0.85}>
        <Text style={styles.clearBtnText}>Xóa bộ lọc</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── HomeScreen ─────────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const {
    posts, postsLoading, postsError,
    selectedCategory, selectedSort, searchQuery,
    setCategory, setSort, setSearch, clearFilters,
    fetchPosts, toggleLikePost,
  } = usePostStore();

  const { navigate, setSelectedPostId } = useAppStore();

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory, selectedSort, searchQuery]);

  const hasActiveFilters =
    selectedCategory !== "Tất cả" || selectedSort !== "newest" || searchQuery.trim() !== "";

  const ListHeader = () => (
    <>
      {/* Page title */}
      <View style={styles.pageTitleRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.pageTitle}>Bài viết cộng đồng</Text>
          <Text style={styles.pageSubtitle}>Khám phá và chia sẻ kiến thức nông nghiệp</Text>
        </View>
        {posts.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countNum}>{posts.length}</Text>
            <Text style={styles.countLabel}>bài viết</Text>
          </View>
        )}
      </View>

      {/* ── Category Guide ── */}
      <CategoryGuideSection
        selectedCategory={selectedCategory}
        onCategoryChange={setCategory}
      />

      {/* Search + filter toggle */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearch}
        onFilterPress={() => setShowFilters((v) => !v)}
        filterActive={showFilters}
      />

      {/* Filter panel */}
      {showFilters && (
        <View style={styles.filterPanel}>
          <SortBar value={selectedSort} onChange={setSort} />
          {hasActiveFilters && (
            <TouchableOpacity style={styles.clearFiltersBtn} onPress={clearFilters} activeOpacity={0.8}>
              <Ionicons name="close-circle-outline" size={16} color="#ef4444" />
              <Text style={styles.clearFiltersBtnText}>Xóa bộ lọc</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Category tabs */}
      <CategoryTabs active={selectedCategory} onSelect={setCategory} />
    </>
  );

  // Full-screen loading (first load)
  if (postsLoading && posts.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.centerWrap}>
          <ActivityIndicator size="large" color="#16a34a" />
          <Text style={styles.loadingText}>Đang tải bài viết...</Text>
        </View>
      </View>
    );
  }

  // Full-screen error (first load)
  if (postsError && posts.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.centerWrap}>
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text style={styles.errorText}>{postsError}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchPosts} activeOpacity={0.85}>
            <Text style={styles.retryBtnText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onToggleLike={toggleLikePost}
            onComment={(postId) => {
              setSelectedPostId(postId);
              navigate("comment");
            }}
          />
        )}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={!postsLoading ? <EmptyState onClear={clearFilters} /> : null}
        contentContainerStyle={styles.feed}
        showsVerticalScrollIndicator={false}
        onRefresh={fetchPosts}
        refreshing={postsLoading}
      />
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },

  centerWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 24 },
  loadingText: { fontSize: 14, color: "#6b7280" },
  errorText: { fontSize: 14, color: "#ef4444", textAlign: "center" },
  retryBtn: { backgroundColor: "#16a34a", borderRadius: 10, paddingHorizontal: 24, paddingVertical: 10 },
  retryBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },

  // Page title
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
  countNum: { fontSize: 18, fontWeight: "800", color: "#065f46" },
  countLabel: { fontSize: 11, color: "#059669" },

  // ── Category Guide ──────────────────────────────────────────────────────────
  guideWrap: { marginHorizontal: 16, marginBottom: 12 },
  guideHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  guideHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  guideIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#10b981",
    alignItems: "center",
    justifyContent: "center",
  },
  guideHeaderTitle: { fontSize: 14, fontWeight: "700", color: "#111827", marginBottom: 2 },
  guideHeaderSub: { fontSize: 12, color: "#6b7280" },

  guideGrid: { marginTop: 10, gap: 10 },
  guideCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    overflow: "hidden",
  },
  guideCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  guideCardIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  guideTagLineBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    maxWidth: 180,
  },
  guideTagLineText: { fontSize: 11, fontWeight: "700" },
  guideCardName: { fontSize: 15, fontWeight: "800", marginBottom: 2 },
  guideCardWho: { fontSize: 11, color: "#9ca3af", fontWeight: "500", marginBottom: 6 },
  guideCardDesc: { fontSize: 13, color: "#4b5563", lineHeight: 19, marginBottom: 10 },
  guideFilterHint: { flexDirection: "row", alignItems: "center", gap: 5 },
  guideFilterHintText: { fontSize: 11, fontWeight: "700" },
  guideActiveOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    opacity: 0.04,
    borderRadius: 14,
  },

  // Search
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
  sortBtnTextActive: { color: "#fff", fontWeight: "700" },
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
    gap: 8,
    marginBottom: 3,
    flexWrap: "wrap",
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
    paddingHorizontal: 32,
    gap: 10,
  },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: "#374151" },
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