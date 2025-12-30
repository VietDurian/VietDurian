import Image from "next/image";
import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-emerald-800 text-white py-8 px-4 lg:px-6">
            <div className="max-w-[1400px] mx-auto">
                {/* Main Footer Content */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">

                    {/* Logo */}
                    <div className="relative w-40 h-20 bg-white/10 backdrop-blur-sm rounded-lg ring-2 ring-white/20">
                        <Image
                            src="/images/VietDurian-logo.png"
                            alt="VietDurian"
                            fill
                            className="object-contain"
                        />
                    </div>
                    {/* Navigation Links */}
                    <nav className="flex flex-wrap items-center justify-center gap-6 text-sm">
                        <Link href="/gioi-thieu" className="hover:text-lime-400 transition-colors">
                            Giới Thiệu
                        </Link>
                        <Link href="/san-pham" className="hover:text-lime-400 transition-colors">
                            Sản Phẩm
                        </Link>
                        <Link href="/huong-dan" className="hover:text-lime-400 transition-colors">
                            Hướng Dẫn
                        </Link>
                        <Link href="/blog" className="hover:text-lime-400 transition-colors">
                            Blog
                        </Link>
                        <Link href="/lien-he" className="hover:text-lime-400 transition-colors">
                            Liên Hệ
                        </Link>
                    </nav>

                    {/* CTA Button */}
                    <Link
                        href="/lien-he"
                        className="px-6 py-2.5 bg-lime-400 text-emerald-900 rounded-full font-medium hover:bg-lime-500 transition-colors flex items-center gap-2"
                    >
                        Liên Hệ Ngay
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>

                {/* Bottom Copyright */}
                <div className="border-t border-emerald-700 pt-6 text-center">
                    <p className="text-sm text-emerald-100">
                        © 2025 VietDurian, Inc. • <Link href="/chinh-sach" className="hover:text-white transition-colors">Chính Sách</Link> • <Link href="/dieu-khoan" className="hover:text-white transition-colors">Điều Khoản</Link> • <Link href="/sitemap" className="hover:text-white transition-colors">Sitemap</Link>
                    </p>
                </div>
            </div>
        </footer>
    );
}