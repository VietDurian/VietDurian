// Nguyễn Trọng Quý - CE180596
import { Suspense } from "react";
import VerifyEmailContent from "./component/VerifyEmailContent";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
