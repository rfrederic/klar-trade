import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";
import { isValidTimeZone } from "@/lib/timezone";

export async function GET() {
  const authClient = await createServerClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Fetch avatar_url + account_size from profiles table, fall back to user_metadata for avatar
  const supabase = createServiceClient();
  const { data: prof } = await supabase
    .from("profiles")
    .select("avatar_url, account_size")
    .eq("id", user.id)
    .maybeSingle();

  const avatar_url = prof?.avatar_url ?? user.user_metadata?.avatar_url ?? null;

  return NextResponse.json(
    {
      email: user.email,
      user_metadata: user.user_metadata ?? {},
      avatar_url,
      account_size: prof?.account_size ?? null,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function PATCH(req: NextRequest) {
  const authClient = await createServerClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { full_name, username, timezone, experience, account_size } = await req.json();

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

  const supabase = createServiceClient();

  // If a real IANA timezone was sent (e.g. auto-detected via
  // Intl.DateTimeFormat().resolvedOptions().timeZone on the client), persist
  // it to profiles.timezone — this is what server-side date aggregation
  // (journal calendar, analytics, "today" stats) actually reads. The
  // Settings page's cosmetic timezone dropdown sends display labels like
  // "(GMT+0) London" which aren't valid IANA zones, so they're ignored here
  // and only ever land in user_metadata for display.
  if (isValidTimeZone(timezone)) {
    const { error: tzError } = await supabase.from("profiles").upsert({ id: user.id, timezone }, { onConflict: "id" });
    if (tzError) return NextResponse.json({ error: tzError.message }, { status: 500 });
  }

  // account_size is the user's manually-entered starting balance, used to
  // compute balance/equity and position sizing when no broker is connected.
  // Sending `null` clears it (e.g. after connecting a real broker).
  if (account_size !== undefined) {
    const size = account_size === null ? null : Number(account_size);
    if (size !== null && (!Number.isFinite(size) || size < 0)) {
      return NextResponse.json({ error: "account_size must be a non-negative number" }, { status: 400 });
    }
    const { error: sizeError } = await supabase.from("profiles").upsert({ id: user.id, account_size: size }, { onConflict: "id" });
    if (sizeError) return NextResponse.json({ error: sizeError.message }, { status: 500 });
  }

  return NextResponse.json({ user_metadata: data.user?.user_metadata ?? {} });
}
