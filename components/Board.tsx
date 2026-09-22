"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, ChevronsDownUp, ChevronsUpDown } from "lucide-react";
import TaskRow from "@/components/TaskRow";
import AddTaskRow from "@/components/AddTaskRow";
import GroupHeader from "@/components/GroupHeader";
import { Button } from "@/components/ui/Button";
import type { Group, Task } from "@/lib/types";

const STORAGE_KEY = "ambtracker:hideDone";
const collapseKey = (projectId: string) => `ambtracker:collapsed:${projectId}`;

export default function Board({
  projectId,
  groups,
  tasks,
}: {
  projectId: string;
  groups: Group[];
  tasks: Task[];
}) {
  const [hideDone, setHideDone] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  useEffect(() => {
    setHideDone(localStorage.getItem(STORAGE_KEY) === "1");
    try {
      const raw = localStorage.getItem(collapseKey(projectId));
      if (raw) setCollapsed(new Set(JSON.parse(raw) as string[]));
    } catch {
      // start expanded
    }
  }, [projectId]);

  function toggleGroup(groupId: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      localStorage.setItem(collapseKey(projectId), JSON.stringify([...next]));
      return next;
    });
  }

  const allCollapsed = groups.length > 0 && groups.every((g) => collapsed.has(g.id));

  function toggleAll() {
    const next = allCollapsed ? new Set<string>() : new Set(groups.map((g) => g.id));
    setCollapsed(next);
    localStorage.setItem(collapseKey(projectId), JSON.stringify([...next]));
  }

  function toggleHideDone() {
    setHideDone((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }

  const doneCount = tasks.filter((t) => t.status === "done").length;

  if (groups.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-ink-300 bg-white p-10 text-center text-ink-500">
        No groups yet. Add a group below to start adding tasks.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {(doneCount > 0 || groups.length > 1) && (
        <div className="flex justify-end gap-2">
          {groups.length > 1 && (
            <Button variant="secondary" size="sm" onClick={toggleAll}>
              {allCollapsed ? <ChevronsUpDown size={13} /> : <ChevronsDownUp size={13} />}
              {allCollapsed ? "Expand all" : "Collapse all"}
            </Button>
          )}
          {doneCount > 0 && (
            <Button variant="secondary" size="sm" onClick={toggleHideDone}>
              {hideDone ? <Eye size={13} /> : <EyeOff size={13} />}
              {hideDone ? `Show done (${doneCount})` : `Hide done (${doneCount})`}
            </Button>
          )}
        </div>
      )}

      {groups.map((group) => {
        const groupTasks = tasks.filter((t) => t.group_id === group.id);
        const visible = hideDone ? groupTasks.filter((t) => t.status !== "done") : groupTasks;
        const hidden = groupTasks.length - visible.length;
        const isCollapsed = collapsed.has(group.id);
        const groupDone = groupTasks.filter((t) => t.status === "done").length;

        return (
          <section key={group.id}>
            <GroupHeader
              group={group}
              projectId={projectId}
              collapsed={isCollapsed}
              onToggle={() => toggleGroup(group.id)}
              summary={`${groupTasks.length} task${groupTasks.length === 1 ? "" : "s"} · ${groupDone} done`}
            />

            {isCollapsed ? (
              <button
                onClick={() => toggleGroup(group.id)}
                className="w-full rounded-card border border-dashed border-ink-200 bg-white/60 px-4 py-2 text-left text-xs text-ink-400 transition-colors hover:border-ink-300 hover:text-ink-600"
              >
                {groupTasks.length} task{groupTasks.length === 1 ? "" : "s"} hidden, click to expand
              </button>
            ) : (
              <div className="overflow-x-auto rounded-card border border-ink-200 bg-white shadow-card">
                <div className="flex min-w-max border-b border-ink-200 bg-ink-50 text-label uppercase text-ink-400">
                  <div className="min-w-[220px] flex-1 px-4 py-2">Task</div>
                  <div className="w-36 px-2 py-2 text-center">Assignee</div>
                  <div className="w-44 px-2 py-2 text-center">Status</div>
                  <div className="w-28 px-2 py-2 text-center">Priority</div>
                  <div className="w-36 px-2 py-2 text-center">Due date</div>
                  <div className="w-20 px-2 py-2" />
                </div>

                {visible.map((task) => (
                  <TaskRow key={task.id} task={task} projectId={projectId} accent={group.color} />
                ))}

                {hidden > 0 && (
                  <button
                    onClick={toggleHideDone}
                    className="w-full border-t border-ink-200 px-4 py-2 text-left text-xs text-ink-400 transition-colors hover:bg-ink-50 hover:text-ink-600"
                  >
                    {hidden} done task{hidden === 1 ? "" : "s"} hidden — show
                  </button>
                )}

                <AddTaskRow groupId={group.id} projectId={projectId} />
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
