import Image from "next/image";
import Link from "next/link";
import {
    MapPin,
    Phone,
    Mail,
    Facebook,
    Instagram,
    Youtube,
    Twitter,
    Sprout,
    Handshake,
    Wrench,
    BookOpen,
} from "lucide-react";

const SOCIAL_LINKS = [
    { icon: Facebook, href: "#" },
    { icon: Instagram, href: "#" },
    { icon: Twitter, href: "#" },
    { icon: Youtube, href: "#" },
];

const NAV_LINKS = [
    { label: "Trang Chủ", href: "/" },
    { label: "Hướng Dẫn", href: "/guide" },
    { label: "Sản Phẩm", href: "/products" },
    { label: "Blog", href: "/blogs" },
    { label: "Bài Viết", href: "/posts" },
    { label: "Về Chúng Tôi", href: "/about-us" },
];

const SERVICES = [
    { icon: Sprout, label: "Nông dân – Công bố vườn & lô sầu riêng" },
    { icon: Handshake, label: "Thương lái – Tìm nguồn hàng theo vụ" },
    { icon: Wrench, label: "Dịch vụ – Phun thuốc, bón phân, cắt tỉa" },
    { icon: BookOpen, label: "Chuyên gia – Chia sẻ kiến thức canh tác" },
];

export default function Footer() {
    return (
        <footer className="bg-emerald-900 text-white">
            <div className="max-w-[1400px] mx-auto px-5 py-14">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1.5fr_1.2fr] gap-10">

                    {/* Col 1: Brand */}
                    <div>
                        <div className="relative w-36 h-16 bg-white/10 rounded-lg ring-1 ring-white/20 mb-4">
                            <Image
                                src="/images/VietDurian-logo.png"
                                alt="VietDurian"
                                fill
                                className="object-contain"
                            />
                        </div>
                        <p className="text-emerald-200 text-sm leading-relaxed mb-5">
                            Nền tảng kiến thức và thương mại sầu riêng uy tín, kết nối nông dân với thị trường trong và ngoài nước.
                        </p>
                        <div className="flex items-center gap-3">
                            {SOCIAL_LINKS.map((item, i) => {
                                const Icon = item.icon;
                                return (
                                    <a
                                        key={i}
                                        href={item.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-emerald-600 flex items-center justify-center transition-colors duration-200"
                                    >
                                        <Icon className="w-4 h-4" />
                                    </a>
                                );
                            })}
                        </div>
                    </div>

                    {/* Col 2: Liên kết nhanh */}
                    <div>
                        <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
                            Liên kết nhanh
                        </h3>
                        <ul className="space-y-2.5">
                            {NAV_LINKS.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-emerald-200 hover:text-white text-sm transition-colors duration-200"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Col 3: Dịch vụ */}
                    <div>
                        <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
                            Dịch vụ
                        </h3>
                        <ul className="space-y-3">
                            {SERVICES.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <li key={item.label} className="flex items-start gap-2.5 text-emerald-200 text-sm">
                                        <Icon className="w-4 h-4 text-lime-400 mt-0.5 flex-shrink-0" />
                                        <span>{item.label}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {/* Col 4: Liên hệ */}
                    <div>
                        <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
                            Liên hệ
                        </h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-2.5 text-emerald-200 text-sm">
                                <MapPin className="w-4 h-4 text-lime-400 mt-0.5 flex-shrink-0" />
                                <span>123 Đường Nguyễn Huệ, Q.1, TP. Hồ Chí Minh</span>
                            </li>
                            <li className="flex items-center gap-2.5 text-emerald-200 text-sm">
                                <Phone className="w-4 h-4 text-lime-400 flex-shrink-0" />
                                <span>(+84) 123 456 789</span>
                            </li>
                            <li className="flex items-center gap-2.5 text-emerald-200 text-sm">
                                <Mail className="w-4 h-4 text-lime-400 flex-shrink-0" />
                                <span>support@vietdurian.vn</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    );
}