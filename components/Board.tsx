"use client";

import { Eye, EyeOff, ChevronsDownUp, ChevronsUpDown } from "lucide-react";
import TaskRow from "@/components/TaskRow";
import AddTaskRow from "@/components/AddTaskRow";
import GroupHeader from "@/components/GroupHeader";
import { Button } from "@/components/ui/Button";
import { useStoredFlag, useStoredString } from "@/lib/useStoredState";
import type { Group, Task } from "@/lib/types";

const STORAGE_KEY = "ambtracker:hideDone";
const collapseKey = (projectId: string) => `ambtracker:collapsed:${projectId}`;

function parseIds(raw: string) {
  try {
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set<string>();
  }
}

export default function Board({
  projectId,
  groups,
  tasks,
}: {
  projectId: string;
  groups: Group[];
  tasks: Task[];
}) {
  const [hideDone, setHideDone] = useStoredFlag(STORAGE_KEY);
  const [collapsedRaw, setCollapsedRaw] = useStoredString(collapseKey(projectId), "[]");
  const collapsed = parseIds(collapsedRaw);
  const setCollapsed = (next: Set<string>) => setCollapsedRaw(JSON.stringify([...next]));

  function toggleGroup(groupId: string) {
    const next = new Set(collapsed);
    if (next.has(groupId)) next.delete(groupId);
    else next.add(groupId);
    setCollapsed(next);
  }

  const allCollapsed = groups.length > 0 && groups.every((g) => collapsed.has(g.id));

  function toggleAll() {
    setCollapsed(allCollapsed ? new Set<string>() : new Set(groups.map((g) => g.id)));
  }

  const toggleHideDone = () => setHideDone(!hideDone);

  const doneCount = tasks.filter((t) => t.status === "done").length;

  if (groups.length === 0) {
    return (
      <div className="rounded-card border-2 border-dashed border-ink-300 p-10 text-center text-ink-400">
        No groups yet. Add a group below to start adding tasks.
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
          <section key={group.id} className="rounded-card bg-white px-1 pb-1.5 pt-3.5">
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
                className="mx-3.5 mb-2 text-left text-[13px] font-semibold text-ink-400 hover:text-ink-900"
              >
                {groupTasks.length} task{groupTasks.length === 1 ? "" : "s"} hidden, click to expand
              </button>
            ) : (
              <div className="overflow-x-auto">
                <div className="hidden min-w-max text-xs font-semibold text-ink-400 md:flex">
                  <div className="min-w-[260px] flex-1 px-3.5 py-2">Task</div>
                  <div className="w-36 px-2 py-2">Owner</div>
                  <div className="w-40 px-2 py-2">Status</div>
                  <div className="w-32 px-2 py-2">Priority</div>
                  <div className="w-24 px-2 py-2" />
                </div>

                {visible.map((task) => (
                  <TaskRow key={task.id} task={task} projectId={projectId} />
                ))}

                {hidden > 0 && (
                  <button
                    onClick={toggleHideDone}
                    className="w-full border-t border-ink-200 px-3.5 py-2 text-left text-[13px] font-semibold text-ink-400 hover:text-ink-900"
                  >
                    {hidden} done task{hidden === 1 ? "" : "s"} hidden. Show
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
