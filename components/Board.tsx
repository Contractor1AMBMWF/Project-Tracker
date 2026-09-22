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
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {groups.map((group) => {
        const groupTasks = tasks.filter((t) => t.group_id === group.id);
        return (
          <div key={group.id} className="w-72 shrink-0 rounded-lg border border-slate-200 bg-white">
            <GroupHeader
              groupId={group.id}
              projectId={projectId}
              name={group.name}
              count={groupTasks.length}
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
  );
}
