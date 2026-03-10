import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  FlatList, Image, ScrollView, ActivityIndicator, Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../components/Header";
import BottomTabBar from "../components/BottomTabBar";
import { useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useAppStore } from "../store/useAppStore";

const { width: SCREEN_W } = Dimensions.get("window");

// ── Mock data ─────────────────────────────────────────────────────────────────
const MOCK_TYPES = [
  { _id: "", name: "Tất cả" },
  { _id: "1", name: "Ri6" },
  { _id: "2", name: "Musang King" },
  { _id: "3", name: "Monthong" },
  { _id: "4", name: "Cơm vàng hạt lép" },
];

const MOCK_PRODUCTS = [
  {
    _id: "p1",
    name: "Sầu Riêng Ri6 Tiền Giang",
    description: "Sầu riêng Ri6 chính hiệu, múi dày, hạt lép, thơm nồng đặc trưng",
    price: 180000, origin: "Tiền Giang", weight: 3.5, view_count: 1240, rating: 4.8,
    images: [{ url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Durian.jpg/640px-Durian.jpg" }],
  },
  {
    _id: "p2",
    name: "Musang King Malaysia",
    description: "Giống sầu riêng cao cấp nhập khẩu từ Malaysia, vị đắng nhẹ, béo ngậy",
    price: 420000, origin: "Bình Phước", weight: 4.2, view_count: 980, rating: 4.9,
    images: [{ url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Durian.jpg/640px-Durian.jpg" }],
  },
  {
    _id: "p3",
    name: "Monthong Đăk Lăk",
    description: "Monthong trồng tại Đăk Lăk, cơm vàng óng, vị ngọt thanh dịu",
    price: 150000, origin: "Đăk Lăk", weight: 3.0, view_count: 760, rating: 4.5,
    images: [{ url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Durian.jpg/640px-Durian.jpg" }],
  },
  {
    _id: "p4",
    name: "Cơm Vàng Hạt Lép Cần Thơ",
    description: "Đặc sản Cần Thơ, hạt teo nhỏ, tỷ lệ thịt cao, giá trị dinh dưỡng vượt trội",
    price: 220000, origin: "Cần Thơ", weight: 2.8, view_count: 530, rating: 4.6,
    images: [{ url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Durian.jpg/640px-Durian.jpg" }],
  },
];

const SORT_OPTIONS = [
  { value: "created_at", label: "Mới nhất" },
  { value: "price", label: "Giá" },
  { value: "name", label: "Tên A-Z" },
  { value: "rating", label: "Đánh giá" },
  { value: "view_count", label: "Lượt xem" },
];
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Card layout bám 1-1 theo web:
 * [ảnh 16:9]
 * tên (text-xl font-bold)
 * description (line-clamp-1)
 * [Eye view_count]  [MapPin origin]  [Weight weight]   ← hàng meta riêng
 * "Giá tham khảo"  badge "1 sản phẩm"
 * giá to (text-2xl emerald)
 * ─────────────────────────────────────────────────────
 * ⭐ 4.8                              [Liên Hệ]
 */
function ProductCard({ product, onPress, onContact }) {
  const price = new Intl.NumberFormat("vi-VN", {
    style: "currency", currency: "VND",
  }).format(product.price);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.93}>
      {/* ── Ảnh 16:9 ── */}
      <View style={styles.cardImgWrap}>
        <Image
          source={{ uri: product.images?.[0]?.url }}
          style={styles.cardImage}
          resizeMode="cover"
        />
      </View>

      <View style={styles.cardBody}>
        {/* Tên */}
        <Text style={styles.cardName} numberOfLines={2}>{product.name}</Text>

        {/* Description */}
        <Text style={styles.cardDesc} numberOfLines={1}>{product.description}</Text>

        {/* Hàng meta: Eye · MapPin · Weight — đúng thứ tự web */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Feather name="eye" size={13} color="#059669" />
            <Text style={styles.metaText}>{product.view_count}</Text>
          </View>
          <View style={styles.metaItem}>
            <Feather name="map-pin" size={13} color="#059669" />
            <Text style={styles.metaText}>{product.origin}</Text>
          </View>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="weight-kilogram" size={13} color="#059669" />
            <Text style={styles.metaText}>{product.weight}kg</Text>
          </View>
        </View>

        {/* Giá tham khảo + badge "1 sản phẩm" */}
        <View style={styles.priceBlock}>
          <View style={styles.priceLabelRow}>
            <Text style={styles.priceLabel}>Giá tham khảo</Text>
            <View style={styles.productBadge}>
              <Text style={styles.productBadgeText}>1 sản phẩm</Text>
            </View>
          </View>
          <Text style={styles.priceValue}>{price}</Text>
        </View>

        {/* Footer: ⭐ rating trái | Liên hệ phải — đúng như web */}
        <View style={styles.cardFooter}>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={16} color="#EAB308" />
            <Text style={styles.ratingText}>{Number(product.rating).toFixed(1)}</Text>
          </View>
          <TouchableOpacity
            style={styles.contactBtn}
            onPress={onContact}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Text style={styles.contactBtnText}>Liên Hệ</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ProductsScreen() {
  const { navigate, setSelectedProduct } = useAppStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showSortSheet, setShowSortSheet] = useState(false);
  const [loading] = useState(false);

  const getCurrentSortLabel = () =>
    SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? "Sắp xếp";

  const filtered = MOCK_PRODUCTS.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header />

      {/* ── Hero / Search ─────────────────────────── */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Sản Phẩm Sầu Riêng</Text>
        <Text style={styles.heroSub}>
          Khám phá bộ sưu tập sầu riêng chất lượng cao từ các vùng trồng nổi tiếng
        </Text>
        <View style={styles.searchBox}>
          <Feather name="search" size={17} color="#059669" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm sản phẩm..."
            placeholderTextColor="#6B7280"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity onPress={() => setSearchTerm("")}>
              <View style={styles.clearBtn}>
                <Feather name="x" size={13} color="#6B7280" />
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Filter & Sort ──────────────────────────── */}
      <View style={styles.filterBar}>
        {/* Loại sản phẩm chips */}
        <View style={styles.filterSection}>
          <View style={styles.filterTitleRow}>
            <Feather name="tag" size={14} color="#059669" />
            <Text style={styles.filterTitle}>LOẠI SẢN PHẨM</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.typeChipsRow}
          >
            {MOCK_TYPES.map((t) => (
              <TouchableOpacity
                key={t._id}
                style={[styles.typeChip, selectedType === t._id && styles.typeChipActive]}
                onPress={() => setSelectedType(t._id)}
              >
                {t._id === "" && (
                  <Feather
                    name="list"
                    size={12}
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

        {/* Sort — border-t */}
        <View style={styles.sortSection}>
          <Text style={styles.sortLabel}>Sắp xếp:</Text>
          <TouchableOpacity style={styles.sortDropBtn} onPress={() => setShowSortSheet(true)}>
            <Text style={styles.sortDropBtnText}>{getCurrentSortLabel()}</Text>
            <Feather name="chevron-down" size={14} color="#374151" />
          </TouchableOpacity>
          {/* asc / desc */}
          <TouchableOpacity
            style={[styles.orderBtn, sortOrder === "asc" && styles.orderBtnActive]}
            onPress={() => setSortOrder("asc")}
          >
            <Feather name="chevron-up" size={16} color={sortOrder === "asc" ? "#FFF" : "#6B7280"} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.orderBtn, sortOrder === "desc" && styles.orderBtnActive]}
            onPress={() => setSortOrder("desc")}
          >
            <Feather name="chevron-down" size={16} color={sortOrder === "desc" ? "#FFF" : "#6B7280"} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Sort bottom sheet ──────────────────────── */}
      {showSortSheet && (
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
      )}

      {/* ── Products list ──────────────────────────── */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#059669" />
          <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
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
            <Text style={styles.resultCount}>
              Tìm thấy{" "}
              <Text style={{ color: "#059669", fontWeight: "700" }}>{filtered.length}</Text>
              {" "}sản phẩm
            </Text>
          }
          ListEmptyComponent={
            <View style={styles.centered}>
              <MaterialCommunityIcons name="package-variant" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>Không tìm thấy sản phẩm nào</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      <BottomTabBar />
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const CARD_W = SCREEN_W - 32;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },

  // Hero
  hero: {
    backgroundColor: "#065F46",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 22,
  },
  heroTitle: { fontSize: 22, fontWeight: "800", color: "#FFF", marginBottom: 4 },
  heroSub: { fontSize: 12, color: "#A7F3D0", marginBottom: 14, lineHeight: 18 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  searchInput: { flex: 1, fontSize: 14, color: "#111827" },
  clearBtn: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: "#E5E7EB",
    alignItems: "center", justifyContent: "center",
  },

  // Filter bar
  filterBar: {
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  filterSection: { paddingBottom: 8 },
  filterTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterTitle: { fontSize: 11, fontWeight: "700", color: "#374151", letterSpacing: 0.5 },
  typeChipsRow: { paddingHorizontal: 16, gap: 8 },
  typeChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  typeChipActive: { backgroundColor: "#059669" },
  typeChipText: { fontSize: 13, color: "#374151", fontWeight: "500" },
  typeChipTextActive: { color: "#FFF" },

  // Sort row
  sortSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  sortLabel: { fontSize: 12, fontWeight: "700", color: "#374151" },
  sortDropBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: "#FFF",
    maxWidth: 160,
  },
  sortDropBtnText: { fontSize: 13, color: "#111827", fontWeight: "500" },
  orderBtn: {
    width: 34, height: 34,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFF",
    alignItems: "center", justifyContent: "center",
  },
  orderBtnActive: { backgroundColor: "#059669", borderColor: "#059669" },

  // Sort sheet
  sheetOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
    zIndex: 99,
    justifyContent: "flex-end",
  },
  sheetContainer: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
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
  listContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 96 },
  resultCount: { fontSize: 13, color: "#6B7280", marginBottom: 14 },

  // ── Card — layout 1-1 theo web ───────────────────
  card: {
    width: CARD_W,
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  cardImgWrap: {},
  // 16:9 ratio
  cardImage: { width: "100%", height: Math.round(CARD_W * 9 / 16) },

  cardBody: { padding: 16 },
  cardName: { fontSize: 17, fontWeight: "700", color: "#111827", marginBottom: 6 },
  cardDesc: { fontSize: 13, color: "#6B7280", marginBottom: 14 },

  // Meta row: Eye · MapPin · Weight
  metaRow: { flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 14 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  metaText: { fontSize: 12, color: "#6B7280" },

  // Giá block
  priceBlock: { marginBottom: 14 },
  priceLabelRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  priceLabel: { fontSize: 12, color: "#6B7280" },
  productBadge: {
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  productBadgeText: { fontSize: 10, color: "#059669", fontWeight: "600" },
  priceValue: { fontSize: 22, fontWeight: "800", color: "#059669" },

  // Footer: ⭐ rating | Liên Hệ
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  ratingText: { fontSize: 13, fontWeight: "600", color: "#6B7280" },
  contactBtn: {
    backgroundColor: "#059669",
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 30,
  },
  contactBtnText: { fontSize: 13, color: "#FFF", fontWeight: "600" },

  // States
  centered: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 60 },
  loadingText: { marginTop: 12, color: "#6B7280", fontSize: 14 },
  emptyText: { marginTop: 12, color: "#9CA3AF", fontSize: 15 },
});