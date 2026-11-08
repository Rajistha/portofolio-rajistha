-- Migration: Add status column to projects table
-- Values: 'completed' (default) or 'in_progress'

alter table projects 
add column if not exists status text not null default 'completed';

-- Optional check constraint to guarantee valid values
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'projects_status_check'
  ) then
    alter table projects 
    add constraint projects_status_check 
    check (status in ('completed', 'in_progress'));
  end if;
end $$;
