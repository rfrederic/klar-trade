import { Suspense } from "react";
import ResetPasswordContent from "./ResetPasswordContent";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050508]" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
