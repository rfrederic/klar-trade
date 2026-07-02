import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";
import { isValidTimeZone } from "@/lib/timezone";

export async function GET() {
  const authClient = await createServerClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Fetch avatar_url from profiles table, fall back to user_metadata
  const supabase = createServiceClient();
  const { data: prof } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const avatar_url = prof?.avatar_url ?? user.user_metadata?.avatar_url ?? null;

  return NextResponse.json(
    { email: user.email, user_metadata: user.user_metadata ?? {}, avatar_url },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function PATCH(req: NextRequest) {
  const authClient = await createServerClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { full_name, username, timezone, experience } = await req.json();

  const trim = (v: unknown, max: number): string | undefined =>
    typeof v === "string" ? v.slice(0, max) : undefined;

  const { data, error } = await authClient.auth.updateUser({
    data: {
      full_name:  trim(full_name, 100),
      username:   trim(username, 50),
      timezone:   trim(timezone, 50),
      experience: trim(experience, 50),
    },
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // If a real IANA timezone was sent (e.g. auto-detected via
  // Intl.DateTimeFormat().resolvedOptions().timeZone on the client), persist
  // it to profiles.timezone — this is what server-side date aggregation
  // (journal calendar, analytics, "today" stats) actually reads. The
  // Settings page's cosmetic timezone dropdown sends display labels like
  // "(GMT+0) London" which aren't valid IANA zones, so they're ignored here
  // and only ever land in user_metadata for display.
  if (isValidTimeZone(timezone)) {
    const supabase = createServiceClient();
    await supabase.from("profiles").upsert({ id: user.id, timezone }, { onConflict: "id" });
  }

  return NextResponse.json({ user_metadata: data.user?.user_metadata ?? {} });
}
