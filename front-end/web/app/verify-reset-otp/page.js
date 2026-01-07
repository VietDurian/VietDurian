// Nguyễn Trọng Quý - CE180596
import { Suspense } from "react";
import VerifyResetOTPContent from "./component/VerifyResetOTPContent";

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyResetOTPContent />
    </Suspense>
  );
}
