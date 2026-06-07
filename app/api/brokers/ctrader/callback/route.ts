import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

const CT_BASE       = "https://openapi.ctrader.com";
const CT_TOKEN      = `${CT_BASE}/apps/token`;
const CT_ACCOUNTS   = `${CT_BASE}/trading/accounts`;

export const maxDuration = 30;

// ── Types ─────────────────────────────────────────────────────────────────

interface CTDeal {
  dealId?:              string | number;
  positionId?:          string | number;
  symbolId?:            number;
  symbolName?:          string;
  symbol?:              string;
  tradeSide?:           string;   // "BUY" | "SELL"
  filledVolume?:        number;
  volume?:              number;
  executionPrice?:      number;
  price?:               number;
  createTimestamp?:     number;
  closeTimestamp?:      number;
  timestamp?:           number;
  closePositionDetail?: {
    entryPrice?:              number;
    grossProfit?:             number;
    profit?:                  number;
    commission?:              number;
    swap?:                    number;
    balance?:                 number;
    closedVolume?:            number;
    pnlConversionFee?:        number;
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────

function extractError(raw: string): string {
  try {
    const p = JSON.parse(raw);
    return p.message ?? p.error ?? p.errorMessage ?? p.description ?? raw;
  } catch { return raw; }
}

function mapDeal(deal: CTDeal, userId: string): Record<string, unknown> | null {
  // Only map deals that have closePositionDetail (these are position-closing deals)
  const close = deal.closePositionDetail;
  if (!close) return null;

  const symbol = (deal.symbolName ?? deal.symbol ?? String(deal.symbolId ?? "")).toUpperCase();
  if (!symbol) return null;

  // Closing deal: SELL closes LONG, BUY closes SHORT
  const side      = (deal.tradeSide ?? "").toUpperCase();
  const direction = side === "SELL" ? "long" : "short";

  const grossProfit = close.grossProfit ?? close.profit ?? 0;
  const commission  = close.commission  ?? 0;
  const swap        = close.swap        ?? 0;
  const pnl         = Math.round((grossProfit + commission + swap) * 100) / 100;

  // cTrader filledVolume is in units (1 standard lot = 100 units in cTrader's convention)
  const rawVolume = deal.filledVolume ?? deal.volume ?? close.closedVolume ?? null;
  const volume    = rawVolume != null ? rawVolume / 100 : null;

  // Timestamp is in milliseconds
  const tsMs     = deal.closeTimestamp ?? deal.createTimestamp ?? deal.timestamp ?? null;
  const closedAt = tsMs ? new Date(tsMs).toISOString() : null;
  if (!closedAt) return null;

  return {
    user_id:       userId,
    symbol,
    direction,
    entry_price:   close.entryPrice          ?? null,
    exit_price:    deal.executionPrice ?? deal.price ?? null,
    pnl,
    volume,
    closed_at:     closedAt,
    source:        "ctrader",
    followed_plan: true,
  };
}

function getAppBaseUrl(req: NextRequest): string {
  const proto = req.headers.get("x-forwarded-proto") ?? "http";
  const host  = req.headers.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

// ── Route ─────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code  = searchParams.get("code");
  const state = searchParams.get("state");   // = broker_connections.id
  const error = searchParams.get("error");

  const base = getAppBaseUrl(req);

  if (error) {
    console.warn("[ctrader/callback] OAuth denied:", error);
    return NextResponse.redirect(`${base}/brokers?ctrader_error=${encodeURIComponent(error)}`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${base}/brokers?ctrader_error=missing_code`);
  }

  const supabase = createServiceClient();

  // ── 1. Look up the pending connection row ─────────────────────────────────
  const { data: connRow, error: rowErr } = await supabase
    .from("broker_connections")
    .select("id, user_id, meta_account_id, server")
    .eq("id", state)
    .eq("broker", "ctrader")
    .single();

  if (rowErr || !connRow) {
    console.error("[ctrader/callback] connection not found:", rowErr);
    return NextResponse.redirect(`${base}/brokers?ctrader_error=state_not_found`);
  }

  // Decode credentials stored during the connect step
  let clientId     = "";
  let clientSecret = "";
  try {
    const creds  = JSON.parse(connRow.meta_account_id as string);
    clientId     = creds.clientId;
    clientSecret = creds.clientSecret;
  } catch {
    return NextResponse.redirect(`${base}/brokers?ctrader_error=invalid_credentials`);
  }

  const redirectUri = `${base}/api/brokers/ctrader/callback`;

  // ── 2. Exchange authorization code for tokens ─────────────────────────────
  let accessToken  = "";
  let refreshToken = "";
  try {
    const tokenRes = await fetch(CT_TOKEN, {
      method:  "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body:    new URLSearchParams({
        code,
        client_id:     clientId,
        client_secret: clientSecret,
        redirect_uri:  redirectUri,
        grant_type:    "authorization_code",
      }),
    });
    const rawText = await tokenRes.text();
    console.log("[ctrader/callback] token exchange:", tokenRes.status, rawText.slice(0, 300));

    if (!tokenRes.ok) {
      const msg = extractError(rawText);
      return NextResponse.redirect(`${base}/brokers?ctrader_error=${encodeURIComponent(msg)}`);
    }

    const parsed = JSON.parse(rawText);
    accessToken  = parsed.accessToken  ?? parsed.access_token  ?? "";
    refreshToken = parsed.refreshToken ?? parsed.refresh_token ?? "";

    if (!accessToken) throw new Error("No access token in response");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[ctrader/callback] token exchange error:", msg);
    return NextResponse.redirect(`${base}/brokers?ctrader_error=${encodeURIComponent(msg)}`);
  }

  const authHeader = { Authorization: `Bearer ${accessToken}` };

  // ── 3. Fetch accounts ─────────────────────────────────────────────────────
  let ctAccountId   = "";
  let accountLogin  = "";
  let balance       = "—";

  console.log("[ctrader/callback] GET", CT_ACCOUNTS);
  try {
    const accRes  = await fetch(CT_ACCOUNTS, { headers: authHeader });
    const accText = await accRes.text();
    console.log("[ctrader/callback] accounts:", accRes.status, accText.slice(0, 500));

    if (accRes.ok) {
      const body     = JSON.parse(accText);
      // cTrader may wrap accounts in ctidTraderAccounts or data or return an array
      const accounts = Array.isArray(body)
        ? body
        : (body.ctidTraderAccounts ?? body.accounts ?? body.data ?? []);
      const first = accounts[0];
      if (first) {
        ctAccountId  = String(first.ctidTraderAccountId ?? first.id ?? first.accountId ?? "");
        accountLogin = String(first.traderLogin ?? first.login ?? first.accountNumber ?? ctAccountId);
        if (first.balance != null) {
          balance = `$${Number(first.balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
        }
      }
    }
  } catch (err) {
    console.warn("[ctrader/callback] accounts fetch failed (non-fatal):", err);
  }

  // ── 4. Import last 90 days of closed deals ────────────────────────────────
  let imported = 0;

  if (ctAccountId) {
    const from    = Date.now() - 90 * 24 * 60 * 60 * 1000;
    const to      = Date.now();
    const dealsUrl = `${CT_BASE}/trading/accounts/${ctAccountId}/deals?from=${from}&to=${to}`;
    console.log("[ctrader/callback] GET", dealsUrl);

    try {
      const dealsRes  = await fetch(dealsUrl, { headers: authHeader });
      const dealsText = await dealsRes.text();
      console.log("[ctrader/callback] deals:", dealsRes.status, dealsText.slice(0, 500));

      if (dealsRes.ok) {
        const body  = JSON.parse(dealsText);
        const deals: CTDeal[] = Array.isArray(body)
          ? body
          : (body.deal ?? body.deals ?? body.data ?? []);

        const tradeRecords = deals
          .map(d => mapDeal(d, connRow.user_id as string))
          .filter((r): r is Record<string, unknown> => r !== null);

        console.log("[ctrader/callback] mapping", tradeRecords.length, "closed deals");

        if (tradeRecords.length > 0) {
          await supabase
            .from("trades")
            .delete()
            .eq("user_id", connRow.user_id)
            .eq("source", "ctrader")
            .is("notes", null)
            .is("emotion", null)
            .is("grade", null);

          const { error: insertErr } = await supabase.from("trades").insert(tradeRecords);
          if (insertErr) console.error("[ctrader/callback] insert error:", insertErr.message);
          else imported = tradeRecords.length;
        }
      }
    } catch (err) {
      console.warn("[ctrader/callback] deals fetch failed (non-fatal):", err);
    }
  }

  // ── 5. Update the connection row ──────────────────────────────────────────
  await supabase
    .from("broker_connections")
    .update({
      display_name:  `cTrader · ${accountLogin || clientId}`,
      account_id:    ctAccountId || accountLogin,
      access_token:  accessToken,
      refresh_token: refreshToken,
      balance,
      status:        "connected",
      trades_count:  imported,
      last_sync:     new Date().toISOString(),
    })
    .eq("id", connRow.id);

  console.log(`[ctrader/callback] done — account: ${ctAccountId}, imported: ${imported}`);
  return NextResponse.redirect(`${base}/brokers?ctrader=connected`);
}
