"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
    BookOpen,
    Sprout,
    Droplets,
    Sun,
    ShieldCheck,
    Scissors,
    ClipboardCheck,
    CheckCircle2,
    AlertTriangle,
    FileText,
    Bug,
    ThermometerSun,
    Calendar,
    Wind,
    ScanLine,
    Award,
    Trash2
} from "lucide-react";

// Dữ liệu VietGAP chuyên sâu - PHIÊN BẢN CẢI TIẾN với đầy đủ nguồn tham chiếu
const guideSections = [
    {
        id: "tong-quan-vietgap",
        title: "1. Tổng quan về VietGAP",
        icon: <ShieldCheck className="w-6 h-6" />,
        description: "Hiểu đúng về tiêu chuẩn VietGAP và lợi ích kinh tế mang lại.",
        source: "TCVN 11892-1:2017 - Thực hành sản xuất nông nghiệp tốt",
        content: (
            <div className="space-y-8">
                {/* Định nghĩa VietGAP */}
                <div className="bg-emerald-50 border-l-4 border-emerald-500 p-6 rounded-r-xl shadow-sm">
                    <h4 className="font-bold text-emerald-900 mb-2 text-xl flex items-center gap-2">
                        <BookOpen className="w-6 h-6" /> VietGAP là gì?
                    </h4>
                    <p className="text-gray-800 text-base leading-relaxed">
                        <strong>VietGAP</strong> (Vietnamese Good Agricultural Practices) là Quy trình thực hành sản xuất nông nghiệp tốt tại Việt Nam.
                        Đối với sầu riêng, đây là bộ tiêu chuẩn "sống còn" để đảm bảo sản phẩm sạch, an toàn và là điều kiện bắt buộc để được cấp <strong>Mã số vùng trồng (PU Code)</strong> xuất khẩu chính ngạch sang Trung Quốc và các nước khác.
                    </p>
                </div>

                {/* 4 Trụ cột cốt lõi */}
                <div>
                    <h4 className="font-bold text-gray-900 mb-4 text-lg">4 Tiêu Chí Cốt Lõi Của VietGAP</h4>
                    <div className="grid md:grid-cols-2 gap-4 items-stretch">
                        <div className="bg-white border rounded-xl p-5 shadow-sm hover:border-emerald-300 transition-colors h-full">
                            <div className="flex items-center gap-3 mb-3 pb-2 border-b">
                                <div className="bg-red-100 p-2 rounded-lg text-red-600"><AlertTriangle className="w-5 h-5" /></div>
                                <span className="font-bold text-gray-800">1. An toàn thực phẩm</span>
                            </div>
                            <p className="text-sm text-gray-600">Không tồn dư thuốc BVTV, Nitrat, Kim loại nặng và Vi sinh vật có hại trên trái sầu riêng.</p>
                        </div>
                        <div className="bg-white border rounded-xl p-5 shadow-sm hover:border-emerald-300 transition-colors h-full">
                            <div className="flex items-center gap-3 mb-3 pb-2 border-b">
                                <div className="bg-green-100 p-2 rounded-lg text-green-600"><Sprout className="w-5 h-5" /></div>
                                <span className="font-bold text-gray-800">2. An toàn môi trường</span>
                            </div>
                            <p className="text-sm text-gray-600">Không làm ô nhiễm đất, nước. Phải thu gom và xử lý rác thải (vỏ chai thuốc) đúng quy định.</p>
                        </div>
                        <div className="bg-white border rounded-xl p-5 shadow-sm hover:border-emerald-300 transition-colors h-full">
                            <div className="flex items-center gap-3 mb-3 pb-2 border-b">
                                <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><ShieldCheck className="w-5 h-5" /></div>
                                <span className="font-bold text-gray-800">3. Sức khỏe lao động</span>
                            </div>
                            <p className="text-sm text-gray-600">Người phun thuốc phải có đồ bảo hộ. Nông dân được tập huấn kỹ thuật và khám sức khỏe.</p>
                        </div>
                        <div className="bg-white border rounded-xl p-5 shadow-sm hover:border-emerald-300 transition-colors h-full">
                            <div className="flex items-center gap-3 mb-3 pb-2 border-b">
                                <div className="bg-purple-100 p-2 rounded-lg text-purple-600"><FileText className="w-5 h-5" /></div>
                                <span className="font-bold text-gray-800">4. Truy xuất nguồn gốc</span>
                            </div>
                            <p className="text-sm text-gray-600">Phải ghi chép nhật ký canh tác ("Làm gì - Ghi nấy") để truy vết khi có sự cố xảy ra.</p>
                        </div>
                    </div>
                </div>

                {/* Lợi ích */}
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-xl border border-orange-100">
                    <h4 className="font-bold text-orange-900 mb-3 text-lg flex items-center gap-2">
                        <Award className="w-6 h-6" /> Tại sao phải làm VietGAP?
                    </h4>
                    <ul className="grid md:grid-cols-2 gap-3 text-sm text-gray-800">
                        <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-orange-600 flex-shrink-0" /> <span>Giá bán cao hơn 10-20% so với canh tác thường.</span></li>
                        <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-orange-600 flex-shrink-0" /> <span>Đầu ra ổn định (Siêu thị, Xuất khẩu).</span></li>
                        <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-orange-600 flex-shrink-0" /> <span>Giảm chi phí thuốc BVTV nhờ quản lý IPM.</span></li>
                        <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-orange-600 flex-shrink-0" /> <span>Bền vững cho đất và sức khỏe người trồng.</span></li>
                    </ul>
                </div>
            </div>
        )
    },
    {
        id: "danh-gia-ban-dau",
        title: "2. Đánh giá & Chuẩn bị đất",
        icon: <Sun className="w-6 h-6" />,
        description: "Bước khởi đầu: Đánh giá mối nguy và chuẩn bị điều kiện sinh thái.",
        source: "QCVN 03-MT:2015/BTNMT - Quy chuẩn kỹ thuật quốc gia về chất lượng đất, QCVN 08-MT:2015/BTNMT - Quy chuẩn kỹ thuật quốc gia về chất lượng nước mặt",

        content: (
            <div className="space-y-8">
                {/* 2.1 Đánh giá mối nguy - BẮT BUỘC */}
                <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-r-lg shadow-sm">
                    <h4 className="font-bold text-red-900 flex items-center gap-2 mb-3 text-lg">
                        <AlertTriangle className="w-6 h-6" />
                        2.1. Đánh Giá Mối Nguy (Major Must - BẮT BUỘC)
                    </h4>
                    <p className="text-gray-800 mb-2 text-sm">
                        Theo VietGAP (TCVN 11892-1:2017, Điều 4.1), trước khi trồng, bắt buộc phải đánh giá và loại trừ các mối nguy. Lấy mẫu phân tích tại phòng thí nghiệm đạt chuẩn <strong>ISO 17025</strong>:
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                        <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                            <li><strong>Đất (QCVN 03-MT:2015/BTNMT):</strong> Kiểm tra kim loại nặng: Asen (As), Cadimi (Cd), Chì (Pb), Thủy ngân (Hg).</li>
                            <li><strong>Nước (QCVN 08-MT:2015/BTNMT):</strong> Không nhiễm E. Coli, Salmonella, Coliforms. Nồng độ mặn {'<'} 1‰.</li>
                        </ul>
                        <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                            <li><strong>Lịch sử đất:</strong> Không trồng trên bãi rác, kho hóa chất, khu vực bệnh viện/nghĩa trang.</li>
                            <li><strong>Cách ly:</strong> Cách xa nguồn ô nhiễm (KCN, chuồng trại) tối thiểu 500m - 1km.</li>
                        </ul>
                    </div>
                    <p className="text-xs text-gray-500 mt-3 italic">
                        📌 Nguồn: TCVN 11892-1:2017, Điều 4.1 - "Đánh giá mối nguy ban đầu"
                    </p>
                </div>

                {/* 2.2 Yêu cầu sinh thái */}
                <div className="grid md:grid-cols-2 gap-6 items-stretch">
                    <div className="bg-white border rounded-xl p-5 shadow-sm hover:border-orange-300 transition-colors h-full flex flex-col">
                        <h5 className="font-bold text-gray-800 mb-3 border-b pb-2 flex items-center gap-2">
                            <ThermometerSun className="w-5 h-5 text-orange-500" /> 2.2. Khí hậu lý tưởng
                        </h5>
                        <ul className="space-y-3 text-sm text-gray-600 flex-1">
                            <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 flex-shrink-0" /> <span><strong>Nhiệt độ:</strong> 24 - 30°C. (Dưới 22°C sinh trưởng chậm).</span></li>
                            <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 flex-shrink-0" /> <span><strong>Độ ẩm:</strong> 75 - 80%.</span></li>
                            <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 flex-shrink-0" /> <span><strong>Lượng mưa:</strong> 1.600 - 4.000 mm/năm. Cần 2 tháng khô hạn để ra hoa.</span></li>
                            <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 flex-shrink-0" /> <span><strong>Gió:</strong> Trồng cây chắn gió (muồng đen, bình linh) bao quanh vườn.</span></li>
                        </ul>
                        <p className="text-xs text-gray-500 mt-3 italic">
                            📌 Nguồn: Tài liệu tham khảo (QCERT.VN - Quy trình trồng sầu riêng VietGAP), phần "Yêu cầu về sinh thái"
                        </p>
                    </div>
                    <div className="bg-white border rounded-xl p-5 shadow-sm hover:border-orange-300 transition-colors h-full flex flex-col">
                        <h5 className="font-bold text-gray-800 mb-3 border-b pb-2 flex items-center gap-2">
                            <Sprout className="w-5 h-5 text-green-600" /> 2.3. Chuẩn bị đất trồng
                        </h5>
                        <ul className="space-y-3 text-sm text-gray-600 flex-1">
                            <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-1.5 flex-shrink-0" /> <span><strong>Miền Tây:</strong> Lên mô cao 60-80cm, rộng 1.5-2m để chống lũ/triều cường.</span></li>
                            <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-1.5 flex-shrink-0" /> <span><strong>Tây Nguyên:</strong> Đào hố 60x60x60cm.</span></li>
                            <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-1.5 flex-shrink-0" /> <span><strong>Xử lý hố:</strong> Bón lót 15-20kg phân chuồng hoai + 0.5kg Lân + 0.5kg Vôi + Nấm Trichoderma (trước trồng 20 ngày).</span></li>
                            <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-1.5 flex-shrink-0" /> <span><strong>pH đất:</strong> 5.5 - 6.5.</span></li>
                        </ul>
                        <p className="text-xs text-gray-500 mt-3 italic">
                            📌 Nguồn: Tài liệu tham khảo (QCERT.VN - Quy trình trồng sầu riêng VietGAP), phần "Chuẩn bị đất trồng"
                        </p>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: "quan-ly-giong",
        title: "3. Cây giống & Kỹ thuật trồng",
        icon: <Sprout className="w-6 h-6" />,
        description: "Quy chuẩn cây giống (QCVN 01-189:2019) và kỹ thuật xuống giống.",
        source: "QCVN 01-189:2019/BNNPTNT - Quy chuẩn kỹ thuật quốc gia về chất lượng cây giống",
        content: (
            <div className="space-y-8">
                {/* 3.1 Tiêu chuẩn giống */}
                <div>
                    <h4 className="font-bold text-gray-900 mb-4 text-xl">3.1. Tiêu Chuẩn Cây Giống Xuất Vườn</h4>
                    <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                            <div className="bg-white p-5 rounded-lg shadow-sm h-full flex flex-col">
                                <h5 className="font-bold text-emerald-800 mb-2 border-b pb-1">Chỉ tiêu hình thái (QCVN 01-189:2019):</h5>
                                <ul className="space-y-2 text-sm text-gray-600 flex-1">
                                    <li>• Gốc ghép thẳng, đường kính đo cách mặt bầu 2cm phải đạt <strong>&ge; 0.8 - 1.0 cm</strong> (tùy giống).</li>
                                    <li>• Vết ghép liền da hoàn toàn, tiếp hợp tốt, cách mặt bầu 20-30cm.</li>
                                    <li>• Có ít nhất 2-3 cơi đọt, lá xanh đậm, khỏe mạnh.</li>
                                    <li>• Không bị dị dạng rễ (bó rễ, cong rễ cọc).</li>
                                </ul>
                                <p className="text-xs text-gray-500 mt-3 italic">
                                    📌 Nguồn: QCVN 01-189:2019/BNNPTNT, Điều 5.2
                                </p>
                            </div>
                            <div className="bg-white p-5 rounded-lg shadow-sm h-full flex flex-col">
                                <h5 className="font-bold text-emerald-800 mb-2 border-b pb-1">Chỉ tiêu sâu bệnh & Pháp lý:</h5>
                                <ul className="space-y-2 text-sm text-gray-600 flex-1">
                                    <li>• <strong>Sạch bệnh:</strong> Không nhiễm Phytophthora, thán thư, tuyến trùng, rệp sáp.</li>
                                    <li>• <strong>Nguồn gốc:</strong> Mua tại vườn ươm có giấy phép hành nghề.</li>
                                    <li>• <strong>Hồ sơ:</strong> Phải lưu giữ hóa đơn, hợp đồng mua bán giống (để truy xuất).</li>
                                </ul>
                                <p className="text-xs text-gray-500 mt-3 italic">
                                    📌 Nguồn: TCVN 11892-1:2017, Điều 5 - "Vật liệu nhân giống"
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3.2 Mật độ & Kỹ thuật trồng */}
                <div>
                    <h4 className="font-bold text-gray-900 mb-4 text-xl">3.2. Mật Độ & Cách Trồng</h4>
                    <div className="overflow-x-auto border rounded-xl shadow-sm mb-6">
                        <table className="min-w-full text-sm text-left">
                            <thead className="bg-gray-100 font-bold text-gray-800">
                                <tr>
                                    <th className="px-5 py-3">Phương thức</th>
                                    <th className="px-5 py-3">Khoảng cách</th>
                                    <th className="px-5 py-3">Mật độ (cây/ha)</th>
                                    <th className="px-5 py-3">Lưu ý</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                <tr>
                                    <td className="px-5 py-3 font-medium">Trồng thuần</td>
                                    <td className="px-5 py-3">8m x 8m</td>
                                    <td className="px-5 py-3">~ 156</td>
                                    <td className="px-5 py-3">Phổ biến nhất.</td>
                                </tr>
                                <tr>
                                    <td className="px-5 py-3 font-medium">Trồng thưa</td>
                                    <td className="px-5 py-3">8m x 10m</td>
                                    <td className="px-5 py-3">~ 125</td>
                                    <td className="px-5 py-3">Giảm sâu bệnh, cây lâu năm.</td>
                                </tr>
                                <tr>
                                    <td className="px-5 py-3 font-medium">Trồng xen</td>
                                    <td className="px-5 py-3">9m x 12m</td>
                                    <td className="px-5 py-3">~ 70-80</td>
                                    <td className="px-5 py-3">Xen canh Cà phê/Tiêu.</td>
                                </tr>
                            </tbody>
                        </table>
                        <p className="text-xs text-gray-500 p-3 bg-gray-50 italic">
                            📌 Nguồn: (QCERT.VN - Quy trình trồng sầu riêng VietGAP), phần "Mật độ và khoảng cách trồng"
                        </p>
                    </div>

                    <div className="bg-lime-50 p-5 rounded-xl border border-lime-200">
                        <h5 className="font-bold text-lime-900 mb-2">Quy trình xuống giống chuẩn:</h5>
                        <ol className="list-decimal pl-5 text-sm text-gray-700 space-y-2">
                            <li>Đào hố nhỏ giữa mô. Cắt đáy bầu, cắt bỏ phần rễ cọc bị cong (nếu có).</li>
                            <li>Đặt cây vào hố. <strong>Lưu ý: Mặt bầu phải ngang hoặc cao hơn mặt đất 2-3cm</strong> (để chống nghẹt rễ).</li>
                            <li>Rạch túi bầu, lấp đất, ấn nhẹ. Cắm cọc cố định cây (tránh gió lay).</li>
                            <li>Tưới đẫm nước. Che nắng 30-50% bằng lưới đen hoặc tàu dừa.</li>
                            <li>Tủ gốc giữ ẩm (rơm rạ) nhưng phải cách gốc 20cm để tránh nấm bệnh tấn công cổ rễ.</li>
                        </ol>
                        <p className="text-xs text-gray-500 mt-3 italic">
                            📌 Nguồn: Tài liệu tham khảo (QCERT.VN - Quy trình trồng sầu riêng VietGAP), phần "Cách trồng cây sầu riêng"
                        </p>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: "cham-soc-phan-bon",
        title: "4. Chăm sóc & Phân bón",
        icon: <Droplets className="w-6 h-6" />,
        description: "Quy trình phân bón và nước tưới theo giai đoạn (Tài liệu SOFRI).",
        source: "Viện Cây ăn quả miền Nam (SOFRI), 2022 - 'Quy trình kỹ thuật trồng sầu riêng VietGAP tại ĐBSCL'",
        content: (
            <div className="space-y-8">
                {/* 4.1 Nước tưới */}
                <div className="bg-blue-50 p-5 rounded-xl border border-blue-200 shadow-sm">
                    <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2 text-lg">
                        <Droplets className="w-5 h-5" /> 4.1. Quản Lý Nước Tưới & Tỉa Cành
                    </h4>
                    <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-700">
                        <ul className="space-y-2">
                            <li><strong>Cây con:</strong> Tưới giữ ẩm thường xuyên, độ ẩm 65-70%.</li>
                            <li><strong>Cây ra hoa:</strong> Phải <strong>Xiết nước (cắt nước)</strong> 20-30 ngày (kết hợp phủ bạt) để tạo sốc khô hạn kích thích mầm hoa.</li>
                            <li><strong>Nuôi trái:</strong> Cung cấp đủ nước. Thiếu nước gây rụng trái; thừa nước gây nứt gai, sượng cơm.</li>
                        </ul>
                        <ul className="space-y-2">
                            <li><strong>Tỉa cành:</strong> Cành cấp 1 đầu tiên cách gốc &gt; 80cm.</li>
                            <li><strong>Tạo tán:</strong> Tỉa bỏ cành tăm, cành sâu bệnh, cành mọc đứng, cành đan chéo.</li>
                            <li><strong>Thông thoáng:</strong> Giúp ánh nắng xuyên vào thân, hạn chế nấm bệnh.</li>
                        </ul>
                    </div>
                    <p className="text-xs text-gray-500 mt-3 italic">
                        📌 Nguồn: Tài liệu tham khảo (QCERT.VN - Quy trình trồng sầu riêng VietGAP), phần "Kỹ thuật tưới nước" và "Kỹ thuật tỉa cành, tạo tán"
                    </p>
                </div>

                {/* 4.2 Phân bón - Dùng TABLE cho chi tiết */}
                <div>
                    <h4 className="font-bold text-gray-900 mb-4 text-xl">4.2. Quy Trình Bón Phân (Khuyến cáo SOFRI)</h4>
                    <div className="overflow-x-auto border rounded-xl shadow-sm">
                        <table className="min-w-full text-sm">
                            <thead className="bg-emerald-100 font-bold text-emerald-900 uppercase">
                                <tr>
                                    <th className="px-5 py-3 text-left w-1/4">Giai đoạn</th>
                                    <th className="px-5 py-3 text-left w-1/4">Loại phân</th>
                                    <th className="px-5 py-3 text-left w-2/4">Công thức & Liều lượng (Tham khảo)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {/* Kiến thiết */}
                                <tr className="hover:bg-gray-50">
                                    <td className="px-5 py-4 font-bold text-gray-800">Kiến thiết<br /><span className="text-xs font-normal text-gray-500">(1-3 năm đầu)</span></td>
                                    <td className="px-5 py-4">Hữu cơ + NPK Đạm cao</td>
                                    <td className="px-5 py-4 text-gray-700">
                                        <p className="mb-1">• <strong>Hữu cơ:</strong> 10-30kg phân chuồng hoai/cây/năm (hoặc 3-5kg hữu cơ vi sinh).</p>
                                        <p>• <strong>NPK:</strong> 20-10-10 hoặc 16-16-8. Liều 0.5-1.5kg/cây/năm, chia 4-6 lần.</p>
                                    </td>
                                </tr>
                                {/* Kinh doanh - Sau thu hoạch */}
                                <tr className="hover:bg-gray-50">
                                    <td className="px-5 py-4 font-bold text-gray-800">Sau thu hoạch<br /><span className="text-xs font-normal text-gray-500">(Phục hồi)</span></td>
                                    <td className="px-5 py-4">Hữu cơ + Đạm cao</td>
                                    <td className="px-5 py-4 text-gray-700">
                                        <p className="mb-1">• <strong>Hữu cơ:</strong> 20-30kg/cây.</p>
                                        <p>• <strong>NPK:</strong> 20-10-10 + Humic để kích rễ, ra cơi đọt mới.</p>
                                    </td>
                                </tr>
                                {/* Kinh doanh - Tạo mầm */}
                                <tr className="hover:bg-gray-50">
                                    <td className="px-5 py-4 font-bold text-gray-800">Tạo mầm hoa</td>
                                    <td className="px-5 py-4">Lân cao</td>
                                    <td className="px-5 py-4 text-gray-700">
                                        <p className="mb-1">• NPK 10-60-10 hoặc Lân nung chảy.</p>
                                        <p>• Phun MKP (0-52-34) qua lá để ức chế đọt.</p>
                                    </td>
                                </tr>
                                {/* Kinh doanh - Nuôi trái */}
                                <tr className="hover:bg-gray-50">
                                    <td className="px-5 py-4 font-bold text-gray-800">Nuôi trái lớn<br /><span className="text-xs font-normal text-gray-500">(Trước thu hoạch 1-2 tháng)</span></td>
                                    <td className="px-5 py-4 text-red-600 font-bold">Kali cao</td>
                                    <td className="px-5 py-4 text-gray-700">
                                        <p className="mb-1">• NPK 12-11-18 hoặc 15-5-20 (Kali Sunphat).</p>
                                        <p>• <strong>Cấm:</strong> Tuyệt đối không bón Đạm (Ure) và Clo để tránh sượng cơm.</p>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <div className="p-3 bg-amber-50 text-xs text-gray-600 border-t italic">
                            <p className="mb-1">⚠️ <strong>Lưu ý:</strong> Liều lượng trên chỉ mang tính tham khảo. Nên điều chỉnh dựa trên:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Kết quả phân tích đất cụ thể</li>
                                <li>Giai đoạn sinh trưởng của cây</li>
                                <li>Điều kiện khí hậu địa phương</li>
                            </ul>
                            <p className="mt-2">📌 <strong>Nguồn:</strong> Viện Cây ăn quả miền Nam (SOFRI), 2022 - "Quy trình kỹ thuật trồng sầu riêng VietGAP tại ĐBSCL"</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: "quan-ly-sau-benh",
        title: "5. Quản lý Sâu bệnh & IPM",
        icon: <Bug className="w-6 h-6" />,
        description: "Nguyên tắc 4 ĐÚNG, IPM và quản lý rác thải thuốc BVTV.",
        source: "TT 10/2020/TT-BNNPTNT - Danh mục thuốc BVTV được phép sử dụng",
        content: (
            <div className="space-y-8">
                {/* 5.1 Nguyên tắc 4 ĐÚNG */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6 shadow-sm">
                    <h4 className="font-bold text-blue-900 mb-4 text-lg flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6" /> 5.1. Nguyên Tắc 4 ĐÚNG Khi Sử Dụng Thuốc BVTV
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-lg border border-blue-100">
                            <h5 className="font-bold text-gray-800 mb-2">1️⃣ Đúng thuốc</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Chỉ dùng thuốc trong danh mục được phép (TT 10/2020)</li>
                                <li>• Ưu tiên thuốc sinh học, thuốc ít độc</li>
                            </ul>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-blue-100">
                            <h5 className="font-bold text-gray-800 mb-2">2️⃣ Đúng liều lượng</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Pha đúng nồng độ theo hướng dẫn nhà sản xuất</li>
                                <li>• <strong>KHÔNG tăng liều tùy tiện</strong></li>
                            </ul>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-blue-100">
                            <h5 className="font-bold text-gray-800 mb-2">3️⃣ Đúng lúc</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Phun khi sâu bệnh mới chớm (ngưỡng kinh tế)</li>
                                <li>• Tuân thủ thời gian PHI (xem Phần 6)</li>
                            </ul>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-blue-100">
                            <h5 className="font-bold text-gray-800 mb-2">4️⃣ Đúng cách</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Phun kỹ, tơi sương, đều khắp tán lá</li>
                                <li>• Đeo đồ bảo hộ: khẩu trang, găng tay, áo dài tay</li>
                                <li>• Không phun ngược gió, không phun trời mưa</li>
                            </ul>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-4 italic">
                        📌 Nguồn: Thông tư 10/2020/TT-BNNPTNT, Điều 8 - "Quy định về sử dụng thuốc BVTV"
                    </p>
                </div>

                {/* 5.2 Quản lý rác thải */}
                <div className="grid md:grid-cols-2 gap-6 items-stretch">
                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 shadow-sm h-full flex flex-col">
                        <h4 className="font-bold text-red-800 mb-4 text-lg flex items-center gap-2">
                            <Trash2 className="w-5 h-5" /> 5.2. Quản Lý Rác Thải (BẮT BUỘC)
                        </h4>
                        <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2 flex-1">
                            <li><strong>Kho thuốc:</strong> Riêng biệt, có khóa, biển báo "NGUY HIỂM", thoáng mát.</li>
                            <li><strong>Vỏ bao bì:</strong> Súc rửa 3 lần sau khi dùng hết.</li>
                            <li><strong>Thu gom:</strong> Bỏ vào <strong>Bể chứa rác thải nguy hại</strong> (xi măng, có nắp đậy kín).</li>
                            <li className="text-red-600 font-bold">⚠️ Tuyệt đối KHÔNG vứt xuống mương/suối hoặc đốt vỏ chai.</li>
                            <li><strong>Thu gom định kỳ:</strong> Liên hệ đơn vị chuyên môn. Ghi nhật ký thu gom.</li>
                        </ul>
                        <p className="text-xs text-gray-500 mt-4 italic">
                            📌 Nguồn: TCVN 11892-1:2017, Điều 7 - "Quản lý chất thải"
                        </p>
                    </div>

                    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 shadow-sm h-full flex flex-col">
                        <h4 className="font-bold text-green-800 mb-4 text-lg flex items-center gap-2">
                            <Sprout className="w-5 h-5" /> 5.3. Nguyên Tắc IPM
                        </h4>
                        <p className="text-sm text-gray-700 mb-3">
                            <strong>IPM</strong> (Integrated Pest Management) - Quản lý dịch hại tổng hợp:
                        </p>
                        <ol className="list-decimal pl-5 text-sm text-gray-700 space-y-2 flex-1">
                            <li><strong>Phòng bệnh hơn chữa bệnh:</strong> Chọn giống kháng, trồng đúng mật độ.</li>
                            <li><strong>Ưu tiên biện pháp canh tác:</strong> Tỉa cành thông thoáng, thu gom trái bệnh tiêu hủy.</li>
                            <li><strong>Sử dụng thiên địch:</strong> Bảo vệ ong, ruồi ăn rầy; thả tuyến trùng ăn sâu.</li>
                            <li><strong>Chế phẩm sinh học:</strong> Trichoderma, Bacillus, nấm xanh/trắng.</li>
                            <li><strong>Hóa học là giải pháp cuối:</strong> Chỉ phun khi vượt ngưỡng kinh tế.</li>
                        </ol>
                        <p className="text-xs text-gray-500 mt-4 italic">
                            📌 Nguồn: SOFRI, 2022 - "Hướng dẫn IPM trên cây sầu riêng"
                        </p>
                    </div>
                </div>

                {/* 5.4 Bảng sâu bệnh */}
                <div>
                    <h4 className="font-bold text-gray-900 mb-4 text-xl">5.4. Các Đối Tượng Gây Hại Chính & Biện Pháp IPM</h4>
                    <div className="overflow-x-auto border rounded-xl shadow-sm">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-100 font-bold text-gray-800 uppercase">
                                <tr>
                                    <th className="px-5 py-3 text-left w-1/4">Đối tượng</th>
                                    <th className="px-5 py-3 text-left w-1/3">Tác hại</th>
                                    <th className="px-5 py-3 text-left w-1/3">Biện pháp phòng trừ (IPM)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                <tr className="hover:bg-gray-50">
                                    <td className="px-5 py-4 font-bold text-red-600">Phytophthora<br /><span className="text-xs font-normal text-gray-500">(Nấm thủy sinh)</span></td>
                                    <td className="px-5 py-4 text-gray-700">Xì mủ thân, thối rễ, thối trái. Nguy hiểm nhất khi trời mưa kéo dài.</td>
                                    <td className="px-5 py-4 text-gray-700">
                                        <ul className="text-xs space-y-1">
                                            <li>• Thoát nước tốt, không ngập úng</li>
                                            <li>• Quét thuốc gốc Đồng (Copper), Metalaxyl lên vết bệnh</li>
                                            <li>• Tưới <em>Trichoderma</em> gốc định kỳ</li>
                                        </ul>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="px-5 py-4 font-bold text-green-700">Rầy xanh</td>
                                    <td className="px-5 py-4 text-gray-700">Chích hút đọt non làm lá xoăn, cháy mép, rụng lá.</td>
                                    <td className="px-5 py-4 text-gray-700">
                                        <ul className="text-xs space-y-1">
                                            <li>• Phun dầu khoáng SK Enspray khi đọt vừa nhú</li>
                                            <li>• Chế phẩm nấm xanh/trắng</li>
                                            <li>• Bảo vệ thiên địch (ruồi ăn rầy)</li>
                                        </ul>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="px-5 py-4 font-bold text-purple-600">Rệp sáp</td>
                                    <td className="px-5 py-4 text-gray-700">Bám trên cành, lá, tiết mật ngọt → nấm muội đen phủ lá.</td>
                                    <td className="px-5 py-4 text-gray-700">
                                        <ul className="text-xs space-y-1">
                                            <li>• Cắt bỏ cành bệnh nặng, tiêu hủy</li>
                                            <li>• Phun Imidacloprid hoặc dầu khoáng</li>
                                            <li>• Tỉa cành thông thoáng</li>
                                        </ul>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="px-5 py-4 font-bold text-orange-600">Sâu đục trái</td>
                                    <td className="px-5 py-4 text-gray-700">Đục vào trái non, tạo đường cho nấm xâm nhập → thối trái.</td>
                                    <td className="px-5 py-4 text-gray-700">
                                        <ul className="text-xs space-y-1">
                                            <li>• Thăm vườn, tỉa trái sâu tiêu hủy</li>
                                            <li>• <strong>Bao trái khi bằng nắm tay</strong></li>
                                            <li>• Bẫy đèn diệt sâu bướm trưởng thành</li>
                                        </ul>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="px-5 py-4 font-bold text-amber-700">Thán thư</td>
                                    <td className="px-5 py-4 text-gray-700">Đốm cháy trên lá, khô bông, rụng lá sớm.</td>
                                    <td className="px-5 py-4 text-gray-700">
                                        <ul className="text-xs space-y-1">
                                            <li>• Cắt tỉa cành bệnh, tiêu hủy xa vườn</li>
                                            <li>• Phun Azoxystrobin/Difenoconazole khi bệnh chớm phát</li>
                                            <li>• Tăng cường dinh dưỡng cho cây</li>
                                        </ul>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <p className="text-xs text-gray-500 p-3 bg-gray-50 italic">
                            📌 Nguồn: SOFRI + Thực tiễn canh tác. Lưu ý: Luôn kiểm tra danh mục thuốc được phép trước khi sử dụng.
                        </p>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: "thu-hoach-phi",
        title: "6. Thu hoạch & An toàn thực phẩm",
        icon: <Scissors className="w-6 h-6" />,
        description: "Quy tắc PHI (thời gian cách ly) và tiêu chuẩn thu hoạch xuất khẩu.",
        source: "TT 10/2020/TT-BNNPTNT (PHI) + Thực tiễn xuất khẩu",
        content: (
            <div className="space-y-8">
                {/* 6.1 Quy tắc PHI - THÊM MỚI */}
                <div className="bg-red-50 border-l-4 border-red-600 p-6 rounded-r-xl shadow-md">
                    <h3 className="text-xl font-bold text-red-800 mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-6 h-6" /> 6.1. QUY TẮC PHI (Thời Gian Cách Ly) - QUAN TRỌNG NHẤT
                    </h3>
                    <p className="text-gray-800 font-medium mb-2 text-lg">Tiêu chí sống còn để xuất khẩu</p>

                    <div className="bg-white p-5 rounded-lg mb-4">
                        <h5 className="font-bold text-gray-900 mb-2">PHI là gì?</h5>
                        <ul className="text-sm text-gray-700 space-y-1 list-disc pl-5">
                            <li><strong>PHI</strong> (Pre-Harvest Interval) = Thời gian cách ly (ngày) từ lần phun thuốc cuối cùng đến khi thu hoạch.</li>
                            <li>Cho phép hóa chất phân hủy hết, tồn dư dưới ngưỡng cho phép.</li>
                            <li>Mỗi loại thuốc có PHI khác nhau (thường 7-14 ngày), <strong>ghi rõ trên nhãn chai</strong>.</li>
                        </ul>
                    </div>

                    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg mb-3">
                        <p className="text-gray-800 font-bold mb-2">⚠️ QUY ĐỊNH BẮT BUỘC:</p>
                        <p className="text-sm text-gray-700">
                            <strong>TUYỆT ĐỐI phải ngừng phun thuốc BVTV</strong> trước khi thu hoạch theo đúng thời gian PHI ghi trên nhãn.
                        </p>
                    </div>

                    <div className="bg-red-100 p-4 rounded-lg">
                        <p className="text-red-800 font-bold text-sm">
                            🚨 VI PHẠM PHI = Tồn dư hóa chất → Hủy chứng nhận VietGAP → <span className="underline">CẤM XUẤT KHẨU</span>
                        </p>
                    </div>

                    <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                        <h5 className="font-bold text-blue-900 mb-2">Cách ghi chép PHI:</h5>
                        <ol className="text-sm text-gray-700 list-decimal pl-5 space-y-1">
                            <li>Ghi rõ ngày phun thuốc cuối cùng vào nhật ký canh tác</li>
                            <li>Tính toán ngày thu hoạch sớm nhất = Ngày phun + PHI</li>
                            <li>Lưu trong hồ sơ để truy xuất</li>
                        </ol>
                    </div>

                    <p className="text-xs text-gray-500 mt-4 italic">
                        📌 Nguồn: Thông tư 10/2020/TT-BNNPTNT, Phụ lục II - "Thời gian cách ly (PHI) các loại thuốc BVTV"
                    </p>
                </div>

                {/* 6.2 Thời điểm & Cách thu hoạch */}
                <div className="grid md:grid-cols-2 gap-6 items-stretch">
                    <div className="bg-white border rounded-xl p-5 shadow-sm h-full flex flex-col">
                        <h4 className="font-bold text-gray-900 mb-3 text-lg flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-yellow-600" /> 6.2. Thời điểm thu hoạch
                        </h4>
                        <ul className="text-sm text-gray-600 list-disc pl-4 space-y-3 flex-1">
                            <li><strong>Ri6:</strong> 95 - 105 ngày sau xả nhị (nở hoa).</li>
                            <li><strong>Monthong (Dona):</strong> 115 - 125 ngày sau xả nhị.</li>
                            <li><strong>Dấu hiệu chín sinh lý:</strong>
                                <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-500">
                                    <li>Gõ nghe tiếng "bộp bộp" (âm rỗng).</li>
                                    <li>Rãnh gai nở to, đầu gai tròn.</li>
                                    <li>Tầng rời (cuống) phình to, dễ bẻ.</li>
                                </ul>
                            </li>
                        </ul>
                        <p className="text-xs text-gray-500 mt-3 italic">
                            📌 Nguồn: Thực tiễn canh tác + SOFRI
                        </p>
                    </div>

                    <div className="bg-white border rounded-xl p-5 shadow-sm h-full flex flex-col">
                        <h4 className="font-bold text-gray-900 mb-3 text-lg flex items-center gap-2">
                            <Scissors className="w-5 h-5 text-green-600" /> 6.3. Quy định vệ sinh thu hoạch
                        </h4>
                        <ul className="text-sm text-gray-600 list-disc pl-4 space-y-3 flex-1">
                            <li><strong>Cách cắt:</strong> Dùng kéo chuyên dụng, chừa cuống 3-5cm.</li>
                            <li><strong>Không chạm đất:</strong> Trái cắt xong phải đặt lên bạt lót sạch hoặc sọt nhựa. <span className="text-red-600 font-semibold">Tuyệt đối không để tiếp xúc đất</span> (tránh nhiễm khuẩn E.Coli).</li>
                            <li><strong>Không hóa chất:</strong> Cấm nhúng thuốc ép chín không rõ nguồn gốc.</li>
                            <li><strong>Vận chuyển:</strong> Xe phải sạch sẽ, không chở chung với phân bón/gia súc.</li>
                        </ul>
                        <p className="text-xs text-gray-500 mt-3 italic">
                            📌 Nguồn: TCVN 11892-1:2017, Điều 6 - "Thu hoạch và xử lý sau thu hoạch"
                        </p>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: "nhat-ky-vietgap",
        title: "7. Hồ sơ & Nhật ký (Truy xuất)",
        icon: <ClipboardCheck className="w-6 h-6" />,
        description: "Hệ thống ghi chép bắt buộc (Làm gì - Ghi nấy) để truy xuất nguồn gốc.",
        source: "TCVN 11892-1:2017, Điều 9 - Ghi chép và lưu trữ hồ sơ",
        content: (
            <div className="bg-emerald-50 p-8 rounded-xl border border-emerald-100">
                <h3 className="text-2xl font-bold text-emerald-900 mb-2 text-center uppercase tracking-wide">"Không ghi chép = Không làm VietGAP"</h3>
                <p className="text-red-600 font-bold text-center mb-4 text-sm">
                    ⚠️ Kiểm tra viên sẽ xác minh tính nhất quán giữa: Nhật ký mua → Nhật ký sử dụng → Nhật ký thu hoạch
                </p>
                <p className="text-gray-700 mb-8 text-center max-w-2xl mx-auto text-sm">
                    Nhà vườn bắt buộc phải lưu trữ <strong>4 loại hồ sơ</strong> sau ít nhất <strong>2 năm</strong> để phục vụ truy xuất nguồn gốc khi có sự cố.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-5 rounded-xl flex items-start gap-4 shadow-sm border border-emerald-100 hover:shadow-md transition-shadow h-full">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-lg flex-shrink-0"><FileText className="w-6 h-6" /></div>
                        <div>
                            <span className="block font-bold text-gray-800 text-lg mb-1">1. Nhật ký mua vật tư</span>
                            <p className="text-sm text-gray-600 mb-2">Ghi lại đầu vào: Ngày mua, Tên đại lý, Tên phân bón/thuốc, Số lượng, Hạn sử dụng, Xuất xứ.</p>
                            <p className="text-xs text-red-600 font-medium">→ Để chứng minh mua đúng nguồn hợp pháp</p>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-xl flex items-start gap-4 shadow-sm border border-emerald-100 hover:shadow-md transition-shadow h-full">
                        <div className="p-3 bg-orange-100 text-orange-600 rounded-lg flex-shrink-0"><FileText className="w-6 h-6" /></div>
                        <div>
                            <span className="block font-bold text-gray-800 text-lg mb-1">2. Nhật ký canh tác ⭐</span>
                            <p className="text-sm text-gray-600 mb-2">Ghi lại quá trình: Ngày bón phân/phun thuốc, Tên thuốc, Liều lượng thực tế, Lý do phun (trị bệnh gì), Người thực hiện.</p>
                            <p className="text-xs text-red-600 font-medium">→ QUAN TRỌNG NHẤT để chứng minh tuân thủ PHI</p>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-xl flex items-start gap-4 shadow-sm border border-emerald-100 hover:shadow-md transition-shadow h-full">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-lg flex-shrink-0"><FileText className="w-6 h-6" /></div>
                        <div>
                            <span className="block font-bold text-gray-800 text-lg mb-1">3. Nhật ký thu hoạch</span>
                            <p className="text-sm text-gray-600 mb-2">Ghi lại đầu ra: Ngày cắt, Mã lô đất, Tổng sản lượng (kg), Khách hàng thu mua.</p>
                            <p className="text-xs text-red-600 font-medium">→ Để truy vết ngược khi có khiếu nại</p>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-xl flex items-start gap-4 shadow-sm border border-emerald-100 hover:shadow-md transition-shadow h-full">
                        <div className="p-3 bg-gray-100 text-gray-600 rounded-lg flex-shrink-0"><FileText className="w-6 h-6" /></div>
                        <div>
                            <span className="block font-bold text-gray-800 text-lg mb-1">4. Hồ sơ nhân sự</span>
                            <p className="text-sm text-gray-600 mb-2">Lưu trữ: Giấy khám sức khỏe định kỳ của người lao động, Giấy chứng nhận đã tham gia tập huấn kỹ thuật VietGAP.</p>
                            <p className="text-xs text-red-600 font-medium">→ Chứng minh an toàn lao động</p>
                        </div>
                    </div>
                </div>

                <p className="text-xs text-gray-500 mt-6 text-center italic">
                    📌 Nguồn: TCVN 11892-1:2017, Điều 9 - "Ghi chép và lưu trữ hồ sơ"
                </p>

            </div>
        )
    }
];

export default function GuidePage() {
    const [activeSection, setActiveSection] = useState(guideSections[0].id);

    // Scrollspy logic
    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY + 200;
            for (const section of guideSections) {
                const element = document.getElementById(section.id);
                if (element && element.offsetTop <= scrollPosition && (element.offsetTop + element.offsetHeight) > scrollPosition) {
                    setActiveSection(section.id);
                }
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            const navbarHeight = 100;
            const elementPosition = element.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({
                top: elementPosition - navbarHeight,
                behavior: "smooth"
            });
            setActiveSection(id);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            <Navbar />

            {/* Hero Section */}
            <div className="relative h-[350px] mt-16 w-full overflow-hidden">
                <div className="absolute inset-0">
                    <Image
                        src="/images/Durian5.jpg"
                        alt="VietGAP Durian Farm"
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/90 via-emerald-800/70 to-transparent"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 h-full flex flex-col justify-center items-center text-center">
                    <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight max-w-2xl">
                        Quy Trình Kỹ Thuật <br />
                        <span className="text-lime-400">Trồng Sầu Riêng VietGAP</span>
                    </h1>
                    <p className="text-emerald-100 text-lg max-w-3xl">
                        Hướng dẫn chi tiết từ khâu chọn đất, con giống đến thu hoạch và truy xuất nguồn gốc.
                    </p>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 md:px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">

                    {/* Sidebar Navigation */}
                    <aside className="hidden lg:block h-fit sticky top-28 z-10">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 uppercase text-sm tracking-wide">
                                <BookOpen className="w-4 h-4 text-emerald-600" />
                                Mục lục hướng dẫn
                            </h3>
                            <nav className="space-y-1">
                                {guideSections.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => scrollToSection(section.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 text-left border-l-4 ${activeSection === section.id
                                            ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm"
                                            : "border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                            }`}
                                    >
                                        <span className={`${activeSection === section.id ? "text-emerald-600" : "text-gray-400"}`}>
                                            {section.icon}
                                        </span>
                                        <span className="truncate">{section.title}</span>
                                    </button>
                                ))}
                            </nav>

                            {/* Promo Box */}
                            <div className="mt-6 p-4 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-xl text-white text-center shadow-lg">
                                <p className="text-xs font-medium opacity-90 mb-2">BẠN CẦN TRỢ GIÚP?</p>
                                <p className="text-sm font-bold mb-3">Kiểm tra sâu bệnh bằng AI ngay!</p>
                                <div className="flex justify-center">
                                    <button className="w-full py-2 bg-white text-emerald-700 text-sm font-bold rounded-lg hover:bg-lime-100 transition flex items-center justify-center gap-2">
                                        <ScanLine className="w-4 h-4" />
                                        Quét Ngay
                                    </button>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <div className="space-y-8">
                        {/* Mobile Dropdown */}
                        <div className="lg:hidden sticky top-20 z-20 bg-gray-50 pb-2">
                            <select
                                className="w-full p-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                onChange={(e) => scrollToSection(e.target.value)}
                                value={activeSection}
                            >
                                {guideSections.map((s) => (
                                    <option key={s.id} value={s.id}>{s.title}</option>
                                ))}
                            </select>
                        </div>

                        {/* Render các Section */}
                        {guideSections.map((section) => (
                            <section
                                key={section.id}
                                id={section.id}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden scroll-mt-32 transition-all duration-300 hover:shadow-md"
                            >
                                <div className="p-6 md:p-8">
                                    <div className="flex items-start gap-4 mb-6 pb-6 border-b border-gray-100">
                                        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                                            {section.icon}
                                        </div>
                                        <div className="flex-1">
                                            <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
                                            <p className="text-gray-500 mt-1 text-sm">{section.description}</p>
                                            {section.source && (
                                                <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                                                    <BookOpen className="w-3 h-3" />
                                                    <span className="italic">Nguồn: {section.source}</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Content Injection */}
                                    <div className="prose prose-emerald max-w-none text-gray-600">
                                        {section.content}
                                    </div>
                                </div>
                            </section>
                        ))}
                    </div>
                </div>
            </main>

            {/* Căn cứ pháp lý - CẬP NHẬT */}
            <section className="bg-gray-100 py-8 border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                        Tài liệu tham khảo & Căn cứ pháp lý
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-600">
                        <div className="flex items-start gap-2">
                            <div className="w-1 h-1 bg-gray-400 rounded-full mt-1.5"></div>
                            <span><strong>TCVN 11892-1:2017:</strong> Tiêu chuẩn Quốc gia về VietGAP - Phần 1: Trồng trọt.</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <div className="w-1 h-1 bg-gray-400 rounded-full mt-1.5"></div>
                            <span><strong>QCVN 01-189:2019/BNNPTNT:</strong> Quy chuẩn kỹ thuật quốc gia về chất lượng cây giống.</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <div className="w-1 h-1 bg-gray-400 rounded-full mt-1.5"></div>
                            <span><strong>TT 10/2020/TT-BNNPTNT:</strong> Danh mục thuốc BVTV được phép sử dụng và quy định PHI.</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <div className="w-1 h-1 bg-gray-400 rounded-full mt-1.5"></div>
                            <span><strong>QCVN 03-MT:2015/BTNMT:</strong> Quy chuẩn kỹ thuật quốc gia về chất lượng đất trồng trọt.</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <div className="w-1 h-1 bg-gray-400 rounded-full mt-1.5"></div>
                            <span><strong>QCVN 08-MT:2015/BTNMT:</strong> Quy chuẩn kỹ thuật quốc gia về chất lượng nước mặt.</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <div className="w-1 h-1 bg-gray-400 rounded-full mt-1.5"></div>
                            <span><strong>Viện Cây ăn quả miền Nam (SOFRI), 2022:</strong> Khuyến cáo kỹ thuật quản lý dịch hại tổng hợp (IPM).</span>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}