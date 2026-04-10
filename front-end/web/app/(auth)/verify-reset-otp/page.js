"use client";

// Nguyễn Trọng Quý - CE180596
import { Suspense } from "react";
import VerifyResetOTPContent from "./component/VerifyResetOTPContent";
import FloatingLangToggle from "@/components/FloatingLangToggle";
import { useLanguage } from "@/context/LanguageContext";

export default function ForgotPasswordPage() {
  const { language } = useLanguage();
  const loadingText = language === "vi" ? "Đang tải..." : "Loading...";

  return (
    <>
      <FloatingLangToggle />
      <Suspense fallback={<div>{loadingText}</div>}>
        <VerifyResetOTPContent />
      </Suspense>
    </>
  );
}
