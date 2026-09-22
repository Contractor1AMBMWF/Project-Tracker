"use client";

import { useState } from "react";
import GroupHeader from "@/components/GroupHeader";
import TaskRow from "@/components/TaskRow";
import AddTaskRow from "@/components/AddTaskRow";
import AddGroupButton from "@/components/AddGroupButton";
import type { Group, Task } from "@/lib/types";

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
  const doneCount = tasks.filter((t) => t.status === "done").length;

  return (
    <div>
      <div className="mb-3 flex items-center justify-end gap-3 text-sm">
        <button
          onClick={() => setHideDone((v) => !v)}
          className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-slate-600 hover:border-brand hover:text-brand"
        >
          {hideDone ? "Show" : "Hide"} done ({doneCount})
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {groups.map((group) => {
          const groupTasks = tasks.filter(
            (t) => t.group_id === group.id && (!hideDone || t.status !== "done")
          );
          const totalInGroup = tasks.filter((t) => t.group_id === group.id).length;
          return (
            <div key={group.id} className="w-80 shrink-0 rounded-lg border border-slate-200 bg-white">
              <GroupHeader
                groupId={group.id}
                projectId={projectId}
                name={group.name}
                count={totalInGroup}
              />
              <div>
                {groupTasks.map((task) => (
                  <TaskRow key={task.id} task={task} projectId={projectId} />
                ))}
              </div>
              <AddTaskRow projectId={projectId} groupId={group.id} />
            </div>
          );
        })}
        <AddGroupButton projectId={projectId} />
      </div>
    </div>
  );
}
