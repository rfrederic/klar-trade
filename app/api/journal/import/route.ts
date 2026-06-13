import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";

export const maxDuration = 30;

// ── Types ─────────────────────────────────────────────────────────────────────

interface ParsedTrade {
  symbol:      string;
  direction:   "long" | "short";
  entry_price: number | null;
  exit_price:  number | null;
  pnl:         number | null;
  volume:      number | null;
  closed_at:   string;
  source:      string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseDate(raw: string): string | null {
  if (!raw) return null;
  // Normalise: 2024.01.15 09:30:22 → 2024-01-15T09:30:22
  //             01/15/2024 09:30   → needs month/day swap handled below
  let s = raw.trim().replace(/\./g, "-");

  // Handle MM/DD/YYYY or DD/MM/YYYY (we assume MM/DD for broker statements)
  const mdyMatch = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(.*)/);
  if (mdyMatch) s = `${mdyMatch[3]}-${mdyMatch[1].padStart(2,"0")}-${mdyMatch[2].padStart(2,"0")}${mdyMatch[4]}`;

  s = s.replace(" ", "T").replace(" UTC", "");
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

function direction(raw: string): "long" | "short" {
  return /sell|short/i.test(raw) ? "short" : "long";
}

function num(s: string | undefined): number | null {
  if (!s) return null;
  const n = parseFloat(s.replace(/,/g, ""));
  return isNaN(n) ? null : n;
}

// ── MT5 Deal History Parser ───────────────────────────────────────────────────
// Handles MetaTrader 5 "Deal" export where each position has separate In/Out rows.
// Detected when headers contain: Deal, Action, Entry.

function parseMT5Deals(text: string): ParsedTrade[] {
  const sep   = text.includes("\t") ? "\t" : ",";
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  let hdrIdx = 0;
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const lower = lines[i].toLowerCase();
    if (/\bdeal\b/.test(lower) && /\baction\b/.test(lower) && /\bentry\b/.test(lower)) {
      hdrIdx = i; break;
    }
  }

  const headers = lines[hdrIdx].split(sep).map(h => h.replace(/^"|"$/g, "").toLowerCase().trim());
  const col = (name: string) => headers.indexOf(name.toLowerCase());

  const posC   = col("position");
  const entryC = col("entry");   // "In" / "Out" status column

  type RowMap = Record<string, string>;
  const byPosition = new Map<string, { in?: RowMap; out?: RowMap }>();

  for (let i = hdrIdx + 1; i < lines.length; i++) {
    const cols  = lines[i].split(sep).map(v => v.replace(/^"|"$/g, "").trim());
    if (cols.length < 3) continue;
    const entry = cols[entryC]?.trim();
    const posId = cols[posC]?.trim();
    if (!posId || posId === "0" || !entry) continue;
    if (entry !== "In" && entry !== "Out") continue;

    const row: RowMap = {};
    headers.forEach((h, idx) => { row[h] = cols[idx] ?? ""; });

    if (!byPosition.has(posId)) byPosition.set(posId, {});
    const group = byPosition.get(posId)!;
    if (entry === "In")  group.in  = row;
    if (entry === "Out") group.out = row;
  }

  const trades: ParsedTrade[] = [];

  for (const [, group] of byPosition) {
    const out = group.out;
    if (!out) continue;

    const symbol = (out["symbol"] ?? "")
      .toUpperCase()
      .replace(/\.RAW$/i, "")
      .replace(/\.$/, "");
    if (!symbol || symbol.length < 2 || symbol.length > 12) continue;

    const closedAt = parseDate(out["date"] ?? "");
    if (!closedAt) continue;

    const inRow      = group.in;
    const actionRaw  = inRow ? (inRow["action"] ?? "") : (out["action"] ?? "");
    const dir: "long" | "short" = /sell|short/i.test(actionRaw) ? "short" : "long";

    const entryPrice = inRow  ? num(inRow["price"])  : null;
    const exitPrice  = num(out["price"]);
    const pnl        = num((out["profit"] ?? "").replace(/[$]/g, ""));
    const volume     = num(out["volume"] ?? out["volumeclosed"] ?? "");

    trades.push({
      symbol,
      direction:   dir,
      entry_price: entryPrice,
      exit_price:  exitPrice,
      pnl,
      volume,
      closed_at:   closedAt,
      source:      "csv_import",
    });
  }

