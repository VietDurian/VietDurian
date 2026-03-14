import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    Image,
    TouchableOpacity,
    Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useRef } from "react";
import { Feather } from "@expo/vector-icons";
import { useAppStore } from "../store/useAppStore";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// --- Mock Blog Detail Data ---
const MOCK_BLOG_DETAIL = {
    _id: "1",
    title: "Kỹ thuật trồng sầu riêng Musang King đạt chuẩn xuất khẩu",
    content:
        "Musang King là giống sầu riêng cao cấp từ Malaysia, nổi tiếng với vị ngậy béo, màu vàng đậm và hương thơm đặc trưng. Bài viết này chia sẻ quy trình canh tác chi tiết để đạt chất lượng xuất khẩu sang thị trường châu Âu và Mỹ.",
    image: "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=800",
    created_at: "2024-03-10T00:00:00.000Z",
    knowledgeBlocks: [
        {
            _id: "b1",
            title: "Chọn giống và nguồn gốc cây",
            image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800",
            content:
                "Chọn cây giống Musang King từ nguồn uy tín, có giấy chứng nhận xuất xứ. Cây nên được ghép từ cành của cây mẹ đã được kiểm định chất lượng, đảm bảo giữ nguyên đặc tính di truyền vượt trội của giống gốc.\n\nKiểm tra kỹ bộ rễ của cây giống, đảm bảo rễ khỏe mạnh, không bị thối hoặc nhiễm bệnh. Nên mua cây giống từ các vườn ươm được cấp phép và có uy tín trong ngành.",
        },
        {
            _id: "b2",
            title: "Chuẩn bị đất và hố trồng",
            image: null,
            content:
                "Sầu riêng Musang King ưa đất phù sa pha cát, thoát nước tốt, độ pH từ 5.5 đến 6.5. Cần cải tạo đất trước khi trồng ít nhất 2-3 tháng bằng cách bón vôi, phân hữu cơ và các loại vi sinh vật có lợi.\n\nHố trồng cần được đào với kích thước 60x60x60cm, trộn đất mặt với phân chuồng hoai mục, tro trấu và phân lân theo tỉ lệ phù hợp. Để hố nghỉ ít nhất 3-4 tuần trước khi đặt cây giống.",
        },
        {
            _id: "b3",
            title: "Kỹ thuật tưới nước và quản lý ẩm độ",
            image: "https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=800",
            content:
                "Sầu riêng cần được tưới đều đặn, đặc biệt trong giai đoạn ra hoa và kết quả. Nên sử dụng hệ thống tưới nhỏ giọt để tiết kiệm nước và duy trì độ ẩm ổn định.\n\nTrong mùa khô, cần tăng tần suất tưới lên 2-3 lần/ngày. Tránh để cây bị stress do thiếu nước hoặc úng nước vì cả hai đều ảnh hưởng nghiêm trọng đến chất lượng quả.",
        },
        {
            _id: "b4",
            title: "Bón phân theo từng giai đoạn",
            image: null,
            content:
                "Chương trình bón phân cho sầu riêng cần được điều chỉnh theo từng giai đoạn phát triển: giai đoạn sinh trưởng ưu tiên đạm, giai đoạn ra hoa tăng lân và kali, giai đoạn nuôi quả bổ sung vi lượng.\n\nNên kết hợp phân hóa học với phân hữu cơ vi sinh để cải thiện kết cấu đất và tăng khả năng hấp thụ dinh dưỡng. Định kỳ kiểm tra pH đất và điều chỉnh bằng vôi hoặc lưu huỳnh khi cần thiết.",
        },
        {
            _id: "b5",
            title: "Thu hoạch và bảo quản sau thu hoạch",
            image: "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=800",
            content:
                "Sầu riêng Musang King đạt độ chín thu hoạch khi vỏ bắt đầu nứt nhẹ ở các gai, gai cứng chắc và phần cuống bắt đầu khô. Thời gian từ khi đậu quả đến thu hoạch thường khoảng 90-100 ngày.\n\nSau khi thu hoạch, bảo quản ở nhiệt độ 15-18°C để kéo dài thời gian bảo quản lên 3-5 ngày. Đối với xuất khẩu đường dài, cần áp dụng công nghệ cấp đông và đóng gói chuyên dụng để đảm bảo chất lượng.",
        },
    ],
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

export default function BlogDetailScreen() {
    const { navigate, selectedBlog } = useAppStore();
    const blog = selectedBlog || MOCK_BLOG_DETAIL;

    const [activeBlock, setActiveBlock] = useState(0);
    const [isTocOpen, setIsTocOpen] = useState(false);
    const scrollRef = useRef(null);
    const blockRefs = useRef({});

    const scrollToBlock = (index) => {
        setActiveBlock(index);
        setIsTocOpen(false);
        blockRefs.current[index]?.measure((fx, fy, w, h, px, py) => {
            scrollRef.current?.scrollTo({ y: py - 80, animated: true });
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Fixed Header */}
            <View style={styles.topBar}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigate("blogs")} activeOpacity={0.7}>
                    <Feather name="chevron-left" size={22} color="#065f46" />
                </TouchableOpacity>
                <Text style={styles.topBarTitle} numberOfLines={1}>
                    Chi tiết bài viết
                </Text>
                <TouchableOpacity
                    style={styles.tocToggle}
                    onPress={() => setIsTocOpen(!isTocOpen)}
                    activeOpacity={0.7}
                >
                    <Feather name="list" size={20} color="#065f46" />
                </TouchableOpacity>
            </View>

            {/* TOC Dropdown Overlay */}
            {isTocOpen && (
                <View style={styles.tocOverlay}>
                    <View style={styles.tocCard}>
                        <Text style={styles.tocTitle}>
                            <Feather name="book-open" size={13} color="#059669" />{"  "}MỤC LỤC
                        </Text>
                        {blog.knowledgeBlocks?.map((block, index) => (
                            <TouchableOpacity
                                key={block._id}
                                style={[styles.tocItem, activeBlock === index && styles.tocItemActive]}
                                onPress={() => scrollToBlock(index)}
                                activeOpacity={0.75}
                            >
                                <View
                                    style={[styles.tocNumber, activeBlock === index && styles.tocNumberActive]}
                                >
                                    <Text
                                        style={[
                                            styles.tocNumberText,
                                            activeBlock === index && styles.tocNumberTextActive,
                                        ]}
                                    >
                                        {index + 1}
                                    </Text>
                                </View>
                                <Text
                                    style={[styles.tocLabel, activeBlock === index && styles.tocLabelActive]}
                                    numberOfLines={2}
                                >
                                    {block.title}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}

            <ScrollView
                ref={scrollRef}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Hero Section */}
                <View style={styles.heroBanner}>
                    <Text style={styles.heroTitle}>{blog.title}</Text>
                    <View style={styles.heroMeta}>
                        <View style={styles.heroMetaItem}>
                            <Feather name="calendar" size={14} color="#a7f3d0" />
                            <Text style={styles.heroMetaText}>{formatDate(blog.created_at)}</Text>
                        </View>
                        {blog.knowledgeBlocks?.length > 0 && (
                            <>
                                <Text style={styles.heroDot}>•</Text>
                                <View style={styles.heroMetaItem}>
                                    <Feather name="book" size={14} color="#a7f3d0" />
                                    <Text style={styles.heroMetaText}>
                                        {blog.knowledgeBlocks.length} chương
                                    </Text>
                                </View>
                            </>
                        )}
                    </View>
                </View>

                {/* Cover Image */}
                {blog.image && (
                    <Image
                        source={{ uri: blog.image }}
                        style={styles.coverImage}
                        resizeMode="cover"
                    />
                )}

                {/* Introduction Card */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Giới thiệu</Text>
                    <Text style={styles.sectionBody}>{blog.content}</Text>
                </View>

                {/* Knowledge Blocks */}
                {blog.knowledgeBlocks?.map((block, index) => (
                    <View
                        key={block._id}
                        ref={(ref) => {
                            blockRefs.current[index] = ref;
                        }}
                        style={styles.blockCard}
                    >
                        {block.image && (
                            <Image
                                source={{ uri: block.image }}
                                style={styles.blockImage}
                                resizeMode="cover"
                            />
                        )}
                        <View style={styles.blockBody}>
                            <View style={styles.blockHeader}>
                                <View style={styles.blockIndex}>
                                    <Text style={styles.blockIndexText}>{index + 1}</Text>
                                </View>
                                <Text style={styles.blockTitle}>{block.title}</Text>
                            </View>
                            <Text style={styles.blockContent}>{block.content}</Text>
                        </View>
                    </View>
                ))}

                {/* Bottom Nav */}
                <View style={styles.bottomNav}>
                    <TouchableOpacity style={styles.btnBack} onPress={() => navigate("blogs")} activeOpacity={0.8}>
                        <Feather name="arrow-left" size={16} color="#374151" />
                        <Text style={styles.btnBackText}>Danh sách</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.btnTop}
                        onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.btnTopText}>Lên đầu trang</Text>
                        <Feather name="arrow-up" size={16} color="#ffffff" />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f9fafb" },

    // Top Bar
    topBar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ffffff",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
    },
    backButton: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: "#ecfdf5",
        alignItems: "center",
        justifyContent: "center",
    },
    topBarTitle: {
        flex: 1,
        fontSize: 15,
        fontWeight: "600",
        color: "#111827",
        textAlign: "center",
        marginHorizontal: 8,
    },
    tocToggle: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: "#ecfdf5",
        alignItems: "center",
        justifyContent: "center",
    },

    // TOC overlay
    tocOverlay: {
        position: "absolute",
        top: 64,
        right: 16,
        zIndex: 999,
        width: SCREEN_WIDTH * 0.78,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 10,
    },
    tocCard: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: "#e5e7eb",
    },
    tocTitle: {
        fontSize: 11,
        fontWeight: "700",
        color: "#374151",
        letterSpacing: 1,
        marginBottom: 10,
        textTransform: "uppercase",
    },
    tocItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10,
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 10,
        marginBottom: 2,
        borderLeftWidth: 3,
        borderLeftColor: "transparent",
    },
    tocItemActive: {
        backgroundColor: "#ecfdf5",
        borderLeftColor: "#059669",
    },
    tocNumber: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: "#f3f4f6",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 1,
    },
    tocNumberActive: { backgroundColor: "#d1fae5" },
    tocNumberText: { fontSize: 11, fontWeight: "700", color: "#6b7280" },
    tocNumberTextActive: { color: "#059669" },
    tocLabel: { flex: 1, fontSize: 13, color: "#6b7280", lineHeight: 19 },
    tocLabelActive: { color: "#065f46", fontWeight: "600" },

    // Scroll Content
    scrollContent: { paddingBottom: 40 },

    // Hero
    heroBanner: {
        backgroundColor: "#065f46",
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 28,
    },
    heroTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: "#ffffff",
        lineHeight: 30,
        marginBottom: 12,
        textAlign: "center",
    },
    heroMeta: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    heroMetaItem: { flexDirection: "row", alignItems: "center", gap: 5 },
    heroMetaText: { fontSize: 13, color: "#a7f3d0" },
    heroDot: { color: "#6ee7b7", fontSize: 13 },

    // Cover Image
    coverImage: {
        width: "100%",
        height: 220,
    },

    // Section (intro)
    section: {
        backgroundColor: "#ffffff",
        margin: 16,
        borderRadius: 16,
        padding: 18,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 10,
    },
    sectionBody: {
        fontSize: 14,
        color: "#374151",
        lineHeight: 22,
    },

    // Block Card
    blockCard: {
        backgroundColor: "#ffffff",
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 16,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    blockImage: {
        width: "100%",
        height: 180,
    },
    blockBody: { padding: 18 },
    blockHeader: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
        marginBottom: 12,
    },
    blockIndex: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#059669",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 2,
    },
    blockIndexText: {
        fontSize: 14,
        fontWeight: "700",
        color: "#ffffff",
    },
    blockTitle: {
        flex: 1,
        fontSize: 17,
        fontWeight: "700",
        color: "#111827",
        lineHeight: 24,
    },
    blockContent: {
        fontSize: 14,
        color: "#374151",
        lineHeight: 22,
        paddingLeft: 44,
    },

    // Bottom Nav
    bottomNav: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 16,
        gap: 12,
    },
    btnBack: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        flex: 1,
        justifyContent: "center",
        paddingVertical: 12,
        backgroundColor: "#e5e7eb",
        borderRadius: 24,
    },
    btnBackText: { fontSize: 14, fontWeight: "600", color: "#374151" },
    btnTop: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        flex: 1,
        justifyContent: "center",
        paddingVertical: 12,
        backgroundColor: "#059669",
        borderRadius: 24,
    },
    btnTopText: { fontSize: 14, fontWeight: "600", color: "#ffffff" },
});