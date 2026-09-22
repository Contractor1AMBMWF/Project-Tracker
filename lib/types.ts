export type TaskStatus = "not_started" | "working_on_it" | "stuck" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface Project {
  id: string;
  name: string;
  description: string | null;
  repo_url: string | null;
  website_url: string | null;
  position: number;
  created_at: string;
}

export interface Group {
  id: string;
  project_id: string;
  name: string;
  color: string;
  position: number;
  created_at: string;
}

export interface Task {
  id: string;
  group_id: string;
  project_id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority | null;
  assignee: string | null;
  due_date: string | null;
  completed_at: string | null;
  position: number;
  created_at: string;
}

export interface TaskUpdate {
  id: string;
  task_id: string;
  body: string;
  author: string | null;
  created_at: string;
}

export interface ActivityEntry {
  id: string;
  action:
    | "task_created"
    | "status_changed"
    | "completed"
    | "reopened"
    | "assigned"
    | "task_deleted"
    | "update_posted"
    | "project_created"
    | "project_deleted";
  actor_name: string | null;
  project_id: string | null;
  project_name: string | null;
  task_id: string | null;
  task_title: string | null;
  detail: string | null;
  created_at: string;
}

export const STATUS_META: Record<TaskStatus, { label: string; color: string }> = {
  not_started: { label: "Not Started", color: "#94a3b8" },
  working_on_it: { label: "Working on it", color: "#eab308" },
  stuck: { label: "Stuck", color: "#ef4444" },
  done: { label: "Done", color: "#22c55e" },
};

export const STATUS_ORDER: TaskStatus[] = ["not_started", "working_on_it", "stuck", "done"];

export const PRIORITY_META: Record<TaskPriority, { label: string; color: string }> = {
  low: { label: "Low", color: "#64748b" },
  medium: { label: "Medium", color: "#f59e0b" },
  high: { label: "High", color: "#ef4444" },
};
