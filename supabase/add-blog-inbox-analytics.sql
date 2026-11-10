-- Blog, contact inbox, analytics, and site settings.
-- Run in Supabase SQL Editor: Dashboard > SQL Editor > New query. Safe to re-run.

create extension if not exists "pgcrypto";

-- 1. Blog posts -------------------------------------------------------------
create table if not exists blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  title_en text,
  excerpt text not null default '',
  excerpt_en text,
  content text not null default '',
  content_en text,
  cover_url text,
  tags text[] not null default '{}',
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_blog_posts_published on blog_posts (published, published_at desc);

alter table blog_posts enable row level security;

drop policy if exists "public read published blog_posts" on blog_posts;
create policy "public read published blog_posts" on blog_posts
  for select using (published = true);

drop policy if exists "auth all blog_posts" on blog_posts;
create policy "auth all blog_posts" on blog_posts
  for all to authenticated using (true) with check (true);

-- 2. Contact messages (inserted server-side with the service role) ----------
create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null default '',
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_contact_messages_created on contact_messages (created_at desc);

alter table contact_messages enable row level security;

drop policy if exists "auth all contact_messages" on contact_messages;
create policy "auth all contact_messages" on contact_messages
  for all to authenticated using (true) with check (true);

-- 3. Analytics events (inserted server-side with the service role) ----------
create table if not exists analytics_events (
  id bigint generated always as identity primary key,
  type text not null,            -- 'view' | 'cv_download' | 'project_open' | 'contact_click'
  path text not null default '/',
  label text,
  referrer text,
  device text,
  created_at timestamptz not null default now()
);

create index if not exists idx_analytics_events_created on analytics_events (created_at desc);
create index if not exists idx_analytics_events_type on analytics_events (type, created_at desc);

alter table analytics_events enable row level security;

drop policy if exists "auth read analytics_events" on analytics_events;
create policy "auth read analytics_events" on analytics_events
  for select to authenticated using (true);

-- 4. Site settings (single row) ---------------------------------------------
create table if not exists site_settings (
  id int primary key default 1 check (id = 1),
  preloader_enabled boolean not null default true,
  lanyard_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

insert into site_settings (id) values (1) on conflict (id) do nothing;

alter table site_settings enable row level security;

drop policy if exists "public read site_settings" on site_settings;
create policy "public read site_settings" on site_settings for select using (true);

drop policy if exists "auth write site_settings" on site_settings;
create policy "auth write site_settings" on site_settings
  for all to authenticated using (true) with check (true);
