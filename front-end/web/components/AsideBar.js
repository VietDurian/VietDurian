import React from "react";
import { Home, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const SidebarItem = ({ icon: Icon, label, href, active }) => (
  <Link
    href={href}
    className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
      active
        ? "bg-emerald-50 text-emerald-800 font-bold"
        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
    }`}
  >
    <Icon
      size={22}
      className={
        active ? "text-emerald-800" : "text-gray-400 group-hover:text-gray-900"
      }
    />
    <span className="text-sm tracking-wide">{label}</span>
  </Link>
);

export default function AsideBar() {
  const pathname = usePathname();

  const menuItems = [
    { icon: Home, label: "Posts", href: "/profile/posts" },
    { icon: Search, label: "Blogs", href: "/profile/blogs" },
  ];

  return (
    <aside className="w-64 h-[95vh] fixed top-10 border-r border-gray-100 bg-white flex flex-col p-5 pt-10">
      {/* Navigation Links */}
      <nav className="flex flex-col flex-1 space-y-1">
        {menuItems.map((item) => (
          <SidebarItem
            key={item.label}
            icon={item.icon}
            label={item.label}
            href={item.href}
          />
        ))}
      </nav>
    </aside>
  );
}
