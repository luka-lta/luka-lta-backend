import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Main } from "@/components/layout/main.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Empty, EmptyMedia, EmptyTitle } from "@/components/ui/empty.tsx";
import { ErrorState } from "@/components/error-state.tsx";
import { FolderKanban, Plus } from "lucide-react";
import { useSetPageTitle } from "@/hooks/useSetPageTitle.ts";
import { useManagedProjects, useReorderProjects } from "@/api/projects/hooks.ts";
import { getApiErrorMessage } from "@/lib/apiError.ts";
import ProjectsProvider, { useProjects } from "@/feature/project-management/context/projects-context.tsx";
import { ProjectCard } from "@/feature/project-management/components/ProjectCard.tsx";
import { ProjectCardSkeleton } from "@/feature/project-management/components/ProjectCardSkeleton.tsx";
import { ProjectDialogs } from "@/feature/project-management/components/ProjectDialogs.tsx";

/** Anzahl der Skeleton-Karten im Ladezustand. */
const SKELETON_COUNT = 4;

function ProjectList() {
  const projects = useManagedProjects();
  const reorderProjects = useReorderProjects();
  const { setOpen } = useProjects();

  /**
   * Lokale Reihenfolge, nur waehrend ein Reorder "dirty" ist (optimistisch
   * nach einem Drop gesetzt, bis die Mutation abgeschlossen ist). Ausserhalb
   * dieses Fensters wird die Reihenfolge direkt aus `projects.data` abgeleitet
   * statt gespiegelt — ein fehlgeschlagener Reorder re-synct dadurch ueber
   * `onError`/Invalidierung automatisch aus den Server-Daten, statt bei der
   * alten (lokalen) Reihenfolge haengen zu bleiben.
   */
  const [localOrder, setLocalOrder] = useState<string[] | null>(null);

  const orderedProjects = useMemo(() => {
    const data = projects.data ?? [];
    if (!localOrder) {
      return data;
    }

    const byId = new Map(data.map((project) => [project.id, project]));
    const ordered = localOrder.flatMap((id) => {
      const project = byId.get(id);
      return project ? [project] : [];
    });

    return ordered.length === data.length ? ordered : data;
  }, [projects.data, localOrder]);

  const sensors = useSensors(useSensor(PointerSensor));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = orderedProjects.findIndex((project) => project.id === active.id);
    const newIndex = orderedProjects.findIndex((project) => project.id === over.id);
    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const reordered = arrayMove(orderedProjects, oldIndex, newIndex);
    setLocalOrder(reordered.map((project) => project.id));
    reorderProjects.mutate(
      reordered.map((project, index) => ({ projectId: project.id, sortOrder: index })),
      {
        onError: (error) => {
          toast.error(getApiErrorMessage(error));
        },
        onSettled: () => {
          setLocalOrder(null);
        },
      },
    );
  }

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

  if (orderedProjects.length === 0) {
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
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={orderedProjects.map((project) => project.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {orderedProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
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
