import { Suspense } from "react";
import GardenDashboard from "./GardenDashboard";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Đang tải...</div>}>
      <GardenDashboard />
    </Suspense>
  );
}
