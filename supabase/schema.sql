-- Run this in the Supabase SQL editor (Project > SQL Editor > New query)

create extension if not exists "pgcrypto";

-- Single-row profile info shown in the hero / about section
create table if not exists profile (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Your Name',
  role text not null default 'Front-End Developer',
  tagline text not null default 'I build fast, accessible, beautiful interfaces.',
  bio text not null default '',
  bio_en text,
  avatar_url text,
  email text,
  github_url text,
  linkedin_url text,
  instagram_url text,
  cv_url text,
  updated_at timestamptz not null default now()
);

-- Safe to re-run: adds the column if this schema was already applied before it existed
alter table profile add column if not exists instagram_url text;
alter table profile add column if not exists bio_en text;

insert into profile (name, role, tagline, bio)
select 'Your Name', 'Front-End Developer', 'I build fast, accessible, beautiful interfaces.', 'Write a short bio about yourself here.'
where not exists (select 1 from profile);

-- Tech stack items (used both in the "Tech Stack" section and attached to projects)
create table if not exists tech_stacks (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,        -- simple-icons slug, e.g. "react", "nextdotjs", "tailwindcss"
  color text,                       -- optional hex color override, e.g. "61DAFB"
  category text not null default 'Frontend', -- Frontend / Backend / Tools / Design
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Portfolio projects
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  summary text not null default '',
  summary_en text,
  description text not null default '',
  description_en text,
  image_url text,
  live_url text,
  repo_url text,
  featured boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Safe to re-run: adds the columns if this schema was already applied before they existed
alter table projects add column if not exists summary_en text;
alter table projects add column if not exists description_en text;

-- Join table: which tech stack items were used on which project
create table if not exists project_tech_stacks (
  project_id uuid not null references projects(id) on delete cascade,
  tech_stack_id uuid not null references tech_stacks(id) on delete cascade,
  primary key (project_id, tech_stack_id)
);

-- Row Level Security -------------------------------------------------------

alter table profile enable row level security;
alter table tech_stacks enable row level security;
alter table projects enable row level security;
alter table project_tech_stacks enable row level security;

-- Public (anonymous) read access, since this is a public portfolio site
create policy "public read profile" on profile for select using (true);
create policy "public read tech_stacks" on tech_stacks for select using (true);
create policy "public read projects" on projects for select using (true);
create policy "public read project_tech_stacks" on project_tech_stacks for select using (true);

-- Only logged-in users (the admin account you create) can write
create policy "auth write profile" on profile
  for all to authenticated using (true) with check (true);
create policy "auth write tech_stacks" on tech_stacks
  for all to authenticated using (true) with check (true);
create policy "auth write projects" on projects
  for all to authenticated using (true) with check (true);
create policy "auth write project_tech_stacks" on project_tech_stacks
  for all to authenticated using (true) with check (true);

-- Storage bucket for project screenshots (create via dashboard if this errors)
insert into storage.buckets (id, name, public)
values ('project-images', 'project-images', true)
on conflict (id) do nothing;

create policy "public read project-images" on storage.objects
  for select using (bucket_id = 'project-images');
create policy "auth upload project-images" on storage.objects
  for insert to authenticated with check (bucket_id = 'project-images');
create policy "auth update project-images" on storage.objects
  for update to authenticated using (bucket_id = 'project-images');
create policy "auth delete project-images" on storage.objects
  for delete to authenticated using (bucket_id = 'project-images');

-- Storage bucket for the profile avatar photo (create via dashboard if this errors)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "public read avatars" on storage.objects
  for select using (bucket_id = 'avatars');
create policy "auth upload avatars" on storage.objects
  for insert to authenticated with check (bucket_id = 'avatars');
create policy "auth update avatars" on storage.objects
  for update to authenticated using (bucket_id = 'avatars');
create policy "auth delete avatars" on storage.objects
  for delete to authenticated using (bucket_id = 'avatars');
