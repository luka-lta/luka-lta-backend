import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  type Announcements,
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  type UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { FolderKanban, Plus } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { PageContainer, PageHeader } from "@/components/layout/page.tsx";
import { EmptyState } from "@/components/feedback/empty-state.tsx";
import { ErrorState } from "@/components/feedback/error-state.tsx";
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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const nameOf = (id: UniqueIdentifier) => orderedProjects.find((project) => project.id === id)?.name ?? "Projekt";
  const positionOf = (id: UniqueIdentifier) => orderedProjects.findIndex((project) => project.id === id) + 1;
  const announcements: Announcements = {
    onDragStart: ({ active }) => `${nameOf(active.id)} aufgenommen, Position ${positionOf(active.id)}.`,
    onDragOver: ({ active, over }) => (over ? `${nameOf(active.id)} über Position ${positionOf(over.id)}.` : undefined),
    onDragEnd: ({ active, over }) =>
      over ? `${nameOf(active.id)} auf Position ${positionOf(over.id)} abgelegt.` : `${nameOf(active.id)} abgelegt.`,
    onDragCancel: ({ active }) => `Verschieben von ${nameOf(active.id)} abgebrochen.`,
  };

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
        title="Projekte konnten nicht geladen werden"
        error={projects.error}
        onRetry={() => projects.refetch()}
      />
    );
  }

  if (projects.isPending) {
    return (
      <div className="space-y-2" aria-busy="true" aria-label="Wird geladen">
        {Array.from({ length: SKELETON_COUNT }, (_, index) => (
          <ProjectCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (orderedProjects.length === 0) {
    return (
      <EmptyState
        icon={FolderKanban}
        title="Noch keine Projekte"
        description="Projekte erscheinen in dieser Reihenfolge im öffentlichen Portfolio."
        action={
          <Button variant="outline" size="sm" onClick={() => setOpen("add")}>
            Projekt anlegen
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        Reihenfolge per Ziehen am Griff ändern (oder Griff fokussieren, Leertaste, Pfeiltasten). So erscheinen die
        Projekte im Portfolio.
      </p>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleDragEnd}
        accessibility={{
          announcements,
          screenReaderInstructions: {
            draggable:
              "Leertaste zum Aufnehmen, Pfeiltasten zum Verschieben, Leertaste zum Ablegen, Escape zum Abbrechen.",
          },
        }}
      >
        <SortableContext items={orderedProjects.map((project) => project.id)} strategy={verticalListSortingStrategy}>
          <ol className="space-y-2" aria-label="Projekte in Portfolio-Reihenfolge">
            {orderedProjects.map((project, index) => (
              <ProjectCard key={project.id} project={project} position={index + 1} />
            ))}
          </ol>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function ProjectManagementContent() {
  const { setOpen } = useProjects();

  return (
    <PageContainer title="Projekte" width="narrow">
      <PageHeader
        title="Projekte"
        description="Projekte im öffentlichen Portfolio pflegen und sortieren."
        actions={
          <Button onClick={() => setOpen("add")}>
            <Plus />
            Projekt anlegen
          </Button>
        }
      />
      <ProjectList />
    </PageContainer>
  );
}

function ProjectManagement() {
  return (
    <ProjectsProvider>
      <ProjectManagementContent />
      <ProjectDialogs />
    </ProjectsProvider>
  );
}

export default ProjectManagement;
