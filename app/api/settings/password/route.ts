import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function PATCH(req: NextRequest) {
  const authClient = await createServerClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { current_password, new_password } = await req.json();
  if (!new_password || new_password.length < 8) {
    return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });
  }

  // Verify current password
  const { error: signInError } = await authClient.auth.signInWithPassword({
    email: user.email!,
    password: current_password,
  });
  if (signInError) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });

  const { error } = await authClient.auth.updateUser({ password: new_password });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
