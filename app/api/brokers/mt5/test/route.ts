import { NextResponse } from "next/server";

const METAAPI_BASE = "https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai";

export async function GET() {
  const token = process.env.METAAPI_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "METAAPI_TOKEN not set in .env.local" }, { status: 500 });
  }

  // Test 1: token validity — list existing accounts
  let accounts: unknown = null;
  let accountsError: string | null = null;
  let accountsStatus = 0;
  try {
    const res = await fetch(`${METAAPI_BASE}/users/current/accounts?limit=10`, {
      headers: { "auth-token": token },
    });
    accountsStatus = res.status;
    if (res.ok) {
      accounts = await res.json();
    } else {
      accountsError = await res.text();
    }
  } catch (e) {
    accountsError = String(e);
  }

  return NextResponse.json({
    tokenConfigured: true,
    tokenPreview: `${token.slice(0, 20)}...`,
    accountsStatus,
    accounts,
    accountsError,
  });
}
