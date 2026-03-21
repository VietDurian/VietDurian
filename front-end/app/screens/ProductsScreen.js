import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  FlatList, Image, ScrollView, ActivityIndicator, Dimensions, Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect, useCallback } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useAppStore } from "../store/useAppStore";
import { useProductStore } from "../store/useProductStore";

const { width: SCREEN_W } = Dimensions.get("window");
// Card thon hơn: giảm margin và width
const CARD_W = SCREEN_W - 48;

const SORT_OPTIONS = [
  { value: "created_at", label: "Mới nhất" },
  { value: "price", label: "Giá" },
  { value: "name", label: "Tên A-Z" },
  { value: "rating", label: "Đánh giá" },
  { value: "view_count", label: "Lượt xem" },
];

// ── Fallback mock ─────────────────────────────────────────────────────────────
const MOCK_TYPES = [
  { _id: "", name: "Tất cả" },
  { _id: "1", name: "Ri6" },
  { _id: "2", name: "Musang King" },
  { _id: "3", name: "Monthong" },
  { _id: "4", name: "Cơm vàng hạt lép" },
];
const MOCK_PRODUCTS = [
  { _id: "p1", name: "Sầu Riêng Ri6 Tiền Giang", description: "Múi dày, hạt lép, thơm nồng đặc trưng", price: 180000, origin: "Tiền Giang", weight: 3.5, view_count: 1240, images: [{ url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Durian.jpg/640px-Durian.jpg" }] },
  { _id: "p2", name: "Musang King Malaysia", description: "Giống cao cấp nhập khẩu, vị đắng nhẹ, béo ngậy", price: 420000, origin: "Bình Phước", weight: 4.2, view_count: 980, images: [{ url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Durian.jpg/640px-Durian.jpg" }] },
  { _id: "p3", name: "Monthong Đăk Lăk", description: "Cơm vàng óng, vị ngọt thanh dịu vùng Tây Nguyên", price: 150000, origin: "Đăk Lăk", weight: 3.0, view_count: 760, images: [{ url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Durian.jpg/640px-Durian.jpg" }] },
  { _id: "p4", name: "Cơm Vàng Hạt Lép Cần Thơ", description: "Hạt teo nhỏ, tỷ lệ thịt cao, đặc sản miền Tây", price: 220000, origin: "Cần Thơ", weight: 2.8, view_count: 530, images: [{ url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Durian.jpg/640px-Durian.jpg" }] },
];
// ─────────────────────────────────────────────────────────────────────────────

function ProductCard({ product, onPress, onContact }) {
  const price = new Intl.NumberFormat("vi-VN", {
    style: "currency", currency: "VND",
  }).format(product.price);

  const rating = parseFloat(product.rating ?? 0);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.93}>
      <View style={styles.cardBody}>
        {/* Ảnh 16:9 — nằm bên trong padding của card, bo góc */}
        <View style={styles.cardImageWrapper}>
          <Image
            source={{ uri: product.images?.[0]?.url }}
            style={styles.cardImage}
            resizeMode="cover"
          />
        </View>

        {/* Tên */}
        <Text style={styles.cardName} numberOfLines={2}>{product.name}</Text>

        {/* Description */}
        <Text style={styles.cardDesc} numberOfLines={1}>{product.description}</Text>

        {/* Meta: Eye · MapPin · Weight */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Feather name="eye" size={12} color="#059669" />
            <Text style={styles.metaText}>{product.view_count}</Text>
          </View>
          <View style={styles.metaItem}>
            <Feather name="map-pin" size={12} color="#059669" />
            <Text style={styles.metaText}>{product.origin}</Text>
          </View>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="weight-kilogram" size={12} color="#059669" />
            <Text style={styles.metaText}>{product.weight}kg</Text>
          </View>
        </View>

        {/* Giá tham khảo + badge */}
        <View style={styles.priceBlock}>
          <View style={styles.priceLabelRow}>
            <Text style={styles.priceLabel}>Giá tham khảo</Text>
            <View style={styles.productBadge}>
              <Text style={styles.productBadgeText}>1 sản phẩm</Text>
            </View>
          </View>
          <Text style={styles.priceValue}>{price}</Text>
        </View>

        {/* Footer: ⭐ rating | Liên Hệ */}
        <View style={styles.cardFooter}>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={15} color="#EAB308" />
            <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
          </View>
          <TouchableOpacity style={styles.contactBtn} onPress={onContact}>
            <Text style={styles.contactBtnText}>Liên Hệ</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ProductsScreen() {
  const { navigate, setSelectedProduct } = useAppStore();

  const {
    products, productTypes, pagination,
    productsLoading, productsError,
    fetchProducts, fetchProductTypes, appendProducts,
  } = useProductStore();

  const displayProducts = products.length > 0 ? products : MOCK_PRODUCTS;
  const displayTypes = productTypes.length > 0
    ? [{ _id: "", name: "Tất cả" }, ...productTypes]
    : MOCK_TYPES;

  // ── Local UI state ───────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showSortSheet, setShowSortSheet] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // ── Reset về page 1 khi filter/sort thay đổi ────────
  useEffect(() => { fetchProductTypes(); }, []);

  useEffect(() => {
    fetchProducts({ page: 1, limit: 9, sortBy, sortOrder, name: searchTerm, typeId: selectedType });
  }, [searchTerm, sortBy, sortOrder, selectedType]);

  // ── Load thêm khi cuộn tới cuối ─────────────────────
  const handleLoadMore = useCallback(async () => {
    if (isFetchingMore) return;
    if (pagination.currentPage >= pagination.totalPages) return;
    setIsFetchingMore(true);
    await appendProducts({
      page: pagination.currentPage + 1,
      limit: 9, sortBy, sortOrder,
      name: searchTerm, typeId: selectedType,
    });
    setIsFetchingMore(false);
  }, [isFetchingMore, pagination, sortBy, sortOrder, searchTerm, selectedType]);

  const getCurrentSortLabel = () =>
    SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? "Sắp xếp";

  // ── Header component cho FlatList ──
  const ListHeader = (
    <View>
      {/* ── Filter: Loại sản phẩm ── */}
      <View style={styles.filterTypeBar}>
        <View style={styles.filterTitleRow}>
          <Feather name="tag" size={13} color="#059669" />
          <Text style={styles.filterTitle}>LOẠI SẢN PHẨM</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.typeChipsRow}
          nestedScrollEnabled
        >
          {displayTypes.map((t) => (
            <TouchableOpacity
              key={t._id}
              style={[styles.typeChip, selectedType === t._id && styles.typeChipActive]}
              onPress={() => setSelectedType(t._id)}
            >
              {t._id === "" && (
                <Feather name="list" size={11}
                  color={selectedType === "" ? "#FFF" : "#374151"}
                  style={{ marginRight: 4 }}
                />
              )}
              <Text style={[styles.typeChipText, selectedType === t._id && styles.typeChipTextActive]}>
                {t.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── Sort bar ── */}
      <View style={styles.sortBar}>
        <Text style={styles.sortLabel}>Sắp xếp:</Text>
        <TouchableOpacity style={styles.sortDropBtn} onPress={() => setShowSortSheet(true)}>
          <Text style={styles.sortDropBtnText}>{getCurrentSortLabel()}</Text>
          <Feather name="chevron-down" size={13} color="#374151" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.orderBtn, sortOrder === "asc" && styles.orderBtnActive]}
          onPress={() => setSortOrder("asc")}
        >
          <Feather name="chevron-up" size={15} color={sortOrder === "asc" ? "#FFF" : "#6B7280"} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.orderBtn, sortOrder === "desc" && styles.orderBtnActive]}
          onPress={() => setSortOrder("desc")}
        >
          <Feather name="chevron-down" size={15} color={sortOrder === "desc" ? "#FFF" : "#6B7280"} />
        </TouchableOpacity>
      </View>

      {/* Result count */}
      <Text style={styles.resultCount}>
        Tìm thấy{" "}
        <Text style={{ color: "#059669", fontWeight: "700" }}>
          {pagination.totalItems || displayProducts.length}
        </Text>
        {" "}sản phẩm
      </Text>
    </View>
  );

  // ── Footer: spinner khi đang load thêm ─────────────
  const ListFooter = isFetchingMore ? (
    <View style={styles.loadMoreRow}>
      <ActivityIndicator size="small" color="#059669" />
      <Text style={styles.loadMoreText}>Đang tải thêm...</Text>
    </View>
  ) : null;

  // ── Render ───────────────────────────────────────────
  return (
    <View style={styles.container}>

      {/* ── Hero / Search ── */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Sản Phẩm Sầu Riêng</Text>
        <Text style={styles.heroSub}>
          Khám phá bộ sưu tập sầu riêng chất lượng cao từ các vùng trồng nổi tiếng
        </Text>
        <View style={styles.searchBox}>
          <Feather name="search" size={16} color="#059669" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm sản phẩm..."
            placeholderTextColor="#6B7280"
            value={searchTerm}
            onChangeText={setSearchTerm}
            returnKeyType="search"
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity onPress={() => setSearchTerm("")}>
              <View style={styles.clearBtn}>
                <Feather name="x" size={12} color="#6B7280" />
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Sort bottom sheet dùng Modal ── */}
      <Modal
        visible={showSortSheet}
        transparent
        animationType="none"
        onRequestClose={() => setShowSortSheet(false)}
      >
        <TouchableOpacity
          style={styles.sheetOverlay}
          activeOpacity={1}
          onPress={() => setShowSortSheet(false)}
        >
          <View style={styles.sheetContainer}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Sắp xếp theo</Text>
            {SORT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={styles.sheetOption}
                onPress={() => { setSortBy(opt.value); setShowSortSheet(false); }}
              >
                <Text style={[styles.sheetOptionText, sortBy === opt.value && styles.sheetOptionActive]}>
                  {opt.label}
                </Text>
                {sortBy === opt.value && <Feather name="check" size={15} color="#059669" />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── Products list ── */}
      <FlatList
        data={displayProducts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => { setSelectedProduct(item); navigate("product-detail"); }}
            onContact={() => { }}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            {ListHeader}
            {productsError && (
              <View style={styles.errorBanner}>
                <MaterialCommunityIcons name="alert-circle-outline" size={14} color="#EF4444" />
                <Text style={styles.errorBannerText}>{productsError}</Text>
                <TouchableOpacity onPress={() => fetchProducts({ sortBy, sortOrder, name: searchTerm, typeId: selectedType })}>
                  <Text style={styles.errorBannerRetry}>Thử lại</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <MaterialCommunityIcons name="package-variant" size={44} color="#D1D5DB" />
            <Text style={styles.emptyText}>Không tìm thấy sản phẩm nào</Text>
          </View>
        }
        ListFooterComponent={ListFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        showsVerticalScrollIndicator={false}
      />

    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },

  // Hero
  hero: { backgroundColor: "#065F46", paddingHorizontal: 20, paddingTop: 18, paddingBottom: 20 },
  heroTitle: { fontSize: 21, fontWeight: "800", color: "#FFF", marginBottom: 3 },
  heroSub: { fontSize: 12, color: "#A7F3D0", marginBottom: 12, lineHeight: 18 },
  searchBox: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#FFF", borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 9,
    borderWidth: 2, borderColor: "rgba(255,255,255,0.3)",
  },
  searchInput: { flex: 1, fontSize: 13, color: "#111827" },
  clearBtn: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: "#E5E7EB", alignItems: "center", justifyContent: "center",
  },

  // Filter bar
  filterTypeBar: {
    backgroundColor: "#FFF",
    paddingTop: 10, paddingBottom: 10,
    borderBottomWidth: 1, borderBottomColor: "#F3F4F6",
  },
  filterTitleRow: {
    flexDirection: "row", alignItems: "center",
    gap: 5, paddingHorizontal: 16, marginBottom: 8,
  },
  filterTitle: { fontSize: 10, fontWeight: "700", color: "#374151", letterSpacing: 0.5 },
  typeChipsRow: { paddingHorizontal: 16, gap: 8 },
  typeChip: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 13, paddingVertical: 6,
    borderRadius: 20, backgroundColor: "#F3F4F6",
  },
  typeChipActive: { backgroundColor: "#059669" },
  typeChipText: { fontSize: 12, color: "#374151", fontWeight: "500" },
  typeChipTextActive: { color: "#FFF" },

  // Sort bar
  sortBar: {
    flexDirection: "row", alignItems: "center",
    gap: 8, paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: "#FFF",
    borderBottomWidth: 1, borderBottomColor: "#E5E7EB",
  },
  sortLabel: { fontSize: 12, fontWeight: "700", color: "#374151" },
  sortDropBtn: {
    flex: 1, flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1.5, borderColor: "#E5E7EB", borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 6,
    backgroundColor: "#FFF", maxWidth: 155,
  },
  sortDropBtnText: { fontSize: 12, color: "#111827", fontWeight: "500" },
  orderBtn: {
    width: 32, height: 32, borderRadius: 8,
    borderWidth: 1.5, borderColor: "#E5E7EB",
    backgroundColor: "#FFF", alignItems: "center", justifyContent: "center",
  },
  orderBtnActive: { backgroundColor: "#059669", borderColor: "#059669" },

  // Sort sheet
  sheetOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end",
  },
  sheetContainer: {
    backgroundColor: "#FFF", borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 36,
  },
  sheetHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: "#E5E7EB", alignSelf: "center", marginBottom: 16,
  },
  sheetTitle: { fontSize: 15, fontWeight: "700", color: "#111827", marginBottom: 8 },
  sheetOption: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: "#F3F4F6",
  },
  sheetOptionText: { fontSize: 14, color: "#374151" },
  sheetOptionActive: { color: "#059669", fontWeight: "700" },

  // List
  listContent: { paddingBottom: 96, paddingHorizontal: 0 },
  resultCount: { fontSize: 12, color: "#6B7280", paddingHorizontal: 16, paddingVertical: 12 },

  // Card
  card: {
    width: CARD_W,
    backgroundColor: "#FFF",
    borderRadius: 14,
    marginBottom: 14,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  cardBody: { padding: 14 },
  cardImageWrapper: {
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 12,
  },
  cardImage: {
    width: "100%",
    height: Math.round(CARD_W * 9 / 16),
  },
  cardName: { fontSize: 15, fontWeight: "700", color: "#111827", marginBottom: 4 },
  cardDesc: { fontSize: 12, color: "#6B7280", marginBottom: 10 },

  metaRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 11, color: "#6B7280" },

  priceBlock: { marginBottom: 10 },
  priceLabelRow: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 3 },
  priceLabel: { fontSize: 11, color: "#6B7280" },
  productBadge: {
    backgroundColor: "#ECFDF5", borderWidth: 1, borderColor: "#A7F3D0",
    borderRadius: 5, paddingHorizontal: 6, paddingVertical: 1,
  },
  productBadgeText: { fontSize: 9, color: "#059669", fontWeight: "600" },
  priceValue: { fontSize: 19, fontWeight: "800", color: "#059669" },

  cardFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  ratingText: { fontSize: 12, fontWeight: "600", color: "#6B7280" },
  contactBtn: { backgroundColor: "#059669", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 30 },
  contactBtnText: { fontSize: 12, color: "#FFF", fontWeight: "600" },

  // Error banner
  errorBanner: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#FEF2F2", borderRadius: 8, marginHorizontal: 16,
    marginBottom: 8, paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderColor: "#FECACA",
  },
  errorBannerText: { flex: 1, fontSize: 11, color: "#EF4444" },
  errorBannerRetry: { fontSize: 11, fontWeight: "700", color: "#DC2626" },

  // Load more footer
  loadMoreRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16 },
  loadMoreText: { fontSize: 13, color: "#6B7280" },

  // States
  centered: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 60 },
  loadingText: { marginTop: 10, color: "#6B7280", fontSize: 13 },
  emptyText: { marginTop: 10, color: "#9CA3AF", fontSize: 14 },
  errorText: { marginTop: 10, color: "#EF4444", fontSize: 13, textAlign: "center", marginHorizontal: 24 },
  retryBtn: { marginTop: 14, backgroundColor: "#EF4444", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  retryBtnText: { color: "#FFF", fontWeight: "700", fontSize: 13 },
});