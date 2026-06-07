import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const authClient = await createServerClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { type, message } = await req.json();
  if (!message?.trim()) return NextResponse.json({ error: "Message is required" }, { status: 400 });

  const supabase = createServiceClient();
  const { error } = await supabase.from("support_tickets").insert({
    user_id: user.id,
    type:    type ?? "General Question",
    message: message.trim(),
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
