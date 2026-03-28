import {
    View, Text, StyleSheet, ActivityIndicator,
    TouchableOpacity, ScrollView,
} from "react-native";
import { useState, useEffect } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useDiaryStore } from "../store/useProductStore";

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtDate = (v) => {
    if (!v) return "—";
    const d = new Date(v);
    return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("vi-VN");
};

const fmtNum = (v) =>
    v == null || v === "" ? "—" : new Intl.NumberFormat("vi-VN").format(Number(v));

// ── Accordion Section ─────────────────────────────────────────────────────────
function Section({ iconName, iconLib = "ion", title, count, color = "#059669", children }) {
    const [open, setOpen] = useState(true);

    const Icon = iconLib === "mci"
        ? ({ name, ...p }) => <MaterialCommunityIcons name={name} {...p} />
        : ({ name, ...p }) => <Ionicons name={name} {...p} />;

    return (
        <View style={[styles.section, { borderColor: color + "40" }]}>
            <TouchableOpacity
                style={[styles.sectionHeader, { backgroundColor: color }]}
                onPress={() => setOpen((o) => !o)}
                activeOpacity={0.85}
            >
                <Icon name={iconName} size={17} color="#FFF" />
                <Text style={styles.sectionTitle} numberOfLines={2}>{title}</Text>
                {count != null && (
                    <View style={styles.badge}>
                        <Text style={[styles.badgeText, { color }]}>{count}</Text>
                    </View>
                )}
                <Ionicons
                    name={open ? "chevron-up" : "chevron-down"}
                    size={16} color="#FFF"
                />
            </TouchableOpacity>
            {open && <View style={styles.sectionBody}>{children}</View>}
        </View>
    );
}

