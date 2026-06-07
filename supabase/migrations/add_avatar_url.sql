-- Add avatar_url column to profiles table
alter table profiles add column if not exists avatar_url text;

-- Create the avatars storage bucket (public read, authenticated write)
-- Run this in the Supabase dashboard Storage section, or via the SQL editor:
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Allow authenticated users to upload to their own folder
create policy if not exists "Users can upload their own avatar"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to update/replace their own avatar
create policy if not exists "Users can update their own avatar"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read access to all avatars
create policy if not exists "Public read access for avatars"
  on storage.objects for select
  to public
  using (bucket_id = 'avatars');
