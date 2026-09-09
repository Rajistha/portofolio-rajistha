# Portfolio — Front-End Developer

Portfolio website built with **Next.js (App Router)**, **Tailwind CSS v4**, **Framer Motion**, and **Supabase** (Postgres + Auth + Storage) for the admin-managed project/tech-stack list.

## Stack

- Next.js 16 (App Router, Server Actions)
- Tailwind CSS v4
- Framer Motion (scroll reveals, hover motion)
- Supabase (database, auth, image storage)
- Tech-stack logos rendered live from [Simple Icons](https://simpleicons.org) — no local image assets needed

## 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run [`supabase/schema.sql`](supabase/schema.sql) — this creates the `profile`, `tech_stacks`, `projects`, `project_tech_stacks` tables, Row Level Security policies, and a public `project-images` storage bucket.
3. Optionally run [`supabase/seed.sql`](supabase/seed.sql) to pre-fill a common tech-stack list.
4. In **Authentication > Users**, create one user (your admin email + password) — this is the only account allowed to write data.
5. In **Project Settings > API**, copy the Project URL and anon public key.

## 2. Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in your Supabase values:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

`SUPABASE_SERVICE_ROLE_KEY` is required for the admin image upload feature — it's used **server-side only** (in a Server Action, never sent to the browser) so uploads don't depend on Storage RLS or browser session sync at all. Keep it secret; never prefix it with `NEXT_PUBLIC_`.

## 3. Run the app

```bash
npm install
npm run dev
```

- Public site: [http://localhost:3000](http://localhost:3000)
- Admin panel: [http://localhost:3000/admin/login](http://localhost:3000/admin/login) — sign in with the Supabase user you created above.

From the admin panel you can:

- Edit your profile (name, role, tagline, bio, social links, CV link)
- Add/remove tech stack items (name + [Simple Icons](https://simpleicons.org) slug, e.g. `react`, `nextdotjs`, `tailwindcss`)
- Add/edit/delete portfolio projects — with an image (upload or URL), links, and the tech stack used, shown as logos on each project card

## Deploy

Deploy on [Vercel](https://vercel.com/new), and add the same environment variables in the project's settings.
