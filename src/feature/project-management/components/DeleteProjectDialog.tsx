import { toast } from "sonner";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog.tsx";
import { useDeleteProject } from "@/api/projects/hooks.ts";
import type { Project } from "@/api/projects/schema.ts";
import { getApiErrorMessage } from "@/lib/apiError.ts";

interface Props {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteProjectDialog({ project, open, onOpenChange }: Props) {
  const deleteProject = useDeleteProject();

  function handleConfirm() {
    deleteProject.mutate(project.id, {
      onSuccess: () => {
        onOpenChange(false);
        toast.success("Projekt gelöscht");
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={handleConfirm}
      isLoading={deleteProject.isPending}
      destructive
      title="Projekt löschen?"
      description={
        <>
          <span className="font-medium text-foreground">{project.name}</span> wird samt Logo und Cover dauerhaft
          entfernt und verschwindet aus dem Portfolio.
        </>
      }
      confirmLabel="Löschen"
    />
  );
}
