# Ambassador Project Tracker

Simple internal project and task tracker for Ambassador. A stripped-down
sibling of the EDUK8U tracker: no per-user login, no sprints, no AI chatbot,
no credentials vault — just projects, kanban task boards, and comments.

## Stack

Next.js 15 (App Router) + TypeScript + Tailwind CSS + Supabase (Postgres) + Vercel.

## Access model

One shared password gates all writes (set via `APP_PASSWORD`). Anyone who
knows the password can enter their name and use the tracker; the name is
stored in a cookie and used to attribute tasks, comments, and the activity
log — there are no real user accounts.

Reads are public via the Supabase anon key + RLS `select` policies. Writes
go through Next.js server actions using the service-role key, and every
action calls `requireSession()` first (`lib/auth.ts`), so a write is
impossible without the password cookie even if a form is posted directly.

## Data model

`projects` → `groups` (kanban columns) → `tasks` (status / priority /
assignee / due date), plus `task_updates` (comments on a task) and
`activity_log` (append-only feed powering the dashboard's recent activity).
See `supabase/schema.sql` for the full schema.

## Local development

```bash
npm install
cp .env.local.example .env.local   # fill in Supabase + APP_PASSWORD
npm run dev
# → http://localhost:3000
```

Run `supabase/schema.sql` in your Supabase project's SQL Editor before first use.

## Environment variables

| Variable | Purpose | Exposed to browser? |
|----------|---------|---------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key (read-only via RLS) | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin writes in server actions | No — server only |
| `APP_PASSWORD` | Shared password gating writes | No — server only |

## Deployment

Deploys to Vercel. Set the four env vars above in the Vercel project
settings, then push to `main`.
