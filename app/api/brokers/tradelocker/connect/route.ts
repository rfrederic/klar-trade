import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";

export const maxDuration = 30;

// ── Types ─────────────────────────────────────────────────────────────────

interface TLAccount {
  id?:            string | number;
  accountId?:     string | number;
  accNum?:        string | number;
  accountNumber?: string | number;
  login?:         string | number;
  name?:          string;
  displayName?:   string;
  balance?:       number | string;
}

interface TLOrder {
  id?:           string;
  orderId?:      string;
  symbol?:       string;
  instrument?:   string;
  side?:         string;
  qty?:          number;
  quantity?:     number;
  price?:        number;
  openPrice?:    number;
  entryPrice?:   number;
  filledPrice?:  number;
  closePrice?:   number;
  exitPrice?:    number;
  profitLoss?:   number;
  profit?:       number;
  pnl?:          number;
  commission?:   number;
  swap?:         number;
  status?:       string;
  state?:        string;
  openedAt?:     string;
  closedAt?:     string;
  openTime?:     string;
  closeTime?:    string;
  doneTime?:     string;
  updatedAt?:    string;
}

// ── Helpers ───────────────────────────────────────────────────────────────

function getBase(environment: string): string {
  return environment === "demo"
    ? "https://demo.tradelocker.com/backend-api"
    : "https://live.tradelocker.com/backend-api";
}

function extractError(rawText: string): string {
  try {
    const p = JSON.parse(rawText);
    return p.message ?? p.error ?? p.detail ?? p.errorMessage ?? rawText;
  } catch {
    return rawText;
  }
}

function mapOrder(o: TLOrder, userId: string): Record<string, unknown> | null {
  const closedAt = o.closedAt ?? o.closeTime ?? o.doneTime ?? null;
  if (!closedAt) return null;

  const symbol = (o.symbol ?? o.instrument ?? "").toUpperCase();
  if (!symbol) return null;

  const side      = (o.side ?? "").toLowerCase();
  const direction = side === "sell" ? "short" : "long";

  const rawPnl     = o.profitLoss ?? o.profit ?? o.pnl ?? null;
  const commission = o.commission ?? 0;
  const swap       = o.swap       ?? 0;
  const pnl        = rawPnl != null
    ? Math.round((rawPnl + commission + swap) * 100) / 100
    : null;

  return {
    user_id:       userId,
    symbol,
    direction,
    entry_price:   o.openPrice  ?? o.entryPrice  ?? o.price      ?? null,
    exit_price:    o.closePrice ?? o.exitPrice   ?? o.filledPrice ?? null,
    pnl,
    volume:        o.qty        ?? o.quantity    ?? null,
    closed_at:     closedAt,
    source:        "tradelocker",
    followed_plan: true,
  };
}

