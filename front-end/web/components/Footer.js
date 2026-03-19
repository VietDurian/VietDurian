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
    { icon: Facebook, href: "#", color: "hover:bg-blue-500", label: "Facebook" },
    { icon: Instagram, href: "#", color: "hover:bg-pink-500", label: "Instagram" },
    { icon: Twitter, href: "#", color: "hover:bg-sky-400", label: "Twitter" },
    { icon: Youtube, href: "#", color: "hover:bg-red-500", label: "Youtube" },
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

const CONTACTS = [
    { icon: MapPin, text: "123 Đường Nguyễn Huệ, Q.1, TP. Hồ Chí Minh", align: "items-start" },
    { icon: Phone, text: "(+84) 123 456 789", align: "items-center" },
    { icon: Mail, text: "support@vietdurian.vn", align: "items-center" },
];

export default function Footer() {
    return (
        <footer className="bg-emerald-500 text-white">
            <div className="max-w-[1400px] mx-auto px-5 py-14">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1.5fr_1.2fr] gap-10">

                    {/* Col 1: Brand */}
                    <div>
                        <div className="relative w-36 h-16 bg-white/20 rounded-lg ring-1 ring-white/30 mb-4">
                            <Image src="/images/VietDurian-logo.png" alt="VietDurian" fill className="object-contain" />
                        </div>
                        <p className="text-white/80 text-sm leading-relaxed mb-5">
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
                                        aria-label={item.label}
                                        className={`w-9 h-9 rounded-full bg-white/20 ${item.color} flex items-center justify-center transition-all duration-200 hover:scale-110`}
                                    >
                                        <Icon className="w-4 h-4" />
                                    </a>
                                );
                            })}
                        </div>
                    </div>

                    {/* Col 2: Liên kết nhanh */}
                    <div>
                        <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Liên kết nhanh</h3>
                        <ul className="space-y-2.5">
                            {NAV_LINKS.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-white/75 hover:text-yellow-300 text-sm transition-colors duration-200"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Col 3: Dịch vụ */}
                    <div>
                        <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Dịch vụ</h3>
                        <ul className="space-y-3">
                            {SERVICES.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <li key={item.label} className="flex items-start gap-2.5 text-white/75 text-sm">
                                        <Icon className="w-4 h-4 text-yellow-300 mt-0.5 flex-shrink-0" />
                                        <span>{item.label}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {/* Col 4: Liên hệ */}
                    <div>
                        <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Liên hệ</h3>
                        <ul className="space-y-3">
                            {CONTACTS.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <li key={item.text} className={`flex ${item.align} gap-2.5 text-white/75 text-sm`}>
                                        <Icon className="w-4 h-4 text-yellow-300 flex-shrink-0" />
                                        <span>{item.text}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    );
}