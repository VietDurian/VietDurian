"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function FloatingLangToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      onClick={() => setLanguage(language === "vi" ? "en" : "vi")}
      className="fixed top-5 right-5 z-1002 flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white/95 backdrop-blur-sm shadow-sm hover:border-emerald-500 hover:text-emerald-600 text-gray-600 text-sm font-semibold transition"
      aria-label="Toggle language"
    >
      {language === "vi" ? "EN" : "VI"}
    </button>
  );
}
