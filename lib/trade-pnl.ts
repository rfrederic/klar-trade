// Sign convention: `pnl` is the raw price P&L. `commission` is entered as a
// positive cost and is always subtracted. `swap` carries its own sign — it
// can be a cost (negative) or a credit (positive) depending on carry
// direction — and is added as-is. Net P&L = pnl - commission + swap.
//
// Existing rows (before commission/swap existed) default both to 0, so
// netPnl(trade) === trade.pnl for all of them — this is fully
// backward-compatible.
export function netPnl(trade: { pnl?: number | null; commission?: number | null; swap?: number | null }): number {
  return (trade.pnl ?? 0) - (trade.commission ?? 0) + (trade.swap ?? 0);
}
