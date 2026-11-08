-- Table: short_links
-- Stores branded short links for s.rajistha.my.id and rajistha.my.id

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

-- Index for instant lookup on redirect
create index if not exists idx_short_links_slug on short_links (slug);

-- Enable RLS
alter table short_links enable row level security;

-- Public can read all public short links (for redirection and link hub)
create policy "public read short_links" on short_links
  for select using (true);

-- Public can insert new links (with is_pinned=false) from the public shortener page
create policy "public insert short_links" on short_links
  for insert with check (is_pinned = false);

-- Public can update click count (handled safely via server action or RPC)
create policy "public update click count" on short_links
  for update using (true) with check (true);

-- Authenticated users (admin) have full CRUD access
create policy "admin all short_links" on short_links
  for all to authenticated using (true) with check (true);

-- Seed initial official links for Puja Rajistha
insert into short_links (slug, destination_url, title, description, is_pinned, is_public)
values
  ('cv', 'https://rajistha.my.id', 'Curriculum Vitae (CV)', 'Unduh resume / CV terbaru Puja Rajistha', true, true),
  ('wa', 'https://wa.me/6281234567890?text=Halo%20Puja%20Rajistha,%20saya%20tertarik%20berdiskusi%20mengenai%20proyek%20web', 'WhatsApp Official', 'Hubungi langsung melalui WhatsApp untuk konsultasi cepat', true, true),
  ('memori', 'https://memoribox.id', 'MemoriBox.id Photobooth', 'Platform web operasional terpadu photobooth & photobox di Malang', true, true),
  ('snaphub', 'https://snaphub.my.id', 'SnapHub Photobooth', 'Web apps modern untuk layanan sewa photobooth premium', true, true)
on conflict (slug) do nothing;
