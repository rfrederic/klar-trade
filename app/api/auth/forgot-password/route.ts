import { createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email } = await req.json();
  const supabase = await createServerClient();
  let siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!siteUrl && process.env.VERCEL_URL) {
    siteUrl = `https://${process.env.VERCEL_URL}`;
  }

  if (!siteUrl) {
    siteUrl = process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://klartrade.com";
  }

  const redirectTo = new URL("/reset-password", siteUrl).toString();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
