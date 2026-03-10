import {
    StyleSheet, Text, View, ScrollView, Image,
    TouchableOpacity, Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import ProductRating from "../components/ProductRating";
import { useAppStore } from "../store/useAppStore";

// ── Mock data ─────────────────────────────────────────────────────────────────
const MOCK_PRODUCT = {
    _id: "p1",
    name: "Sầu Riêng Ri6 Tiền Giang",
    description:
        "Sầu riêng Ri6 là giống sầu riêng phổ biến nhất tại Tiền Giang, nổi tiếng với múi dày, màu vàng ươm, hạt lép nhỏ và hương thơm đặc trưng nồng nàn. Được trồng trên vùng đất phù sa màu mỡ ven sông Tiền, sầu riêng Ri6 hội tụ đầy đủ điều kiện tự nhiên lý tưởng để phát triển và cho năng suất cao.",
    price: 180000, origin: "Tiền Giang", weight: 3.5,
    view_count: 1240, rating: 4.8, status: "active",
    harvest_start_date: "2024-06-01", harvest_end_date: "2024-09-30",
    images: [
        { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Durian.jpg/640px-Durian.jpg" },
        { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Durian.jpg/640px-Durian.jpg" },
        { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Durian.jpg/640px-Durian.jpg" },
    ],
    type_id: { name: "Ri6" },
    user_id: {
        _id: "u1", full_name: "Nguyễn Văn A",
        email: "nguyenvana@gmail.com", phone: "0901234567", avatar: null,
    },
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
    const product = selectedProduct ?? MOCK_PRODUCT;

    const [activeTab, setActiveTab] = useState("description");
    const [selectedImage, setSelectedImage] = useState(0);

    const price = new Intl.NumberFormat("vi-VN", {
        style: "currency", currency: "VND",
    }).format(product.price);

    const formatDate = (d) => {
        if (!d) return "N/A";
        return new Date(d).toLocaleDateString("vi-VN");
    };

    const rating = Number(product.rating ?? 0);

    return (
        <SafeAreaView style={styles.safeArea}>

            {/* ── Breadcrumb bar — giống web ─────────────── */}
            <View style={styles.breadcrumbBar}>
                <TouchableOpacity onPress={() => navigate("home")}>
                    <Text style={styles.breadcrumbLink}>Trang chủ</Text>
                </TouchableOpacity>
                <Feather name="chevron-right" size={13} color="#9CA3AF" />
                <TouchableOpacity onPress={() => navigate("products")}>
                    <Text style={styles.breadcrumbLink}>Sản phẩm</Text>
                </TouchableOpacity>
                <Feather name="chevron-right" size={13} color="#9CA3AF" />
                <Text style={styles.breadcrumbCurrent} numberOfLines={1}>{product.name}</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>

                {/* ── White card bọc toàn bộ info — giống web ── */}
                <View style={styles.mainCard}>

                    {/* ── Ảnh chính ─────────────────────────────── */}
                    <View style={styles.imageSection}>
                        <View style={styles.mainImgWrap}>
                            <Image
                                source={{ uri: product.images?.[selectedImage]?.url }}
                                style={styles.mainImg}
                                resizeMode="cover"
                            />
                        </View>
                    </View>

                    {/* ── Info section — bên phải trên web, bên dưới trên mobile ── */}
                    <View style={styles.infoSection}>

                        {/* Tên sản phẩm */}
                        <Text style={styles.productName}>{product.name}</Text>

                        {/* Rating stars + số + lượt xem — đúng layout web */}
                        <View style={styles.ratingViewRow}>
                            <View style={styles.starsGroup}>
                                <StarRow rating={rating} size={18} />
                                <Text style={styles.ratingScore}>{rating.toFixed(1)}</Text>
                            </View>
                            <View style={styles.viewsGroup}>
                                <Feather name="eye" size={15} color="#6B7280" />
                                <Text style={styles.viewsText}>{product.view_count} lượt xem</Text>
                            </View>
                        </View>

                        {/* Giá tham khảo box — bg-emerald-50 như web */}
                        <View style={styles.priceBox}>
                            <Text style={styles.priceBoxLabel}>Giá tham khảo</Text>
                            <Text style={styles.priceBoxValue}>{price}</Text>
                        </View>

                        {/* Meta rows — bg-gray-50 p-3 rounded-lg như web */}
                        <View style={styles.metaList}>
                            {/* Xuất xứ */}
                            <View style={styles.metaRow}>
                                <Feather name="map-pin" size={18} color="#059669" />
                                <Text style={styles.metaLabel}>Xuất xứ:</Text>
                                <Text style={styles.metaValue}>{product.origin}</Text>
                            </View>
                            {/* Trọng lượng */}
                            <View style={styles.metaRow}>
                                <MaterialCommunityIcons name="weight-kilogram" size={18} color="#059669" />
                                <Text style={styles.metaLabel}>Trọng lượng:</Text>
                                <Text style={styles.metaValue}>{product.weight}kg / trái</Text>
                            </View>
                            {/* Trạng thái */}
                            <View style={styles.metaRow}>
                                <MaterialCommunityIcons name="package-variant" size={18} color="#059669" />
                                <Text style={styles.metaLabel}>Trạng thái:</Text>
                                <Text style={[styles.metaValue, { color: "#16A34A" }]}>
                                    {product.status === "active" ? "Đang bán" : "Ngừng bán"}
                                </Text>
                            </View>
                            {/* Loại sản phẩm */}
                            {product.type_id && (
                                <View style={styles.metaRow}>
                                    <Feather name="tag" size={18} color="#059669" />
                                    <Text style={styles.metaLabel}>Loại sản phẩm:</Text>
                                    <Text style={styles.metaValue}>{product.type_id.name}</Text>
                                </View>
                            )}
                            {/* Mùa vụ */}
                            {(product.harvest_start_date || product.harvest_end_date) && (
                                <View style={styles.metaRow}>
                                    <Feather name="calendar" size={18} color="#059669" />
                                    <Text style={styles.metaLabel}>Mùa vụ:</Text>
                                    <Text style={styles.metaValue}>
                                        {formatDate(product.harvest_start_date)} – {formatDate(product.harvest_end_date)}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* CTA: Zalo (flex-1) + Chat icon — đúng như web */}
                        <View style={styles.ctaRow}>
                            <TouchableOpacity
                                style={styles.zaloBtn}
                                onPress={() => Linking.openURL(`https://zalo.me/${product.user_id?.phone ?? ""}`)}
                            >
                                {/* Zalo SVG icon approximated */}
                                <Ionicons name="chatbubble-ellipses" size={18} color="#FFF" />
                                <Text style={styles.zaloBtnText}>Liên hệ qua Zalo</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.chatIconBtn}>
                                <Ionicons name="chatbox-outline" size={20} color="#059669" />
                            </TouchableOpacity>
                        </View>

                        {/* Thông tin người bán — border-t pt-6 như web */}
                        {product.user_id && (
                            <View style={styles.sellerSection}>
                                <Text style={styles.sellerTitle}>Thông tin người bán:</Text>
                                <View style={styles.sellerRow}>
                                    <TouchableOpacity style={styles.sellerAvatar}>
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
                                    </TouchableOpacity>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.sellerName}>{product.user_id.full_name ?? "Người bán"}</Text>
                                        {product.user_id.email && (
                                            <Text style={styles.sellerEmail}>{product.user_id.email}</Text>
                                        )}
                                    </View>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* ── Tabs — border-t như web ─────────────── */}
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
                            {/* Mô tả */}
                            {activeTab === "description" && (
                                <Text style={styles.descText}>{product.description}</Text>
                            )}

                            {/* Thông số — 2 cột như web */}
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
                                        <View key={i} style={styles.specRow}>
                                            <Text style={styles.specLabel}>{row.label}:</Text>
                                            <Text style={[styles.specValue, row.green && { color: "#16A34A" }]}>
                                                {row.value}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            )}

                            {/* Nhật ký */}
                            {activeTab === "diary" && (
                                <View style={styles.diaryEmpty}>
                                    <MaterialCommunityIcons name="notebook-outline" size={40} color="#D1D5DB" />
                                    <Text style={styles.diaryEmptyText}>Chưa có nhật ký canh tác</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                {/* ── ProductRating — ngoài mainCard như web ── */}
                <ProductRating productId={product._id} />

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#F9FAFB" },

    // Breadcrumb
    breadcrumbBar: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: "#FFF",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
        flexWrap: "wrap",
    },
    breadcrumbLink: { fontSize: 12, color: "#059669" },
    breadcrumbCurrent: { fontSize: 12, color: "#111827", fontWeight: "600", flex: 1 },

    // Main card — bg-white rounded-2xl shadow-lg
    mainCard: {
        backgroundColor: "#FFF",
        margin: 12,
        borderRadius: 16,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },

    // Image section
    imageSection: { padding: 16, paddingBottom: 0 },
    mainImgWrap: {
        borderRadius: 12,
        overflow: "hidden",
        backgroundColor: "#F3F4F6",
    },
    mainImg: { width: "100%", height: 260 },

    // Info section
    infoSection: { padding: 16 },

    // Tên
    productName: { fontSize: 22, fontWeight: "800", color: "#111827", marginBottom: 10 },

    // Rating + views row — flex items-center gap-6
    ratingViewRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 20,
        marginBottom: 18,
    },
    starsGroup: { flexDirection: "row", alignItems: "center", gap: 6 },
    ratingScore: { fontSize: 15, fontWeight: "700", color: "#374151" },
    viewsGroup: { flexDirection: "row", alignItems: "center", gap: 5 },
    viewsText: { fontSize: 13, color: "#6B7280" },

    // Price box — bg-emerald-50 rounded-xl p-6
    priceBox: {
        backgroundColor: "#ECFDF5",
        borderRadius: 12,
        padding: 16,
        marginBottom: 18,
    },
    priceBoxLabel: { fontSize: 12, color: "#6B7280", marginBottom: 4 },
    priceBoxValue: { fontSize: 32, fontWeight: "900", color: "#059669" },

    // Meta rows — space-y-3
    metaList: { gap: 10, marginBottom: 20 },
    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        backgroundColor: "#F9FAFB",
        borderRadius: 10,
        padding: 12,
    },
    metaLabel: { fontSize: 13, color: "#6B7280", flex: 1 },
    metaValue: { fontSize: 13, fontWeight: "600", color: "#111827" },

    // CTA
    ctaRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
    zaloBtn: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "#059669",
        borderRadius: 12,
        paddingVertical: 14,
    },
    zaloBtnText: { fontSize: 14, fontWeight: "700", color: "#FFF" },
    chatIconBtn: {
        width: 50, height: 50,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: "#059669",
        alignItems: "center",
        justifyContent: "center",
    },

    // Seller
    sellerSection: {
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
        paddingTop: 18,
    },
    sellerTitle: { fontSize: 12, fontWeight: "600", color: "#374151", marginBottom: 10 },
    sellerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    sellerAvatar: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: "#059669",
        alignItems: "center", justifyContent: "center",
    },
    sellerAvatarText: { fontSize: 18, fontWeight: "700", color: "#FFF" },
    sellerName: { fontSize: 14, fontWeight: "700", color: "#111827" },
    sellerEmail: { fontSize: 12, color: "#9CA3AF", marginTop: 2 },

    // Tabs — border-t border-gray-200
    tabsWrapper: {
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
    },
    tabBar: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    tab: {
        flex: 1,
        paddingVertical: 14,
        alignItems: "center",
        borderBottomWidth: 2,
        borderBottomColor: "transparent",
    },
    tabActive: { borderBottomColor: "#059669" },
    tabText: { fontSize: 12, color: "#6B7280", fontWeight: "500" },
    tabTextActive: { color: "#059669", fontWeight: "700" },

    tabContent: { padding: 18 },
    descText: { fontSize: 14, color: "#374151", lineHeight: 24 },

    // Specs
    specRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    specLabel: { fontSize: 13, fontWeight: "600", color: "#374151", flex: 1 },
    specValue: { fontSize: 13, color: "#111827", flex: 1, textAlign: "right" },

    // Diary
    diaryEmpty: { alignItems: "center", paddingVertical: 40, gap: 10 },
    diaryEmptyText: { fontSize: 13, color: "#9CA3AF" },
});