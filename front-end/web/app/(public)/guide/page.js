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
    Award,
    Trash2,
    Leaf,
    FlaskConical,
    TreePine,
    MapPin,
    Info,
    AlertCircle,
    XCircle,
    CheckSquare,
    Flame,
    Microscope,
    ListChecks,
    NotepadText,
    Recycle,
    CloudRain,
    Wind,
    BadgeCheck,
    ChevronRight,
    Package,
    Droplet,
    CircleDot,
    Layers,
    TriangleAlert,
    Stethoscope,
    Beaker,
    UserCheck,
    FileBadge,
    ClipboardList,
    TestTube,
    Hammer
} from "lucide-react";

// Nội dung cập nhật theo Sổ tay Hướng dẫn kỹ thuật canh tác Sầu riêng VietGAP
// Cục Trồng trọt – Bộ NN&PTNT, SOFRI 2023
const guideSections = [
    {
        id: "tong-quan-vietgap",
        title: "1. Tổng quan VietGAP & Thuật ngữ",
        icon: <ShieldCheck className="w-6 h-6" />,
        description: "Định nghĩa, mục tiêu và các thuật ngữ cốt lõi trong canh tác sầu riêng VietGAP.",
        source: "Sổ tay Hướng dẫn kỹ thuật canh tác cây sầu riêng theo tiêu chuẩn VietGAP – Cục Trồng trọt, Bộ NN&PTNT",
        content: (
            <div className="space-y-8">
                {/* Định nghĩa VietGAP */}
                <div className="bg-emerald-50 border-l-4 border-emerald-500 p-6 rounded-r-xl shadow-sm">
                    <h4 className="font-bold text-emerald-900 mb-3 text-xl flex items-center gap-2">
                        <BookOpen className="w-6 h-6" /> VietGAP là gì?
                    </h4>
                    <p className="text-gray-800 text-base leading-relaxed">
                        <strong>VietGAP</strong> (Vietnamese Good Agricultural Practices – Thực hành nông nghiệp tốt tại Việt Nam) là những nguyên tắc, trình tự, thủ tục hướng dẫn tổ chức, cá nhân sản xuất, thu hoạch, xử lý sau thu hoạch nhằm đảm bảo an toàn, nâng cao chất lượng sản phẩm, đảm bảo phúc lợi xã hội, sức khỏe người sản xuất và người tiêu dùng; đồng thời <strong>bảo vệ môi trường và truy nguyên nguồn gốc sản phẩm</strong>.
                    </p>
                </div>

                {/* 4 tiêu chí cốt lõi */}
                <div>
                    <h4 className="font-bold text-gray-900 mb-4 text-lg">4 Tiêu Chí Cốt Lõi Của VietGAP</h4>
                    <div className="grid md:grid-cols-2 gap-4 items-stretch">
                        {[
                            { icon: <AlertTriangle className="w-5 h-5" />, color: "red", title: "1. An toàn thực phẩm (ATTP)", desc: "Giảm thiểu nguy cơ ô nhiễm hóa học (kim loại nặng, thuốc BVTV), sinh học (vi khuẩn, vi rút) và vật lý (mảnh kính, cành cây) trên sản phẩm sầu riêng." },
                            { icon: <Sprout className="w-5 h-5" />, color: "green", title: "2. An toàn môi trường", desc: "Không làm ô nhiễm đất, nước. Thu gom và xử lý bao bì thuốc BVTV đúng quy định. Áp dụng giải pháp giảm phát thải khí nhà kính trong sản xuất." },
                            { icon: <ShieldCheck className="w-5 h-5" />, color: "blue", title: "3. Sức khỏe & Phúc lợi lao động", desc: "Người phun thuốc phải có đầy đủ đồ bảo hộ lao động (áo dài tay, quần dài, nón, khẩu trang than hoạt tính, kính, bao tay). Nông dân được tập huấn kỹ thuật VietGAP." },
                            { icon: <FileText className="w-5 h-5" />, color: "purple", title: "4. Truy nguyên nguồn gốc", desc: "Bắt buộc ghi chép nhật ký canh tác (\"Làm gì – Ghi nấy\") để truy vết nguyên nhân khi sản phẩm không an toàn. Lưu trữ hồ sơ tối thiểu 2 năm." }
                        ].map(({ icon, color, title, desc }) => (
                            <div key={title} className={`bg-white border rounded-xl p-5 shadow-sm hover:border-${color}-300 transition-colors h-full`}>
                                <div className="flex items-center gap-3 mb-3 pb-2 border-b">
                                    <div className={`bg-${color}-100 p-2 rounded-lg text-${color}-600`}>{icon}</div>
                                    <span className="font-bold text-gray-800">{title}</span>
                                </div>
                                <p className="text-sm text-gray-600">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Thuật ngữ quan trọng */}
                <div>
                    <h4 className="font-bold text-gray-900 mb-4 text-lg flex items-center gap-2">
                        <ListChecks className="w-5 h-5 text-emerald-600" /> Các Thuật Ngữ Quan Trọng Trong Sổ Tay
                    </h4>
                    <div className="overflow-x-auto border rounded-xl shadow-sm">
                        <table className="min-w-full text-sm">
                            <thead className="bg-emerald-100 font-bold text-emerald-900">
                                <tr>
                                    <th className="px-4 py-3 text-left">Thuật ngữ / Viết tắt</th>
                                    <th className="px-4 py-3 text-left">Giải thích</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-semibold text-emerald-700">VietGAP</td><td className="px-4 py-3 text-gray-600">Vietnamese Good Agricultural Practices – Thực hành nông nghiệp tốt tại Việt Nam.</td></tr>
                                <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-semibold text-red-700">Mối nguy ATTP</td><td className="px-4 py-3 text-gray-600">Yếu tố sinh học, hóa học, vật lý có thể làm thực phẩm mất an toàn cho người dùng.</td></tr>
                                <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-semibold text-orange-700">MRLs</td><td className="px-4 py-3 text-gray-600">Maximum Residue Limits – Giới hạn tối đa dư lượng thuốc BVTV/kim loại nặng trong thực phẩm (theo TT 50/2016/TT-BYT).</td></tr>
                                <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-semibold text-blue-700">PHI</td><td className="px-4 py-3 text-gray-600">Pre-Harvest Interval – Thời gian cách ly: khoảng thời gian tối thiểu (ngày) từ lần phun thuốc cuối đến khi thu hoạch. Ghi rõ trên nhãn thuốc.</td></tr>
                                <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-semibold text-purple-700">Truy nguyên nguồn gốc</td><td className="px-4 py-3 text-gray-600">Khả năng theo dõi sản phẩm qua tất cả công đoạn sản xuất – thu hoạch – phân phối bằng hệ thống nhật ký/hồ sơ.</td></tr>
                                <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-semibold text-lime-700">Ủ phân</td><td className="px-4 py-3 text-gray-600">Quá trình phân hủy sinh học nguyên liệu hữu cơ (phân chuồng, vỏ quả) tạo phân hữu cơ an toàn. Phân hữu cơ phải được ủ hoai trước khi bón.</td></tr>
                                <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-semibold text-teal-700">Đánh giá nội bộ</td><td className="px-4 py-3 text-gray-600">Tự kiểm tra, rà soát quy trình sản xuất định kỳ trước khi có đánh giá bên ngoài. Ghi kết quả vào Biểu mẫu 3.</td></tr>
                                <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-semibold text-indigo-700">IPM / ICM / IPHM</td><td className="px-4 py-3 text-gray-600">Quản lý dịch hại tổng hợp / Quản lý cây trồng tổng hợp / Quản lý sức khỏe cây trồng tổng hợp – ưu tiên biện pháp sinh học, hạn chế thuốc hóa học.</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Tại sao áp dụng */}
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-xl border border-orange-100">
                    <h4 className="font-bold text-orange-900 mb-3 text-lg flex items-center gap-2">
                        <Award className="w-6 h-6" /> Tại sao phải áp dụng VietGAP cho sầu riêng?
                    </h4>
                    <ul className="grid md:grid-cols-2 gap-3 text-sm text-gray-800">
                        <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-orange-600 flex-shrink-0" /> <span>Đảm bảo chất lượng, an toàn thực phẩm đáp ứng yêu cầu thị trường xuất khẩu.</span></li>
                        <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-orange-600 flex-shrink-0" /> <span>Giảm thiểu rủi ro ô nhiễm hóa học, sinh học trong toàn bộ chuỗi từ trồng đến tiêu thụ.</span></li>
                        <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-orange-600 flex-shrink-0" /> <span>Sản xuất thích ứng biến đổi khí hậu và giảm phát thải khí nhà kính.</span></li>
                        <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-orange-600 flex-shrink-0" /> <span>Bảo vệ sức khỏe người lao động và môi trường canh tác bền vững.</span></li>
                    </ul>
                </div>
            </div>
        )
    },
    {
        id: "vung-san-xuat",
        title: "2. Vùng sản xuất & Đánh giá đất",
        icon: <MapPin className="w-6 h-6" />,
        description: "Yêu cầu sinh thái, lựa chọn vùng trồng, đánh giá mối nguy và thiết kế vườn.",
        source: "Sổ tay VietGAP Sầu riêng, Mục 1.1 – Lựa chọn vùng sản xuất, đánh giá đất trồng | QCVN 03-MT:2015/BTNMT",
        content: (
            <div className="space-y-8">
                {/* Yêu cầu sinh thái */}
                <div className="grid md:grid-cols-2 gap-6 items-stretch">
                    <div className="bg-white border rounded-xl p-5 shadow-sm hover:border-orange-300 transition-colors h-full flex flex-col">
                        <h5 className="font-bold text-gray-800 mb-3 border-b pb-2 flex items-center gap-2">
                            <ThermometerSun className="w-5 h-5 text-orange-500" /> Yêu cầu sinh thái
                        </h5>
                        <ul className="space-y-3 text-sm text-gray-600 flex-1">
                            <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 flex-shrink-0" /><span><strong>Nhiệt độ:</strong> 24–30°C. Dưới 15°C cây rụng lá, sinh trưởng chậm, có thể chết nếu kéo dài.</span></li>
                            <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 flex-shrink-0" /><span><strong>Lượng mưa:</strong> Trung bình 2.000 mm/năm. Sầu riêng mẫn cảm với mặn, chỉ chịu được nồng độ mặn &lt; 1‰.</span></li>
                            <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 flex-shrink-0" /><span><strong>Ánh sáng:</strong> Cây con cần che mát 30–40%. Cây trưởng thành cần ánh sáng đầy đủ.</span></li>
                            <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 flex-shrink-0" /><span><strong>Gió:</strong> Thích hợp gió nhẹ. Không chịu được gió mạnh/gió bão. Tránh trồng nơi gió mạnh khô nóng.</span></li>
                        </ul>
                    </div>
                    <div className="bg-white border rounded-xl p-5 shadow-sm hover:border-orange-300 transition-colors h-full flex flex-col">
                        <h5 className="font-bold text-gray-800 mb-3 border-b pb-2 flex items-center gap-2">
                            <Sprout className="w-5 h-5 text-green-600" /> Tiêu chí chọn vùng sản xuất
                        </h5>
                        <ul className="space-y-3 text-sm text-gray-600 flex-1">
                            <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-1.5 flex-shrink-0" /><span>Trồng từ vùng ĐBSCL đến độ cao thích hợp 900m. Đất tầng canh tác sâu, ít sét, thoát nước tốt, không ngập úng, pH 5,5–6,5.</span></li>
                            <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-1.5 flex-shrink-0" /><span>Chọn vùng trong quy hoạch phát triển cây ăn quả của địa phương.</span></li>
                            <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-red-600 rounded-full mt-1.5 flex-shrink-0" /><span className="text-red-600 font-semibold">Không khuyến cáo</span><span className="text-gray-600"> trồng tại vùng có nguy cơ thiếu nước tưới, mặn xâm nhập hoặc lũ lụt.</span></li>
                            <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-1.5 flex-shrink-0" /><span>Lấy mẫu đất phân tích (5 ha/mẫu) bởi người đã có chứng chỉ lấy mẫu; so với QCVN 03-MT:2015/BTNMT về kim loại nặng.</span></li>
                        </ul>
                    </div>
                </div>

                {/* Bảng mối nguy đất */}
                <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-r-lg shadow-sm">
                    <h4 className="font-bold text-red-900 flex items-center gap-2 mb-4 text-lg">
                        <AlertTriangle className="w-6 h-6" /> Phân tích mối nguy vùng trồng (BẮT BUỘC theo VietGAP – Mục 1.1.2)
                    </h4>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm bg-white rounded-lg overflow-hidden">
                            <thead className="bg-red-100 font-bold text-red-900">
                                <tr>
                                    <th className="px-4 py-3 text-left">Loại mối nguy</th>
                                    <th className="px-4 py-3 text-left">Nguồn gốc</th>
                                    <th className="px-4 py-3 text-left">Biện pháp kiểm soát</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                <tr className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-semibold text-red-700">Hóa học<br /><span className="text-xs font-normal text-gray-500">Tồn dư thuốc BVTV, KLN (As, Pb, Cd, Hg)</span></td>
                                    <td className="px-4 py-3 text-gray-600 text-xs">Sử dụng không đúng thuốc BVTV; thải bỏ bao bì không hợp lý; rò rỉ hóa chất vào đất; sử dụng liên tục phân bón có KLN cao.</td>
                                    <td className="px-4 py-3 text-gray-600 text-xs">Sử dụng thuốc BVTV theo 4 đúng; thu gom và tiêu hủy bao bì đúng quy định; hạn chế dùng phân bón chứa nhiều KLN.</td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-semibold text-yellow-700">Sinh học<br /><span className="text-xs font-normal text-gray-500">Vi sinh vật (Coliforms, E. Coli, Salmonella)</span></td>
                                    <td className="px-4 py-3 text-gray-600 text-xs">Sử dụng phân tươi chưa xử lý; chăn nuôi gia súc thả lan trên vườn; vùng dễ ngập lụt; nguồn nước từ nơi khác tràn đến.</td>
                                    <td className="px-4 py-3 text-gray-600 text-xs">Phân tích mẫu đất khi nghi ngờ ô nhiễm; quản lý vật nuôi hợp lý; xây đê bao hạn chế lũ lụt.</td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-semibold text-blue-700">Vật lý<br /><span className="text-xs font-normal text-gray-500">Thủy tinh, gạch, đá, kim loại</span></td>
                                    <td className="px-4 py-3 text-gray-600 text-xs">Không quản lý tốt vật dụng trong sản xuất; không có nơi thu gom vật dụng sinh hoạt.</td>
                                    <td className="px-4 py-3 text-gray-600 text-xs">Thu gom và tồn trữ đúng nơi quy định.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p className="text-xs text-gray-500 mt-3 flex items-center gap-1 italic">
                        <Info className="w-3 h-3" /> Nguồn: Sổ tay VietGAP Sầu riêng, Mục 1.1.2 – Đánh giá đất trồng
                    </p>
                </div>

                {/* Thiết kế vườn */}
                <div className="bg-lime-50 p-5 rounded-xl border border-lime-200">
                    <h4 className="font-bold text-lime-900 mb-3 flex items-center gap-2 text-lg">
                        <TreePine className="w-5 h-5" /> Thiết kế vườn trồng (Mục 1.2)
                    </h4>
                    <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-700">
                        <div>
                            <p className="font-semibold mb-2">Vùng ĐBSCL:</p>
                            <ul className="space-y-1 list-disc pl-4">
                                <li>Mương rộng 1,5–3m, sâu 1–1,2m.</li>
                                <li>Liếp rộng 5–6m (hàng đơn) hoặc 7–8m (hàng đôi).</li>
                                <li>Khoảng cách trồng: 7–8 x 7–8m → <strong>150–204 cây/ha</strong>.</li>
                            </ul>
                        </div>
                        <div>
                            <p className="font-semibold mb-2">Vùng Đông Nam Bộ & Tây Nguyên:</p>
                            <ul className="space-y-1 list-disc pl-4">
                                <li>Liếp song song theo độ dốc, rộng 6–7m (hàng đơn).</li>
                                <li>Đất dốc 2–5°: đắp mô cao 0,2m, rộng 0,6m.</li>
                                <li>Khoảng cách: 8–10 x 8–10m → <strong>100–156 cây/ha</strong>.</li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-4 bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-sm text-gray-700">
                        <p className="flex items-center gap-2 font-semibold mb-1"><AlertCircle className="w-4 h-4 text-yellow-600" /> Cây chắn gió:</p>
                        <p>Không dùng cây có cùng ký chủ Phytophthora (dừa, cao su). Ưu tiên cây thân gỗ không cạnh tranh dinh dưỡng với sầu riêng.</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-3 flex items-center gap-1 italic">
                        <Info className="w-3 h-3" /> Nguồn: Sổ tay VietGAP Sầu riêng, Mục 1.2 – Thiết kế vườn trồng (SOFRI, 2023)
                    </p>
                </div>
            </div>
        )
    },
    {
        id: "cay-giong-trong",
        title: "3. Cây giống & Kỹ thuật trồng",
        icon: <Sprout className="w-6 h-6" />,
        description: "Tiêu chuẩn cây giống VietGAP, các giống phổ biến và kỹ thuật trồng theo vùng.",
        source: "Sổ tay VietGAP Sầu riêng, Mục 1.3 & 1.4 – Cây giống và Kỹ thuật trồng (SOFRI, 2023)",
        content: (
            <div className="space-y-8">
                {/* Tiêu chuẩn cây giống */}
                <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-200">
                    <h4 className="font-bold text-emerald-900 mb-4 text-xl flex items-center gap-2">
                        <BadgeCheck className="w-6 h-6" /> 3.1. Tiêu Chuẩn Cây Giống VietGAP
                    </h4>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white p-5 rounded-lg shadow-sm">
                            <h5 className="font-bold text-emerald-800 mb-3 border-b pb-2">Yêu cầu bắt buộc:</h5>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" /><span>Chỉ trồng cây nhân giống bằng <strong>phương pháp vô tính</strong> (ghép mắt hoặc ghép cành). Không dùng cây thực sinh.</span></li>
                                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" /><span>Giống phải được <strong>quyết định công nhận</strong> hoặc tự công bố lưu hành theo Luật Trồng trọt 2018.</span></li>
                                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" /><span>Mắt ghép/cành ghép lấy từ <strong>vườn cây đầu dòng được công nhận</strong>.</span></li>
                                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" /><span>Lưu giữ hóa đơn mua giống, tên cơ sở cung cấp, địa chỉ vào nhật ký.</span></li>
                            </ul>
                        </div>
                        <div className="bg-white p-5 rounded-lg shadow-sm">
                            <h5 className="font-bold text-emerald-800 mb-3 border-b pb-2">Gốc ghép chịu mặn (cho vùng ĐBSCL):</h5>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex gap-2"><Droplet className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" /><span>Sầu riêng <strong>Lá quéo</strong>, <strong>Chanee</strong> và <strong>Khổ qua xanh</strong> có khả năng chịu mặn ở nồng độ 2‰ (trong nhà lưới 35 ngày xử lý mặn).</span></li>
                                <li className="flex gap-2"><Droplet className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" /><span>Khuyến cáo sử dụng các giống này làm gốc ghép cho vùng bị ảnh hưởng mặn.</span></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Các giống phổ biến */}
                <div>
                    <h4 className="font-bold text-gray-900 mb-4 text-xl">3.2. Các Giống Trồng Phổ Biến Hiện Nay</h4>
                    <div className="grid md:grid-cols-3 gap-5">
                        <div className="bg-white border-2 border-yellow-200 rounded-xl p-5 shadow-sm hover:border-yellow-400 transition-colors">
                            <div className="bg-yellow-100 text-yellow-800 font-bold text-sm px-3 py-1 rounded-full inline-block mb-3">Giống Ri6</div>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li><strong>Tán:</strong> Hình tháp, phân cành ngang đẹp.</li>
                                <li><strong>Quả:</strong> 2,5–3 kg/quả, hình elip. Thịt vàng đậm, không xơ, ráo, béo ngọt, thơm nhiều.</li>
                                <li><strong>Hạt lép:</strong> &gt;30%, tỉ lệ thịt &gt;31%.</li>
                                <li><strong>Năng suất:</strong> 130–170 kg/cây/vụ (cây 10 năm).</li>
                                <li><strong>Thu hoạch:</strong> 3–4 năm sau trồng.</li>
                                <li className="flex items-center gap-1 text-red-500"><TriangleAlert className="w-4 h-4 flex-shrink-0" /> Dễ bị cháy múi.</li>
                            </ul>
                        </div>
                        <div className="bg-white border-2 border-green-200 rounded-xl p-5 shadow-sm hover:border-green-400 transition-colors">
                            <div className="bg-green-100 text-green-800 font-bold text-sm px-3 py-1 rounded-full inline-block mb-3">Giống Dona</div>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li><strong>Tán:</strong> Hình tháp, lá thuôn dài.</li>
                                <li><strong>Quả:</strong> 2,5–4,5 kg/quả, hình trụ. Thịt vàng nhạt, ngọt béo, thơm trung bình.</li>
                                <li><strong>Hạt lép:</strong> &gt;85%, tỉ lệ thịt &gt;40%.</li>
                                <li><strong>Năng suất:</strong> 150–180 kg/cây/vụ (cây 10 năm).</li>
                                <li><strong>Thu hoạch:</strong> 4–5 năm sau trồng; chậm hơn Ri6 từ 20–30 ngày.</li>
                                <li className="flex items-center gap-1 text-red-500"><TriangleAlert className="w-4 h-4 flex-shrink-0" /> Dễ bị sượng múi.</li>
                            </ul>
                        </div>
                        <div className="bg-white border-2 border-amber-200 rounded-xl p-5 shadow-sm hover:border-amber-400 transition-colors">
                            <div className="bg-amber-100 text-amber-800 font-bold text-sm px-3 py-1 rounded-full inline-block mb-3">Cơm vàng sữa Chín Hóa</div>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li><strong>Tán:</strong> Hình tháp, lá thuôn dài.</li>
                                <li><strong>Quả:</strong> 2,6–3,1 kg/quả, hình cầu cân đối. Thịt vàng, không xơ, rất béo ngọt, thơm.</li>
                                <li><strong>Hạt lép:</strong> &gt;70%, tỉ lệ thịt 28,8%.</li>
                                <li><strong>Năng suất:</strong> 100–150 kg/cây/vụ (cây 10 năm).</li>
                                <li><strong>Thu hoạch:</strong> Từ năm thứ 4 sau trồng.</li>
                                <li className="flex items-center gap-1 text-red-500"><TriangleAlert className="w-4 h-4 flex-shrink-0" /> Thịt nhão nếu thu hoạch muộn.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Kỹ thuật trồng */}
                <div>
                    <h4 className="font-bold text-gray-900 mb-4 text-xl">3.3. Kỹ Thuật Trồng Theo Vùng (Mục 1.4)</h4>
                    <div className="grid md:grid-cols-2 gap-5">
                        <div className="bg-white border rounded-xl p-5 shadow-sm">
                            <h5 className="font-bold text-gray-800 mb-3 border-b pb-2">Chuẩn bị đất (Vùng đất thấp – ĐBSCL):</h5>
                            <ul className="text-sm text-gray-600 space-y-2">
                                <li>• Làm mô: mặt mô 0,8–1,0m, đáy 1,2–1,4m, <strong>cao ≥1,2m</strong>.</li>
                                <li>• Đào hố trên mô (0,4×0,4×0,4m), trộn với 0,5–1 kg phân hữu cơ sinh học + 0,3–0,5 kg lân nung chảy.</li>
                                <li>• Vùng đất phèn: bón thêm 2–3 kg vôi bột/mô, tưới ướt đẫm sau bón vôi.</li>
                                <li>• Chuẩn bị mô hoàn chỉnh trước trồng 15–20 ngày.</li>
                            </ul>
                        </div>
                        <div className="bg-white border rounded-xl p-5 shadow-sm">
                            <h5 className="font-bold text-gray-800 mb-3 border-b pb-2">Chuẩn bị đất (Vùng đất cao – ĐNB, Tây Nguyên):</h5>
                            <ul className="text-sm text-gray-600 space-y-2">
                                <li>• Đào hố tối thiểu <strong>0,6×0,6×0,6m</strong> (đất nghèo dinh dưỡng đào lớn hơn).</li>
                                <li>• Làm mô cao 0,2m. Xẻ rãnh thoát nước dọc theo vườn.</li>
                            </ul>
                            <h5 className="font-bold text-gray-800 mb-2 mt-4 border-b pb-2">Cách trồng & Thời vụ:</h5>
                            <ul className="text-sm text-gray-600 space-y-2">
                                <li>• Cắt đáy bầu, đặt cây ngang mặt bầu, cắm cọc giữ cây, che bóng cho cây con.</li>
                                <li>• <strong>Thời vụ ĐBSCL:</strong> tháng 6–7 DL; <strong>ĐNB & Tây Nguyên:</strong> tháng 6–8 DL (đầu mùa mưa).</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: "phan-bon-nuoc-tuoi",
        title: "4. Dinh dưỡng & Phân bón",
        icon: <Layers className="w-6 h-6" />,
        description: "Quy trình phân bón chi tiết theo giai đoạn kiến thiết và kinh doanh.",
        source: "Sổ tay VietGAP Sầu riêng, Mục 1.5 – Quản lý dinh dưỡng và phân bón (SOFRI, 2023)",
        content: (
            <div className="space-y-8">
                {/* Phân bón thời kỳ kiến thiết */}
                <div>
                    <h4 className="font-bold text-gray-900 mb-4 text-xl">4.1. Phân Bón Thời Kỳ Kiến Thiết Cơ Bản (Năm 1–4)</h4>
                    <div className="overflow-x-auto border rounded-xl shadow-sm mb-3">
                        <table className="min-w-full text-sm">
                            <thead className="bg-emerald-100 font-bold text-emerald-900">
                                <tr>
                                    <th className="px-4 py-3 text-left">Tuổi cây (năm)</th>
                                    <th className="px-4 py-3 text-left">Số lần bón/năm</th>
                                    <th className="px-4 py-3 text-left">N (g/cây/năm)</th>
                                    <th className="px-4 py-3 text-left">P₂O₅ (g/cây/năm)</th>
                                    <th className="px-4 py-3 text-left">K₂O (g/cây/năm)</th>
                                    <th className="px-4 py-3 text-left">Ure (g)</th>
                                    <th className="px-4 py-3 text-left">Lân (g)</th>
                                    <th className="px-4 py-3 text-left">Kali (g)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-semibold">1</td><td className="px-4 py-3">6–9</td><td className="px-4 py-3">200–300</td><td className="px-4 py-3">100–200</td><td className="px-4 py-3">100–200</td><td className="px-4 py-3">435–652</td><td className="px-4 py-3">625–1.250</td><td className="px-4 py-3">200–400</td></tr>
                                <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-semibold">2</td><td className="px-4 py-3">4–6</td><td className="px-4 py-3">300–450</td><td className="px-4 py-3">200–300</td><td className="px-4 py-3">200–300</td><td className="px-4 py-3">652–978</td><td className="px-4 py-3">1.250–1.875</td><td className="px-4 py-3">400–600</td></tr>
                                <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-semibold">3</td><td className="px-4 py-3">4–6</td><td className="px-4 py-3">450–600</td><td className="px-4 py-3">300–400</td><td className="px-4 py-3">350–500</td><td className="px-4 py-3">978–1.304</td><td className="px-4 py-3">1.875–2.500</td><td className="px-4 py-3">700–1.000</td></tr>
                                <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-semibold">4</td><td className="px-4 py-3">4</td><td className="px-4 py-3">700–900</td><td className="px-4 py-3">400–500</td><td className="px-4 py-3">600–700</td><td className="px-4 py-3">1.522–1.957</td><td className="px-4 py-3">2.500–3.125</td><td className="px-4 py-3">1.200–1.400</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 text-sm text-gray-600">
                        <p>• <strong>Phân hữu cơ:</strong> 10–30 kg phân chuồng hoai (hoặc 3–5 kg hữu cơ vi sinh)/cây/năm, bón định kỳ 1 lần/năm.</p>
                        <p className="mt-1">• <strong>Vôi:</strong> 0,5–1 kg/cây vào đầu mùa mưa. Nếu pH đất &gt;6,5 thì không bón thêm vôi.</p>
                        <p className="mt-1">• Sau trồng thấy cây ra tượt non đầu tiên mới bón phân. Chia nhỏ làm nhiều lần (4–9 lần/năm).</p>
                    </div>
                </div>

                {/* Phân bón thời kỳ kinh doanh */}
                <div>
                    <h4 className="font-bold text-gray-900 mb-4 text-xl">4.2. Phân Bón Thời Kỳ Kinh Doanh (Cây 5–12 năm)</h4>
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 mb-4 text-sm text-gray-700">
                        <p><strong>Tổng liều lượng/cây/năm:</strong> 1.400–1.600g N + 1.200–1.400g P₂O₅ + 1.700–2.000g K₂O (tăng dần đến năm 12 tuổi).</p>
                        <p className="mt-1"><strong>Phân hữu cơ:</strong> 50–100 kg phân chuồng hoai hoặc 12–20 kg hữu cơ vi sinh/cây/năm. Bón vôi 2–4 kg/cây/năm.</p>
                    </div>
                    <div className="overflow-x-auto border rounded-xl shadow-sm">
                        <table className="min-w-full text-sm">
                            <thead className="bg-emerald-100 font-bold text-emerald-900">
                                <tr>
                                    <th className="px-4 py-3 text-left">Đợt bón</th>
                                    <th className="px-4 py-3 text-left">Thời điểm</th>
                                    <th className="px-4 py-3 text-center">N (%)</th>
                                    <th className="px-4 py-3 text-center">P₂O₅ (%)</th>
                                    <th className="px-4 py-3 text-center">K₂O (%)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                <tr className="bg-green-50"><td className="px-4 py-3 font-bold" colSpan={2}>Đợt 1: Sau thu hoạch (Phục hồi) – 36% tổng lượng</td><td className="px-4 py-3 text-center font-bold">36</td><td className="px-4 py-3 text-center font-bold">24</td><td className="px-4 py-3 text-center font-bold">15</td></tr>
                                <tr className="hover:bg-gray-50"><td className="px-4 py-3 pl-8 text-gray-500">→ Lần 1</td><td className="px-4 py-3">Sau thu hoạch</td><td className="px-4 py-3 text-center">12</td><td className="px-4 py-3 text-center">8</td><td className="px-4 py-3 text-center">5</td></tr>
                                <tr className="hover:bg-gray-50"><td className="px-4 py-3 pl-8 text-gray-500">→ Lần 2</td><td className="px-4 py-3">Cơi đợt 1 già</td><td className="px-4 py-3 text-center">12</td><td className="px-4 py-3 text-center">8</td><td className="px-4 py-3 text-center">5</td></tr>
                                <tr className="hover:bg-gray-50"><td className="px-4 py-3 pl-8 text-gray-500">→ Lần 3</td><td className="px-4 py-3">Cơi đợt 2 già</td><td className="px-4 py-3 text-center">12</td><td className="px-4 py-3 text-center">8</td><td className="px-4 py-3 text-center">5</td></tr>
                                <tr className="bg-yellow-50"><td className="px-4 py-3 font-bold" colSpan={2}>Đợt 2: Xử lý ra hoa (Tạo mầm hoa) – 8% N, 40% P, 21% K</td><td className="px-4 py-3 text-center font-bold">8</td><td className="px-4 py-3 text-center font-bold">40</td><td className="px-4 py-3 text-center font-bold">21</td></tr>
                                <tr className="bg-orange-50"><td className="px-4 py-3 font-bold" colSpan={2}>Đợt 3: Ra hoa – 30% N, 18% P, 30% K</td><td className="px-4 py-3 text-center font-bold">30</td><td className="px-4 py-3 text-center font-bold">18</td><td className="px-4 py-3 text-center font-bold">30</td></tr>
                                <tr className="hover:bg-gray-50"><td className="px-4 py-3 pl-8 text-gray-500">→ Lần 1</td><td className="px-4 py-3">Khi hoa dài 1 cm</td><td className="px-4 py-3 text-center">12</td><td className="px-4 py-3 text-center">8</td><td className="px-4 py-3 text-center">5</td></tr>
                                <tr className="hover:bg-gray-50"><td className="px-4 py-3 pl-8 text-gray-500">→ Lần 2</td><td className="px-4 py-3">14 ngày sau lần 1</td><td className="px-4 py-3 text-center">12</td><td className="px-4 py-3 text-center">8</td><td className="px-4 py-3 text-center">5</td></tr>
                                <tr className="hover:bg-gray-50"><td className="px-4 py-3 pl-8 text-gray-500">→ Lần 3</td><td className="px-4 py-3">Trước hoa trổ 10 ngày</td><td className="px-4 py-3 text-center">6</td><td className="px-4 py-3 text-center">2</td><td className="px-4 py-3 text-center">20</td></tr>
                                <tr className="bg-blue-50"><td className="px-4 py-3 font-bold" colSpan={2}>Đợt 4: Nuôi quả – 26% N, 18% P, 21% K</td><td className="px-4 py-3 text-center font-bold">26</td><td className="px-4 py-3 text-center font-bold">18</td><td className="px-4 py-3 text-center font-bold">21</td></tr>
                                <tr className="hover:bg-gray-50"><td className="px-4 py-3 pl-8 text-gray-500">→ Lần 1</td><td className="px-4 py-3">2 tuần sau đậu quả</td><td className="px-4 py-3 text-center">6</td><td className="px-4 py-3 text-center">2</td><td className="px-4 py-3 text-center">7</td></tr>
                                <tr className="hover:bg-gray-50"><td className="px-4 py-3 pl-8 text-gray-500">→ Lần 2</td><td className="px-4 py-3">4 tuần sau đậu quả</td><td className="px-4 py-3 text-center">12</td><td className="px-4 py-3 text-center">8</td><td className="px-4 py-3 text-center">5</td></tr>
                                <tr className="hover:bg-gray-50"><td className="px-4 py-3 pl-8 text-gray-500">→ Lần 3</td><td className="px-4 py-3">6 tuần sau đậu quả</td><td className="px-4 py-3 text-center">8</td><td className="px-4 py-3 text-center">8</td><td className="px-4 py-3 text-center">9</td></tr>
                                <tr className="bg-red-50"><td className="px-4 py-3 font-bold text-red-700" colSpan={2}>Đợt 5: Trước thu hoạch 3–4 tuần – KHÔNG bón N, P</td><td className="px-4 py-3 text-center font-bold text-red-700">0</td><td className="px-4 py-3 text-center font-bold text-red-700">0</td><td className="px-4 py-3 text-center font-bold text-red-700">13</td></tr>
                            </tbody>
                        </table>
                        <p className="text-xs text-gray-500 p-3 bg-gray-50 flex items-center gap-1 italic">
                            <Info className="w-3 h-3" /> Nguồn: Sổ tay VietGAP Sầu riêng, Bảng 2 – Tỷ lệ bón phân vô cơ thời kỳ kinh doanh
                        </p>
                    </div>
                </div>

                {/* Quy định VietGAP về phân bón */}
                <div className="bg-amber-50 border-l-4 border-amber-400 p-5 rounded-r-xl">
                    <h4 className="font-bold text-amber-900 mb-3 flex items-center gap-2 text-lg">
                        <ShieldCheck className="w-5 h-5" /> Quy định VietGAP về phân bón (Mục 1.5)
                    </h4>
                    <ul className="text-sm text-gray-700 space-y-2">
                        <li className="flex gap-2"><ChevronRight className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />Chỉ sử dụng phân bón trong <strong>danh mục được phép lưu hành</strong> của Bộ NN&PTNT.</li>
                        <li className="flex gap-2"><ChevronRight className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" /><strong>Phân chuồng/phân hữu cơ phải được ủ hoai hoàn toàn</strong> trước khi bón. Nhiệt độ đống ủ đạt 55°C trong ít nhất 3 ngày để tiêu diệt mầm bệnh.</li>
                        <li className="flex gap-2"><ChevronRight className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />Kho chứa phân bón phải riêng biệt, thoáng mát, không để chung với thuốc BVTV.</li>
                        <li className="flex gap-2"><ChevronRight className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />Ghi nhật ký: tên phân bón, nhà sản xuất, ngày bón, liều lượng thực tế dùng.</li>
                    </ul>
                </div>
            </div>
        )
    },
    {
        id: "nuoc-tuoi",
        title: "5. Quản lý nguồn nước & Tưới nước",
        icon: <Droplets className="w-6 h-6" />,
        description: "Yêu cầu chất lượng nước, đánh giá mối nguy và kỹ thuật tưới nước theo từng giai đoạn.",
        source: "Sổ tay VietGAP Sầu riêng, Mục 1.6 – Quản lý nguồn nước và biện pháp tưới nước (SOFRI, 2023)",
        content: (
            <div className="space-y-8">
                {/* Mối nguy nguồn nước */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded-r-xl shadow-sm">
                    <h4 className="font-bold text-blue-900 flex items-center gap-2 mb-4 text-lg">
                        <AlertTriangle className="w-6 h-6" /> Phân tích mối nguy nguồn nước tưới (BẮT BUỘC – Mục 1.6.1)
                    </h4>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm bg-white rounded-lg overflow-hidden">
                            <thead className="bg-blue-100 font-bold text-blue-900">
                                <tr>
                                    <th className="px-4 py-3 text-left">Loại mối nguy</th>
                                    <th className="px-4 py-3 text-left">Nguồn gốc</th>
                                    <th className="px-4 py-3 text-left">Biện pháp kiểm soát</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                <tr className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-semibold text-red-700">Hóa học<br /><span className="text-xs font-normal text-gray-500">Tồn dư thuốc BVTV, kim loại nặng trong nước</span></td>
                                    <td className="px-4 py-3 text-gray-600 text-xs">Nước thải công nghiệp, nước từ vùng canh tác dùng nhiều hóa chất chảy vào mương tưới.</td>
                                    <td className="px-4 py-3 text-gray-600 text-xs">Lấy mẫu nước phân tích định kỳ hàng năm theo QCVN 08-MT:2015/BTNMT. Không lấy nước từ nguồn ô nhiễm.</td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-semibold text-yellow-700">Sinh học<br /><span className="text-xs font-normal text-gray-500">Vi sinh vật gây bệnh (Coliforms, E. Coli)</span></td>
                                    <td className="px-4 py-3 text-gray-600 text-xs">Nước thải chăn nuôi, nước thải sinh hoạt, nước lũ chứa phân động vật.</td>
                                    <td className="px-4 py-3 text-gray-600 text-xs">Xét nghiệm nước 1 lần/năm. Nước sau thu hoạch dùng để rửa quả phải đạt QCVN 02:2009/BYT.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quy định nước tưới */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white border rounded-xl p-5 shadow-sm">
                        <h5 className="font-bold text-gray-800 mb-3 border-b pb-2 flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-blue-600" /> Quy định VietGAP về nước
                        </h5>
                        <ul className="text-sm text-gray-600 space-y-2">
                            <li>• Nước tưới phải đạt <strong>QCVN 08-MT:2015/BTNMT</strong> (nước mặt dùng cho tưới tiêu).</li>
                            <li>• Nước dùng sau thu hoạch (rửa quả) phải đạt <strong>QCVN 02:2009/BYT</strong>.</li>
                            <li>• Lấy mẫu nước phân tích <strong>ít nhất 1 lần/năm</strong> (5 ha/mẫu).</li>
                            <li>• Lưu kết quả phân tích vào hồ sơ VietGAP.</li>
                        </ul>
                    </div>
                    <div className="bg-white border rounded-xl p-5 shadow-sm">
                        <h5 className="font-bold text-gray-800 mb-3 border-b pb-2 flex items-center gap-2">
                            <Droplets className="w-5 h-5 text-blue-600" /> Kỹ thuật tưới nước
                        </h5>
                        <ul className="text-sm text-gray-600 space-y-2">
                            <li>• Nước tưới phải có độ mặn <strong>&lt;0,5‰</strong>. Chỉ dùng nước độ mặn &lt;0,5‰ khi không còn nguồn ngọt, hạn chế tưới nhiều lần liên tục.</li>
                            <li>• <strong>Giai đoạn ra hoa:</strong> Giảm 2/3 lượng nước mỗi lần tưới trong 1 tuần trước hoa nở để hạt phấn khỏe, đậu quả tốt.</li>
                            <li>• <strong>Sau đậu quả:</strong> Tưới tăng dần đến mức bình thường.</li>
                            <li>• Áp dụng tưới <strong>nhỏ giọt hoặc phun mưa tiết kiệm</strong>. Kiểm tra hệ thống tưới thường xuyên.</li>
                        </ul>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: "tao-tan-xu-ly-ra-hoa",
        title: "6. Tạo tán, Xử lý ra hoa & Chăm sóc quả",
        icon: <Scissors className="w-6 h-6" />,
        description: "Tạo tán, quy trình xử lý ra hoa 4 bước, thụ phấn bổ sung, tỉa quả và khắc phục sượng cơm.",
        source: "Sổ tay VietGAP Sầu riêng, Mục 1.7, 1.8 & 1.9 – Tạo tán, Xử lý ra hoa và Chăm sóc (SOFRI, 2023)",
        content: (
            <div className="space-y-8">
                {/* Tạo tán tỉa cành */}
                <div className="bg-lime-50 p-5 rounded-xl border border-lime-200">
                    <h4 className="font-bold text-lime-900 mb-3 text-lg flex items-center gap-2">
                        <Scissors className="w-5 h-5" /> Tạo tán & Tỉa cành (Mục 1.7)
                    </h4>
                    <div className="grid md:grid-cols-2 gap-5 text-sm text-gray-700">
                        <div>
                            <p className="font-semibold mb-2">Thời kỳ kiến thiết (từ năm 1):</p>
                            <ul className="space-y-1 list-disc pl-4">
                                <li>Tỉa bỏ chồi mọc từ gốc ghép.</li>
                                <li>Tỉa cành bị che khuất, mọc quá gần nhau, cành mọc đứng.</li>
                                <li>Giữ lại một thân chính và các cành ngang như tán cây thông.</li>
                            </ul>
                        </div>
                        <div>
                            <p className="font-semibold mb-2">Thời kỳ kinh doanh (sau thu hoạch):</p>
                            <ul className="space-y-1 list-disc pl-4">
                                <li>Tỉa cành mọc vượt, yếu, sâu bệnh nặng, cành kiệt sức, cành đan giữa hai cây.</li>
                                <li><strong>Cành cấp 1 đầu tiên phải cao hơn mặt đất &gt;70 cm.</strong></li>
                                <li>Cắt ngọn khi cây cao vượt khoảng cách trồng và có ≥18 cành cấp 1 (đường kính &gt;4cm). Vết cắt quét thuốc hoặc sơn keo chống thấm.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* 4 bước xử lý ra hoa */}
                <div>
                    <h4 className="font-bold text-gray-900 mb-4 text-xl">Quy Trình Xử Lý Ra Hoa (4 Bước – Mục 1.8)</h4>
                    <div className="grid md:grid-cols-2 gap-5">
                        {[
                            {
                                step: "Bước 1", title: "Tạo các đợt chồi mới", color: "emerald",
                                items: ["Sau thu hoạch: tỉa cành không mang quả, cành sâu bệnh, cành nằm trong tán.", "Bón phân đợt 1 (phục hồi cây)."]
                            },
                            {
                                step: "Bước 2", title: "Phân hóa mầm hoa", color: "yellow",
                                items: ["Bón phân đợt 2 (lân cao). Sau 30–40 ngày: quét dọn vật liệu từ gốc.", "Không tưới nước, tháo cạn nước mương, phủ bạt nilon tạo khô hạn nhân tạo.", "Điều kiện: cây thật khỏe, khô hạn liên tục 7–14 ngày, ẩm độ 50–60%."]
                            },
                            {
                                step: "Bước 3", title: "Phát triển hoa", color: "orange",
                                items: ["Khi hoa ra được 0,5 cm: dỡ bạt nilon.", "Tưới nước cách ngày, liều lượng tăng dần đến mức bình thường.", "Bón phân đợt 3. Phun phân bón lá Canxi–Bo trước và sau hoa nở 5–7 ngày."]
                            },
                            {
                                step: "Bước 4", title: "Tăng đậu quả", color: "blue",
                                items: ["Nếu cây có đợt non trước khi xổ nhụy 15 ngày: phun phân bón lá Kali cao để kìm hãm đợt.", "Thụ phấn bổ sung (17–22 giờ) trong 3–5 đêm hoa nở tập trung.", "7 ngày sau đậu quả: phun NAA 20–30 ppm + phân bón lá 15-30-15 hạn chế rụng quả non."]
                            }
                        ].map(({ step, title, color, items }) => (
                            <div key={step} className={`bg-${color}-50 border border-${color}-200 rounded-xl p-5`}>
                                <div className={`bg-${color}-500 text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-2`}>{step}</div>
                                <h5 className="font-bold text-gray-800 mb-2">{title}</h5>
                                <ul className="text-sm text-gray-600 space-y-1 list-disc pl-4">
                                    {items.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-3 flex items-center gap-1 italic">
                        <Info className="w-3 h-3" /> Nguồn: Sổ tay VietGAP Sầu riêng, Mục 1.8 – Xử lý ra hoa (SOFRI, 2023)
                    </p>
                </div>

                {/* Thụ phấn & Tỉa quả */}
                <div className="grid md:grid-cols-2 gap-5">
                    <div className="bg-white border rounded-xl p-5 shadow-sm">
                        <h5 className="font-bold text-gray-800 mb-3 border-b pb-2">Thụ phấn bổ sung:</h5>
                        <ul className="text-sm text-gray-600 space-y-2">
                            <li>• Thời điểm: <strong>17–22 giờ</strong> (Dona từ 17h, Ri6 từ 18h).</li>
                            <li>• Dùng chổi nylon mềm quét qua lại 3–5 lần trên phát hoa đang nở, rồi di chuyển sang phát hoa khác.</li>
                            <li>• Thực hiện trong 3–5 đêm hoa nở tập trung nhất.</li>
                        </ul>
                    </div>
                    <div className="bg-white border rounded-xl p-5 shadow-sm">
                        <h5 className="font-bold text-gray-800 mb-3 border-b pb-2">Tỉa hoa & Tỉa quả:</h5>
                        <ul className="text-sm text-gray-600 space-y-2">
                            <li>• <strong>Tỉa hoa:</strong> Chỉ giữ lại 1 đợt hoa tập trung. Khoảng cách giữa các chùm hoa sau tỉa: 20–30 cm.</li>
                            <li>• <strong>Tỉa quả lần 1 (tuần 3–4):</strong> Tỉa chùm dày, quả méo, sâu bệnh.</li>
                            <li>• <strong>Tỉa quả lần 2 (tuần 6–8):</strong> Tỉa quả méo, phát triển không bình thường.</li>
                        </ul>
                    </div>
                </div>

                {/* Khắc phục sượng cơm, cháy múi */}
                <div className="bg-amber-50 border-l-4 border-amber-500 p-5 rounded-r-xl">
                    <h4 className="font-bold text-amber-900 mb-3 text-lg flex items-center gap-2">
                        <Stethoscope className="w-5 h-5" /> Khắc phục Sượng cơm, Cháy múi, Nhão cơm (Mục 1.9.2)
                    </h4>
                    <ul className="text-sm text-gray-700 space-y-2 list-disc pl-4">
                        <li>Kích thích ra hoa tập trung, đồng loạt. Vườn cây thoát nước tốt, tránh ngập úng.</li>
                        <li>Hạn chế ra đợt non trong giai đoạn phát triển quả: phun phân bón lá Kali + Lân cao 7–10 ngày/lần (giai đoạn 3–12 tuần sau đậu quả).</li>
                        <li><strong>Tránh cháy múi:</strong> Hạn chế phân bón chứa Clo; phun phân bón lá có Bo giai đoạn 15–20 ngày sau đậu quả.</li>
                        <li><strong>Tránh nhão cơm:</strong> Không thu hoạch trong giai đoạn mưa nhiều.</li>
                        <li>Phun 2–3 lần phân bón lá có Canxi, Magiê giai đoạn 2 tháng sau đậu quả.</li>
                    </ul>
                </div>

                {/* Ứng phó hạn mặn */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded-r-xl">
                    <h4 className="font-bold text-blue-900 mb-3 text-lg flex items-center gap-2">
                        <CloudRain className="w-5 h-5" /> Kỹ Thuật Ứng Phó Hạn Mặn (Mục 1.9.3 & 1.9.4)
                    </h4>
                    <div className="grid md:grid-cols-2 gap-5 text-sm text-gray-700">
                        <div>
                            <p className="font-semibold mb-2">Trước & trong xâm nhập mặn:</p>
                            <ul className="space-y-1 list-disc pl-4">
                                <li>Củng cố đê bao; tủ gốc giữ ẩm (lá dừa nước, rơm rạ, lục bình).</li>
                                <li>Dự trữ nước ngọt trong mương (lót nylon) hoặc túi nilon dày.</li>
                                <li>Không xử lý ra hoa khi nguồn nước không đảm bảo.</li>
                                <li><strong>Không tưới nước có độ mặn ≥0,5‰.</strong></li>
                                <li>Phun Brassinosteriod 50 ppm + Canxi nitrat 0,5% (trước mặn 1 lần; khi mặn xâm nhập: 4 lần, mỗi 15 ngày).</li>
                            </ul>
                        </div>
                        <div>
                            <p className="font-semibold mb-2">Phục hồi vườn sau hạn mặn (5 bước):</p>
                            <ul className="space-y-1 list-disc pl-4">
                                <li><strong>Bước 1:</strong> Tưới ngọt liên tục 3–5 ngày (2–3 lần/ngày) rửa mặn. Bón 1 kg vôi/cây.</li>
                                <li><strong>Bước 2:</strong> Sau 7–10 ngày: bón hữu cơ sinh học (đạm cá, humic, Trichoderma, Mycorrhiza). Tuyệt đối không bón phân hóa học.</li>
                                <li><strong>Bước 3–4:</strong> Phun dinh dưỡng hữu cơ-sinh học qua lá mỗi 10 ngày.</li>
                                <li><strong>Bước 5:</strong> Sau bước 4 được 20 ngày: bón gốc phân hữu cơ vi sinh + phun lá hữu cơ-sinh học.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: "quan-ly-sau-benh",
        title: "7. Quản lý Sâu bệnh & Thuốc BVTV",
        icon: <Bug className="w-6 h-6" />,
        description: "Nguyên tắc 4 ĐÚNG, sâu bệnh hại chính và quản lý chất thải thuốc BVTV.",
        source: "Sổ tay VietGAP Sầu riêng, Mục 1.11 – Quản lý thuốc BVTV, hóa chất và sinh vật gây hại (SOFRI, 2023)",
        content: (
            <div className="space-y-8">
                {/* Nguyên tắc 4 ĐÚNG */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6 shadow-sm">
                    <h4 className="font-bold text-blue-900 mb-4 text-lg flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6" /> Nguyên Tắc 4 ĐÚNG Khi Sử Dụng Thuốc BVTV (Mục 1.11.1)
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                        {[
                            { num: "1", title: "Đúng thuốc", items: ["Chỉ dùng thuốc trong danh mục được phép của Bộ NN&PTNT.", "Ưu tiên hoạt chất sinh học, ít độc."] },
                            { num: "2", title: "Đúng liều lượng & nồng độ", items: ["Pha đúng theo hướng dẫn trên nhãn.", "TUYỆT ĐỐI không tăng liều tùy tiện."] },
                            { num: "3", title: "Đúng lúc", items: ["Phun khi sinh vật gây hại đến ngưỡng gây hại.", "Tuân thủ thời gian cách ly (PHI) ghi trên nhãn."] },
                            { num: "4", title: "Đúng cách", items: ["Phun kỹ, đều khắp. Đeo bảo hộ: áo dài tay, quần dài, nón, khẩu trang than hoạt tính, kính, bao tay.", "Dựng biển cảnh báo vườn mới phun. Không phun ngược gió, ngày mưa."] }
                        ].map(({ num, title, items }) => (
                            <div key={title} className="bg-white p-4 rounded-lg border border-blue-100">
                                <h5 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                                    <span className="bg-blue-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">{num}</span>
                                    {title}
                                </h5>
                                <ul className="text-sm text-gray-600 space-y-1">{items.map((i, k) => <li key={k}>• {i}</li>)}</ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bảng sâu hại */}
                <div>
                    <h4 className="font-bold text-gray-900 mb-4 text-xl">Các Sâu Hại Chính & Biện Pháp Quản Lý (Mục 1.11.2)</h4>
                    <div className="overflow-x-auto border rounded-xl shadow-sm">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-100 font-bold text-gray-800 uppercase">
                                <tr>
                                    <th className="px-5 py-3 text-left w-1/4">Đối tượng</th>
                                    <th className="px-5 py-3 text-left w-1/3">Đặc điểm & Tác hại</th>
                                    <th className="px-5 py-3 text-left w-1/3">Biện pháp quản lý (VietGAP)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                <tr className="hover:bg-gray-50">
                                    <td className="px-5 py-4 font-bold text-orange-600">Sâu đục hoa, quả<br /><span className="text-xs font-normal text-gray-500 italic">(Conogethes punctiferalis)</span></td>
                                    <td className="px-5 py-4 text-gray-700 text-xs">Đục vào hoa làm rụng; đục vào quả từ non đến trưởng thành, tạo điều kiện nấm bệnh tấn công gây thối quả.</td>
                                    <td className="px-5 py-4 text-gray-700 text-xs">
                                        <ul className="space-y-1">
                                            <li>• Thu gom, tiêu hủy chùm hoa/quả bị sâu.</li>
                                            <li>• Dùng đoạn gỗ nhỏ chêm giữa các quả.</li>
                                            <li>• Khi cần: phun <em>Bacillus thuringiensis</em>, Spinosad, Chlorantraniliprole, Pyriproxyfen theo liều trên bao bì.</li>
                                        </ul>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="px-5 py-4 font-bold text-green-700">Rầy xanh<br /><span className="text-xs font-normal text-gray-500 italic">(Amrasca sp.)</span></td>
                                    <td className="px-5 py-4 text-gray-700 text-xs">Thành trùng + ấu trùng chích hút lá non. Lá cháy như bệnh, sau đó rụng.</td>
                                    <td className="px-5 py-4 text-gray-700 text-xs">
                                        <ul className="space-y-1">
                                            <li>• Tạo vườn thông thoáng; điều khiển đợt ra tập trung.</li>
                                            <li>• Bảo vệ thiên địch (nhện ăn mồi, bọ rùa, bọ xít ăn sâu).</li>
                                            <li>• Khi cây búp đợt: phun 2–3 lần Clothianidin, Abamectin, Spirotetramat, Buprofezin.</li>
                                        </ul>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="px-5 py-4 font-bold text-teal-700">Rầy nhảy<br /><span className="text-xs font-normal text-gray-500 italic">(Allocaridara malayensis)</span></td>
                                    <td className="px-5 py-4 text-gray-700 text-xs">Chích hút lá non, tiết mật → nấm bồ hóng. Rụng lá hàng loạt ảnh hưởng ra hoa, đậu quả. Phát sinh mạnh mùa nắng.</td>
                                    <td className="px-5 py-4 text-gray-700 text-xs">
                                        <ul className="space-y-1">
                                            <li>• Bảo vệ ong ký sinh (Encyrtidae), bọ rùa.</li>
                                            <li>• Điều khiển đợt tập trung; vườn thông thoáng.</li>
                                            <li>• Phun Clothianidin, Abamectin, Spirotetramat, Buprofezin.</li>
                                        </ul>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="px-5 py-4 font-bold text-purple-600">Rệp sáp hại quả<br /><span className="text-xs font-normal text-gray-500 italic">(Planococcus sp.)</span></td>
                                    <td className="px-5 py-4 text-gray-700 text-xs">Hút dịch vỏ quả từ non đến chín. Tiết mật → nấm bồ hóng đen vỏ quả.</td>
                                    <td className="px-5 py-4 text-gray-700 text-xs">
                                        <ul className="space-y-1">
                                            <li>• Phun nước rửa trôi rệp. Tỉa quả non nhiễm nặng.</li>
                                            <li>• Tránh trồng xen mãng cầu, chôm chôm.</li>
                                            <li>• Phun Buprofezin, Spirotetramat, Clothianidin, dầu khoáng.</li>
                                        </ul>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="px-5 py-4 font-bold text-red-600">Nhện đỏ<br /><span className="text-xs font-normal text-gray-500 italic">(Eutetranychus sp.)</span></td>
                                    <td className="px-5 py-4 text-gray-700 text-xs">Cạp biểu bì mặt lá tạo chấm trắng li ti. Bị nặng lá trắng bạc, rụng, cây còi cọc.</td>
                                    <td className="px-5 py-4 text-gray-700 text-xs">
                                        <ul className="space-y-1">
                                            <li>• Bảo vệ nhện nhỏ ăn mồi (thiên địch).</li>
                                            <li>• Phun dầu khoáng, Abamectin + <em>Bacillus thuringiensis</em>, Sulfur, Emamectin benzoate, Clothianidin.</li>
                                        </ul>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="px-5 py-4 font-bold text-amber-700">Xén tóc đục thân<br /><span className="text-xs font-normal text-gray-500 italic">(Batocera rufomaculata)</span></td>
                                    <td className="px-5 py-4 text-gray-700 text-xs">Sâu non đục thân/cành chính tạo đường hầm bên trong, làm chết cành hoặc cả cây.</td>
                                    <td className="px-5 py-4 text-gray-700 text-xs">
                                        <ul className="space-y-1">
                                            <li>• Dùng bẫy đèn bắt trưởng thành đầu mùa mưa.</li>
                                            <li>• Thăm vườn thường xuyên, phát hiện sớm.</li>
                                            <li>• Dùng dao nhỏ khoét lỗ đục bắt sâu hoặc tiêu diệt nhộng.</li>
                                        </ul>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="px-5 py-4 font-bold text-gray-600">Mọt đục thân<br /><span className="text-xs font-normal text-gray-500 italic">(Xyleborus similis)</span></td>
                                    <td className="px-5 py-4 text-gray-700 text-xs">Tấn công gốc, thân, cành chính bị nấm bệnh hoặc suy yếu.</td>
                                    <td className="px-5 py-4 text-gray-700 text-xs">
                                        <ul className="space-y-1">
                                            <li>• Thăm vườn thường xuyên, phát hiện sớm.</li>
                                            <li>• Phun luân phiên Abamectin, Emamectin benzoate + Dimethomorph hoặc Phosphorous acid.</li>
                                        </ul>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Bảng bệnh hại */}
                <div>
                    <h4 className="font-bold text-gray-900 mb-4 text-xl">Các Bệnh Hại Chính & Biện Pháp Quản Lý (Mục 1.11.3)</h4>
                    <div className="overflow-x-auto border rounded-xl shadow-sm">
                        <table className="min-w-full text-sm">
                            <thead className="bg-red-50 font-bold text-red-900 uppercase">
                                <tr>
                                    <th className="px-5 py-3 text-left">Bệnh</th>
                                    <th className="px-5 py-3 text-left">Tác nhân & Triệu chứng</th>
                                    <th className="px-5 py-3 text-left">Biện pháp quản lý</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                <tr className="hover:bg-gray-50">
                                    <td className="px-5 py-4 font-bold text-red-700">Xì mủ chảy nhựa thân</td>
                                    <td className="px-5 py-4 text-gray-700 text-xs"><em>Phytophthora palmivora.</em> Rễ, thân, cành, lá, quả đều bị hại. Thân chảy nhựa nâu, lá vàng, rễ thối đen.</td>
                                    <td className="px-5 py-4 text-gray-700 text-xs">
                                        <ul className="space-y-1">
                                            <li>• Thoát nước tốt; tỉa cành thông thoáng; cành cấp 1 cách đất &gt;1m.</li>
                                            <li>• Bón phân hữu cơ + Trichoderma, Streptomyces định kỳ.</li>
                                            <li>• Mỗi cơi đợt: phun Phosphorous acid (40ml/8L) ướt thân, cành, lá.</li>
                                            <li>• Cây lớn (&gt;15cm): tiêm Phosphorous acid 3–4 lần/năm.</li>
                                            <li>• Vết chảy nhựa: cạo sạch, bôi Fosetyl-aluminium hoặc Mancozeb + Metalaxyl.</li>
                                        </ul>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="px-5 py-4 font-bold text-amber-700">Thán thư</td>
                                    <td className="px-5 py-4 text-gray-700 text-xs"><em>Colletotrichum gloeosporioides.</em> Đốm nâu đậm từ mép lá lan vào. Vòng đen đồng tâm trên vết bệnh cũ.</td>
                                    <td className="px-5 py-4 text-gray-700 text-xs">Tạo vườn thông thoáng, tỉa tiêu hủy cành bệnh. Phun Propineb, Metiram Complex, Mancozeb, Fosetyl-aluminium.</td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="px-5 py-4 font-bold text-yellow-700">Cháy lá chết ngọn</td>
                                    <td className="px-5 py-4 text-gray-700 text-xs"><em>Rhizoctonia sp.</em> Đốm nâu sũng nước, lan theo mép lá, lá co dúm, khô rụng. Cây con chết ngọn. Phát triển mạnh mùa mưa.</td>
                                    <td className="px-5 py-4 text-gray-700 text-xs">Vườn ươm mật độ thưa, không tưới quá thừa. Vệ sinh cành lá bệnh. Phun Validamycin, Hexaconazole.</td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="px-5 py-4 font-bold text-green-700">Đốm rong</td>
                                    <td className="px-5 py-4 text-gray-700 text-xs"><em>Cephaleuros virescens.</em> Vết tròn màu gạch tôm, đường kính 0,2–1cm, nhô lên mặt lá. Tấn công cành non làm nứt, dễ nhiễm Phytophthora.</td>
                                    <td className="px-5 py-4 text-gray-700 text-xs">Mật độ thưa, tỉa cành tiêu hủy. Phun Copper Hydroxide, Copper Oxychloride, Cuprous Oxide.</td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="px-5 py-4 font-bold text-purple-700">Thối quả & Thối rễ</td>
                                    <td className="px-5 py-4 text-gray-700 text-xs"><em>Sclerotium rolfsii / Phytophthora / Pythium / Fusarium.</em> Vết đen nâu trên quả, thịt nhũn thối hôi. Rễ nhánh thối → cành héo → cây chết dần.</td>
                                    <td className="px-5 py-4 text-gray-700 text-xs">Tránh trầy xước quả; không để tiếp đất/cỏ bệnh. Rải vôi gốc + Trichoderma. Tưới/phun Mancozeb + Metalaxyl, Fosetyl-aluminium, Phosphorous acid, Dimethomorph.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quản lý rác thải */}
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 shadow-sm">
                    <h4 className="font-bold text-red-800 mb-4 text-lg flex items-center gap-2">
                        <Trash2 className="w-5 h-5" /> Quản Lý Chất Thải & Bao Bì Thuốc BVTV (BẮT BUỘC – Mục 1.12)
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
                        <ul className="space-y-2">
                            <li>• <strong>Kho thuốc:</strong> Riêng biệt, có khóa, biển báo nguy hiểm, không gây ô nhiễm nguồn nước. Không đặt tại khu sơ chế/bảo quản sản phẩm.</li>
                            <li>• <strong>Vỏ bao bì:</strong> Sau dùng hết, súc rửa 3 lần bằng nước sạch, gỡ nhãn tiêu hủy tránh tái sử dụng.</li>
                            <li>• <strong>Thu gom:</strong> Bỏ vào thùng chứa bao bì thuốc BVTV, có thể trả lại nhà cung cấp hoặc xử lý theo quy định địa phương (Thông tư 05/2016/TTLT-BTNMT).</li>
                        </ul>
                        <ul className="space-y-2">
                            <li className="text-red-600 font-bold flex items-center gap-2"><XCircle className="w-4 h-4 flex-shrink-0" /> TUYỆT ĐỐI không vứt xuống mương/suối, đốt vỏ chai, tái sử dụng bao bì chứa sản phẩm.</li>
                            <li>• <strong>Thuốc dư:</strong> Thu gom xử lý theo quy định về chất thải nguy hại. Nên có hố cát để súc rửa dụng cụ phun.</li>
                            <li>• <strong>Rác hữu cơ (vỏ quả, quả rụng):</strong> Thu gom vào hố ủ có nắp đậy, rắc vôi vào các lớp chất thải.</li>
                        </ul>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: "thu-hoach",
        title: "8. Thu hoạch & Sau thu hoạch",
        icon: <Package className="w-6 h-6" />,
        description: "Quy tắc PHI, thời điểm thu hoạch, vệ sinh, bảo quản và vận chuyển sầu riêng.",
        source: "Sổ tay VietGAP Sầu riêng, Mục 1.10 – Thu hoạch và xử lý sau thu hoạch (SOFRI, 2023)",
        content: (
            <div className="space-y-8">
                {/* PHI */}
                <div className="bg-red-50 border-l-4 border-red-600 p-6 rounded-r-xl shadow-md">
                    <h3 className="text-xl font-bold text-red-800 mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-6 h-6" /> Quy Tắc PHI (Thời Gian Cách Ly) – QUAN TRỌNG NHẤT
                    </h3>
                    <div className="bg-white p-5 rounded-lg mb-4">
                        <h5 className="font-bold text-gray-900 mb-2 flex items-center gap-2"><Info className="w-4 h-4 text-blue-500" /> PHI là gì?</h5>
                        <ul className="text-sm text-gray-700 space-y-1 list-disc pl-5">
                            <li><strong>PHI</strong> (Pre-Harvest Interval / Khoảng thời gian cách ly) = thời gian tối thiểu (tính bằng ngày) từ lần phun thuốc BVTV cuối cùng đến khi thu hoạch.</li>
                            <li>Mỗi loại thuốc có PHI khác nhau, <strong>ghi rõ trên bao bì (nhãn) thuốc BVTV</strong>.</li>
                            <li>Mục đích: đảm bảo dư lượng thuốc trong sản phẩm dưới mức tối đa cho phép (MRLs) theo Thông tư 50/2016/TT-BYT.</li>
                        </ul>
                    </div>
                    <div className="bg-red-100 p-4 rounded-lg flex items-start gap-3">
                        <Flame className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" />
                        <p className="text-red-800 font-bold text-sm">
                            Thu hoạch trước thời gian PHI = Tồn dư hóa chất vượt MRLs → Vi phạm VietGAP → Hủy lô hàng / Cấm xuất khẩu
                        </p>
                    </div>
                </div>

                {/* Thu hoạch */}
                <div className="grid md:grid-cols-2 gap-6 items-stretch">
                    <div className="bg-white border rounded-xl p-5 shadow-sm h-full flex flex-col">
                        <h4 className="font-bold text-gray-900 mb-3 text-lg flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-yellow-600" /> Thời điểm & Cách thu hoạch
                        </h4>
                        <ul className="text-sm text-gray-600 list-disc pl-4 space-y-2 flex-1">
                            <li><strong>Giống Dona:</strong> Cắt 110–130 ngày sau khi hoa nở. Chậm hơn Ri6 từ 20–30 ngày; miền ĐNB và Tây Nguyên chậm hơn ĐBSCL thêm 20–30 ngày.</li>
                            <li><strong>Giống Ri6:</strong> Cắt 85–100 ngày sau khi hoa nở.</li>
                            <li><strong>Xác định chín:</strong> Gõ vào trái nghe âm thanh phát ra để kiểm tra độ vang.</li>
                            <li><strong>Thời điểm:</strong> Thu hoạch sáng sớm hoặc chiều mát. Tránh thu sau mưa hoặc khi có sương mù dày.</li>
                            <li>Dùng dao cắt cả cuống quả. <span className="text-red-600 font-semibold">Không để quả tiếp xúc đất, bị nắng hay mưa ướt.</span></li>
                        </ul>
                    </div>
                    <div className="bg-white border rounded-xl p-5 shadow-sm h-full flex flex-col">
                        <h4 className="font-bold text-gray-900 mb-3 text-lg flex items-center gap-2">
                            <UserCheck className="w-5 h-5 text-green-600" /> Vệ sinh trong thu hoạch
                        </h4>
                        <ul className="text-sm text-gray-600 list-disc pl-4 space-y-2 flex-1">
                            <li>Trong quá trình thu hoạch không để quả tiếp xúc nước sông (mương); phải trải bạt trước khi đặt quả.</li>
                            <li>Không chất quả thành đống lớn. Đặt quả vào dụng cụ chứa phù hợp, chèn lót vật liệu mềm sạch giữa các quả.</li>
                            <li>Dụng cụ chứa và vật liệu chèn lót phải sạch sẽ.</li>
                            <li className="flex items-center gap-1 text-red-600"><XCircle className="w-4 h-4 flex-shrink-0" /> Không sử dụng trẻ em và phụ nữ mang thai thu hoạch quả.</li>
                            <li>Hướng dẫn nhân công về vệ sinh cá nhân và quy trình thu hoạch.</li>
                        </ul>
                    </div>
                </div>

                {/* Bảng mối nguy thu hoạch */}
                <div className="bg-orange-50 border-l-4 border-orange-400 p-5 rounded-r-xl">
                    <h4 className="font-bold text-orange-900 mb-3 flex items-center gap-2 text-lg">
                        <AlertCircle className="w-5 h-5" /> Phân tích mối nguy giai đoạn thu hoạch (Mục 1.10)
                    </h4>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm bg-white rounded-lg overflow-hidden">
                            <thead className="bg-orange-100 font-bold text-orange-900">
                                <tr>
                                    <th className="px-4 py-2 text-left">Mối nguy</th>
                                    <th className="px-4 py-2 text-left">Nguồn gốc</th>
                                    <th className="px-4 py-2 text-left">Biện pháp</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                <tr><td className="px-4 py-2 font-semibold text-red-700 text-xs">Hóa học (tồn dư thuốc)</td><td className="px-4 py-2 text-gray-600 text-xs">Thu hoạch trước PHI.</td><td className="px-4 py-2 text-gray-600 text-xs">Tuân thủ PHI ghi trên nhãn thuốc.</td></tr>
                                <tr><td className="px-4 py-2 font-semibold text-yellow-700 text-xs">Sinh học (vi sinh vật)</td><td className="px-4 py-2 text-gray-600 text-xs">Dụng cụ bẩn, nhân công không vệ sinh tay, quả tiếp đất/nước mương.</td><td className="px-4 py-2 text-gray-600 text-xs">Vệ sinh cá nhân, trải bạt, dụng cụ sạch.</td></tr>
                                <tr><td className="px-4 py-2 font-semibold text-blue-700 text-xs">Vật lý (dị vật)</td><td className="px-4 py-2 text-gray-600 text-xs">Mảnh kim loại, gỗ từ dụng cụ thu hoạch.</td><td className="px-4 py-2 text-gray-600 text-xs">Kiểm tra dụng cụ trước và sau khi dùng.</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Bảo quản & Vận chuyển */}
                <div className="bg-amber-50 p-5 rounded-xl border border-amber-200">
                    <h4 className="font-bold text-amber-900 mb-3 text-lg flex items-center gap-2">
                        <Package className="w-5 h-5" /> Bảo Quản & Vận Chuyển (Mục 1.10.2)
                    </h4>
                    <div className="grid md:grid-cols-2 gap-5 text-sm text-gray-700">
                        <div>
                            <p className="font-semibold mb-2">Bảo quản:</p>
                            <ul className="space-y-1 list-disc pl-4">
                                <li>Rửa quả bằng nước sạch, hong khô trong mát (có thể dùng quạt điện).</li>
                                <li>Khi trữ quả, phải có tấm lót ngăn cách với sàn nhà. Không đặt quả thành đống, tạo điều kiện thoáng mát.</li>
                                <li>Chỉ xử lý thúc chín theo hướng dẫn chuyên môn với chủng loại, liều lượng và nồng độ được nhà tiêu thụ cho phép.</li>
                            </ul>
                        </div>
                        <div>
                            <p className="font-semibold mb-2">Vận chuyển:</p>
                            <ul className="space-y-1 list-disc pl-4">
                                <li>Xếp theo lớp có chèn lót hoặc trong xọt chứa thông thoáng. Che mát cho trái trong quá trình vận chuyển.</li>
                                <li>Vận chuyển trên đường dài nên thực hiện <strong>ban đêm</strong> khi nhiệt độ hạ thấp.</li>
                                <li><strong>Đưa vào xử lý, đóng gói và bảo quản trước 24 giờ</strong> sau thu hoạch để tăng khả năng tồn trữ.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: "nhat-ky-vietgap",
        title: "9. Hồ sơ & Nhật ký VietGAP",
        icon: <ClipboardCheck className="w-6 h-6" />,
        description: "Hệ thống ghi chép bắt buộc, các biểu mẫu VietGAP và giải pháp giảm phát thải.",
        source: "Sổ tay VietGAP Sầu riêng, Phần II – Các biểu mẫu ghi chép lưu trữ hồ sơ",
        content: (
            <div className="space-y-8">
                <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100">
                    <h3 className="text-2xl font-bold text-emerald-900 mb-2 text-center uppercase tracking-wide">"Không ghi chép = Không làm VietGAP"</h3>
                    <p className="text-red-600 font-bold text-center mb-4 text-sm flex items-center justify-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> Kiểm tra viên sẽ xác minh tính nhất quán: Nhật ký mua vật tư → Nhật ký sử dụng → Nhật ký thu hoạch & tiêu thụ
                    </p>
                    <p className="text-gray-700 mb-6 text-center max-w-2xl mx-auto text-sm">
                        Theo Phần II Sổ tay VietGAP Sầu riêng, nhà vườn bắt buộc phải lưu trữ các biểu mẫu dưới đây.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {[
                            {
                                icon: <ClipboardList className="w-6 h-6" />, color: "blue",
                                title: "Biểu mẫu 1: Nhật ký sản xuất",
                                desc: "Bao gồm: Thông tin chung (tên giống, diện tích, mã số vùng trồng, sơ đồ vườn), nhật ký mua giống/phân bón/thuốc BVTV, nhật ký sử dụng phân bón và thuốc BVTV, nhật ký thu gom bao bì và thuốc dư thừa, nhật ký thu hoạch và tiêu thụ sản phẩm.",
                                note: "→ Ghi rõ: tên vật tư, tên đại lý, ngày mua, hạn sử dụng, liều lượng thực tế dùng, tên thuốc, PHI, ngày cắt, sản lượng (kg), khách hàng thu mua."
                            },
                            {
                                icon: <FileBadge className="w-6 h-6" />, color: "orange",
                                title: "Biểu mẫu 2: Tập huấn đào tạo",
                                desc: "Ghi lại: ngày tháng tập huấn, nội dung tập huấn, đơn vị tổ chức, tên giảng viên.",
                                note: "→ Chứng minh nông dân đã được đào tạo kỹ thuật VietGAP theo yêu cầu."
                            },
                            {
                                icon: <TestTube className="w-6 h-6" />, color: "purple",
                                title: "Biểu mẫu 3: Tự đánh giá & kiểm soát mối nguy",
                                desc: "Ghi lại kết quả phân tích mẫu đất, nước tưới, sản phẩm (kim loại nặng, thuốc BVTV, vi sinh vật, độc tố vi nấm) so với ngưỡng quy định. Ghi biện pháp khắc phục nếu không đạt.",
                                note: "→ Lưu kết quả phân tích từ phòng thử nghiệm được công nhận (ISO 17025)."
                            },
                            {
                                icon: <ShieldCheck className="w-6 h-6" />, color: "green",
                                title: "Hồ sơ pháp lý & Nhân sự",
                                desc: "Lưu giữ: hóa đơn mua giống/phân bón/thuốc (có tên đại lý, địa chỉ), giấy khám sức khỏe định kỳ của người lao động, chứng nhận tập huấn VietGAP.",
                                note: "→ Toàn bộ hồ sơ lưu trữ tối thiểu 2 năm."
                            }
                        ].map(({ icon, color, title, desc, note }) => (
                            <div key={title} className="bg-white p-5 rounded-xl flex items-start gap-4 shadow-sm border border-emerald-100 hover:shadow-md transition-shadow h-full">
                                <div className={`p-3 bg-${color}-100 text-${color}-600 rounded-lg flex-shrink-0`}>{icon}</div>
                                <div>
                                    <span className="block font-bold text-gray-800 text-lg mb-1">{title}</span>
                                    <p className="text-sm text-gray-600 mb-2">{desc}</p>
                                    <p className="text-xs text-red-600 font-medium">{note}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Giảm phát thải */}
                    <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                        <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                            <Recycle className="w-5 h-5" /> Giải Pháp Giảm Phát Thải Khí Nhà Kính (Mục 1.9.5)
                        </h4>
                        <ul className="text-sm text-gray-700 space-y-2 list-disc pl-4">
                            <li>Xử lý phế/phụ phẩm (đặc biệt vỏ quả chiếm ~75% khối lượng) đúng cách hoặc tái sử dụng (làm than hoạt tính, nhựa sinh học) để giảm CO₂ phát thải. <span className="text-gray-500 italic">(Vỏ quả chiếm 82,93% lượng phát thải theo Chattanong & Puttadee, 2019.)</span></li>
                            <li>Nâng cao hiệu quả sử dụng phân bón, hạn chế lãng phí; bón vừa đủ đảm bảo năng suất và chất lượng. Sử dụng phân bón tan có kiểm soát, phân phức hợp chất lượng cao.</li>
                            <li>Áp dụng quản lý sức khỏe cây trồng tổng hợp (IPHM) và tưới nhỏ giọt kết hợp bón phân.</li>
                        </ul>
                    </div>

                    <p className="text-xs text-gray-500 mt-6 text-center flex items-center justify-center gap-1 italic">
                        <Info className="w-3 h-3" /> Nguồn: Sổ tay Hướng dẫn kỹ thuật cho nông dân về canh tác cây sầu riêng theo tiêu chuẩn VietGAP – Cục Trồng trọt, Bộ NN&PTNT (GIZ hỗ trợ kỹ thuật)
                    </p>
                </div>
            </div>
        )
    }
];

export default function GuidePage() {
    const [activeSection, setActiveSection] = useState(guideSections[0].id);

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
            window.scrollTo({ top: elementPosition - navbarHeight, behavior: "smooth" });
            setActiveSection(id);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            <Navbar />

            {/* Hero Section */}
            <div className="relative h-[350px] mt-16 w-full overflow-hidden">
                <div className="absolute inset-0">
                    <Image src="/images/Durian5.jpg" alt="VietGAP Durian Farm" fill className="object-cover" priority />
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/90 via-emerald-800/70 to-transparent"></div>
                </div>
                <div className="relative max-w-7xl mx-auto px-4 h-full flex flex-col justify-center items-center text-center">
                    <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight max-w-2xl">
                        Quy Trình Kỹ Thuật <br />
                        <span className="text-lime-400">Trồng Sầu Riêng VietGAP</span>
                    </h1>
                    <p className="text-emerald-100 text-lg max-w-3xl">
                        Theo Sổ tay Hướng dẫn kỹ thuật – Cục Trồng trọt, Bộ NN&PTNT (SOFRI, 2023)
                    </p>
                </div>
            </div>

            <main className="max-w-8xl mx-auto px-4 md:px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8">

                    {/* Sidebar */}
                    <aside className="hidden lg:block h-fit sticky top-28 z-10">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm tracking-wide">
                                <BookOpen className="w-4 h-4 text-emerald-600" /> Mục lục
                            </h3>
                            <nav className="space-y-2">
                                {guideSections.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => scrollToSection(section.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 text-left border-l-4 ${activeSection === section.id
                                            ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm"
                                            : "border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                            }`}
                                    >
                                        <span className={`flex-shrink-0 ${activeSection === section.id ? "text-emerald-600" : "text-gray-400"}`}>
                                            {section.icon}
                                        </span>
                                        <span className="truncate">{section.title}</span>
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="space-y-8">
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
                                                    <BookOpen className="w-3 h-3 flex-shrink-0" />
                                                    <span className="italic">Nguồn: {section.source}</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="prose prose-emerald max-w-none text-gray-600">
                                        {section.content}
                                    </div>
                                </div>
                            </section>
                        ))}
                    </div>
                </div>
            </main>

            {/* Footer tài liệu */}
            <section className="bg-gray-100 py-8 border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                        Tài liệu tham khảo & Căn cứ pháp lý
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-600">
                        {[
                            { bold: "Sổ tay VietGAP Sầu riêng:", text: "Cục Trồng trọt – Bộ NN&PTNT, biên soạn bởi TS. Võ Hữu Thoại, TS. Lê Văn Đức và cộng sự. Hỗ trợ kỹ thuật từ GIZ/BMZ." },
                            { bold: "SOFRI, 2023:", text: "Viện Cây ăn quả miền Nam – Kết quả nghiên cứu kỹ thuật canh tác và phòng trừ sâu bệnh hại cây sầu riêng." },
                            { bold: "QCVN 03-MT:2015/BTNMT:", text: "Quy chuẩn kỹ thuật quốc gia về giới hạn cho phép của kim loại nặng trong đất." },
                            { bold: "QCVN 08-MT:2015/BTNMT:", text: "Quy chuẩn kỹ thuật quốc gia về chất lượng nước mặt dùng cho tưới tiêu." },
                            { bold: "TT 50/2016/TT-BYT:", text: "Quy định giới hạn tối đa dư lượng thuốc bảo vệ thực vật trong thực phẩm (MRLs)." },
                            { bold: "Chattanong & Puttadee, 2019:", text: "Đánh giá dấu chân carbon của sầu riêng tươi trong hệ thống nông lâm kết hợp, Thái Lan." }
                        ].map(({ bold, text }) => (
                            <div key={bold} className="flex items-start gap-2">
                                <div className="w-1 h-1 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></div>
                                <span><strong>{bold}</strong> {text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}