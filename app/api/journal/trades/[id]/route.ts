import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";

const CLOSE_TYPES = ["tp", "sl", "manual", "breakeven"] as const;

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const authClient = await createServerClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  if (body.close_type != null && !CLOSE_TYPES.includes(body.close_type)) {
    return NextResponse.json({ error: "Invalid close_type" }, { status: 400 });
  }

  const editableAnytime = ["emotion", "grade", "notes", "followed_plan", "setup", "tags"];
  // Core trade data may only be edited for manually-entered trades — editing
  // a broker-synced trade's price/size here would drift from the broker's
  // own record and could be re-clobbered (or duplicated) on the next sync.
  const manualOnly = [
    "symbol", "direction", "entry_price", "exit_price", "pnl", "volume", "closed_at",
    "take_profit", "stop_loss", "commission", "swap", "close_type",
  ];

  const update: Record<string, unknown> = {};
  for (const key of editableAnytime) {
    if (key in body) update[key] = body[key];
  }

  const supabase = createServiceClient();

  const requestedManualFields = manualOnly.filter((key) => key in body);
  if (requestedManualFields.length > 0) {
    const { data: existing } = await supabase
      .from("trades")
      .select("source")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!existing) return NextResponse.json({ error: "Trade not found" }, { status: 404 });
    if (existing.source !== "manual") {
      return NextResponse.json({ error: "Only manually-entered trades can be edited" }, { status: 403 });
    }
    for (const key of requestedManualFields) update[key] = body[key];
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("trades")
    .update(update)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ trade: data });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const authClient = await createServerClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("trades")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
