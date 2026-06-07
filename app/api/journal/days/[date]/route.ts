import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;

  const authClient = await createServerClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceClient();
  const { data } = await supabase
    .from("journal_days")
    .select("notes, emotion")
    .eq("user_id", user.id)
    .eq("date", date)
    .maybeSingle();

  return NextResponse.json({ notes: data?.notes ?? "", emotion: data?.emotion ?? "" });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;

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
