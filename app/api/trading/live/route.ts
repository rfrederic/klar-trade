import { NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";

const MT_CLIENT = "https://mt-client-api-v1.agiliumtrade.agiliumtrade.ai";
const MT_PROVISION = "https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai";

export async function GET() {
  const authClient = await createServerClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const token = process.env.METAAPI_TOKEN;
  if (!token) return NextResponse.json({ error: "MetaApi not configured" }, { status: 500 });

  const supabase = createServiceClient();
  const { data: connection } = await supabase
    .from("broker_connections")
    .select("meta_account_id")
    .eq("user_id", user.id)
    .eq("broker", "mt5")
    .eq("status", "connected")
    .single();

  if (!connection?.meta_account_id) {
    return NextResponse.json({ connected: false, accountInfo: null, positions: [], orders: [], todayPnl: 0, todayTrades: 0 });
  }

  const accountId = connection.meta_account_id;
  const headers = { "auth-token": token };

  // Ensure deployed
  try {
    await fetch(`${MT_PROVISION}/users/current/accounts/${accountId}/deploy`, { method: "POST", headers });
  } catch { /* non-fatal */ }

  // Fetch all in parallel
  const [accountRes, positionsRes, ordersRes] = await Promise.allSettled([
    fetch(`${MT_CLIENT}/users/current/accounts/${accountId}/account-information`, { headers }),
    fetch(`${MT_CLIENT}/users/current/accounts/${accountId}/positions`, { headers }),
    fetch(`${MT_CLIENT}/users/current/accounts/${accountId}/orders`, { headers }),
  ]);

  const accountInfo = accountRes.status === "fulfilled" && accountRes.value.ok
    ? await accountRes.value.json().catch(() => null)
    : null;

  const positions = positionsRes.status === "fulfilled" && positionsRes.value.ok
    ? await positionsRes.value.json().catch(() => [])
    : [];

  const orders = ordersRes.status === "fulfilled" && ordersRes.value.ok
    ? await ordersRes.value.json().catch(() => [])
    : [];

  // Today's closed trades from journal
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const { data: todayTrades } = await supabase
    .from("trades")
    .select("pnl")
    .eq("user_id", user.id)
    .gte("closed_at", todayStart.toISOString());

  const todayPnl = (todayTrades ?? []).reduce((s, t) => s + (t.pnl ?? 0), 0);

  return NextResponse.json({
    connected: true,
    accountInfo,
    positions: Array.isArray(positions) ? positions : [],
    orders: Array.isArray(orders) ? orders : [],
    todayPnl,
    todayTrades: todayTrades?.length ?? 0,
  });
}
