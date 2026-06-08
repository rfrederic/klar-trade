import { Suspense } from "react";
import BrokersContent from "./BrokersContent";

export default function BrokersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0A]" />}>
      <BrokersContent />
    </Suspense>
  );
}
