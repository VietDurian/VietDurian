"use client";

import { useState, useMemo } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// HƯỚNG DẪN TÍCH HỢP ZUSTAND
// ─────────────────────────────────────────────────────────────────────────────
// Thay SEED_DATA bằng data từ store:
//   import { useDiaryStore } from "@/stores/diaryStore";
//   const rows    = useDiaryStore((s) => s.rows[activeDiary.id] ?? []);
//   const addRow  = useDiaryStore((s) => s.addRow);
//   const editRow = useDiaryStore((s) => s.editRow);
//   const delRows = useDiaryStore((s) => s.deleteRows);
// Trong DiaryTable, truyền props: initialRows={rows} onRowsChange={...}
// ─────────────────────────────────────────────────────────────────────────────

// ── DIARY DEFINITIONS ─────────────────────────────────────────────────────────

const DIARIES = [
  {
    id: "1.4",
    title: "Mua hoặc sản xuất giống trồng",
    icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
    groups: [
      {
        label: null,
        cols: [
          {
            key: "ngayMua",
            label: "Ngày mua\nhoặc SX",
            type: "date",
            width: "w-28",
          },
          {
            key: "tenGiong",
            label: "Tên giống\ntrồng",
            type: "text",
            width: "w-32",
          },
          {
            key: "soLuong",
            label: "Số lượng\nmua (cây)",
            type: "number",
            width: "w-24",
          },
        ],
      },
      {
        label: "Nơi cung cấp",
        cols: [
          { key: "tenDaiLy", label: "Tên đại lý", type: "text", width: "w-28" },
          { key: "diaChi", label: "Địa chỉ", type: "text", width: "w-36" },
        ],
      },
      {
        label: "Đối với giống tự sản xuất ghi thêm thông tin sau",
        cols: [
          {
            key: "nguyenLieu",
            label: "Nguyên liệu\nsản xuất",
            type: "text",
            width: "w-32",
          },
          {
            key: "phuongPhap",
            label: "Phương\npháp",
            type: "text",
            width: "w-28",
          },
          {
            key: "hoaChat",
            label: "Hóa chất\nxử lý",
            type: "text",
            width: "w-28",
          },
          {
            key: "nguoiSX",
            label: "Người\nsản xuất",
            type: "text",
            width: "w-28",
          },
        ],
      },
    ],
  },
  {
    id: "1.5",
    title: "Mua hoặc sản xuất phân bón, thuốc BVTV và hóa chất",
    icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z",
    groups: [
      {
        label: null,
        cols: [
          {
            key: "ngayMua",
            label: "Ngày mua\nhoặc SX",
            type: "date",
            width: "w-28",
          },
          { key: "tenVatTu", label: "Tên vật tư", type: "text", width: "w-32" },
          {
            key: "khoiLuong",
            label: "Khối lượng\n(kg, g, l, ml)",
            type: "text",
            width: "w-28",
          },
        ],
      },
      {
        label: "Nơi cung cấp",
        cols: [
          { key: "tenDaiLy", label: "Tên đại lý", type: "text", width: "w-28" },
          { key: "diaChi", label: "Địa chỉ", type: "text", width: "w-36" },
        ],
      },
      {
        label: null,
        cols: [
          {
            key: "hanSD",
            label: "Hạn sử dụng\n(ngày/tháng/năm)",
            type: "date",
            width: "w-32",
          },
        ],
      },
      {
        label: "Đối với vật tư tự sản xuất ghi thêm thông tin sau",
        cols: [
          {
            key: "nguyenLieu",
            label: "Nguyên liệu\nsản xuất",
            type: "text",
            width: "w-32",
          },
          {
            key: "phuongPhap",
            label: "Phương pháp\nxử lý",
            type: "text",
            width: "w-28",
          },
          {
            key: "hoaChat",
            label: "Hóa chất\nxử lý",
            type: "text",
            width: "w-28",
          },
          {
            key: "nguoiSX",
            label: "Người\nsản xuất",
            type: "text",
            width: "w-28",
          },
        ],
      },
    ],
  },
  {
    id: "1.6",
    title: "Sử dụng phân bón và thuốc BVTV",
    icon: "M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1v1a1 1 0 002 0v-1h6v1a1 1 0 002 0v-1h1a1 1 0 001-1V5a1 1 0 00-1-1H3zm2 3h10v2H5V7zm0 4h4v2H5v-2zm7 0h3v2h-3v-2z",
    groups: [
      {
        label: null,
        cols: [
          {
            key: "ngaySuDung",
            label: "Ngày\nsử dụng",
            type: "date",
            width: "w-28",
          },
          {
            key: "tenVatTu",
            label: "Tên phân bón /\nthuốc BVTV",
            type: "text",
            width: "w-36",
          },
          {
            key: "lieuLuong",
            label: "Liều lượng\nsử dụng",
            type: "text",
            width: "w-28",
          },
          {
            key: "diemPhun",
            label: "Khu vực /\ndiện tích",
            type: "text",
            width: "w-32",
          },
          {
            key: "mucDich",
            label: "Mục đích\nsử dụng",
            type: "text",
            width: "w-36",
          },
          {
            key: "phuongPhap",
            label: "Phương pháp\nphun / bón",
            type: "text",
            width: "w-32",
          },
          {
            key: "thoiGianCachLy",
            label: "Thời gian\ncách ly (ngày)",
            type: "number",
            width: "w-28",
          },
          {
            key: "nguoiThucHien",
            label: "Người\nthực hiện",
            type: "text",
            width: "w-28",
          },
          { key: "ghiChu", label: "Ghi chú", type: "text", width: "w-36" },
        ],
      },
    ],
  },
  {
    id: "1.7",
    title: "Thu gom, xử lý bao bì chứa đựng và thuốc BVTV dư thừa",
    icon: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
    groups: [
      {
        label: null,
        cols: [
          {
            key: "ngay",
            label: "Ngày,\ntháng, năm",
            type: "date",
            width: "w-28",
          },
          {
            key: "loaiBaoBi",
            label: "Loại bao bì, thùng chứa,\nthuốc dư thừa",
            type: "text",
            width: "w-48",
          },
          {
            key: "noiTonTru",
            label: "Nơi tồn trữ,\nhuỷ bỏ",
            type: "text",
            width: "w-40",
          },
          { key: "cachXuLy", label: "Cách xử lý", type: "text", width: "w-40" },
        ],
      },
    ],
  },
  {
    id: "1.8",
    title: "Thu hoạch và tiêu thụ sản phẩm",
    icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
    groups: [
      {
        label: null,
        cols: [
          {
            key: "ngay",
            label: "Ngày,\ntháng, năm",
            type: "date",
            width: "w-28",
          },
          {
            key: "sanLuong",
            label: "Sản lượng\nthu hoạch (kg)",
            type: "number",
            width: "w-32",
          },
          {
            key: "diaDiemSoChe",
            label: "Địa điểm, cách thức\nsơ chế (nếu có)",
            type: "text",
            width: "w-44",
          },
          {
            key: "thoiGianXuatBan",
            label: "Thời gian xuất bán\n(ngày/tháng/năm)",
            type: "date",
            width: "w-36",
          },
          {
            key: "tenCoSoThuMua",
            label: "Tên địa chỉ cơ sở\nthu mua hoặc tiêu thụ",
            type: "text",
            width: "w-44",
          },
          {
            key: "khoiLuongTieuThu",
            label: "Khối lượng\ntiêu thụ (kg)",
            type: "number",
            width: "w-32",
          },
        ],
      },
    ],
  },
];

