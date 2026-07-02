import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s — KlarTrade",
    default: "KlarTrade",
  },
};

// Each page in this route group renders its own full-screen layout
// (background, logo, centering) — this wrapper must stay a passthrough
// or the pages get a duplicate header/logo stacked above their own.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
