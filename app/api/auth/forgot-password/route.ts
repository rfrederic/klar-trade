import { createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email } = await req.json();
  const supabase = await createServerClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: "https://klartrade.com/reset-password",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
