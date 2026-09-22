-- =============================================================
-- Ambassador Project Tracker schema
-- Run in Supabase SQL Editor (Dashboard > SQL Editor > New query).
-- Safe to re-run.
--
-- Access model: single shared password gates writes (no per-user login).
-- Anonymous (anon key) can read everything. All writes go through Next.js
-- server actions using the service-role key, gated by a password cookie.
-- =============================================================

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  lead_name text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

-- A "group" is a colored section of rows inside a project (kanban column).
create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  color text not null default '#E8520A',
  position int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  status text not null default 'not_started',
  priority text,
  assignee text,
  due_date date,
  completed_at timestamptz,
  position int not null default 0,
  created_at timestamptz not null default now()
);

-- Comment thread on a task.
create table if not exists public.task_updates (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  body text not null,
  author text,
  created_at timestamptz not null default now()
);

-- Append-only activity feed. Powers the dashboard "recent activity" list.
create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  actor_name text,
  project_id uuid references public.projects(id) on delete set null,
  project_name text,
  task_id uuid references public.tasks(id) on delete set null,
  task_title text,
  detail text,
  created_at timestamptz not null default now()
);

create index if not exists tasks_project_idx on public.tasks(project_id);
create index if not exists tasks_group_idx on public.tasks(group_id);
create index if not exists groups_project_idx on public.groups(project_id);
create index if not exists task_updates_task_idx on public.task_updates(task_id);
create index if not exists activity_log_created_idx on public.activity_log(created_at desc);

-- =============================================================
-- Row Level Security: public read-only. Writes are blocked for the anon
-- key; only the server's service-role key (password-gated) can modify data.
-- =============================================================
alter table public.projects     enable row level security;
alter table public.groups       enable row level security;
alter table public.tasks        enable row level security;
alter table public.task_updates enable row level security;
alter table public.activity_log enable row level security;

drop policy if exists "projects_read" on public.projects;
create policy "projects_read" on public.projects for select using (true);

drop policy if exists "groups_read" on public.groups;
create policy "groups_read" on public.groups for select using (true);

drop policy if exists "tasks_read" on public.tasks;
create policy "tasks_read" on public.tasks for select using (true);

drop policy if exists "task_updates_read" on public.task_updates;
create policy "task_updates_read" on public.task_updates for select using (true);

drop policy if exists "activity_log_read" on public.activity_log;
create policy "activity_log_read" on public.activity_log for select using (true);

-- No insert/update/delete policies are defined, so those are denied for the
-- anon key. The server-side service-role key bypasses RLS entirely.
