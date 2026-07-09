import { NextRequest, NextResponse } from "next/server";
import { EARLY_ACCESS_COOKIE, EARLY_ACCESS_MAX_AGE, isValidAccessCode } from "@/lib/early-access";

export async function POST(req: NextRequest) {
  const { code } = await req.json().catch(() => ({ code: null }));

  if (!isValidAccessCode(code)) {
    return NextResponse.json({ error: "Invalid access code" }, { status: 401 });
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set(EARLY_ACCESS_COOKIE, code, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: EARLY_ACCESS_MAX_AGE,
    path: "/",
  });
  return res;
}
