import { useProjects } from "@/feature/project-management/context/projects-context.tsx";
import { ProjectFormDialog } from "@/feature/project-management/components/ProjectFormDialog.tsx";

export function ProjectDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useProjects();

  return (
    <>
      <ProjectFormDialog
        key="project-add"
        mode="create"
        project={null}
        open={open === "add"}
        onOpenChange={(state) => {
          setOpen(state ? "add" : null);
          if (!state) {
            setTimeout(() => {
              setCurrentRow(null);
            }, 500);
          }
        }}
      />

      {currentRow && (
        <ProjectFormDialog
          key={`project-edit-${currentRow.id}`}
          mode="edit"
          project={currentRow}
          open={open === "edit"}
          onOpenChange={(state) => {
            setOpen(state ? "edit" : null);
            if (!state) {
              setTimeout(() => {
                setCurrentRow(null);
              }, 500);
            }
          }}
        />
      )}
    </>
  );
}

export default ProjectDialogs;