  return trades;
}

// ── CSV Parser ────────────────────────────────────────────────────────────────
// Supports comma-separated and tab-separated (MT5 history export).
// Column matching is header-name–driven so column order doesn't matter.

function parseCsv(text: string): ParsedTrade[] {
  const sep    = text.includes("\t") ? "\t" : ",";
  const lines  = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  // Find first line that looks like a header
  let hdrIdx = 0;
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    if (/symbol|ticket|order|item|instrument|deal/i.test(lines[i])) { hdrIdx = i; break; }
  }
  const raw = lines[hdrIdx].split(sep).map(h => h.replace(/^"|"$/g, "").toLowerCase().trim());

  // Delegate to MT5 deal parser when the format has Deal + Action + Entry columns
  if (raw.includes("deal") && raw.includes("action") && raw.includes("entry")) {
    return parseMT5Deals(text);
  }

  const col = (preds: RegExp[]): number =>
    raw.findIndex(h => preds.some(p => p.test(h)));

  const symC      = col([/symbol/, /instrument/, /item/, /pair/]);
  const typeC     = col([/^type$/, /^side$/, /direction/, /action/]);
  const volC      = col([/volume/, /size/, /lots/, /qty/, /quantity/]);
  const entryC    = col([/open.?price/, /entry.?price/, /^open$/, /^entry$/, /^price$/]);
  const exitC     = col([/close.?price/, /exit.?price/, /^close$/, /^exit$/]);
  const pnlC      = col([/profit/, /p&l/, /^pnl$/, /net.?p/, /gain/]);
  const closeTC   = col([/close.?time/, /exit.?time/, /closed_at/, /close.?date/, /end.?time/, /^exit$/]);

  if (symC === -1 && closeTC === -1) return [];

  const trades: ParsedTrade[] = [];

  for (let i = hdrIdx + 1; i < lines.length; i++) {
    const c = lines[i].split(sep).map(v => v.replace(/^"|"$/g, "").trim());
    if (c.length < 3) continue;

    const sym = symC >= 0 ? c[symC]?.toUpperCase() : null;
    if (!sym || sym.length < 2 || sym.length > 12) continue;

    const closedAt = closeTC >= 0 ? parseDate(c[closeTC]) : null;
    if (!closedAt) continue;

    trades.push({
      symbol:      sym,
      direction:   direction(typeC >= 0 ? c[typeC] : ""),
      entry_price: num(c[entryC]),
      exit_price:  num(c[exitC]),
      pnl:         num(c[pnlC]),
      volume:      num(c[volC]),
      closed_at:   closedAt,
      source:      "csv",
    });
  }

  return trades;
}

// ── PDF Parser ────────────────────────────────────────────────────────────────
// Works with MT5/MT4, cTrader, TradeLocker, and generic broker statement PDFs.
//
// Strategy: score each line on how many trade-like features it has, then extract
// data from high-scoring lines. This tolerates varying column orders.

// Symbols most brokers trade — used to anchor line detection
const SYMBOL_RE = /\b([A-Z]{3,8}(?:USD|EUR|GBP|JPY|CHF|AUD|NZD|CAD)?|XAUUSD|XAGUSD|BTCUSD|ETHUSD|NAS100|SPX500|US30|NQ|ES|YM|GBPJPY|EURJPY|GBPAUD|EURCAD|USOIL)\b/;

