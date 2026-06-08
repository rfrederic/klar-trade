import { Suspense } from "react";
import JournalContent from "./JournalContent";

export default function JournalPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0A]" />}>
      <JournalContent />
    </Suspense>
  );
}
