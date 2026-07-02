import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";
import { resolveUserTimezone } from "@/lib/timezone-server";
import { getLocalDateString, localDayRangeUtc } from "@/lib/timezone";

// `date` is always the user's local calendar date ("YYYY-MM-DD"), computed
// client-side from the browser's own timezone (see JournalContent.tsx). It is
// stored and matched as a plain string key — never parsed via `new Date()`,
// which would reinterpret a bare "YYYY-MM-DD" as UTC midnight and could shift
// it to the wrong day for the user.
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(req: NextRequest, { params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  if (!DATE_RE.test(date)) {
    return NextResponse.json({ error: "date must be YYYY-MM-DD" }, { status: 400 });
  }

  const authClient = await createServerClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceClient();
  const timeZone = await resolveUserTimezone(supabase, user.id, req.nextUrl.searchParams.get("tz"));

  // Widen the DB query to a UTC window guaranteed to cover the local day at
  // any offset, then filter to the exact local day by converting each
  // trade's UTC timestamp into the user's timezone and comparing dates —
  // this is what actually determines "which day" a trade belongs to for
  // the user, not the raw UTC date.
  const { start, end } = localDayRangeUtc(date, timeZone);
  const widenedStart = new Date(start.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const widenedEnd = new Date(end.getTime() + 24 * 60 * 60 * 1000).toISOString();

  const [{ data: dayRow }, { data: allTrades }] = await Promise.all([
    supabase
      .from("journal_days")
      .select("notes, emotion")
      .eq("user_id", user.id)
      .eq("date", date)
      .maybeSingle(),
    supabase
      .from("trades")
      .select("*")
      .eq("user_id", user.id)
      .gte("closed_at", widenedStart)
      .lt("closed_at", widenedEnd)
      .order("closed_at", { ascending: false }),
  ]);

  const trades = (allTrades ?? []).filter(
    (t) => getLocalDateString(t.closed_at, timeZone) === date
  );

  return NextResponse.json({
    notes: dayRow?.notes ?? "",
    emotion: dayRow?.emotion ?? "",
    trades,
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  if (!DATE_RE.test(date)) {
    return NextResponse.json({ error: "date must be YYYY-MM-DD" }, { status: 400 });
  }

  const authClient = await createServerClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const row: Record<string, unknown> = { user_id: user.id, date };
  if ("notes" in body) row.notes = body.notes;
  if ("emotion" in body) row.emotion = body.emotion;

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("journal_days")
    .upsert(row, { onConflict: "user_id,date" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
