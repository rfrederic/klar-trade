-- Add timezone column to profiles table.
-- Stores the user's IANA timezone (e.g. "America/New_York"), auto-detected
-- from the browser and used server-side to bucket trades/sessions by the
-- user's local day/month instead of the server's clock or raw UTC.
alter table profiles add column if not exists timezone text default 'UTC';
