-- Adds project metadata + category grouping. Safe to re-run.
alter table public.projects add column if not exists sublead_name text;
alter table public.projects add column if not exists repo_url text;
alter table public.projects add column if not exists website_url text;
alter table public.projects add column if not exists category text;
