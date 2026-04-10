"use client";

// Nguyễn Trọng Quý - CE180596
import { Suspense } from "react";
import VerifyEmailContent from "./component/VerifyEmailContent";
import FloatingLangToggle from "@/components/FloatingLangToggle";
import { useLanguage } from "@/context/LanguageContext";

export default function VerifyEmailPage() {
  const { language } = useLanguage();
  const loadingText = language === "vi" ? "Đang tải..." : "Loading...";

  return (
    <>
      <FloatingLangToggle />
      <Suspense fallback={<div>{loadingText}</div>}>
        <VerifyEmailContent />
      </Suspense>
    </>
  );
}
