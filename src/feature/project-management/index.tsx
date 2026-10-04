import { Main } from "@/components/layout/main.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Empty, EmptyMedia, EmptyTitle } from "@/components/ui/empty.tsx";
import { ErrorState } from "@/components/error-state.tsx";
import { FolderKanban, Plus } from "lucide-react";
import { useSetPageTitle } from "@/hooks/useSetPageTitle.ts";
import { useManagedProjects } from "@/api/projects/hooks.ts";
import { getApiErrorMessage } from "@/lib/apiError.ts";
import ProjectsProvider, { useProjects } from "@/feature/project-management/context/projects-context.tsx";
import { ProjectCard } from "@/feature/project-management/components/ProjectCard.tsx";
import { ProjectCardSkeleton } from "@/feature/project-management/components/ProjectCardSkeleton.tsx";
import { ProjectDialogs } from "@/feature/project-management/components/ProjectDialogs.tsx";

/** Anzahl der Skeleton-Karten im Ladezustand. */
const SKELETON_COUNT = 4;

function ProjectList() {
  const projects = useManagedProjects();
  const { setOpen } = useProjects();

  if (projects.error) {
    return (
      <ErrorState
        title="Failed to load projects"
        message={getApiErrorMessage(projects.error)}
        refetch={projects.refetch}
      />
    );
  }

  if (projects.isPending) {
    return (
      <div className="space-y-3">
        {Array.from({ length: SKELETON_COUNT }, (_, index) => (
          <ProjectCardSkeleton key={index} />
        ))}
      </div>
    );
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

  return (
    <div className="space-y-3">
      {items.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}

function ProjectManagementContent() {
  const { setOpen } = useProjects();

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Projects</h2>
          <p className="text-muted-foreground">
            Manage the projects shown on the public portfolio.
          </p>
        </div>
        <Button onClick={() => setOpen("add")}>
          <Plus className="h-4 w-4" />
          Project
        </Button>
      </div>

      <ProjectList />
    </>
  );
}

function ProjectManagement() {
  useSetPageTitle("Backend - Projects");

  return (
    <ProjectsProvider>
      <Main>
        <ProjectManagementContent />
      </Main>
      <ProjectDialogs />
    </ProjectsProvider>
  );
}

export default ProjectManagement;
