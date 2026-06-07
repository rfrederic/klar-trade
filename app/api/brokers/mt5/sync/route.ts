import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";

const META_PROVISION = "https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai";
const META_CLIENT    = "https://mt-client-api-v1.agiliumtrade.agiliumtrade.ai";

export const maxDuration = 60;

interface MetaDeal {
  id:          string;
  type:        string;   // DEAL_TYPE_BUY | DEAL_TYPE_SELL | DEAL_TYPE_BALANCE | ...
  entryType?:  string;   // DEAL_ENTRY_IN | DEAL_ENTRY_OUT | DEAL_ENTRY_INOUT | DEAL_ENTRY_OUT_BY
  symbol?:     string;
  time:        string;
  volume?:     number;
  price?:      number;
  profit?:     number;
  commission?: number;
  swap?:       number;
  positionId?: string;
  comment?:    string;
}

function fmtBalance(n: number) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

async function retryFetch(url: string, options: RequestInit, retries = 2, delayMs = 3000): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, options);
    if (res.status !== 504 && res.status !== 503) return res;
    if (i < retries - 1) await new Promise(r => setTimeout(r, delayMs));
  }
  return fetch(url, options);
}

export async function POST(req: NextRequest) {
  const authClient = await createServerClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const token = process.env.METAAPI_TOKEN;
  if (!token) return NextResponse.json({ error: "MetaApi token not configured" }, { status: 500 });

  const body = await req.json().catch(() => ({}));
  const connectionId: string | undefined = body.connectionId;
  if (!connectionId) {
    return NextResponse.json({ error: "connectionId is required" }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { data: connection, error: connErr } = await supabase
    .from("broker_connections")
    .select("id, meta_account_id, account_id")
    .eq("id", connectionId)
    .eq("user_id", user.id)
    .eq("broker", "mt5")
    .single();

  if (connErr || !connection?.meta_account_id) {
    return NextResponse.json({ error: "MT5 connection not found" }, { status: 404 });
  }

  const accountId = connection.meta_account_id;
  const headers: Record<string, string> = { "auth-token": token };

  // ── 1. Deploy (ensure the account is connected to MT5 server) ────────────
  console.log("[mt5/sync] deploying account:", accountId);
  try {
    const deployRes = await fetch(
      `${META_PROVISION}/users/current/accounts/${accountId}/deploy`,
      { method: "POST", headers }
    );
    console.log("[mt5/sync] deploy status:", deployRes.status);
  } catch (err) {
    console.warn("[mt5/sync] deploy failed (non-fatal):", err);
  }

  // Wait for the terminal connection to establish
  await new Promise(r => setTimeout(r, 3000));

  // ── 2. Fetch account info (balance / equity) ──────────────────────────────
  let balance: number | null = null;
  let equity: number | null  = null;
  try {
    const infoRes  = await retryFetch(
      `${META_CLIENT}/users/current/accounts/${accountId}/account-information`,
      { headers }
    );
    const infoText = await infoRes.text();
    console.log("[mt5/sync] account-info:", infoRes.status, infoText.slice(0, 300));
    if (infoRes.ok) {
      const info = JSON.parse(infoText);
      balance = info.balance ?? null;
      equity  = info.equity  ?? null;
    }
  } catch (err) {
    console.warn("[mt5/sync] account-info failed (non-fatal):", err);
  }

  // ── 3. Determine sync window ──────────────────────────────────────────────
  // Use the most recent MT5 trade as a high-water mark (minus 5 min overlap).
  // First-ever sync defaults to 90 days back.
  const { data: latestTrade } = await supabase
    .from("trades")
    .select("closed_at")
    .eq("user_id", user.id)
    .eq("source", "mt5")
    .order("closed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const syncFrom = latestTrade?.closed_at
    ? new Date(new Date(latestTrade.closed_at).getTime() - 5 * 60 * 1000)
    : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

  const syncTo  = new Date();
  const startIso = syncFrom.toISOString();
  const endIso   = syncTo.toISOString();

  // ── 4. Fetch history deals ────────────────────────────────────────────────
  const dealsUrl = `${META_CLIENT}/users/current/accounts/${accountId}/history-deals/time/${encodeURIComponent(startIso)}/${encodeURIComponent(endIso)}`;
  console.log("[mt5/sync] GET deals:", dealsUrl);

  let deals: MetaDeal[] = [];
  try {
    const dealsRes  = await retryFetch(dealsUrl, { headers });
    const dealsText = await dealsRes.text();
    console.log("[mt5/sync] deals:", dealsRes.status, dealsText.slice(0, 400));
    if (dealsRes.ok) {
      const parsed = JSON.parse(dealsText);
      deals = Array.isArray(parsed) ? parsed : (parsed.deals ?? []);
    } else {
      console.warn("[mt5/sync] deals fetch failed:", dealsText);
    }
  } catch (err) {
    console.warn("[mt5/sync] deals fetch error:", err);
  }

  // ── 5. Group deals by positionId → completed trade records ───────────────
  const positions = new Map<string, { inDeal: MetaDeal | null; outDeal: MetaDeal | null }>();

  for (const deal of deals) {
    if (!deal.positionId) continue;
    // Skip non-trade deals (balance deposits, credit, etc.)
    if (!["DEAL_TYPE_BUY", "DEAL_TYPE_SELL"].includes(deal.type)) continue;

    const entry = deal.entryType ?? "";
    const pos   = positions.get(deal.positionId) ?? { inDeal: null, outDeal: null };

    if (entry === "DEAL_ENTRY_IN") {
      pos.inDeal = deal;
    } else if (
      entry === "DEAL_ENTRY_OUT" ||
      entry === "DEAL_ENTRY_INOUT" ||
      entry === "DEAL_ENTRY_OUT_BY"
    ) {
      // Keep the latest close deal if there are multiple partials
      if (!pos.outDeal || new Date(deal.time) > new Date(pos.outDeal.time)) {
        pos.outDeal = deal;
      }
    }

    positions.set(deal.positionId, pos);
  }

  const tradeRecords: Array<Record<string, unknown>> = [];

  for (const [, pos] of positions) {
    const { inDeal, outDeal } = pos;
    if (!outDeal) continue; // Open position — skip

    const symbol = (outDeal.symbol ?? inDeal?.symbol ?? "").toUpperCase();
    if (!symbol) continue;

    const profit     = outDeal.profit     ?? 0;
    const commission = (outDeal.commission ?? 0) + (inDeal?.commission ?? 0);
    const swap       = (outDeal.swap       ?? 0) + (inDeal?.swap       ?? 0);
    const pnl        = Math.round((profit + commission + swap) * 100) / 100;

    // Direction: if we have the open (IN) deal, use its type.
    // If only the close (OUT) deal is available (opened before the sync window),
    // infer: a SELL close closes a long; a BUY close closes a short.
    let direction = "long";
    if (inDeal) {
      direction = inDeal.type === "DEAL_TYPE_BUY" ? "long" : "short";
    } else {
      direction = outDeal.type === "DEAL_TYPE_SELL" ? "long" : "short";
    }

    tradeRecords.push({
      user_id:       user.id,
      symbol,
      direction,
      entry_price:   inDeal?.price  ?? null,
      exit_price:    outDeal.price  ?? null,
      pnl,
      volume:        outDeal.volume ?? inDeal?.volume ?? null,
      closed_at:     outDeal.time,
      source:        "mt5",
      followed_plan: true,
    });
  }

  // ── 6. Persist trades ─────────────────────────────────────────────────────
  // Delete unannotated MT5 trades in the sync window before re-inserting to
  // prevent duplicates on re-sync while preserving any user-added notes.
  let inserted = 0;
  if (tradeRecords.length > 0) {
    await supabase
      .from("trades")
      .delete()
      .eq("user_id", user.id)
      .eq("source", "mt5")
      .gte("closed_at", startIso)
      .lte("closed_at", endIso)
      .is("notes", null)
      .is("emotion", null)
      .is("grade", null);

    const { error: insertErr } = await supabase.from("trades").insert(tradeRecords);
    if (insertErr) {
      console.error("[mt5/sync] insert error:", insertErr);
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }
    inserted = tradeRecords.length;
  }

  // ── 7. Count total MT5 trades for this user ───────────────────────────────
  const { count: tradesCount } = await supabase
    .from("trades")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("source", "mt5");

  // ── 8. Update broker_connections with latest balance + trade count ────────
  const updatePayload: Record<string, unknown> = {
    last_sync:    new Date().toISOString(),
    status:       "connected",
    trades_count: tradesCount ?? 0,
  };
  if (balance !== null) updatePayload.balance = fmtBalance(balance);

  await supabase
    .from("broker_connections")
    .update(updatePayload)
    .eq("id", connectionId);

  console.log(
    `[mt5/sync] done — balance: ${balance}, deals: ${deals.length}, imported: ${inserted}`
  );

  return NextResponse.json({
    success:        true,
    balance:        balance != null ? fmtBalance(balance) : null,
    equity,
    dealsFound:     deals.length,
    tradesImported: inserted,
    tradesTotal:    tradesCount ?? 0,
  });
}
