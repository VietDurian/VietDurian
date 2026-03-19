import {
    StyleSheet, Text, View, ScrollView, Image,
    TouchableOpacity, Linking, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useAppStore } from "../store/useAppStore";
import { useProductStore } from "../store/useProductStore";
import { useAuthStore } from "../store/useAuthStore";
import ProductRating from "../components/ProductRating";

// ── Mock fallback ─────────────────────────────────────────────────────────────
const MOCK_PRODUCT = {
    _id: "p1", name: "Sầu Riêng Ri6 Tiền Giang",
    description: "Sầu riêng Ri6 là giống sầu riêng phổ biến nhất tại Tiền Giang, nổi tiếng với múi dày, màu vàng ươm, hạt lép nhỏ và hương thơm đặc trưng nồng nàn.",
    price: 180000, origin: "Tiền Giang", weight: 3.5, view_count: 1240, rating: 4.8,
    status: "active", harvest_start_date: "2024-06-01", harvest_end_date: "2024-09-30",
    images: [
        { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Durian.jpg/640px-Durian.jpg" },
        { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Durian.jpg/640px-Durian.jpg" },
        { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Durian.jpg/640px-Durian.jpg" },
    ],
    type_id: { name: "Ri6" },
    user_id: { _id: "u1", full_name: "Nguyễn Văn A", email: "nguyenvana@gmail.com", phone: "0901234567", avatar: null },
};
// ─────────────────────────────────────────────────────────────────────────────

function StarRow({ rating, size = 18 }) {
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

export default function ProductDetailScreen() {
    const { selectedProduct, navigate } = useAppStore();

    const {
        productDetail, productDetailLoading, productDetailError, liveDetailRating,
        fetchProductById, clearProductDetail,
    } = useProductStore();

    // Dùng selectedProduct làm fallback nhanh, sau đó fetch chi tiết
    const product = productDetail ?? selectedProduct ?? MOCK_PRODUCT;
    const rating = liveDetailRating ?? Number(product.rating ?? 0);

    const [activeTab, setActiveTab] = useState("description");
    const [selectedImage, setSelectedImage] = useState(0);
    const { authUser } = useAuthStore();
    const currentUserId = authUser?._id ?? null;

    // Fetch chi tiết khi mount
    useEffect(() => {
        const id = selectedProduct?._id;
        if (id) fetchProductById(id);
        return () => clearProductDetail();
    }, [selectedProduct?._id]);

    const price = new Intl.NumberFormat("vi-VN", {
        style: "currency", currency: "VND",
    }).format(product.price ?? 0);

    const formatDate = (d) => {
        if (!d) return "N/A";
        return new Date(d).toLocaleDateString("vi-VN");
    };

    // ── Loading / Error ─────────────────────────────────
    if (productDetailLoading && !selectedProduct) {
        return (
            <View style={styles.safeArea}>
                <View style={styles.breadcrumbBar}>
                    <TouchableOpacity onPress={() => navigate("products")}>
                        <Text style={styles.breadcrumbLink}>Sản phẩm</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.centeredFull}>
                    <ActivityIndicator size="large" color="#059669" />
                    <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.safeArea}>

            {/* ── Breadcrumb ────────────────────────────────── */}
            <View style={styles.breadcrumbBar}>
                <TouchableOpacity onPress={() => navigate("home")}>
                    <Text style={styles.breadcrumbLink}>Trang chủ</Text>
                </TouchableOpacity>
                <Feather name="chevron-right" size={12} color="#9CA3AF" />
                <TouchableOpacity onPress={() => navigate("products")}>
                    <Text style={styles.breadcrumbLink}>Sản phẩm</Text>
                </TouchableOpacity>
                <Feather name="chevron-right" size={12} color="#9CA3AF" />
                <Text style={styles.breadcrumbCurrent} numberOfLines={1}>{product.name}</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.mainCard}>

                    {/* ── Gallery: ảnh chính ─────────────────────── */}
                    <View style={styles.gallerySection}>
                        <View style={styles.mainImgWrap}>
                            <Image
                                source={{ uri: product.images?.[selectedImage]?.url }}
                                style={styles.mainImg}
                                resizeMode="cover"
                            />
                        </View>

                        {/* Thumbnails — hiện khi có > 1 ảnh */}
                        {product.images?.length > 1 && (
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.thumbRow}
                            >
                                {product.images.map((img, idx) => (
                                    <TouchableOpacity
                                        key={idx}
                                        onPress={() => setSelectedImage(idx)}
                                        style={[styles.thumbWrap, selectedImage === idx && styles.thumbWrapActive]}
                                    >
                                        <Image source={{ uri: img.url }} style={styles.thumbImg} resizeMode="cover" />
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}
                    </View>

                    {/* ── Info ──────────────────────────────────────── */}
                    <View style={styles.infoSection}>

                        {/* Tên */}
                        <Text style={styles.productName}>{product.name}</Text>

                        {/* Stars + lượt xem — giữ nguyên như bản gốc */}
                        <View style={styles.ratingViewRow}>
                            <View style={styles.starsGroup}>
                                <StarRow rating={rating} size={17} />
                                <Text style={styles.ratingScore}>{rating.toFixed(1)}</Text>
                            </View>
                            <View style={styles.viewsGroup}>
                                <Feather name="eye" size={14} color="#6B7280" />
                                <Text style={styles.viewsText}>{product.view_count} lượt xem</Text>
                            </View>
                        </View>

                        {/* Giá box — emerald-50 */}
                        <View style={styles.priceBox}>
                            <Text style={styles.priceBoxLabel}>Giá tham khảo</Text>
                            <Text style={styles.priceBoxValue}>{price}</Text>
                        </View>

                        {/* Meta rows — tất cả 5 rows như web */}
                        <View style={styles.metaList}>
                            <MetaRow icon={<Feather name="map-pin" size={17} color="#059669" />}
                                label="Xuất xứ:" value={product.origin} />
                            <MetaRow icon={<MaterialCommunityIcons name="weight-kilogram" size={17} color="#059669" />}
                                label="Trọng lượng:" value={`${product.weight}kg / trái`} />
                            <MetaRow icon={<MaterialCommunityIcons name="package-variant" size={17} color="#059669" />}
                                label="Trạng thái:"
                                value={product.status === "active" ? "Đang bán" : "Ngừng bán"}
                                green />
                            {product.type_id && (
                                <MetaRow icon={<Feather name="tag" size={17} color="#059669" />}
                                    label="Loại sản phẩm:" value={product.type_id.name} />
                            )}
                            {(product.harvest_start_date || product.harvest_end_date) && (
                                <MetaRow icon={<Feather name="calendar" size={17} color="#059669" />}
                                    label="Mùa vụ:"
                                    value={`${formatDate(product.harvest_start_date)} – ${formatDate(product.harvest_end_date)}`} />
                            )}
                        </View>

                        {/* CTA: Zalo + chat icon (chờ tích hợp sau) */}
                        <View style={styles.ctaRow}>
                            <TouchableOpacity
                                style={styles.zaloBtn}
                                onPress={() => Linking.openURL(`https://zalo.me/${product.user_id?.phone ?? ""}`)}
                            >
                                <Ionicons name="chatbubble-ellipses" size={17} color="#FFF" />
                                <Text style={styles.zaloBtnText}>Liên hệ qua Zalo</Text>
                            </TouchableOpacity>
                            {/* chat icon — bạn tự làm */}
                            <TouchableOpacity style={styles.chatIconBtn} onPress={() => { }}>
                                <Ionicons name="chatbubble-outline" size={20} color="#059669" />
                            </TouchableOpacity>
                        </View>

                        {/* Thông tin người bán */}
                        {product.user_id && (
                            <View style={styles.sellerSection}>
                                <Text style={styles.sellerTitle}>Thông tin người bán:</Text>
                                <View style={styles.sellerRow}>
                                    <View style={styles.sellerAvatar}>
                                        {product.user_id.avatar ? (
                                            <Image
                                                source={{ uri: product.user_id.avatar }}
                                                style={{ width: 44, height: 44, borderRadius: 22 }}
                                            />
                                        ) : (
                                            <Text style={styles.sellerAvatarText}>
                                                {product.user_id.full_name?.charAt(0) ?? "U"}
                                            </Text>
                                        )}
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.sellerName}>{product.user_id.full_name ?? "Người bán"}</Text>
                                        {product.user_id.email && (
                                            <Text style={styles.sellerEmail}>{product.user_id.email}</Text>
                                        )}
                                    </View>
                                    <Feather name="chevron-right" size={16} color="#9CA3AF" />
                                </View>
                            </View>
                        )}
                    </View>

                    {/* ── Tabs ──────────────────────────────────────── */}
                    <View style={styles.tabsWrapper}>
                        <View style={styles.tabBar}>
                            {[
                                { key: "description", label: "Mô tả sản phẩm" },
                                { key: "specifications", label: "Thông số kỹ thuật" },
                                { key: "diary", label: "Nhật ký canh tác" },
                            ].map((t) => (
                                <TouchableOpacity
                                    key={t.key}
                                    style={[styles.tab, activeTab === t.key && styles.tabActive]}
                                    onPress={() => setActiveTab(t.key)}
                                >
                                    <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>
                                        {t.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.tabContent}>
                            {activeTab === "description" && (
                                <Text style={styles.descText}>{product.description}</Text>
                            )}

                            {activeTab === "specifications" && (
                                <View>
                                    {[
                                        { label: "Tên sản phẩm", value: product.name },
                                        { label: "Xuất xứ", value: product.origin },
                                        { label: "Trọng lượng", value: `${product.weight}kg / trái` },
                                        { label: "Mùa vụ bắt đầu", value: formatDate(product.harvest_start_date) },
                                        { label: "Trạng thái", value: product.status === "active" ? "Đang bán" : "Ngừng bán", green: true },
                                        { label: "Lượt xem", value: String(product.view_count) },
                                        { label: "Đánh giá", value: `${rating.toFixed(1)} / 5.0` },
                                        { label: "Mùa vụ kết thúc", value: formatDate(product.harvest_end_date) },
                                    ].map((row, i) => (
                                        <View key={i} style={[styles.specRow, i % 2 === 0 && { backgroundColor: "#F9FAFB" }]}>
                                            <Text style={styles.specLabel}>{row.label}</Text>
                                            <Text style={[styles.specValue, row.green && { color: "#16A34A" }]}>
                                                {row.value}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            )}

                            {activeTab === "diary" && (
                                <View style={styles.diaryEmpty}>
                                    <MaterialCommunityIcons name="notebook-outline" size={38} color="#D1D5DB" />
                                    <Text style={styles.diaryEmptyText}>Chưa có nhật ký canh tác</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                <ProductRating productId={product._id} userId={currentUserId} />

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

// ── Sub-component MetaRow ─────────────────────────────────────────────────────
function MetaRow({ icon, label, value, green }) {
    return (
        <View style={styles.metaRow}>
            {icon}
            <Text style={styles.metaLabel}>{label}</Text>
            <Text style={[styles.metaValue, green && { color: "#16A34A" }]}>{value}</Text>
        </View>
    );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F9FAFB" },

    breadcrumbBar: {
        flexDirection: "row", alignItems: "center", flexWrap: "wrap",
        gap: 5, paddingHorizontal: 16, paddingVertical: 10,
        backgroundColor: "#FFF", borderBottomWidth: 1, borderBottomColor: "#E5E7EB",
    },
    breadcrumbLink: { fontSize: 12, color: "#059669" },
    breadcrumbCurrent: { fontSize: 12, color: "#111827", fontWeight: "600", flex: 1 },

    centeredFull: { flex: 1, alignItems: "center", justifyContent: "center" },
    loadingText: { marginTop: 10, color: "#6B7280", fontSize: 13 },

    mainCard: {
        backgroundColor: "#FFF", margin: 12, borderRadius: 16, overflow: "hidden",
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.09, shadowRadius: 8, elevation: 4,
    },

    // Gallery
    gallerySection: { padding: 14, paddingBottom: 0 },
    mainImgWrap: { borderRadius: 10, overflow: "hidden", backgroundColor: "#F3F4F6" },
    mainImg: { width: "100%", height: 248 },
    thumbRow: { paddingVertical: 10, gap: 8 },
    thumbWrap: {
        width: 56, height: 56, borderRadius: 8, overflow: "hidden",
        borderWidth: 2, borderColor: "#E5E7EB",
    },
    thumbWrapActive: { borderColor: "#059669" },
    thumbImg: { width: "100%", height: "100%" },

    // Info
    infoSection: { padding: 16 },
    productName: { fontSize: 21, fontWeight: "800", color: "#111827", marginBottom: 10 },

    ratingViewRow: { flexDirection: "row", alignItems: "center", gap: 18, marginBottom: 16 },
    starsGroup: { flexDirection: "row", alignItems: "center", gap: 5 },
    ratingScore: { fontSize: 14, fontWeight: "700", color: "#374151" },
    viewsGroup: { flexDirection: "row", alignItems: "center", gap: 5 },
    viewsText: { fontSize: 13, color: "#6B7280" },

    priceBox: { backgroundColor: "#ECFDF5", borderRadius: 12, padding: 14, marginBottom: 16 },
    priceBoxLabel: { fontSize: 11, color: "#6B7280", marginBottom: 3 },
    priceBoxValue: { fontSize: 30, fontWeight: "900", color: "#059669" },

    metaList: { gap: 8, marginBottom: 18 },
    metaRow: {
        flexDirection: "row", alignItems: "center", gap: 9,
        backgroundColor: "#F9FAFB", borderRadius: 10, padding: 11,
    },
    metaLabel: { fontSize: 12, color: "#6B7280", flex: 1 },
    metaValue: { fontSize: 12, fontWeight: "600", color: "#111827" },

    ctaRow: { flexDirection: "row", gap: 10, marginBottom: 18 },
    zaloBtn: {
        flex: 1, flexDirection: "row", alignItems: "center",
        justifyContent: "center", gap: 7,
        backgroundColor: "#059669", borderRadius: 12, paddingVertical: 13,
    },
    zaloBtnText: { fontSize: 13, fontWeight: "700", color: "#FFF" },
    chatIconBtn: {
        width: 48, height: 48, borderRadius: 12,
        borderWidth: 2, borderColor: "#059669",
        alignItems: "center", justifyContent: "center",
    },

    sellerSection: { borderTopWidth: 1, borderTopColor: "#E5E7EB", paddingTop: 16 },
    sellerTitle: { fontSize: 11, fontWeight: "600", color: "#374151", marginBottom: 10 },
    sellerRow: {
        flexDirection: "row", alignItems: "center", gap: 10,
        backgroundColor: "#F9FAFB", borderRadius: 12, padding: 12,
        borderWidth: 1, borderColor: "#E5E7EB",
    },
    sellerAvatar: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: "#059669", alignItems: "center", justifyContent: "center",
    },
    sellerAvatarText: { fontSize: 17, fontWeight: "700", color: "#FFF" },
    sellerName: { fontSize: 13, fontWeight: "700", color: "#111827" },
    sellerEmail: { fontSize: 11, color: "#9CA3AF", marginTop: 2 },

    tabsWrapper: { borderTopWidth: 1, borderTopColor: "#E5E7EB" },
    tabBar: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
    tab: {
        flex: 1, paddingVertical: 13, alignItems: "center",
        borderBottomWidth: 2, borderBottomColor: "transparent",
    },
    tabActive: { borderBottomColor: "#059669" },
    tabText: { fontSize: 11, color: "#6B7280", fontWeight: "500" },
    tabTextActive: { color: "#059669", fontWeight: "700" },

    tabContent: { padding: 16 },
    descText: { fontSize: 14, color: "#374151", lineHeight: 24 },

    specRow: {
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        paddingVertical: 11, paddingHorizontal: 4,
        borderBottomWidth: 1, borderBottomColor: "#F3F4F6",
    },
    specLabel: { fontSize: 12, fontWeight: "600", color: "#374151", flex: 1 },
    specValue: { fontSize: 12, color: "#111827", flex: 1, textAlign: "right" },

    diaryEmpty: { alignItems: "center", paddingVertical: 36, gap: 10 },
    diaryEmptyText: { fontSize: 13, color: "#9CA3AF" },
});