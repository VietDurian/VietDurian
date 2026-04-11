import {
    StyleSheet, Text, View, ScrollView, Image,
    TouchableOpacity, Dimensions, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useRef, useEffect } from "react";
import Feather from "@expo/vector-icons/Feather";
import { useAppStore } from "../store/useAppStore";
import { useBlogStore } from "../store/useBlogStore";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
        day: "2-digit", month: "2-digit", year: "numeric",
    });
};

export default function BlogDetailScreen() {
    const { navigate, selectedBlog } = useAppStore();
    const { blogDetail, blogDetailLoading, blogDetailError, fetchBlogById, clearBlogDetail } = useBlogStore();

    const [activeBlock, setActiveBlock] = useState(0);
    const [isTocOpen, setIsTocOpen] = useState(false);
    const scrollRef = useRef(null);
    // Lưu offsetY của từng block trong ScrollView (dùng onLayout thay vì measure)
    const blockOffsets = useRef({});

    // Fetch full detail khi vào màn hình
    useEffect(() => {
        if (selectedBlog?._id) {
            fetchBlogById(selectedBlog._id);
        }
        return () => clearBlogDetail();
    }, [selectedBlog?._id]);

    // Blog hiển thị: ưu tiên blogDetail (full data), fallback selectedBlog (card data)
    const blog = blogDetail ?? selectedBlog;

    const scrollToBlock = (index) => {
        setActiveBlock(index);
        setIsTocOpen(false);
        const offsetY = blockOffsets.current[index];
        if (offsetY !== undefined) {
            // Trừ 16px padding trên để block không bị sát top
            scrollRef.current?.scrollTo({ y: offsetY - 16, animated: true });
        }
    };

    // ── Loading ──────────────────────────────────────────────────────────────────
    if (blogDetailLoading && !blog) {
        return (
            <View style={styles.container}>
                <View style={styles.topBar}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigate("blogs")}>
                        <Feather name="chevron-left" size={22} color="#065f46" />
                    </TouchableOpacity>
                    <Text style={styles.topBarTitle}>Chi tiết bài viết</Text>
                    <View style={{ width: 36 }} />
                </View>
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#059669" />
                    <Text style={styles.loadingText}>Đang tải bài viết...</Text>
                </View>
            </View>
        );
    }

    // ── Error ────────────────────────────────────────────────────────────────────
    if (blogDetailError && !blog) {
        return (
            <View style={styles.container}>
                <View style={styles.topBar}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigate("blogs")}>
                        <Feather name="chevron-left" size={22} color="#065f46" />
                    </TouchableOpacity>
                    <Text style={styles.topBarTitle}>Chi tiết bài viết</Text>
                    <View style={{ width: 36 }} />
                </View>
                <View style={styles.centered}>
                    <Feather name="alert-circle" size={44} color="#fca5a5" />
                    <Text style={styles.errorText}>{blogDetailError}</Text>
                    <TouchableOpacity
                        style={styles.retryBtn}
                        onPress={() => fetchBlogById(selectedBlog?._id)}
                    >
                        <Text style={styles.retryBtnText}>Thử lại</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
    // ── Main render ──────────────────────────────────────────────────────────────
    return (
        <View style={styles.container}>
            {/* Top Bar */}
            <View style={styles.topBar}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigate("blogs")}
                    activeOpacity={0.7}
                >
                    <Feather name="chevron-left" size={22} color="#065f46" />
                </TouchableOpacity>
                <Text style={styles.topBarTitle} numberOfLines={1}>
                    Chi tiết bài viết
                </Text>
                {blog?.knowledgeBlocks?.length > 0 ? (
                    <TouchableOpacity
                        style={styles.tocToggle}
                        onPress={() => setIsTocOpen(!isTocOpen)}
                        activeOpacity={0.7}
                    >
                        <Feather name="list" size={20} color="#065f46" />
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 36 }} />
                )}
            </View>

            {/* TOC Dropdown */}
            {isTocOpen && (
                <TouchableOpacity
                    style={styles.tocBackdrop}
                    activeOpacity={1}
                    onPress={() => setIsTocOpen(false)}
                >
                    <View style={styles.tocOverlay}>
                        <View style={styles.tocCard}>
                            <Text style={styles.tocTitle}>MỤC LỤC</Text>
                            {blog.knowledgeBlocks?.map((block, index) => (
                                <TouchableOpacity
                                    key={block._id}
                                    style={[styles.tocItem, activeBlock === index && styles.tocItemActive]}
                                    onPress={() => scrollToBlock(index)}
                                    activeOpacity={0.75}
                                >
                                    <View style={[styles.tocNumber, activeBlock === index && styles.tocNumberActive]}>
                                        <Text style={[styles.tocNumberText, activeBlock === index && styles.tocNumberTextActive]}>
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
                </TouchableOpacity>
            )}

            <ScrollView
                ref={scrollRef}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                scrollEventThrottle={16}
                onScroll={(e) => {
                    const scrollY = e.nativeEvent.contentOffset.y + 80;
                    const offsets = blockOffsets.current;
                    const keys = Object.keys(offsets).map(Number).sort((a, b) => a - b);
                    for (let i = keys.length - 1; i >= 0; i--) {
                        if (scrollY >= offsets[keys[i]]) {
                            setActiveBlock(keys[i]);
                            break;
                        }
                    }
                }}
            >
                {/* Hero */}
                <View style={styles.heroBanner}>
                    <Text style={styles.heroTitle}>{blog?.title}</Text>
                    <View style={styles.heroMeta}>
                        <View style={styles.heroMetaItem}>
                            <Feather name="calendar" size={14} color="#a7f3d0" />
                            <Text style={styles.heroMetaText}>{formatDate(blog?.created_at)}</Text>
                        </View>
                        {blog?.knowledgeBlocks?.length > 0 && (
                            <>
                                <Text style={styles.heroDot}>•</Text>
                                <View style={styles.heroMetaItem}>
                                    <Feather name="book" size={14} color="#a7f3d0" />
                                    <Text style={styles.heroMetaText}>{blog.knowledgeBlocks.length} chương</Text>
                                </View>
                            </>
                        )}
                    </View>
                </View>

                {/* Cover Image */}
                {blog?.image && (
                    <Image source={{ uri: blog.image }} style={styles.coverImage} resizeMode="cover" />
                )}

                {/* Giới thiệu */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Giới thiệu</Text>
                    <Text style={styles.sectionBody}>{blog?.content}</Text>
                </View>

                {/* Loading shimmer */}
                {blogDetailLoading && (
                    <View style={styles.loadingBlockRow}>
                        <ActivityIndicator size="small" color="#059669" />
                        <Text style={styles.loadingBlockText}>Đang tải nội dung chi tiết...</Text>
                    </View>
                )}

                {/* Knowledge Blocks */}
                {blog?.knowledgeBlocks?.map((block, index) => (
                    <View
                        key={block._id}
                        onLayout={(e) => {
                            blockOffsets.current[index] = e.nativeEvent.layout.y;
                        }}
                        style={styles.blockCard}
                    >
                        {block.image && (
                            <Image source={{ uri: block.image }} style={styles.blockImage} resizeMode="cover" />
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

                {/* Bottom Navigation */}
                <View style={styles.bottomNav}>
                    <TouchableOpacity
                        style={styles.btnBack}
                        onPress={() => navigate("blogs")}
                        activeOpacity={0.8}
                    >
                        <Feather name="arrow-left" size={16} color="#374151" />
                        <Text style={styles.btnBackText}>Danh sách</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.btnTop}
                        onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.btnTopText}>Lên đầu trang</Text>
                        <Feather name="arrow-up" size={16} color="#fff" />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f9fafb" },

    // Top Bar
    topBar: {
        flexDirection: "row", alignItems: "center",
        backgroundColor: "#fff",
        paddingHorizontal: 16, paddingVertical: 12,
        borderBottomWidth: 1, borderBottomColor: "#e5e7eb",
    },
    backButton: {
        width: 36, height: 36, borderRadius: 10,
        backgroundColor: "#ecfdf5", alignItems: "center", justifyContent: "center",
    },
    topBarTitle: {
        flex: 1, fontSize: 15, fontWeight: "600", color: "#111827",
        textAlign: "center", marginHorizontal: 8,
    },
    tocToggle: {
        width: 36, height: 36, borderRadius: 10,
        backgroundColor: "#ecfdf5", alignItems: "center", justifyContent: "center",
    },

    // TOC
    tocBackdrop: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 99,
    },
    tocOverlay: {
        position: "absolute",
        top: 68,
        right: 16,
        zIndex: 999,
        width: SCREEN_WIDTH * 0.78,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 10,
    },
    tocCard: {
        backgroundColor: "#fff", borderRadius: 16,
        padding: 14, borderWidth: 1, borderColor: "#e5e7eb",
    },
    tocTitle: {
        fontSize: 11, fontWeight: "700", color: "#374151",
        letterSpacing: 1, marginBottom: 10,
    },
    tocItem: {
        flexDirection: "row", alignItems: "flex-start", gap: 10,
        paddingVertical: 8, paddingHorizontal: 10,
        borderRadius: 10, marginBottom: 2,
        borderLeftWidth: 3, borderLeftColor: "transparent",
    },
    tocItemActive: { backgroundColor: "#ecfdf5", borderLeftColor: "#059669" },
    tocNumber: {
        width: 22, height: 22, borderRadius: 11,
        backgroundColor: "#f3f4f6", alignItems: "center", justifyContent: "center", marginTop: 1,
    },
    tocNumberActive: { backgroundColor: "#d1fae5" },
    tocNumberText: { fontSize: 11, fontWeight: "700", color: "#6b7280" },
    tocNumberTextActive: { color: "#059669" },
    tocLabel: { flex: 1, fontSize: 13, color: "#6b7280", lineHeight: 19 },
    tocLabelActive: { color: "#065f46", fontWeight: "600" },

    // Scroll
    scrollContent: { paddingBottom: 40 },

    // Hero
    heroBanner: {
        backgroundColor: "#10b981",
        paddingHorizontal: 20, paddingTop: 20, paddingBottom: 28,
    },
    heroTitle: {
        fontSize: 20, fontWeight: "700", color: "#fff",
        lineHeight: 28, marginBottom: 12, textAlign: "center",
    },
    heroMeta: {
        flexDirection: "row", alignItems: "center",
        justifyContent: "center", gap: 8,
    },
    heroMetaItem: { flexDirection: "row", alignItems: "center", gap: 5 },
    heroMetaText: { fontSize: 13, color: "#a7f3d0" },
    heroDot: { color: "#6ee7b7", fontSize: 13 },

    // Cover
    coverImage: { width: "100%", height: 220 },

    // Section
    section: {
        backgroundColor: "#fff", margin: 16,
        borderRadius: 16, padding: 18,
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
    },
    sectionTitle: { fontSize: 18, fontWeight: "700", color: "#111827", marginBottom: 10 },
    sectionBody: { fontSize: 14, color: "#374151", lineHeight: 22 },

    // Loading detail blocks
    loadingBlockRow: {
        flexDirection: "row", alignItems: "center", justifyContent: "center",
        gap: 8, paddingVertical: 12, marginHorizontal: 16,
    },
    loadingBlockText: { fontSize: 13, color: "#6b7280" },

    // Block
    blockCard: {
        backgroundColor: "#fff", marginHorizontal: 16, marginBottom: 16,
        borderRadius: 16, overflow: "hidden",
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
    },
    blockImage: { width: "100%", height: 180 },
    blockBody: { padding: 18 },
    blockHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 12 },
    blockIndex: {
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: "#10b981", alignItems: "center", justifyContent: "center", marginTop: 2,
    },
    blockIndexText: { fontSize: 14, fontWeight: "700", color: "#fff" },
    blockTitle: { flex: 1, fontSize: 17, fontWeight: "700", color: "#111827", lineHeight: 24 },
    blockContent: { fontSize: 14, color: "#374151", lineHeight: 22, paddingLeft: 44 },

    // Bottom Nav
    bottomNav: {
        flexDirection: "row", justifyContent: "space-between",
        paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16, gap: 12,
    },
    btnBack: {
        flexDirection: "row", alignItems: "center", gap: 6,
        flex: 1, justifyContent: "center",
        paddingVertical: 12, backgroundColor: "#e5e7eb", borderRadius: 24,
    },
    btnBackText: { fontSize: 14, fontWeight: "600", color: "#374151" },
    btnTop: {
        flexDirection: "row", alignItems: "center", gap: 6,
        flex: 1, justifyContent: "center",
        paddingVertical: 12, backgroundColor: "#10b981", borderRadius: 24,
    },
    btnTopText: { fontSize: 14, fontWeight: "600", color: "#fff" },

    // States
    centered: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 60 },
    loadingText: { marginTop: 10, color: "#6b7280", fontSize: 13 },
    errorText: { marginTop: 10, color: "#6b7280", fontSize: 13, textAlign: "center", paddingHorizontal: 24 },
    retryBtn: { marginTop: 14, backgroundColor: "#059669", paddingHorizontal: 24, paddingVertical: 10, borderRadius: 24 },
    retryBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
});