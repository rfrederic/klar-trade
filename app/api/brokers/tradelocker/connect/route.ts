import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";

const TL_BASE = "https://broker-api.tradelocker.com";

// ── Types ─────────────────────────────────────────────────────────────────

interface TLOrder {
  id?:           string;
  orderId?:      string;
  symbol?:       string;
  instrument?:   string;
  side?:         string;   // "buy" | "sell"
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
  createdAt?:    string;
  updatedAt?:    string;
}

// ── Helpers ───────────────────────────────────────────────────────────────

function extractError(rawText: string): string {
  try {
    const p = JSON.parse(rawText);
    return p.message ?? p.error ?? p.detail ?? p.errorMessage ?? rawText;
  } catch {
    return rawText;
  }
}

function isClosedOrder(o: TLOrder): boolean {
  const s = (o.status ?? o.state ?? "").toLowerCase();
  return ["filled", "closed", "done", "completed"].some(k => s.includes(k));
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
    entry_price:   o.openPrice   ?? o.entryPrice  ?? o.price       ?? null,
    exit_price:    o.closePrice  ?? o.exitPrice   ?? o.filledPrice  ?? null,
    pnl,
    volume:        o.qty         ?? o.quantity    ?? null,
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

  const { email, password, server, environment } = await req.json();
  if (!email || !password || !server) {
    return NextResponse.json({ error: "email, password and server are required" }, { status: 400 });
  }

  // ── 1. Authenticate ───────────────────────────────────────────────────────
  const authUrl = `${TL_BASE}/auth/jwt/token`;
  console.log("[tradelocker/connect] POST", authUrl, { email, server, environment });

  let accessToken  = "";
  let refreshToken = "";
  try {
    const authRes = await fetch(authUrl, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email, password, server }),
    });
    const rawText = await authRes.text();
    console.log("[tradelocker/connect] auth:", authRes.status, rawText.slice(0, 400));

    if (!authRes.ok) {
      return NextResponse.json(
        { error: extractError(rawText) || `TradeLocker returned ${authRes.status}` },
        { status: 401 }
      );
    }

    const parsed = JSON.parse(rawText);
    accessToken  = parsed.accessToken  ?? parsed.access_token  ?? "";
    refreshToken = parsed.refreshToken ?? parsed.refresh_token ?? "";

    if (!accessToken) {
      return NextResponse.json({ error: "No access token in response" }, { status: 502 });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[tradelocker/connect] auth error:", msg);
    return NextResponse.json({ error: `Network error: ${msg}` }, { status: 502 });
  }

  // ── 2. Fetch accounts ─────────────────────────────────────────────────────
  const accountsUrl = `${TL_BASE}/trade/accounts`;
  console.log("[tradelocker/connect] GET", accountsUrl);

  let tlAccountId   = "";
  let accountNumber = "";
  let balance       = "—";

  try {
    const accRes  = await fetch(accountsUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const accText = await accRes.text();
    console.log("[tradelocker/connect] accounts:", accRes.status, accText.slice(0, 400));

    if (accRes.ok) {
      const body     = JSON.parse(accText);
      const accounts = Array.isArray(body) ? body : (body.accounts ?? body.data ?? []);
      const first    = accounts[0];
      if (first) {
        tlAccountId   = String(first.id ?? first.accountId ?? "");
        accountNumber = String(first.accountNumber ?? first.login ?? tlAccountId);
        if (first.balance != null) {
          balance = `$${Number(first.balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
        }
      }
    }
  } catch (err) {
    console.warn("[tradelocker/connect] accounts fetch failed (non-fatal):", err);
  }

  // ── 3. Persist connection ─────────────────────────────────────────────────
  const supabase = createServiceClient();
  const { data: connRow, error: connErr } = await supabase
    .from("broker_connections")
    .upsert(
      {
        user_id:       user.id,
        broker:        "tradelocker",
        display_name:  `TradeLocker · ${accountNumber || server}`,
        account_id:    tlAccountId || accountNumber,
        balance,
        server,
        environment:   environment ?? "live",
        access_token:  accessToken,
        refresh_token: refreshToken,
        status:        "connected",
        last_sync:     new Date().toISOString(),
      },
      { onConflict: "user_id,broker,server" }
    )
    .select()
    .single();

  if (connErr) {
    console.error("[tradelocker/connect] supabase upsert error:", connErr);
    return NextResponse.json({ error: connErr.message }, { status: 500 });
  }

  // ── 4. Import last 90 days of orders as trades ────────────────────────────
  if (tlAccountId) {
    const ordersUrl = `${TL_BASE}/trade/accounts/${tlAccountId}/orders`;
    console.log("[tradelocker/connect] GET", ordersUrl);
    try {
      const ordRes  = await fetch(ordersUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const ordText = await ordRes.text();
      console.log("[tradelocker/connect] orders:", ordRes.status, ordText.slice(0, 400));

      if (ordRes.ok) {
        const body   = JSON.parse(ordText);
        const orders: TLOrder[] = Array.isArray(body)
          ? body
          : (body.orders ?? body.data ?? []);

        const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

        const tradeRecords = orders
          .filter(isClosedOrder)
          .filter(o => {
            const t = o.closedAt ?? o.closeTime ?? o.doneTime;
            return t ? new Date(t) >= since : false;
          })
          .map(o => mapOrder(o, user.id))
          .filter((r): r is Record<string, unknown> => r !== null);

        console.log("[tradelocker/connect] mapping", tradeRecords.length, "closed trades");

        if (tradeRecords.length > 0) {
          // Full re-import on initial connect — wipe unannotated trades and re-insert
          await supabase
            .from("trades")
            .delete()
            .eq("user_id", user.id)
            .eq("source", "tradelocker")
            .is("notes", null)
            .is("emotion", null)
            .is("grade", null);

          const { error: insertErr } = await supabase.from("trades").insert(tradeRecords);
          if (insertErr) console.error("[tradelocker/connect] insert error:", insertErr.message);
          else {
            await supabase
              .from("broker_connections")
              .update({ trades_count: tradeRecords.length })
              .eq("id", connRow.id);
          }
        }
      }
    } catch (err) {
      console.warn("[tradelocker/connect] orders import failed (non-fatal):", err);
    }
  }

  return NextResponse.json({ success: true, connection: connRow });
}