const SKIP_LINE_RE = /^(symbol|deal|ticket|order|position|entry|close|open|type|dir|profit|commission|balance|swap|description|deposit|withdrawal|credit|transfer|bonus|date|time|volume|lot|size|p&l|net|gross|total|subtotal|currency|#)/i;

// Date patterns found inside a line
const DATE_IN_LINE_RE = /(\d{4}[.\-/]\d{2}[.\-/]\d{2}(?:[ T]\d{2}:\d{2}(?::\d{2})?)?|\d{2}[./]\d{2}[./]\d{4}(?:[ T]\d{2}:\d{2}(?::\d{2})?)?)/g;

function parsePdfText(text: string): ParsedTrade[] {
  const lines  = text.split("\n").map(l => l.trim()).filter(l => l.length > 15);
  const trades: ParsedTrade[] = [];
  const seen   = new Set<string>();

  for (const line of lines) {
    if (SKIP_LINE_RE.test(line)) continue;

    // Must contain at least one price-like decimal
    if (!/\d+\.\d{2,6}/.test(line)) continue;

    // Find symbol
    const symM = line.match(SYMBOL_RE);
    if (!symM) continue;
    const symbol = symM[1].toUpperCase();

    // Find direction
    const dirM = line.match(/\b(buy|sell|long|short)\b/i);
    const dir  = direction(dirM?.[1] ?? "");

    // Find all dates in the line; prefer the LAST one as the close time
    const dates   = [...line.matchAll(DATE_IN_LINE_RE)];
    const rawDate = dates.length > 0 ? dates[dates.length - 1][0] : null;
    const closedAt = rawDate ? parseDate(rawDate) : null;
    if (!closedAt) continue;

    // Find all decimal numbers (likely prices / pnl values)
    const decimals = [...line.matchAll(/\b(\d{1,6}\.\d{2,6})\b/g)]
      .map(m => parseFloat(m[1]))
      .filter(n => !isNaN(n) && n > 0);

    // Last number on the line often is profit/loss (may be negative)
    const signedM   = line.match(/([-]\d+\.?\d*)\s*$/);
    const trailingN = line.match(/(\d+\.?\d*)\s*$/);
    const pnlRaw    = signedM?.[1] ?? trailingN?.[1] ?? null;
    const pnl       = pnlRaw != null ? parseFloat(pnlRaw) : null;

    // Need at least 2 price-like numbers for entry + exit
    if (decimals.length < 2) continue;

    // Deduplicate on symbol+closedAt (avoids re-parsing same row from page headers)
    const key = `${symbol}|${closedAt}`;
    if (seen.has(key)) continue;
    seen.add(key);

    trades.push({
      symbol,
      direction:   dir,
      entry_price: decimals[0],
      exit_price:  decimals[1],
      pnl:         !isNaN(pnl as number) ? (pnl as number) : null,
      volume:      null,
      closed_at:   closedAt,
      source:      "pdf",
    });
  }

  return trades;
}

// ── Route ─────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const authClient = await createServerClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const name  = file.name.toLowerCase();
  const isPdf = name.endsWith(".pdf") || file.type === "application/pdf";
  const isCsv = name.endsWith(".csv") || name.endsWith(".tsv") || file.type === "text/csv";

  if (!isPdf && !isCsv) {
    return NextResponse.json({ error: "Only .csv and .pdf files are supported" }, { status: 400 });
  }

  let trades: ParsedTrade[] = [];

  if (isCsv) {
    const text = await file.text();
    trades = parseCsv(text);
  } else {
    // Dynamic import keeps pdf-parse out of the webpack client bundle.
    // pdf-parse ships both ESM and CJS; normalise to a callable.
    const pdfMod  = await import("pdf-parse");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfParse: (buf: Buffer) => Promise<{ text: string }> = (pdfMod as any).default ?? pdfMod;
    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfData = await pdfParse(buffer);
    trades = parsePdfText(pdfData.text);
  }

  if (trades.length === 0) {
    const msg = isPdf
      ? "Could not extract trades from this PDF. Try CSV export from your broker instead."
      : "No trades found in CSV. Make sure the file has symbol, direction, close time, and price columns.";
    return NextResponse.json({ error: msg, imported: 0 }, { status: 422 });
  }

  const supabase = createServiceClient();
  const rows = trades.map(t => ({ ...t, user_id: user.id }));

  const { error: insertErr } = await supabase.from("trades").insert(rows);
  if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 });

  return NextResponse.json({
    imported:  trades.length,
    fileType:  isPdf ? "pdf" : "csv",
    sample:    trades.slice(0, 3).map(t => ({
      symbol:    t.symbol,
      direction: t.direction,
      pnl:       t.pnl,
      closed_at: t.closed_at,
    })),
  });
}
