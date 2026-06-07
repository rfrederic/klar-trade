import { NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";

const MT_CLIENT = "https://mt-client-api-v1.agiliumtrade.agiliumtrade.ai";
const MT_PROVISION = "https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai";

interface Deal {
  id: string;
  symbol: string;
  type: string;
  entryType: string;
  profit: number;
  volume: number;
  time: string;
  price: number;
}

export async function POST() {
  const authClient = await createServerClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const token = process.env.METAAPI_TOKEN;
  if (!token) return NextResponse.json({ error: "MetaApi not configured" }, { status: 500 });

  const supabase = createServiceClient();

  const { data: connection } = await supabase
    .from("broker_connections")
    .select("id, meta_account_id")
    .eq("user_id", user.id)
    .eq("broker", "mt5")
    .eq("status", "connected")
    .single();

  if (!connection?.meta_account_id) {
    return NextResponse.json({ error: "No MT5 account connected" }, { status: 404 });
  }

  const accountId = connection.meta_account_id;
  const headers = { "auth-token": token };

  try {
    await fetch(`${MT_PROVISION}/users/current/accounts/${accountId}/deploy`, { method: "POST", headers });
  } catch { /* non-fatal */ }

  const now = new Date();
  const from = new Date(now);
  from.setDate(from.getDate() - 90);

  const dealsRes = await fetch(
    `${MT_CLIENT}/users/current/accounts/${accountId}/history-deals/time/${from.toISOString()}/${now.toISOString()}`,
    { headers }
  );

  if (!dealsRes.ok) {
    const err = await dealsRes.text();
    return NextResponse.json({ error: `MetaApi error: ${err}` }, { status: 502 });
  }

  const raw = await dealsRes.json();
  const deals: Deal[] = Array.isArray(raw) ? raw : (raw.deals ?? []);

  const closing = deals.filter(
    (d) =>
      (d.entryType === "DEAL_ENTRY_OUT" || d.entryType === "DEAL_ENTRY_INOUT") &&
      d.type !== "DEAL_TYPE_BALANCE" &&
      d.profit !== undefined
  );

  if (closing.length === 0) {
    return NextResponse.json({ synced: 0, trades: [] });
  }

  // Find which external_ids we already have
  const extIds = closing.map((d) => d.id);
  const { data: existing } = await supabase
    .from("trades")
    .select("external_id")
    .eq("user_id", user.id)
    .in("external_id", extIds);

  const existingIds = new Set((existing ?? []).map((r) => r.external_id));
  const newDeals = closing.filter((d) => !existingIds.has(d.id));

  if (newDeals.length === 0) {
    return NextResponse.json({ synced: 0, trades: [] });
  }

  const rows = newDeals.map((d) => ({
    user_id: user.id,
    broker_connection_id: connection.id,
    external_id: d.id,
    symbol: d.symbol,
    direction: d.type === "DEAL_TYPE_SELL" ? "long" : "short",
    exit_price: d.price,
    volume: d.volume,
    pnl: d.profit,
    closed_at: d.time,
    source: "mt5",
  }));

  const { data: inserted, error } = await supabase
    .from("trades")
    .insert(rows)
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ synced: inserted?.length ?? 0, trades: inserted ?? [] });
}