// ── Card Row ─────────────────────────────────────────────────────────────────
function CardRow({ index, fields }) {
    return (
        <View style={[styles.card, index % 2 === 1 && { backgroundColor: "#F9FAFB" }]}>
            <View style={styles.cardIndex}>
                <Text style={styles.cardIndexText}>{index}</Text>
            </View>
            <View style={styles.cardFields}>
                {fields.map(({ label, value }, i) => (
                    <View key={i} style={styles.fieldRow}>
                        <Text style={styles.fieldLabel}>{label}</Text>
                        <Text style={styles.fieldValue}>{value ?? "—"}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

// ── Empty / Loading / Error ───────────────────────────────────────────────────
function LoadingState() {
    return (
        <View style={styles.stateBox}>
            <ActivityIndicator size="small" color="#059669" />
            <Text style={styles.stateText}>Đang tải…</Text>
        </View>
    );
}

function ErrorState({ msg }) {
    return (
        <View style={styles.stateBox}>
            <Ionicons name="alert-circle-outline" size={18} color="#EF4444" />
            <Text style={[styles.stateText, { color: "#EF4444" }]}>{msg}</Text>
        </View>
    );
}

function EmptyState() {
    return (
        <View style={styles.stateBox}>
            <Ionicons name="document-outline" size={22} color="#D1D5DB" />
            <Text style={styles.stateText}>Chưa có dữ liệu</Text>
        </View>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Mua giống
// ─────────────────────────────────────────────────────────────────────────────
function BuyingSeedSection({ diaryId }) {
    const { buyingSeeds, loadingSeeds, errorSeeds, fetchBuyingSeeds } = useDiaryStore();

    useEffect(() => { if (diaryId) fetchBuyingSeeds(diaryId); }, [diaryId]);

    return (
        <Section iconName="leaf-outline" title="Mua hoặc sản xuất giống trồng"
            color="#059669" count={buyingSeeds.length}>
            {loadingSeeds ? <LoadingState /> : errorSeeds ? <ErrorState msg={errorSeeds} /> :
                buyingSeeds.length === 0 ? <EmptyState /> :
                    buyingSeeds.map((row, i) => (
                        <CardRow key={row._id ?? i} index={i + 1} fields={[
                            { label: "Ngày mua", value: fmtDate(row.purchase_date) },
                            { label: "Tên giống", value: row.seed_name },
                            { label: "Số lượng", value: fmtNum(row.quantity) },
                            { label: "Nhà cung cấp", value: row.supplier_name },
                        ]} />
                    ))
            }
        </Section>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Mua phân bón / vật tư
// ─────────────────────────────────────────────────────────────────────────────
function BuyingFertilizerSection({ diaryId }) {
    const { buyingFertilizers, loadingFertilizers, errorFertilizers, fetchBuyingFertilizers } = useDiaryStore();

    useEffect(() => { if (diaryId) fetchBuyingFertilizers(diaryId); }, [diaryId]);

    return (
        <Section iconName="flask-outline" iconLib="ion"
            title="Mua hoặc sản xuất phân bón, thuốc BVTV và hóa chất"
            color="#0D9488" count={buyingFertilizers.length}>
            {loadingFertilizers ? <LoadingState /> : errorFertilizers ? <ErrorState msg={errorFertilizers} /> :
                buyingFertilizers.length === 0 ? <EmptyState /> :
                    buyingFertilizers.map((row, i) => (
                        <CardRow key={row._id ?? i} index={i + 1} fields={[
                            { label: "Ngày mua", value: fmtDate(row.purchase_date) },
                            { label: "Tên vật tư / phân bón", value: row.material_name },
                            { label: "Số lượng", value: fmtNum(row.quantity) },
                            { label: "Đơn vị", value: row.unit },
                            { label: "Nhà cung cấp", value: row.supplier_name },
                        ]} />
                    ))
            }
        </Section>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Sử dụng phân bón / thuốc BVTV
// ─────────────────────────────────────────────────────────────────────────────
function UseFertilizerSection({ diaryId }) {
    const { useFertilizers, loadingUseFertilizers, errorUseFertilizers, fetchUseFertilizers } = useDiaryStore();

    useEffect(() => { if (diaryId) fetchUseFertilizers(diaryId); }, [diaryId]);

    return (
        <Section iconName="water-outline" title="Sử dụng phân bón và thuốc BVTV"
            color="#16A34A" count={useFertilizers.length}>
            {loadingUseFertilizers ? <LoadingState /> : errorUseFertilizers ? <ErrorState msg={errorUseFertilizers} /> :
                useFertilizers.length === 0 ? <EmptyState /> :
                    useFertilizers.map((row, i) => (
                        <CardRow key={row._id ?? i} index={i + 1} fields={[
                            { label: "Ngày sử dụng", value: fmtDate(row.usage_date) },
                            { label: "Tên phân bón", value: row.fertilizer_name },
                            { label: "Liều lượng phân", value: row.fertilizer_amount },
                            { label: "Tên thuốc BVTV", value: row.pesticide_name },
                            { label: "Nồng độ / liều lượng", value: row.pesticide_concentration_amount },
                            { label: "Thời gian cách ly", value: row.preharvest_interval },
                        ]} />
                    ))
            }
        </Section>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Xử lý & đóng gói
// ─────────────────────────────────────────────────────────────────────────────
function PackagingSection({ diaryId }) {
    const { packaging, loadingPackaging, errorPackaging, fetchPackaging } = useDiaryStore();

    useEffect(() => { if (diaryId) fetchPackaging(diaryId); }, [diaryId]);

    return (
        <Section iconName="cube-outline" title="Thu gom, xử lý bao bì chứa đựng và thuốc BVTV dư thừa"
            color="#0891B2" count={packaging.length}>
            {loadingPackaging ? <LoadingState /> : errorPackaging ? <ErrorState msg={errorPackaging} /> :
                packaging.length === 0 ? <EmptyState /> :
                    packaging.map((row, i) => (
                        <CardRow key={row._id ?? i} index={i + 1} fields={[
                            { label: "Ngày xử lý", value: fmtDate(row.handling_date) },
                            { label: "Loại bao bì", value: row.packaging_type },
                            { label: "Nơi lưu trữ", value: row.storage_location },
                            { label: "Phương pháp xử lý", value: row.treatment_method },
                        ]} />
                    ))
            }
        </Section>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Thu hoạch & tiêu thụ
// ─────────────────────────────────────────────────────────────────────────────
function HarvestSection({ diaryId }) {
    const { harvest, loadingHarvest, errorHarvest, fetchHarvest } = useDiaryStore();

    useEffect(() => { if (diaryId) fetchHarvest(diaryId); }, [diaryId]);

    return (
        <Section iconName="basket-outline" title="Thu hoạch và tiêu thụ sản phẩm"
            color="#65A30D" count={harvest.length}>
            {loadingHarvest ? <LoadingState /> : errorHarvest ? <ErrorState msg={errorHarvest} /> :
                harvest.length === 0 ? <EmptyState /> :
                    harvest.map((row, i) => (
                        <CardRow key={row._id ?? i} index={i + 1} fields={[
                            { label: "Ngày thu hoạch", value: fmtDate(row.harvest_date) },
                            { label: "Sản lượng (kg)", value: row.harvest_quantity_kg != null ? `${fmtNum(row.harvest_quantity_kg)} kg` : "—" },
                            { label: "Ngày bán", value: fmtDate(row.sale_date) },
                            { label: "KL tiêu thụ (kg)", value: row.consumed_weight_kg != null ? `${fmtNum(row.consumed_weight_kg)} kg` : "—" },
                        ]} />
                    ))
            }
        </Section>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Chi phí tưới tiêu
// ─────────────────────────────────────────────────────────────────────────────
const IRRIGATION_LABEL = {
    nho_giot: "Nhỏ giọt",
    phun_mua: "Phun mưa",
    thu_cong: "Thủ công",
};

function IrrigationSection({ diaryId }) {
    const { irrigation, loadingIrrigation, errorIrrigation, fetchIrrigation } = useDiaryStore();

    useEffect(() => { if (diaryId) fetchIrrigation(diaryId); }, [diaryId]);

    return (
        <Section iconName="rainy-outline" title="Chi phí tưới tiêu và hệ thống tưới"
            color="#2563EB" count={irrigation.length}>
            {loadingIrrigation ? <LoadingState /> : errorIrrigation ? <ErrorState msg={errorIrrigation} /> :
                irrigation.length === 0 ? <EmptyState /> :
                    irrigation.map((row, i) => {
                        const h = row?.irrigation_duration?.hours ?? "—";
                        const m = row?.irrigation_duration?.minutes ?? "—";
                        return (
                            <CardRow key={row._id ?? i} index={i + 1} fields={[
                                { label: "Ngày thực hiện", value: fmtDate(row.execution_date) },
                                { label: "Hạng mục tưới", value: row.irrigation_item },
                                { label: "Phương pháp", value: IRRIGATION_LABEL[row.irrigation_method] ?? row.irrigation_method },
                                { label: "Thời gian tưới", value: `${h}h ${m}p` },
                                { label: "Diện tích", value: row.irrigation_area },
                                { label: "Người thực hiện", value: row.performed_by },
                            ]} />
                        );
                    })
            }
        </Section>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Chi phí lao động
// ─────────────────────────────────────────────────────────────────────────────
function LaborSection({ diaryId }) {
    const { labor, loadingLabor, errorLabor, fetchLabor } = useDiaryStore();

    useEffect(() => { if (diaryId) fetchLabor(diaryId); }, [diaryId]);

    return (
        <Section iconName="people-outline" title="Chi phí thuê lao động"
            color="#4F46E5" count={labor.length}>
            {loadingLabor ? <LoadingState /> : errorLabor ? <ErrorState msg={errorLabor} /> :
                labor.length === 0 ? <EmptyState /> :
                    labor.map((row, i) => {
                        const h = row?.working_time?.hours ?? "—";
                        const m = row?.working_time?.minutes ?? "—";
                        return (
                            <CardRow key={row._id ?? i} index={i + 1} fields={[
                                { label: "Ngày thuê", value: fmtDate(row.labor_hire_date) },
                                { label: "Công việc", value: row.work_description },
                                { label: "Số lượng người", value: fmtNum(row.worker_quantity) },
                                { label: "Thời gian làm việc", value: `${h}h ${m}p` },
                            ]} />
                        );
                    })
            }
        </Section>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Export
// ─────────────────────────────────────────────────────────────────────────────
export default function DiarySection({ diaryId }) {
    if (!diaryId) {
        return (
            <View style={styles.noDiaryBox}>
                <Ionicons name="alert-circle-outline" size={16} color="#9CA3AF" />
                <Text style={styles.noDiaryText}>Sản phẩm chưa liên kết nhật ký canh tác.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <MaterialCommunityIcons name="notebook-outline" size={18} color="#059669" />
                <Text style={styles.headerTitle}>Nhật ký canh tác</Text>
                <Text style={styles.headerSub}>(chỉ đọc — dữ liệu từ nhà sản xuất)</Text>
            </View>

            <BuyingSeedSection diaryId={diaryId} />
            <BuyingFertilizerSection diaryId={diaryId} />
            <UseFertilizerSection diaryId={diaryId} />
            <PackagingSection diaryId={diaryId} />
            <HarvestSection diaryId={diaryId} />
            <IrrigationSection diaryId={diaryId} />
            <LaborSection diaryId={diaryId} />
        </View>
    );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { gap: 10 },

    noDiaryBox: {
        flexDirection: "row", alignItems: "center", gap: 6,
        paddingVertical: 12,
    },
    noDiaryText: { fontSize: 13, color: "#9CA3AF" },

    header: {
        flexDirection: "row", alignItems: "center", gap: 6,
        marginBottom: 4,
    },
    headerTitle: { fontSize: 15, fontWeight: "700", color: "#111827" },
    headerSub: { fontSize: 11, color: "#9CA3AF", marginTop: 1 },

    // Section
    section: {
        borderRadius: 12, borderWidth: 1,
        overflow: "hidden",
        marginBottom: 2,
    },
    sectionHeader: {
        flexDirection: "row", alignItems: "center", gap: 8,
        paddingHorizontal: 14, paddingVertical: 11,
    },
    sectionTitle: {
        flex: 1, fontSize: 12, fontWeight: "600",
        color: "#FFF", lineHeight: 17,
    },
    badge: {
        backgroundColor: "#FFF", borderRadius: 20,
        paddingHorizontal: 7, paddingVertical: 1,
        minWidth: 22, alignItems: "center",
    },
    badgeText: { fontSize: 11, fontWeight: "700" },
    sectionBody: { backgroundColor: "#FFF" },

    // Card
    card: {
        flexDirection: "row",
        borderBottomWidth: 1, borderBottomColor: "#F3F4F6",
        paddingVertical: 10, paddingHorizontal: 12,
    },
    cardIndex: {
        width: 24, height: 24, borderRadius: 12,
        backgroundColor: "#E5E7EB",
        alignItems: "center", justifyContent: "center",
        marginRight: 10, marginTop: 1, flexShrink: 0,
    },
    cardIndexText: { fontSize: 11, fontWeight: "700", color: "#6B7280" },
    cardFields: { flex: 1, gap: 4 },
    fieldRow: {
        flexDirection: "row", justifyContent: "space-between",
        alignItems: "flex-start", gap: 8,
    },
    fieldLabel: {
        fontSize: 11, color: "#6B7280", fontWeight: "500",
        flexShrink: 0, maxWidth: "45%",
    },
    fieldValue: {
        fontSize: 11, color: "#111827", fontWeight: "600",
        textAlign: "right", flex: 1, flexWrap: "wrap",
    },

    // Loading / Error / Empty
    stateBox: {
        flexDirection: "row", alignItems: "center", gap: 7,
        paddingHorizontal: 14, paddingVertical: 14,
    },
    stateText: { fontSize: 12, color: "#9CA3AF" },
});