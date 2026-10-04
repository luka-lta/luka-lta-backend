import { Main } from "@/components/layout/main.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Empty, EmptyMedia, EmptyTitle } from "@/components/ui/empty.tsx";
import { ErrorState } from "@/components/error-state.tsx";
import { FolderKanban, Plus } from "lucide-react";
import { useSetPageTitle } from "@/hooks/useSetPageTitle.ts";
import { useManagedProjects } from "@/api/projects/hooks.ts";
import ProjectsProvider, { useProjects } from "@/feature/project-management/context/projects-context.tsx";

function ProjectList() {
  const projects = useManagedProjects();
  const { setOpen } = useProjects();

  if (projects.error) {
    return (
      <ErrorState
        title="Failed to load projects"
        message={projects.error.message}
        refetch={projects.refetch}
      />
    );
  }

  if (projects.isPending) {
    return <p className="text-muted-foreground">Loading projects...</p>;
  }

  const items = projects.data ?? [];

  if (items.length === 0) {
    return (
      <Empty className="border-0 py-12">
        <EmptyMedia variant="icon">
          <FolderKanban />
        </EmptyMedia>
        <EmptyTitle>No projects yet</EmptyTitle>
        <Button onClick={() => setOpen("add")}>
          <Plus className="h-4 w-4" />
          Create project
        </Button>
      </Empty>
    );
  }

  return <p className="text-muted-foreground">{items.length} projects</p>;
}

function ProjectManagement() {
  useSetPageTitle("Backend - Projects");

  return (
    <ProjectsProvider>
      <Main>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Projects</h2>
            <p className="text-muted-foreground">
              Manage the projects shown on the public portfolio.
            </p>
          </div>
        </div>

        <ProjectList />
      </Main>
    </ProjectsProvider>
  );
}

export default ProjectManagement;
