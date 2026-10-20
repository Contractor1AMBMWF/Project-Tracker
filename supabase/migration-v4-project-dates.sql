-- Project dates for the Roadmap page. Safe to re-run.
alter table public.projects add column if not exists start_date date;
alter table public.projects add column if not exists end_date date;
