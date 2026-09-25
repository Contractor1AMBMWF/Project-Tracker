"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  checkPassword,
  clearSessionCookie,
  getActorName,
  requireSession,
  setActorName,
  setSessionCookie,
} from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { TaskPriority, TaskStatus } from "@/lib/types";

// ---------- auth ----------

export async function login(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const next = String(formData.get("next") ?? "/");

  if (!checkPassword(password)) {
    redirect(`/login?error=1&next=${encodeURIComponent(next)}`);
  }

  await setSessionCookie();
  if (name) await setActorName(name);
  redirect(next || "/");
}

export async function signOut() {
  await clearSessionCookie();
  redirect("/login");
}

// ---------- activity log ----------

async function logActivity(entry: {
  action: string;
  project_id?: string | null;
  project_name?: string | null;
  task_id?: string | null;
  task_title?: string | null;
  detail?: string | null;
}) {
  const actor_name = await getActorName();
  const admin = createAdminClient();
  await admin.from("activity_log").insert({ actor_name, ...entry });
}

// ---------- projects ----------

export async function createProject(formData: FormData) {
  await requireSession();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const admin = createAdminClient();
  const { count } = await admin
    .from("projects")
    .select("id", { count: "exact", head: true });

  const { data: project, error } = await admin
    .from("projects")
    .insert({ name, position: count ?? 0 })
    .select()
    .single();
  if (error || !project) return;

  await admin.from("groups").insert({ project_id: project.id, name: "To Do", position: 0 });

  await logActivity({
    action: "project_created",
    project_id: project.id,
    project_name: project.name,
  });

  revalidatePath("/");
  redirect(`/projects/${project.id}`);
}

export async function deleteProject(projectId: string) {
  await requireSession();
  const admin = createAdminClient();
  const { data: project } = await admin
    .from("projects")
    .select("name")
    .eq("id", projectId)
    .single();

  await admin.from("projects").delete().eq("id", projectId);

  await logActivity({
    action: "project_deleted",
    project_name: project?.name ?? "Unknown project",
  });

  revalidatePath("/");
  redirect("/");
}

export async function updateProject(
  projectId: string,
  patch: Partial<{
    name: string;
    description: string;
    repo_url: string;
    website_url: string;
  }>
) {
  await requireSession();
  const admin = createAdminClient();
  await admin.from("projects").update(patch).eq("id", projectId);
  revalidatePath(`/projects/${projectId}`);
}

// ---------- groups ----------

export async function createGroup(projectId: string, name: string) {
  await requireSession();
  const admin = createAdminClient();
  const { count } = await admin
    .from("groups")
    .select("id", { count: "exact", head: true })
    .eq("project_id", projectId);

  await admin
    .from("groups")
    .insert({ project_id: projectId, name: name || "New group", position: count ?? 0 });

  revalidatePath(`/projects/${projectId}`);
}

export async function renameGroup(groupId: string, projectId: string, name: string) {
  await requireSession();
  const admin = createAdminClient();
  await admin.from("groups").update({ name }).eq("id", groupId);
  revalidatePath(`/projects/${projectId}`);
}

export async function deleteGroup(groupId: string, projectId: string) {
  await requireSession();
  const admin = createAdminClient();
  await admin.from("groups").delete().eq("id", groupId);
  revalidatePath(`/projects/${projectId}`);
}

// ---------- tasks ----------

export async function createTask(
  projectId: string,
  groupId: string,
  title: string
) {
  await requireSession();
  if (!title.trim()) return;
  const admin = createAdminClient();

  const { count } = await admin
    .from("tasks")
    .select("id", { count: "exact", head: true })
    .eq("group_id", groupId);

  const { data: task } = await admin
    .from("tasks")
    .insert({
      project_id: projectId,
      group_id: groupId,
      title: title.trim(),
      position: count ?? 0,
    })
    .select("id, title, projects(name)")
    .single();

  const { data: project } = await admin
    .from("projects")
    .select("name")
    .eq("id", projectId)
    .single();

  await logActivity({
    action: "task_created",
    project_id: projectId,
    project_name: project?.name,
    task_id: task?.id,
    task_title: title.trim(),
  });

  revalidatePath(`/projects/${projectId}`);
}

