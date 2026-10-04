import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog.tsx";
import { buttonVariants } from "@/components/ui/button.tsx";
import { Spinner } from "@/components/ui/kibo-ui/spinner/index.tsx";
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
        toast.success("Project deleted successfully!");
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error));
      },
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete project?</AlertDialogTitle>
          <AlertDialogDescription>
            &ldquo;{project.name}&rdquo; will be permanently deleted. Its project assets will be removed
            as well.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteProject.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={buttonVariants({ variant: "destructive" })}
            disabled={deleteProject.isPending}
            onClick={(event) => {
              event.preventDefault();
              handleConfirm();
            }}
          >
            {deleteProject.isPending && <Spinner size={16} className="mr-2" />}
            Delete project
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