// ── HELPERS ───────────────────────────────────────────────────────────────────
const genId = () => Math.random().toString(36).slice(2, 10);
const flatCols = (d) => d.groups.flatMap((g) => g.cols);
const emptyRow = (d) => Object.fromEntries(flatCols(d).map((c) => [c.key, ""]));

// ── SEED DATA (thay bằng Zustand store) ──────────────────────────────────────
const SEED_DATA = {
  1.4: [
    {
      id: genId(),
      ngayMua: "2025-01-10",
      tenGiong: "Sầu riêng Ri6",
      soLuong: "200",
      tenDaiLy: "Cty TNHH Xanh",
      diaChi: "Cần Thơ",
      nguyenLieu: "",
      phuongPhap: "",
      hoaChat: "",
      nguoiSX: "",
    },
    {
      id: genId(),
      ngayMua: "2025-02-15",
      tenGiong: "Sầu riêng Musang King",
      soLuong: "150",
      tenDaiLy: "Vườn ươm Nam Bộ",
      diaChi: "Tiền Giang",
      nguyenLieu: "",
      phuongPhap: "",
      hoaChat: "",
      nguoiSX: "",
    },
  ],
  1.5: [
    {
      id: genId(),
      ngayMua: "2025-01-20",
      tenVatTu: "Phân NPK 20-20-15",
      khoiLuong: "50 kg",
      tenDaiLy: "Agri Shop",
      diaChi: "Cần Thơ",
      hanSD: "2026-12-31",
      nguyenLieu: "",
      phuongPhap: "",
      hoaChat: "",
      nguoiSX: "",
    },
    {
      id: genId(),
      ngayMua: "2025-03-01",
      tenVatTu: "Thuốc trừ sâu Confidor",
      khoiLuong: "2 l",
      tenDaiLy: "Bayer VN",
      diaChi: "HCM",
      hanSD: "2026-06-30",
      nguyenLieu: "",
      phuongPhap: "",
      hoaChat: "",
      nguoiSX: "",
    },
  ],
  1.6: [
    {
      id: genId(),
      ngaySuDung: "2025-03-05",
      tenVatTu: "Phân NPK 20-20-15",
      lieuLuong: "2 kg/cây",
      diemPhun: "Khu A – 1 ha",
      mucDich: "Bón thúc",
      phuongPhap: "Rải gốc",
      thoiGianCachLy: "0",
      nguoiThucHien: "Nguyễn Văn A",
      ghiChu: "",
    },
  ],
  1.7: [
    {
      id: genId(),
      ngay: "2025-04-10",
      loaiBaoBi: "Chai nhựa Confidor 1L",
      noiTonTru: "Kho chứa bao bì",
      cachXuLy: "Đốt theo quy định",
    },
  ],
  1.8: [
    {
      id: genId(),
      ngay: "2025-06-20",
      sanLuong: "500",
      diaDiemSoChe: "Kho tại vườn",
      thoiGianXuatBan: "2025-06-21",
      tenCoSoThuMua: "Cty XNK Sầu Riêng Việt",
      khoiLuongTieuThu: "480",
    },
  ],
};

