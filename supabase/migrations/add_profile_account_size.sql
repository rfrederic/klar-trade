-- Add account_size column to profiles table.
-- Manually-entered starting balance, used to compute balance/equity and
-- position sizing when the user hasn't connected a real broker yet.
alter table profiles add column if not exists account_size numeric;
