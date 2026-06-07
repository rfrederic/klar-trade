import { NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  const authClient = await createServerClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceClient();

  const [
    { data: trades },
    { data: journalDays },
    { data: refugeSessions },
    { data: refugeCheckins },
  ] = await Promise.all([
    supabase.from("trades").select("*").eq("user_id", user.id).order("closed_at", { ascending: false }),
    supabase.from("journal_days").select("*").eq("user_id", user.id).order("date", { ascending: false }),
    supabase.from("sanctuary_sessions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("sanctuary_checkins").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
  ]);

  return NextResponse.json({
    exported_at: new Date().toISOString(),
    user_id: user.id,
    trades: trades ?? [],
    journal_days: journalDays ?? [],
    refuge_sessions: refugeSessions ?? [],
    refuge_checkins: refugeCheckins ?? [],
  }, { headers: { "Cache-Control": "no-store" } });
}