const PAGE_SIZE = 8;

// ── TOAST HOOK ────────────────────────────────────────────────────────────────
function useToast() {
  const [toast, setToast] = useState(null);
  const show = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };
  return { toast, show };
}

// ── RECORD MODAL (create / edit) ─────────────────────────────────────────────
function RecordModal({ diary, row, onSave, onClose }) {
  const [form, setForm] = useState({ ...row });
  const isEdit = !!row.id;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 py-8 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <p className="text-xs text-emerald-600 font-medium mb-0.5">
              Nhật ký {diary.id}
            </p>
            <h2 className="text-sm font-semibold text-gray-800">
              {isEdit ? "Chỉnh sửa bản ghi" : "Thêm bản ghi mới"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition text-xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 max-h-[65vh] overflow-y-auto">
          {diary.groups.map((group, gi) => (
            <div key={gi}>
              {group.label && (
                <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-3 pb-1 border-b border-emerald-100">
                  {group.label}
                </p>
              )}
              <div className="grid grid-cols-2 gap-3">
                {group.cols.map((col) => (
                  <div
                    key={col.key}
                    className={
                      col.type === "text" && col.width === "w-48"
                        ? "col-span-2"
                        : ""
                    }
                  >
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      {col.label.replace(/\n/g, " ")}
                    </label>
                    <input
                      type={
                        col.type === "number"
                          ? "number"
                          : col.type === "date"
                            ? "date"
                            : "text"
                      }
                      value={form[col.key] ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, [col.key]: e.target.value }))
                      }
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-5 pt-3 border-t border-gray-50">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            Huỷ
          </button>
          <button
            onClick={() => onSave(form)}
            className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-sm text-white font-medium transition shadow-sm shadow-emerald-200"
          >
            {isEdit ? "Lưu thay đổi" : "Thêm mới"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── DELETE MODAL ──────────────────────────────────────────────────────────────
function DeleteModal({ count, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="px-6 py-6 text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-gray-800 mb-1">
            Xác nhận xoá
          </h3>
          <p className="text-sm text-gray-500">
            Sắp xoá{" "}
            <span className="font-medium text-gray-700">{count} bản ghi</span>.
            Hành động không thể hoàn tác.
          </p>
        </div>
        <div className="flex gap-3 px-6 pb-5">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            Huỷ
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-sm text-white font-medium transition"
          >
            Xoá
          </button>
        </div>
      </div>
    </div>
  );
}

// ── DIARY TABLE ───────────────────────────────────────────────────────────────
function DiaryTable({ diary, initialRows, onRowsChange }) {
  const cols = flatCols(diary);

  const [rows, setRowsInner] = useState(
    initialRows ?? SEED_DATA[diary.id] ?? [],
  );
  const setRows = (updater) => {
    setRowsInner((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      onRowsChange?.(next);
      return next;
    });
  };

  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null); // null | "create" | "edit"
  const [editRow, setEditRow] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [page, setPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const { toast, show: showToast } = useToast();

  const filtered = useMemo(() => {
    if (!search) return rows;
    const q = search.toLowerCase();
    return rows.filter((r) =>
      cols.some((c) =>
        String(r[c.key] ?? "")
          .toLowerCase()
          .includes(q),
      ),
    );
  }, [rows, search, cols]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const allSelected =
    paginated.length > 0 && paginated.every((r) => selected.has(r.id));

  const openCreate = () => {
    setEditRow(emptyRow(diary));
    setModal("create");
  };
  const openEdit = (row) => {
    setEditRow({ ...row });
    setModal("edit");
  };

  const handleSave = (form) => {
    if (modal === "create") {
      setRows((prev) => [{ ...form, id: genId() }, ...prev]);
      showToast("Đã thêm bản ghi mới");
    } else {
      setRows((prev) =>
        prev.map((r) => (r.id === editRow.id ? { ...form, id: r.id } : r)),
      );
      showToast("Đã cập nhật bản ghi");
    }
    setModal(null);
    setPage(1);
  };

  const handleDelete = (ids) => {
    setRows((prev) => prev.filter((r) => !ids.has(r.id)));
    setSelected(new Set());
    setDeleteConfirm(null);
    showToast(`Đã xoá ${ids.size} bản ghi`);
  };

  const toggleRow = (id) =>
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const toggleAll = () => {
    if (allSelected)
      setSelected((prev) => {
        const n = new Set(prev);
        paginated.forEach((r) => n.delete(r.id));
        return n;
      });
    else
      setSelected((prev) => {
        const n = new Set(prev);
        paginated.forEach((r) => n.add(r.id));
        return n;
      });
  };

  const fmtVal = (col, val) => {
    if (!val) return <span className="text-gray-300">—</span>;
    if (col.type === "date") {
      try {
        return new Date(val).toLocaleDateString("vi-VN");
      } catch {
        return val;
      }
    }
    return val;
  };

  return (
    <div className="space-y-4 p-5 min-h-screen">
      {/* ── Toolbar ── */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-48">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm kiếm bản ghi..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
          />
        </div>

        {selected.size > 0 && (
          <button
            onClick={() => setDeleteConfirm(new Set(selected))}
            className="px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 hover:bg-red-100 transition font-medium"
          >
            Xoá {selected.size} mục
          </button>
        )}

        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition shadow-sm shadow-emerald-200"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Thêm bản ghi
        </button>
      </div>

      {/* ── Table ── */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table
            className="text-xs border-collapse"
            style={{ minWidth: "max-content", width: "100%" }}
          >
            <thead>
              {/* Row 1: group headers */}
              <tr>
                <th
                  className="border border-emerald-200 bg-emerald-700 text-white px-3 py-2 text-center"
                  rowSpan={2}
                  style={{ minWidth: 36 }}
                >
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="w-3.5 h-3.5 rounded border-emerald-300 text-emerald-600"
                  />
                </th>

                {diary.groups.map((group, gi) =>
                  group.label ? (
                    <th
                      key={gi}
                      className="border border-emerald-200 bg-emerald-600 text-white px-2 py-2 text-center font-semibold"
                      colSpan={group.cols.length}
                    >
                      {group.label}
                    </th>
                  ) : (
                    group.cols.map((col, ci) => (
                      <th
                        key={`${gi}-${ci}`}
                        className="border border-emerald-200 bg-emerald-700 text-white px-2 py-1 text-center font-medium leading-snug"
                        rowSpan={2}
                        style={{
                          minWidth:
                            parseInt((col.width || "w-28").replace("w-", "")) *
                            4,
                        }}
                      >
                        {col.label.split("\n").map((l, i) => (
                          <span key={i} className="block">
                            {l}
                          </span>
                        ))}
                      </th>
                    ))
                  ),
                )}

                <th
                  className="border border-emerald-200 bg-emerald-700 text-white px-3 py-2 text-center font-medium"
                  rowSpan={2}
                  style={{ minWidth: 80 }}
                >
                  Hành động
                </th>
              </tr>

              {/* Row 2: sub-headers for grouped columns */}
              <tr>
                {diary.groups
                  .filter((g) => g.label)
                  .flatMap((g) => g.cols)
                  .map((col, ci) => (
                    <th
                      key={ci}
                      className="border border-emerald-200 bg-emerald-500 text-white px-2 py-1.5 text-center font-medium leading-snug whitespace-nowrap"
                      style={{
                        minWidth:
                          parseInt((col.width || "w-28").replace("w-", "")) * 4,
                      }}
                    >
                      {col.label.split("\n").map((l, i) => (
                        <span key={i} className="block">
                          {l}
                        </span>
                      ))}
                    </th>
                  ))}
              </tr>
            </thead>

            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={cols.length + 2}
                    className="text-center py-14 text-gray-400"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <svg
                        className="w-8 h-8 text-gray-200"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Chưa có bản ghi nào
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((row, ri) => (
                  <tr
                    key={row.id}
                    className={`transition border-b border-gray-50 ${
                      selected.has(row.id)
                        ? "bg-emerald-50"
                        : ri % 2 === 0
                          ? "bg-white hover:bg-gray-50/60"
                          : "bg-gray-50/40 hover:bg-gray-50"
                    }`}
                  >
                    <td className="border border-gray-100 px-3 py-2.5 text-center">
                      <input
                        type="checkbox"
                        checked={selected.has(row.id)}
                        onChange={() => toggleRow(row.id)}
                        className="w-3.5 h-3.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                    </td>

                    {cols.map((col) => (
                      <td
                        key={col.key}
                        className="border border-gray-100 px-2.5 py-2.5 text-gray-700 whitespace-nowrap"
                      >
                        {fmtVal(col, row[col.key])}
                      </td>
                    ))}

                    <td className="border border-gray-100 px-2 py-2.5">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEdit(row)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition"
                          title="Sửa"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(new Set([row.id]))}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                          title="Xoá"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 bg-gray-50/50">
          <p className="text-xs text-gray-400">
            {filtered.length > 0
              ? `${Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–${Math.min(page * PAGE_SIZE, filtered.length)} / ${filtered.length} bản ghi`
              : "0 bản ghi"}
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-2.5 py-1 text-xs rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                ←
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 text-xs rounded-lg font-medium transition ${
                    p === page
                      ? "bg-emerald-600 text-white"
                      : "border border-gray-200 text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-2.5 py-1 text-xs rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {modal && (
        <RecordModal
          diary={diary}
          row={editRow}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
      {deleteConfirm && (
        <DeleteModal
          count={deleteConfirm.size}
          onConfirm={() => handleDelete(deleteConfirm)}
          onClose={() => setDeleteConfirm(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${
            toast.type === "error" ? "bg-red-500" : "bg-emerald-600"
          }`}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={
                toast.type === "error"
                  ? "M6 18L18 6M6 6l12 12"
                  : "M5 13l4 4L19 7"
              }
            />
          </svg>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function DiaryPage() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const diary = DIARIES[activeIdx];

  return (
    <div className="space-y-4 p-5" onClick={() => setDropdownOpen(false)}>
      {/* ── Header with dropdown ── */}
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => setDropdownOpen((o) => !o)}
          className="flex items-center gap-2.5 group"
        >
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg shrink-0">
            Nhật ký {diary.id}
          </span>
          <h1 className="text-base font-semibold text-gray-800">
            {diary.title}
          </h1>
          <svg
            className={`w-4 h-4 text-emerald-500 shrink-0 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : "rotate-0"}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Dropdown */}
        {dropdownOpen && (
          <div className="absolute top-full left-0 mt-2 w-96 bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/60 py-1.5 z-30 overflow-hidden">
            {DIARIES.map((d, i) => (
              <button
                key={d.id}
                onClick={() => {
                  setActiveIdx(i);
                  setDropdownOpen(false);
                }}
                className={`w-full flex items-start gap-3 px-4 py-3 text-left transition hover:bg-emerald-50 ${
                  i === activeIdx ? "bg-emerald-50" : ""
                }`}
              >
                {/* Icon */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    i === activeIdx ? "bg-emerald-600" : "bg-gray-100"
                  }`}
                >
                  <svg
                    className={`w-4 h-4 ${i === activeIdx ? "text-white" : "text-gray-500"}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d={d.icon}
                    />
                  </svg>
                </div>

                {/* Label */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs font-bold mb-0.5 ${i === activeIdx ? "text-emerald-600" : "text-gray-400"}`}
                  >
                    Nhật ký {d.id}
                  </p>
                  <p
                    className={`text-xs leading-snug ${i === activeIdx ? "text-emerald-800 font-medium" : "text-gray-600"}`}
                  >
                    {d.title}
                  </p>
                </div>

                {/* Active check */}
                {i === activeIdx && (
                  <svg
                    className="w-4 h-4 text-emerald-500 flex-shrink-0 ml-auto mt-1.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Table (re-mounts on diary switch) ── */}
      <DiaryTable key={diary.id} diary={diary} />
    </div>
  );
}
