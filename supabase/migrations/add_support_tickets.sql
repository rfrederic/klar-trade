create table if not exists support_tickets (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users(id),
  type       text,
  message    text,
  created_at timestamptz default now()
);

alter table support_tickets enable row level security;

create policy "Users can insert own tickets"
  on support_tickets for insert
  with check (auth.uid() = user_id);

create policy "Users can view own tickets"
  on support_tickets for select
  using (auth.uid() = user_id);
