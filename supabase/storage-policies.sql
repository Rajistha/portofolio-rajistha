-- Run this if uploads fail with "new row violates row-level security policy".
-- Safe to run multiple times (drops existing policies first).

insert into storage.buckets (id, name, public)
values ('project-images', 'project-images', true)
on conflict (id) do update set public = true;

drop policy if exists "public read project-images" on storage.objects;
drop policy if exists "auth upload project-images" on storage.objects;
drop policy if exists "auth update project-images" on storage.objects;
drop policy if exists "auth delete project-images" on storage.objects;

create policy "public read project-images" on storage.objects
  for select using (bucket_id = 'project-images');

create policy "auth upload project-images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'project-images');

create policy "auth update project-images" on storage.objects
  for update to authenticated
  using (bucket_id = 'project-images');

create policy "auth delete project-images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'project-images');
