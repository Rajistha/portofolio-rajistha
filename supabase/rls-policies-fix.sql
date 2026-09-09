-- Run this if you get "new row violates row-level security policy for table ..."
-- Replaces the auth.role() check with Supabase's recommended `to authenticated`
-- role-based policies, which are more reliable. Safe to run multiple times.

drop policy if exists "auth write profile" on profile;
drop policy if exists "auth write tech_stacks" on tech_stacks;
drop policy if exists "auth write projects" on projects;
drop policy if exists "auth write project_tech_stacks" on project_tech_stacks;

create policy "auth write profile" on profile
  for all to authenticated using (true) with check (true);

create policy "auth write tech_stacks" on tech_stacks
  for all to authenticated using (true) with check (true);

create policy "auth write projects" on projects
  for all to authenticated using (true) with check (true);

create policy "auth write project_tech_stacks" on project_tech_stacks
  for all to authenticated using (true) with check (true);