export async function applyTaskPatch(
  taskId: string,
  patch: Partial<{
    title: string;
    status: TaskStatus;
    priority: TaskPriority | null;
    assignee: string | null;
    due_date: string | null;
    group_id: string;
    position: number;
  }>
) {
  await requireSession();
  const admin = createAdminClient();

  const { data: task } = await admin
    .from("tasks")
    .select("id, title, status, project_id, projects(name)")
    .eq("id", taskId)
    .single<{
      id: string;
      title: string;
      status: TaskStatus;
      project_id: string;
      projects: { name: string } | null;
    }>();
  if (!task) return;

  const nextPatch: typeof patch & { completed_at?: string | null } = { ...patch };

  if (patch.status && patch.status !== task.status) {
    nextPatch.completed_at = patch.status === "done" ? new Date().toISOString() : null;
  }

  await admin.from("tasks").update(nextPatch).eq("id", taskId);

  if (patch.status && patch.status !== task.status) {
    const fromLabel = task.status;
    await logActivity({
      action: patch.status === "done" ? "completed" : "status_changed",
      project_id: task.project_id,
      project_name: task.projects?.name,
      task_id: task.id,
      task_title: task.title,
      detail: `${fromLabel} → ${patch.status}`,
    });
  } else if (patch.assignee !== undefined) {
    await logActivity({
      action: "assigned",
      project_id: task.project_id,
      project_name: task.projects?.name,
      task_id: task.id,
      task_title: task.title,
      detail: patch.assignee ? `Assigned to ${patch.assignee}` : "Unassigned",
    });
  }

  revalidatePath(`/projects/${task.project_id}`);
  revalidatePath(`/tasks/${taskId}`);
  revalidatePath("/");
}

export async function deleteTask(taskId: string, projectId: string) {
  await requireSession();
  const admin = createAdminClient();
  const { data: task } = await admin
    .from("tasks")
    .select("title, projects(name)")
    .eq("id", taskId)
    .single<{ title: string; projects: { name: string } | null }>();

  await admin.from("tasks").delete().eq("id", taskId);

  await logActivity({
    action: "task_deleted",
    project_id: projectId,
    project_name: task?.projects?.name,
    task_title: task?.title,
  });

  revalidatePath(`/projects/${projectId}`);
}

// ---------- task updates (comments) ----------

export async function addTaskUpdate(taskId: string, projectId: string, body: string) {
  await requireSession();
  if (!body.trim()) return;
  const author = await getActorName();
  const admin = createAdminClient();

  await admin.from("task_updates").insert({ task_id: taskId, body: body.trim(), author });

  const { data: task } = await admin
    .from("tasks")
    .select("title, projects(name)")
    .eq("id", taskId)
    .single<{ title: string; projects: { name: string } | null }>();

  await logActivity({
    action: "update_posted",
    project_id: projectId,
    project_name: task?.projects?.name,
    task_id: taskId,
    task_title: task?.title,
    detail: body.trim().slice(0, 140),
  });

  revalidatePath(`/tasks/${taskId}`);
}

// ---------- touch base notes ----------

export async function addTouchBaseNote(input: {
  periodKey: string;
  kind: "done" | "action" | "info";
  body: string;
  audience?: string | null;
}) {
  await requireSession();
  const body = input.body.trim();
  if (!body) return;
  const author = await getActorName();
  const admin = createAdminClient();
  await admin.from("touch_base_notes").insert({
    period_key: input.periodKey,
    kind: input.kind,
    body,
    audience: input.audience || null,
    author,
  });
  revalidatePath("/touch-base");
}

// An answer is a touch_base_notes row of kind "answer" whose period_key holds
// the id of the info item it answers, so replies need no extra table.
export async function addTouchBaseAnswer(noteId: string, body: string) {
  await requireSession();
  const text = body.trim();
  if (!text) return;
  const author = await getActorName();
  const admin = createAdminClient();
  await admin.from("touch_base_notes").insert({ period_key: noteId, kind: "answer", body: text, author });
  revalidatePath("/touch-base");
}

export async function setTouchBaseNoteResolved(id: string, resolved: boolean) {
  await requireSession();
  const admin = createAdminClient();
  await admin
    .from("touch_base_notes")
    .update({ resolved, resolved_at: resolved ? new Date().toISOString() : null })
    .eq("id", id);
  revalidatePath("/touch-base");
}

export async function deleteTouchBaseNote(id: string) {
  await requireSession();
  const admin = createAdminClient();
  await admin.from("touch_base_notes").delete().eq("id", id);
  revalidatePath("/touch-base");
}
