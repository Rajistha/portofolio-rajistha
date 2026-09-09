-- Optional sample data. Run after schema.sql. Slugs must match simple-icons.com slugs.

insert into tech_stacks (name, slug, color, category, sort_order) values
  ('React', 'react', '61DAFB', 'Frontend', 1),
  ('Next.js', 'nextdotjs', '000000', 'Frontend', 2),
  ('TypeScript', 'typescript', '3178C6', 'Frontend', 3),
  ('Tailwind CSS', 'tailwindcss', '06B6D4', 'Frontend', 4),
  ('JavaScript', 'javascript', 'F7DF1E', 'Frontend', 5),
  ('Framer', 'framer', '0055FF', 'Tools', 6),
  ('Vite', 'vite', '646CFF', 'Tools', 7),
  ('Figma', 'figma', 'F24E1E', 'Design', 8),
  ('Supabase', 'supabase', '3FCF8E', 'Backend', 9),
  ('Node.js', 'nodedotjs', '339933', 'Backend', 10),
  ('Git', 'git', 'F05032', 'Tools', 11),
  ('Vercel', 'vercel', '000000', 'Tools', 12)
on conflict (slug) do nothing;
