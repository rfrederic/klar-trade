-- Add take-profit/stop-loss, commission/swap, and close-type fields to trades.
-- All nullable/defaulted so existing rows (manual or broker-synced) are
-- unaffected — net P&L is computed as `pnl - commission + swap`, and with
-- commission/swap defaulting to 0 this equals the existing `pnl` for every
-- row that predates this migration.
alter table trades add column if not exists take_profit numeric;
alter table trades add column if not exists stop_loss numeric;
alter table trades add column if not exists commission numeric default 0;
alter table trades add column if not exists swap numeric default 0;
alter table trades add column if not exists close_type text;

alter table trades drop constraint if exists trades_close_type_check;
alter table trades add constraint trades_close_type_check
  check (close_type is null or close_type in ('tp', 'sl', 'manual', 'breakeven'));
