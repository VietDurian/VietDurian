import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../components/Header";
import BottomTabBar from "../components/BottomTabBar";
import { useState } from "react";
import Feather from "@expo/vector-icons/Feather";
import { useAppStore } from "../store/useAppStore";

const { width: SCREEN_W } = Dimensions.get("window");
const CARD_W = SCREEN_W - 32;

const MOCK_BLOGS = [
  {
    _id: "1",
    title: "Kỹ thuật trồng sầu riêng Musang King đạt chuẩn xuất khẩu",
    content: "Musang King là giống sầu riêng cao cấp từ Malaysia, nổi tiếng với vị ngậy béo, màu vàng đậm và hương thơm đặc trưng. Bài viết này chia sẻ quy trình canh tác chi tiết.",
    image: "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=800",
    created_at: "2024-03-10T00:00:00.000Z",
    knowledgeBlocksCount: 5,
  },
  {
    _id: "2",
    title: "Phòng trừ sâu bệnh trên cây sầu riêng mùa mưa",
    content: "Mùa mưa là thời điểm sâu bệnh phát triển mạnh trên cây sầu riêng. Hướng dẫn nhận biết và xử lý hiệu quả các loại sâu bệnh phổ biến.",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800",
    created_at: "2024-02-20T00:00:00.000Z",
    knowledgeBlocksCount: 3,
  },
  {
    _id: "3",
    title: "Cập nhật giá sầu riêng tháng 3/2024 tại các tỉnh miền Tây",
    content: "Thị trường sầu riêng tháng 3/2024 có nhiều biến động do ảnh hưởng của thời tiết và nhu cầu xuất khẩu sang Trung Quốc tăng mạnh.",
    image: null,
    created_at: "2024-03-01T00:00:00.000Z",
    knowledgeBlocksCount: 0,
  },
  {
    _id: "4",
    title: "Bón phân cân đối giúp sầu riêng ra hoa đồng loạt",
    content: "Chế độ dinh dưỡng hợp lý là yếu tố then chốt để cây sầu riêng ra hoa đúng thời điểm và đậu quả tốt.",
    image: "https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=800",
    created_at: "2024-01-15T00:00:00.000Z",
    knowledgeBlocksCount: 7,
  },
  {
    _id: "5",
    title: "Xử lý ra hoa sầu riêng trái vụ tăng thu nhập",
    content: "Kỹ thuật xử lý ra hoa trái vụ giúp nông dân chủ động lịch thu hoạch, tránh thời điểm rớt giá và tối đa hóa lợi nhuận.",
    image: "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=800",
    created_at: "2024-01-05T00:00:00.000Z",
    knowledgeBlocksCount: 4,
  },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "oldest", label: "Cũ nhất" },
];

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const normalize = (str) =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function BlogCard({ blog, onPress }) {
  const imageHeight = Math.round(CARD_W * 9 / 16);
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.cardBody}>
        <View style={[styles.cardImageWrapper, { height: imageHeight }]}>
          {blog.image ? (
            <Image source={{ uri: blog.image }} style={styles.cardImage} resizeMode="cover" />
          ) : (
            <View style={styles.cardImagePlaceholder}>
              <Feather name="book-open" size={32} color="#6ee7b7" />
              <Text style={styles.cardImagePlaceholderText}>Chưa có ảnh bìa</Text>
            </View>
          )}
        </View>

        <Text style={styles.cardTitle} numberOfLines={2}>{blog.title}</Text>
        <Text style={styles.cardContent} numberOfLines={2}>{blog.content}</Text>

        <View style={styles.cardFooter}>
          <View style={styles.cardMeta}>
            <Feather name="calendar" size={12} color="#6b7280" />
            <Text style={styles.cardMetaText}>{formatDate(blog.created_at)}</Text>
          </View>
          {blog.knowledgeBlocksCount > 0 && (
            <View style={styles.cardChapterBadge}>
              <Feather name="book-open" size={11} color="#059669" />
              <Text style={styles.cardChapterText}>{blog.knowledgeBlocksCount} chương</Text>
            </View>
          )}
        </View>

        <View style={styles.readMoreRow}>
          <Text style={styles.readMoreText}>Đọc thêm</Text>
          <Feather name="chevron-right" size={14} color="#059669" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function BlogsScreen() {
  const { navigate, setSelectedBlog } = useAppStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [showSortSheet, setShowSortSheet] = useState(false);

  const handleOpenBlog = (blog) => {
    setSelectedBlog(blog);
    navigate("blog-detail");
  };

  const filteredBlogs = MOCK_BLOGS
    .filter((blog) => normalize(blog.title).includes(normalize(searchTerm)))
    .sort((a, b) =>
      sortOrder === "newest"
        ? new Date(b.created_at) - new Date(a.created_at)
        : new Date(a.created_at) - new Date(b.created_at)
    );

  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sortOrder)?.label ?? "Sắp xếp";

  return (
    <SafeAreaView style={styles.container}>
      <Header />

      {/* Hero + Search */}
      <View style={styles.heroBanner}>
        <Text style={styles.heroTitle}>Kiến Thức Sầu Riêng</Text>
        <Text style={styles.heroSubtitle}>
          Khám phá kỹ thuật trồng và chăm sóc sầu riêng hiện đại,{"\n"}
          cập nhật xu hướng thị trường và kinh nghiệm thực tế
        </Text>
        <View style={styles.searchWrapper}>
          <Feather name="search" size={16} color="#059669" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm bài viết..."
            placeholderTextColor="#9ca3af"
            value={searchTerm}
            onChangeText={setSearchTerm}
            returnKeyType="search"
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity onPress={() => setSearchTerm("")} style={styles.searchClear}>
              <Feather name="x" size={12} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Sort Bottom Sheet */}
      {showSortSheet && (
        <TouchableOpacity
          style={styles.sheetOverlay}
          activeOpacity={1}
          onPress={() => setShowSortSheet(false)}
        >
          <View style={styles.sheetContainer}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Sắp xếp theo</Text>
            {SORT_OPTIONS.map((opt, i) => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.sheetOption, i < SORT_OPTIONS.length - 1 && styles.sheetOptionBorder]}
                onPress={() => { setSortOrder(opt.value); setShowSortSheet(false); }}
              >
                <Text style={[styles.sheetOptionText, sortOrder === opt.value && styles.sheetOptionTextActive]}>
                  {opt.label}
                </Text>
                {sortOrder === opt.value && <Feather name="check" size={15} color="#059669" />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      )}

      {/* Blog List */}
      <FlatList
        data={filteredBlogs}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.sortBar}>
            <Text style={styles.resultCount}>
              Tìm thấy <Text style={styles.resultCountHighlight}>{filteredBlogs.length}</Text> bài viết
            </Text>
            <View style={styles.sortRight}>
              <Text style={styles.sortLabel}>Sắp xếp:</Text>
              <TouchableOpacity style={styles.sortButton} onPress={() => setShowSortSheet(true)} activeOpacity={0.8}>
                <Text style={styles.sortButtonText}>{currentSortLabel}</Text>
                <Feather name="chevron-down" size={13} color="#374151" />
              </TouchableOpacity>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="meh" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>Không tìm thấy bài viết nào</Text>
          </View>
        }
        renderItem={({ item }) => (
          <BlogCard blog={item} onPress={() => handleOpenBlog(item)} />
        )}
      />

      <BottomTabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },

  // Hero
  heroBanner: {
    backgroundColor: "#065f46",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 22,
  },
  heroTitle: { fontSize: 22, fontWeight: "800", color: "#fff", textAlign: "center", marginBottom: 6 },
  heroSubtitle: { fontSize: 12, color: "#a7f3d0", textAlign: "center", lineHeight: 18, marginBottom: 14 },
  searchWrapper: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#fff", borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 9,
    borderWidth: 2, borderColor: "rgba(255,255,255,0.3)",
  },
  searchInput: { flex: 1, fontSize: 13, color: "#111827" },
  searchClear: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: "#e5e7eb", alignItems: "center", justifyContent: "center",
  },

  // Sort bar
  sortBar: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", paddingHorizontal: 4, paddingVertical: 12,
  },
  resultCount: { fontSize: 12, color: "#6b7280" },
  resultCountHighlight: { fontWeight: "700", color: "#059669" },
  sortRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  sortLabel: { fontSize: 12, fontWeight: "700", color: "#374151" },
  sortButton: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "#fff", borderWidth: 1.5, borderColor: "#e5e7eb",
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
  },
  sortButtonText: { fontSize: 12, fontWeight: "500", color: "#374151" },

  // Sort sheet
  sheetOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)", zIndex: 99, justifyContent: "flex-end",
  },
  sheetContainer: {
    backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 36,
  },
  sheetHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: "#e5e7eb", alignSelf: "center", marginBottom: 16,
  },
  sheetTitle: { fontSize: 15, fontWeight: "700", color: "#111827", marginBottom: 8 },
  sheetOption: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", paddingVertical: 14,
  },
  sheetOptionBorder: { borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  sheetOptionText: { fontSize: 14, color: "#374151" },
  sheetOptionTextActive: { color: "#059669", fontWeight: "700" },

  // List
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },

  // Card
  card: {
    width: CARD_W, backgroundColor: "#fff", borderRadius: 14,
    marginBottom: 14, alignSelf: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 6, elevation: 3,
    borderWidth: 1, borderColor: "#f3f4f6",
  },
  cardBody: { padding: 12 },
  cardImageWrapper: { borderRadius: 10, overflow: "hidden", marginBottom: 12, backgroundColor: "#d1fae5" },
  cardImage: { width: "100%", height: "100%" },
  cardImagePlaceholder: { flex: 1, alignItems: "center", justifyContent: "center", gap: 6 },
  cardImagePlaceholderText: { fontSize: 12, color: "#6ee7b7", fontWeight: "500" },

  cardTitle: { fontSize: 15, fontWeight: "700", color: "#111827", lineHeight: 21, marginBottom: 5 },
  cardContent: { fontSize: 12, color: "#6b7280", lineHeight: 18, marginBottom: 10 },

  cardFooter: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingTop: 10, borderTopWidth: 1, borderTopColor: "#f3f4f6", marginBottom: 8,
  },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 5 },
  cardMetaText: { fontSize: 11, color: "#6b7280" },
  cardChapterBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#ecfdf5", borderWidth: 1, borderColor: "#a7f3d0",
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20,
  },
  cardChapterText: { fontSize: 11, color: "#059669", fontWeight: "600" },
  readMoreRow: { flexDirection: "row", alignItems: "center", gap: 2 },
  readMoreText: { fontSize: 13, color: "#059669", fontWeight: "600" },

  // Empty
  emptyState: { alignItems: "center", paddingVertical: 60 },
  emptyText: { marginTop: 12, fontSize: 14, color: "#9ca3af" },
});