# Portfolio — Front-End Developer

Portfolio website built with **Next.js (App Router)**, **Tailwind CSS v4**, **Framer Motion**, **React Three Fiber** (3D lanyard hero), and **Supabase** (Postgres + Auth + Storage) for the admin-managed content.

## Stack

- Next.js 16 (App Router, Server Actions)
- Tailwind CSS v4
- Framer Motion (scroll reveals, hover motion, typewriter effect)
- React Three Fiber + Rapier — physics-based 3D lanyard card in the hero section
- Tiptap — rich text editor for the admin-authored bio
- Supabase (database, auth, image storage)
- Custom lightweight i18n (Indonesian / English toggle) for the site's static UI text
- Tech-stack logos rendered live from [Simple Icons](https://simpleicons.org) — no local image assets needed

## 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run [`supabase/schema.sql`](supabase/schema.sql) — this creates the `profile`, `tech_stacks`, `projects`, `project_tech_stacks` tables, Row Level Security policies, and two public storage buckets: `project-images` and `avatars`. The script is safe to re-run (uses `if not exists` / `add column if not exists`), so re-running it after a `git pull` picks up any new columns.
3. Optionally run [`supabase/seed.sql`](supabase/seed.sql) to pre-fill a common tech-stack list.
4. In **Authentication > Users**, create one user (your admin email + password) — this is the only account allowed to write data.
5. In **Project Settings > API**, copy the Project URL and anon public key.

## 2. Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_NAME="Your Name"
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

- `SUPABASE_SERVICE_ROLE_KEY` is required for the admin image upload feature — it's used **server-side only** (in a Server Action, never sent to the browser) so uploads don't depend on Storage RLS or browser session sync at all. Keep it secret; never prefix it with `NEXT_PUBLIC_`.
- `NEXT_PUBLIC_SITE_URL` drives SEO metadata, `sitemap.xml`, `robots.txt`, and the generated Open Graph image — set it to your real production domain (e.g. `https://rajistha.my.id`) in your hosting provider's environment variables.

## 3. Run the app

```bash
npm install
npm run dev
```

- Public site: [http://localhost:3000](http://localhost:3000)
- Admin panel: [http://localhost:3000/admin/login](http://localhost:3000/admin/login) — sign in with the Supabase user you created above.

From the admin panel you can:

- Edit your profile (name, role, tagline, bio in both Indonesian and English via a rich text editor, avatar photo, social links, CV link)
- Add/remove tech stack items (name + [Simple Icons](https://simpleicons.org) slug, e.g. `react`, `nextdotjs`, `tailwindcss`)
- Add/edit/delete portfolio projects — with an image (upload or URL), links, and the tech stack used, shown as logos on each project card

## Notes

- **Hero lanyard**: the 3D card/strap model lives in `public/lanyard/` (`card.glb`, ~130KB after Meshopt + WebP compression). It's loaded client-only via `next/dynamic` and only rendered on `lg`+ screens.
- **Language toggle**: only static UI text (nav labels, section headings, buttons) is translated — see `src/lib/i18n/dictionaries.ts`. Content you write in the admin panel (bio has separate ID/EN fields; project/tagline text does not) is shown as-is.
- **SEO**: sitemap, robots.txt, JSON-LD (`Person` schema), and the Open Graph/Twitter preview image are all generated automatically from `NEXT_PUBLIC_SITE_URL` and your profile data — no manual asset needed.

## Deploy

Deploy on [Vercel](https://vercel.com/new), and add the same environment variables in the project's settings — including `NEXT_PUBLIC_SITE_URL` set to your production domain.
