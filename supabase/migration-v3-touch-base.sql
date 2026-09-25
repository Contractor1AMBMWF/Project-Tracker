-- Touch Base notes: manual items for the Tuesday / Friday calls. Safe to re-run.
-- kind: 'done' (extra accomplishment), 'action' (pending action item), 'info' (info needed)
-- audience: who the item is for, e.g. 'RJ', 'Matt', 'Both' (used for info-needed items)
create table if not exists public.touch_base_notes (
  id uuid primary key default gen_random_uuid(),
  period_key text not null,
  kind text not null,
  body text not null,
  audience text,
  project_id uuid references public.projects(id) on delete set null,
  resolved boolean not null default false,
  resolved_at timestamptz,
  author text,
  created_at timestamptz not null default now()
);

create index if not exists touch_base_notes_period_idx on public.touch_base_notes(period_key);

alter table public.touch_base_notes enable row level security;

drop policy if exists "touch_base_notes_read" on public.touch_base_notes;
create policy "touch_base_notes_read" on public.touch_base_notes for select using (true);
