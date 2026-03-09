import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import BottomTabBar from "../components/BottomTabBar";
import Header from "../components/Header";

// ── Mock Data ──
const CATEGORIES = [
  "Tất cả",
  "Kỹ thuật",
  "Thị trường",
  "Sâu bệnh",
  "Thu hoạch",
];

const POSTS = [
  {
    id: "1",
    category: "Thị trường",
    categoryColor: "#F59E0B",
    image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600",
    title: "Giá sầu riêng tháng 6/2025 tăng mạnh tại Đồng Nai",
    author: "Lê Minh Tuấn",
    avatar: "https://i.pravatar.cc/100?img=11",
    time: "1 ngày trước",
    readTime: "3 phút đọc",
    bookmarked: false,
  },
  {
    id: "2",
    category: "Sâu bệnh",
    categoryColor: "#EF4444",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600",
    title: "Nhận biết sâu bệnh hại phổ biến trên cây sầu riêng",
    author: "Phạm Thu Hà",
    avatar: "https://i.pravatar.cc/100?img=5",
    time: "2 ngày trước",
    readTime: "7 phút đọc",
    bookmarked: false,
  },
  {
    id: "3",
    category: "Thu hoạch",
    categoryColor: "#F97316",
    image: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=600",
    title: "Thời điểm thu hoạch sầu riêng đúng độ chín để đạt thiết bị",
    author: "Nguyễn Văn An",
    avatar: "https://i.pravatar.cc/100?img=8",
    time: "3 ngày trước",
    readTime: "5 phút đọc",
    bookmarked: true,
  },
];

// ── Post Card ──
function PostCard({ post }) {
  const [bookmarked, setBookmarked] = useState(post.bookmarked);

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9}>
      <View style={styles.imageWrapper}>
        <Image source={{ uri: post.image }} style={styles.cardImage} />
        {/* Category badge */}
        <View
          style={[
            styles.categoryBadge,
            { backgroundColor: post.categoryColor },
          ]}
        >
          <Text style={styles.categoryBadgeText}>{post.category}</Text>
        </View>
        {/* Bookmark */}
        <TouchableOpacity
          style={styles.bookmarkBtn}
          onPress={() => setBookmarked(!bookmarked)}
        >
          <Ionicons
            name={bookmarked ? "bookmark" : "bookmark-outline"}
            size={18}
            color={bookmarked ? "#F59E0B" : "#6B7280"}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {post.title}
        </Text>
        <View style={styles.cardMeta}>
          <Image source={{ uri: post.avatar }} style={styles.avatar} />
          <Text style={styles.authorName}>{post.author}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaText}>{post.time}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Ionicons name="time-outline" size={12} color="#9CA3AF" />
          <Text style={styles.metaText}> {post.readTime}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ── Home Screen ──
export default function HomeScreen() {
  const [activeCategory, setActiveCategory] = useState("Tất cả");

  const filtered =
    activeCategory === "Tất cả"
      ? POSTS
      : POSTS.filter((p) => p.category === activeCategory);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Header />

      {/* Category Tabs */}
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContent}
        >
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryTab,
                  isActive && styles.categoryTabActive,
                ]}
                onPress={() => setActiveCategory(cat)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.categoryTabText,
                    isActive && styles.categoryTabTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Posts Feed */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostCard post={item} />}
        contentContainerStyle={styles.feed}
        showsVerticalScrollIndicator={false}
      />
      {/* Bottom Tab Bar */}
      <BottomTabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
  },
  logoEmoji: { fontSize: 16 },
  logoText: { fontSize: 17, fontWeight: "700", color: "#1B6B3A" },
  notifBtn: { position: "relative", padding: 4 },
  notifDot: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },

  // Categories
  categoryScroll: { backgroundColor: "#FFFFFF" },
  categoryContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  categoryTabActive: { backgroundColor: "#16A34A" },
  categoryTabText: { fontSize: 14, fontWeight: "500", color: "#6B7280" },
  categoryTabTextActive: { color: "#FFFFFF", fontWeight: "600" },

  // Feed
  feed: { padding: 16, gap: 16 },

  // Card
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  imageWrapper: { position: "relative" },
  cardImage: { width: "100%", height: 180 },
  categoryBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  categoryBadgeText: { color: "#FFFFFF", fontSize: 12, fontWeight: "600" },
  bookmarkBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardBody: { padding: 14, gap: 10 },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    lineHeight: 22,
  },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  avatar: { width: 24, height: 24, borderRadius: 12 },
  authorName: { fontSize: 13, fontWeight: "500", color: "#374151" },
  metaDot: { color: "#D1D5DB", fontSize: 12 },
  metaText: { fontSize: 12, color: "#9CA3AF" },

  // Bottom Tab
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  tabItem: { flex: 1, alignItems: "center", gap: 2 },
  tabIconWrapper: { position: "relative" },
  tabLabel: { fontSize: 11, color: "#9CA3AF" },
  tabLabelActive: { color: "#16A34A", fontWeight: "600" },
  badge: {
    position: "absolute",
    top: -4,
    right: -8,
    backgroundColor: "#EF4444",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: { color: "#FFFFFF", fontSize: 10, fontWeight: "700" },
});
