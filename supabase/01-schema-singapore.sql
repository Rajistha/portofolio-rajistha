-- =============================================================================
-- MASTER SCHEMA MIGRATION SCRIPT (SINGAPORE REGION - ap-southeast-1)
-- =============================================================================
-- Database schema for Puja Rajistha Portfolio & Link Shortener Ecosystem
-- Includes:
--   1. Extensions (pgcrypto)
--   2. Tables: profile, tech_stacks, projects, project_tech_stacks,
--              portfolio_stats, experiences, testimonials, short_links
--   3. Indexes for maximum query performance
--   4. Row Level Security (RLS) policies for tables
--   5. Storage buckets setup (project-images, avatars) & Storage RLS policies
-- =============================================================================

-- Enable pgcrypto for gen_random_uuid()
create extension if not exists "pgcrypto";

-- =============================================================================
-- 1. TABLES DEFINITIONS
-- =============================================================================

-- 1.1 Profile (Hero & About section)
create table if not exists profile (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Puja Rajistha',
  role text not null default 'Web Developer',
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

-- 1.2 Tech Stacks
create table if not exists tech_stacks (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,        -- simple-icons slug (e.g. "react", "nextdotjs")
  color text,                       -- hex color override (e.g. "61DAFB")
  category text not null default 'Frontend', -- Frontend / Backend / Tools / Design
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- 1.3 Projects
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
  status text not null default 'completed', -- completed / in_progress / archived
  created_at timestamptz not null default now()
);

-- 1.4 Project Tech Stacks (Many-to-Many Join Table)
create table if not exists project_tech_stacks (
  project_id uuid not null references projects(id) on delete cascade,
  tech_stack_id uuid not null references tech_stacks(id) on delete cascade,
  primary key (project_id, tech_stack_id)
);

-- 1.5 Portfolio Stats (Key Metrics on Landing Page)
create table if not exists portfolio_stats (
  id uuid primary key default gen_random_uuid(),
  value numeric not null default 0,
  suffix text not null default '',
  label text not null,
  label_en text,
  description text not null default '',
  description_en text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- 1.6 Experiences / Rekam Jejak (Education, Work, Organization, Projects)
create table if not exists experiences (
  id uuid primary key default gen_random_uuid(),
  category text not null default 'work', -- 'education', 'work', 'organization', 'project'
  period text not null,
  role text not null,
  role_en text,
  company text not null,
  location text not null default '',
  description text not null default '',
  description_en text,
  achievements text not null default '',
  achievements_en text,
  skills text not null default '',
  is_current boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- 1.7 Testimonials / Ulasan Klien
create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  role_en text,
  company text not null,
  avatar_url text,
  rating int not null default 5,
  content text not null,
  content_en text,
  project_ref text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- 1.8 Branded Short Links (s.rajistha.my.id & rajistha.my.id)
create table if not exists short_links (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  destination_url text not null,
  title text not null default '',
  description text default '',
  clicks int not null default 0,
  is_pinned boolean not null default false,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================================
-- 2. PERFORMANCE INDEXES
-- =============================================================================
create index if not exists idx_short_links_slug on short_links (slug);
create index if not exists idx_short_links_pinned on short_links (is_pinned desc, created_at desc);
create index if not exists idx_projects_slug on projects (slug);
create index if not exists idx_projects_featured on projects (featured desc, sort_order asc);
create index if not exists idx_tech_stacks_sort on tech_stacks (sort_order asc);
create index if not exists idx_portfolio_stats_sort on portfolio_stats (sort_order asc);
create index if not exists idx_experiences_category_sort on experiences (category, sort_order asc);
create index if not exists idx_testimonials_sort on testimonials (sort_order asc);

-- =============================================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

alter table profile enable row level security;
alter table tech_stacks enable row level security;
alter table projects enable row level security;
alter table project_tech_stacks enable row level security;
alter table portfolio_stats enable row level security;
alter table experiences enable row level security;
alter table testimonials enable row level security;
alter table short_links enable row level security;

-- Drop existing policies if re-running
drop policy if exists "public read profile" on profile;
drop policy if exists "auth write profile" on profile;
drop policy if exists "public read tech_stacks" on tech_stacks;
drop policy if exists "auth write tech_stacks" on tech_stacks;
drop policy if exists "public read projects" on projects;
drop policy if exists "auth write projects" on projects;
drop policy if exists "public read project_tech_stacks" on project_tech_stacks;
drop policy if exists "auth write project_tech_stacks" on project_tech_stacks;
drop policy if exists "public read portfolio_stats" on portfolio_stats;
drop policy if exists "auth write portfolio_stats" on portfolio_stats;
drop policy if exists "public read experiences" on experiences;
drop policy if exists "auth write experiences" on experiences;
drop policy if exists "public read testimonials" on testimonials;
drop policy if exists "auth write testimonials" on testimonials;
drop policy if exists "public read short_links" on short_links;
drop policy if exists "public insert short_links" on short_links;
drop policy if exists "public update click count" on short_links;
drop policy if exists "admin all short_links" on short_links;

-- Public read policies (visitor access)
create policy "public read profile" on profile for select using (true);
create policy "public read tech_stacks" on tech_stacks for select using (true);
create policy "public read projects" on projects for select using (true);
create policy "public read project_tech_stacks" on project_tech_stacks for select using (true);
create policy "public read portfolio_stats" on portfolio_stats for select using (true);
create policy "public read experiences" on experiences for select using (true);
create policy "public read testimonials" on testimonials for select using (true);
create policy "public read short_links" on short_links for select using (true);

-- Authenticated write policies (admin dashboard)
create policy "auth write profile" on profile for all to authenticated using (true) with check (true);
create policy "auth write tech_stacks" on tech_stacks for all to authenticated using (true) with check (true);
create policy "auth write projects" on projects for all to authenticated using (true) with check (true);
create policy "auth write project_tech_stacks" on project_tech_stacks for all to authenticated using (true) with check (true);
create policy "auth write portfolio_stats" on portfolio_stats for all to authenticated using (true) with check (true);
create policy "auth write experiences" on experiences for all to authenticated using (true) with check (true);
create policy "auth write testimonials" on testimonials for all to authenticated using (true) with check (true);
create policy "admin all short_links" on short_links for all to authenticated using (true) with check (true);

-- Special public permissions for short links (public creation & click incrementing)
create policy "public insert short_links" on short_links for insert with check (is_pinned = false);
create policy "public update click count" on short_links for update using (true) with check (true);

-- =============================================================================
-- 4. STORAGE BUCKETS & STORAGE RLS POLICIES
-- =============================================================================

-- Ensure buckets exist and are public
insert into storage.buckets (id, name, public)
values ('project-images', 'project-images', true)
on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public)
values ('documents', 'documents', true)
on conflict (id) do update set public = true;

-- Drop existing storage policies if re-running
drop policy if exists "public read project-images" on storage.objects;
drop policy if exists "auth upload project-images" on storage.objects;
drop policy if exists "auth update project-images" on storage.objects;
drop policy if exists "auth delete project-images" on storage.objects;
drop policy if exists "public read avatars" on storage.objects;
drop policy if exists "auth upload avatars" on storage.objects;
drop policy if exists "auth update avatars" on storage.objects;
drop policy if exists "auth delete avatars" on storage.objects;
drop policy if exists "public read documents" on storage.objects;
drop policy if exists "auth upload documents" on storage.objects;
drop policy if exists "auth update documents" on storage.objects;
drop policy if exists "auth delete documents" on storage.objects;

-- Storage policies for project-images
create policy "public read project-images" on storage.objects
  for select using (bucket_id = 'project-images');
create policy "auth upload project-images" on storage.objects
  for insert to authenticated with check (bucket_id = 'project-images');
create policy "auth update project-images" on storage.objects
  for update to authenticated using (bucket_id = 'project-images');
create policy "auth delete project-images" on storage.objects
  for delete to authenticated using (bucket_id = 'project-images');

-- Storage policies for avatars
create policy "public read avatars" on storage.objects
  for select using (bucket_id = 'avatars');
create policy "auth upload avatars" on storage.objects
  for insert to authenticated with check (bucket_id = 'avatars');
create policy "auth update avatars" on storage.objects
  for update to authenticated using (bucket_id = 'avatars');
create policy "auth delete avatars" on storage.objects
  for delete to authenticated using (bucket_id = 'avatars');

-- Storage policies for documents (CV, etc.)
create policy "public read documents" on storage.objects
  for select using (bucket_id = 'documents');
create policy "auth upload documents" on storage.objects
  for insert to authenticated with check (bucket_id = 'documents');
create policy "auth update documents" on storage.objects
  for update to authenticated using (bucket_id = 'documents');
create policy "auth delete documents" on storage.objects
  for delete to authenticated using (bucket_id = 'documents');
