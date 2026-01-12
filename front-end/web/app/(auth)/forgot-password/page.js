// Nguyễn Trọng Quý - CE180596
import { Suspense } from "react";
import ForogtPasswordContent from "./component/ForgotPasswordContent";

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ForogtPasswordContent />
    </Suspense>
  );
}
