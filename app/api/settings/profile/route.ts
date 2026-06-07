import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";

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

  const { data, error } = await authClient.auth.updateUser({
    data: { full_name, username, timezone, experience },
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ user_metadata: data.user?.user_metadata ?? {} });
}
