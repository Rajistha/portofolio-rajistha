-- SQL migration to add tables for Key Stats, Experiences (Rekam Jejak), and Testimonials
-- Run this in your Supabase SQL Editor: Dashboard > SQL Editor > New query

create extension if not exists "pgcrypto";

-- 1. Portfolio Key Stats ----------------------------------------------------
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

-- 2. Experiences / Rekam Jejak ---------------------------------------------
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

-- Safe to re-run: adds category column if table was created previously
alter table experiences add column if not exists category text not null default 'work';

-- 3. Testimonials / Ulasan Klien -------------------------------------------
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

-- Row-Level Security --------------------------------------------------------
alter table portfolio_stats enable row level security;
alter table experiences enable row level security;
alter table testimonials enable row level security;

-- Public read access
create policy "public read portfolio_stats" on portfolio_stats for select using (true);
create policy "public read experiences" on experiences for select using (true);
create policy "public read testimonials" on testimonials for select using (true);

-- Authenticated admin write access
create policy "auth write portfolio_stats" on portfolio_stats
  for all to authenticated using (true) with check (true);

create policy "auth write experiences" on experiences
  for all to authenticated using (true) with check (true);

create policy "auth write testimonials" on testimonials
  for all to authenticated using (true) with check (true);

-- Initial Optional Seed Data (Uncomment if you want to populate initial sample rows):
/*
insert into portfolio_stats (value, suffix, label, label_en, description, description_en, sort_order)
values
  (15, '+', 'Proyek Selesai', 'Projects Delivered', 'Aplikasi web modern, sistem photobooth, & website interaktif.', 'Modern web applications, photobooth systems, & interactive sites.', 1),
  (99.8, '%', 'Kepuasan Klien', 'Client Satisfaction', 'Berdasarkan ulasan langsung klien bisnis & photobooth.', 'Based on direct reviews from business & photobooth clients.', 2),
  (3, '+', 'Tahun Pengalaman', 'Years Experience', 'Spesialisasi arsitektur React, Next.js, & Tailwind CSS.', 'Specializing in React, Next.js, & Tailwind CSS architecture.', 3),
  (10, 'k+', 'Pengguna Terlayani', 'End Users Served', 'Melalui platform web MemoriBox & event digital photobooth.', 'Via MemoriBox web platform & digital photobooth events.', 4);

insert into experiences (period, role, role_en, company, location, description, description_en, achievements, skills, is_current, sort_order)
values
  ('2024 — Sekarang', 'Lead Front-End Developer & Co-Founder', 'Lead Front-End Developer & Co-Founder', 'MemoriBox.id Photobooth', 'Malang, Indonesia', 'Merancang dan membangun ekosistem web platform untuk operasional bisnis photobooth.', 'Designing and building the web platform ecosystem for modern photobooth operations.', 'Membangun portal pelanggan modern untuk reservasi sewa dan unduhan hasil cetak foto via QR code.
Mengintegrasikan backend Supabase untuk autentikasi admin dan penjadwalan real-time.
Mencapai skor Lighthouse 98+ untuk performa pada perangkat mobile.', 'Next.js, React 19, Tailwind CSS, Supabase, TypeScript, Framer Motion', true, 1),
  ('2023 — Sekarang', 'Freelance Front-End Engineer', 'Freelance Front-End Engineer', 'Independent / Self-Employed', 'Remote', 'Mengembangkan berbagai landing page interaktif dan aplikasi web responsif.', 'Developing interactive landing pages and responsive web applications.', 'Menyelesaikan 15+ proyek web dengan zero downtime dan kepuasan klien 99.8%.
Menerapkan micro-animations yang halus dan loading di bawah 1.5 detik.', 'React, Next.js, TypeScript, Tailwind CSS, Three.js, Git', true, 2),
  ('2022 — 2024', 'Web Developer & UI/UX Specialist', 'Web Developer & UI/UX Specialist', 'SnapHub Tech Project', 'Malang, Indonesia', 'Mengembangkan antarmuka web pemesanan dan kalkulator paket photobooth.', 'Built the front-end user experience and dynamic package pricing calculator.', 'Membuat sistem estimasi harga instan yang meningkatkan konversi pesanan masuk hingga 35%.
Mendesain komponen UI modular yang dapat digunakan kembali.', 'Vite, React, Tailwind CSS, Framer Motion, JavaScript', false, 3);

insert into testimonials (name, role, role_en, company, rating, content, project_ref, sort_order)
values
  ('Dimas Prasetyo', 'Event Organizer & Creative Lead', 'Event Organizer & Creative Lead', 'Malang Festive Moments', 5, 'Puja sangat cekatan dalam menerjemahkan kebutuhan web kami. Sistem booking photobooth MemoriBox yang dibuat sangat mulus, responsif di HP, dan tamu-tamu kami sangat senang dengan kemudahan download foto via QR code.', 'MemoriBox.id', 1),
  ('Sarah Anggraini', 'Brand Manager', 'Brand Manager', 'GlowUp Studio', 5, 'Desain portofolio dan landing page yang dibangun punya nuansa premium luar biasa. Efek interaktif dan animasi Three.js-nya benar-benar membedakan website kami dari kompetitor lain.', 'Custom Web App', 2),
  ('Rizky Ramadhan', 'Founder & Operations', 'Founder & Operations', 'SnapHub Malang', 5, 'Komunikasi sangat lancar, kode rapi dan mudah di-maintain. Fitur kalkulator paket dan integrasi Supabase-nya sangat membantu operasional bisnis kami berkembang pesat.', 'SnapHub Photobooth', 3);
*/
