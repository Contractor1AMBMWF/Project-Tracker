export type TaskStatus = "not_started" | "working_on_it" | "stuck" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface Project {
  id: string;
  name: string;
  description: string | null;
  repo_url: string | null;
  website_url: string | null;
  // Roadmap dates (migration-v4). Undefined until that migration runs.
  start_date?: string | null;
  end_date?: string | null;
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
  not_started: { label: "Not started", color: "#9a9cb0" },
  working_on_it: { label: "Working on it", color: "#e59a00" },
  stuck: { label: "Stuck", color: "#D93A2B" },
  done: { label: "Done", color: "#00a874" },
};

// Board card fill and text colour per status.
export const STATUS_CARD: Record<TaskStatus, { bg: string; fg: string; light?: boolean }> = {
  not_started: { bg: "#ffffff", fg: "#161616" },
  working_on_it: { bg: "#F2C14E", fg: "#2b2100" },
  stuck: { bg: "#E8622C", fg: "#ffffff", light: true },
  done: { bg: "#1a2740", fg: "#ffffff", light: true },
};

export const STATUS_ORDER: TaskStatus[] = ["not_started", "working_on_it", "stuck", "done"];

export const PRIORITY_META: Record<TaskPriority, { label: string; color: string }> = {
  low: { label: "Low", color: "#8d8c88" },
  medium: { label: "Medium", color: "#4a4a48" },
  high: { label: "High", color: "#E8520A" },
};
