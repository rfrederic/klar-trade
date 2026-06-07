import type { Metadata } from "next";
import { RefugeClient } from "@/components/dashboard/RefugeClient";

export const metadata: Metadata = { title: "Refuge" };

export default function RefugePage() {
  return <RefugeClient />;
}
