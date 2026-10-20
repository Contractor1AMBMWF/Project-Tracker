"use client";

import { Plus } from "lucide-react";
import { createGroup } from "@/app/actions";
import { Button } from "@/components/ui/Button";

export default function AddGroupButton({ projectId }: { projectId: string }) {
  return (
    <Button variant="secondary" onClick={() => createGroup(projectId, "New Group")}>
      <Plus size={15} />
      Add group
    </Button>
  );
}
