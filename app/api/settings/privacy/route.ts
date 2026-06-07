import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";

const ALLOWED_KEYS = ["analytics_consent", "ai_training_consent", "email_notifications", "public_profile"] as const;
type PrivacyKey = (typeof ALLOWED_KEYS)[number];

export async function GET() {
  const authClient = await createServerClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceClient();
  const { data } = await supabase
    .from("profiles")
    .select("analytics_consent, ai_training_consent, email_notifications, public_profile")
    .eq("id", user.id)
    .maybeSingle();

  return NextResponse.json({
    analytics_consent:   data?.analytics_consent   ?? true,
    ai_training_consent: data?.ai_training_consent ?? false,
    email_notifications: data?.email_notifications ?? true,
    public_profile:      data?.public_profile      ?? false,
  }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(req: NextRequest) {
  const authClient = await createServerClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { key, value } = await req.json();
  if (!ALLOWED_KEYS.includes(key as PrivacyKey)) {
    return NextResponse.json({ error: "Invalid key" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("profiles")
    .upsert({ id: user.id, [key]: value }, { onConflict: "id" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
