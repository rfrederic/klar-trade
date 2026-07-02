import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";
import { resolveUserTimezone } from "@/lib/timezone-server";
import { localDayRangeUtc } from "@/lib/timezone";

export async function GET(req: NextRequest) {
  const authClient = await createServerClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const date = req.nextUrl.searchParams.get("date");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "date param required (YYYY-MM-DD)" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const timeZone = await resolveUserTimezone(supabase, user.id, req.nextUrl.searchParams.get("tz"));
  // `date` is the user's local calendar date — convert to the matching UTC range.
  const { start, end } = localDayRangeUtc(date, timeZone);

  const { data, error } = await supabase
    .from("sanctuary_sessions")
    .select("mood, biome, duration_min, created_at")
    .eq("user_id", user.id)
    .gte("created_at", start.toISOString())
    .lt("created_at", end.toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data)  return NextResponse.json({ context: null });

  return NextResponse.json({
    context: {
      mood:         data.mood,
      biome:        data.biome,
      duration_min: data.duration_min,
      recorded_at:  data.created_at,
    },
  });
}
