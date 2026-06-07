import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";

const TL_LIVE_BASE = "https://ttlivewebapi.tradelocker.com";
const TL_DEMO_BASE = "https://tttestwebapi.tradelocker.com";

export async function POST(req: NextRequest) {
  const authClient = await createServerClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { email, password, server, environment } = await req.json();

  if (!email || !password || !server) {
    return NextResponse.json({ error: "email, password and server are required" }, { status: 400 });
  }

  const base = environment === "demo" ? TL_DEMO_BASE : TL_LIVE_BASE;
  const authUrl = `${base}/api/auth/jwt/token`;

  // 1. Authenticate with TradeLocker
  console.log("[tradelocker/connect] POST", authUrl, { email, server, environment });

  let authData: { accessToken: string; refreshToken: string };
  try {
    const authRes = await fetch(authUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, server }),
    });

    const rawText = await authRes.text();
    console.log("[tradelocker/connect] auth response", authRes.status, rawText);

    if (!authRes.ok) {
      // Try to parse JSON for a structured message, fall back to raw text
      let message = rawText;
      try {
        const parsed = JSON.parse(rawText);
        message = parsed.message ?? parsed.error ?? parsed.detail ?? rawText;
      } catch {
        // rawText is already the message
      }
      return NextResponse.json(
        { error: message || `TradeLocker returned ${authRes.status}` },
        { status: 401 }
      );
    }

    authData = JSON.parse(rawText);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[tradelocker/connect] network error:", message);
    return NextResponse.json(
      { error: `Network error reaching TradeLocker: ${message}` },
      { status: 502 }
    );
  }

  // 2. Fetch accounts to get balance and account number
  const accountsUrl = `${base}/api/trade/accounts`;
  console.log("[tradelocker/connect] GET", accountsUrl);

  let accountInfo = { id: "", accountNumber: "", balance: "—", currency: "USD" };
  try {
    const accRes = await fetch(accountsUrl, {
      headers: { Authorization: `Bearer ${authData.accessToken}` },
    });

    const accText = await accRes.text();
    console.log("[tradelocker/connect] accounts response", accRes.status, accText);

    if (accRes.ok) {
      const accounts = JSON.parse(accText);
      const first = Array.isArray(accounts) ? accounts[0] : accounts?.accounts?.[0];
      if (first) {
        accountInfo = {
          id: first.id ?? first.accountId ?? "",
          accountNumber: first.accountNumber ?? first.login ?? first.id ?? "",
          balance: first.balance != null
            ? `$${Number(first.balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
            : "—",
          currency: first.currency ?? "USD",
        };
      }
    }
  } catch (err) {
    console.warn("[tradelocker/connect] accounts fetch failed (non-fatal):", err);
  }

  // 3. Persist in Supabase
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("broker_connections")
    .upsert(
      {
        user_id: user.id,
        broker: "tradelocker",
        display_name: `TradeLocker · ${server}`,
        account_id: accountInfo.accountNumber,
        balance: accountInfo.balance,
        server,
        environment: environment ?? "live",
        access_token: authData.accessToken,
        refresh_token: authData.refreshToken,
        status: "connected",
        last_sync: new Date().toISOString(),
      },
      { onConflict: "user_id,broker,server" }
    )
    .select()
    .single();

  if (error) {
    console.error("[tradelocker/connect] supabase upsert error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, connection: data });
}
