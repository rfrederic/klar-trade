import LandingPageClient from "@/components/LandingPageClient";
import ComingSoonClient from "@/components/ComingSoonClient";
import { COMING_SOON } from "@/lib/early-access";

export default function Page() {
  if (COMING_SOON) return <ComingSoonClient />;
  return <LandingPageClient />;
}
