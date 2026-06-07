alter table profiles add column if not exists analytics_consent   boolean default true;
alter table profiles add column if not exists ai_training_consent boolean default false;
alter table profiles add column if not exists email_notifications boolean default true;
alter table profiles add column if not exists public_profile      boolean default false;