// ── Route ─────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const authClient = await createServerClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { email, password, server, environment = "live" } = await req.json();
  if (!email || !password || !server) {
    return NextResponse.json({ error: "email, password and server are required" }, { status: 400 });
  }

  const BASE = getBase(environment);
  console.log("[tradelocker/connect] environment:", environment, "base:", BASE);

  // ── Step 1: POST /auth/jwt/token → accessToken ────────────────────────────

  const tokenUrl = `${BASE}/auth/jwt/token`;
  console.log("[tradelocker/connect] POST", tokenUrl, { email, server });

  let accessToken  = "";
  let refreshToken = "";

  try {
    const tokenRes = await fetch(tokenUrl, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email, password, server }),
    });
    const rawText = await tokenRes.text();
    console.log("[tradelocker/connect] token:", tokenRes.status, rawText.slice(0, 400));

    if (!tokenRes.ok) {
      const msg = extractError(rawText) || `TradeLocker auth returned ${tokenRes.status}`;
      return NextResponse.json({ error: msg }, { status: 401 });
    }

    const parsed = JSON.parse(rawText);
    accessToken  = parsed.accessToken  ?? parsed.access_token  ?? "";
    refreshToken = parsed.refreshToken ?? parsed.refresh_token ?? "";

    if (!accessToken) {
      return NextResponse.json({ error: "No access token returned by TradeLocker" }, { status: 502 });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[tradelocker/connect] token error:", msg);
    return NextResponse.json({ error: `Network error authenticating: ${msg}` }, { status: 502 });
  }

  // ── Step 2: GET /auth/jwt/all-accounts → accountId + accNum ──────────────

  const accountsUrl = `${BASE}/auth/jwt/all-accounts`;
  console.log("[tradelocker/connect] GET", accountsUrl);

  let accountId   = "";
  let accNum      = "";
  let balance     = "—";
  let displayName = `TradeLocker · ${server}`;

  try {
    const accRes  = await fetch(accountsUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const accText = await accRes.text();
    console.log("[tradelocker/connect] all-accounts:", accRes.status, accText.slice(0, 600));

    if (!accRes.ok) {
      const msg = extractError(accText) || `Failed to fetch accounts (${accRes.status})`;
      return NextResponse.json({ error: msg }, { status: 502 });
    }

    const body = JSON.parse(accText);
    // TL wraps results in body.d.d in some API versions
    const accounts: TLAccount[] = Array.isArray(body)
      ? body
      : (body.accounts ?? body.d?.d ?? []);

    if (accounts.length === 0) {
      return NextResponse.json(
        { error: "No accounts found for this TradeLocker login. Check your server name." },
        { status: 400 }
      );
    }

    const first = accounts[0];
    accountId   = String(first.id ?? first.accountId ?? "");
    accNum      = String(first.accNum ?? first.accountNumber ?? first.login ?? accountId);
    displayName = first.displayName ?? first.name ?? `TradeLocker · ${server}`;

    if (first.balance != null) {
      balance = `$${Number(first.balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
    }

    console.log("[tradelocker/connect] accountId:", accountId, "accNum:", accNum, "balance:", balance);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[tradelocker/connect] accounts error:", msg);
    return NextResponse.json({ error: `Failed to load accounts: ${msg}` }, { status: 502 });
  }

  // ── Persist connection ────────────────────────────────────────────────────

  const supabase = createServiceClient();
  const { data: connRow, error: connErr } = await supabase
    .from("broker_connections")
    .upsert(
      {
        user_id:       user.id,
        broker:        "tradelocker",
        display_name:  displayName,
        account_id:    accountId,
        account_num:   accNum,
        balance,
        server,
        environment,
        access_token:  accessToken,
        refresh_token: refreshToken,
        status:        "connected",
        last_sync:     new Date().toISOString(),
        trades_count:  0,
      },
      { onConflict: "user_id,broker,server" }
    )
    .select()
    .single();

  if (connErr) {
    console.error("[tradelocker/connect] db upsert error:", connErr.message);
    return NextResponse.json({ error: connErr.message }, { status: 500 });
  }

  // ── Step 3: GET /trade/accounts/{accountId}/ordersHistory ─────────────────

  if (accountId) {
    const historyUrl = `${BASE}/trade/accounts/${accountId}/ordersHistory`;
    console.log("[tradelocker/connect] GET", historyUrl, "accNum:", accNum);

    try {
      const histRes  = await fetch(historyUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          accNum:        accNum,
        },
      });
      const histText = await histRes.text();
      console.log("[tradelocker/connect] ordersHistory:", histRes.status, histText.slice(0, 600));

      if (histRes.ok) {
        const body = JSON.parse(histText);
        // TL may wrap in body.d.d
        const raw: TLOrder[] = Array.isArray(body)
          ? body
          : (body.orders ?? body.data ?? body.d?.d ?? body.history ?? []);

        const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

        const tradeRecords = raw
          .filter(o => {
            const t = o.closedAt ?? o.closeTime ?? o.doneTime;
            return t ? new Date(t) >= since : false;
          })
          .map(o => mapOrder(o, user.id))
          .filter((r): r is Record<string, unknown> => r !== null);

        console.log("[tradelocker/connect] importing", tradeRecords.length, "trades from last 90 days");

        if (tradeRecords.length > 0) {
          await supabase
            .from("trades")
            .delete()
            .eq("user_id", user.id)
            .eq("source", "tradelocker")
            .is("notes", null)
            .is("emotion", null)
            .is("grade", null);

          const { error: insertErr } = await supabase.from("trades").insert(tradeRecords);
          if (insertErr) {
            console.error("[tradelocker/connect] insert error:", insertErr.message);
          } else {
            await supabase
              .from("broker_connections")
              .update({ trades_count: tradeRecords.length })
              .eq("id", connRow.id);
          }
        }
      } else {
        console.warn("[tradelocker/connect] ordersHistory failed:", extractError(histText));
      }
    } catch (err) {
      console.warn("[tradelocker/connect] ordersHistory error (non-fatal):", err);
    }
  }

  return NextResponse.json({ success: true, connection: connRow });
}
