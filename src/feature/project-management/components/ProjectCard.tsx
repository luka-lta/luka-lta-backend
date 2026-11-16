import { EyeOff, GripVertical, ImageOff, Pencil, Trash2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge.tsx";
import { StatusBadge } from "@/components/feedback/status-badge.tsx";
import { RowActions } from "@/components/data/row-actions.tsx";
import { cn } from "@/lib/utils.ts";
import type { Project } from "@/api/projects/schema.ts";
import { useProjects } from "@/feature/project-management/context/projects-context.tsx";
import { PROJECT_STATUS } from "@/feature/project-management/projectStatus.ts";

interface ProjectCardProps {
  project: Project;
  position: number;
}

export function ProjectCard({ project, position }: ProjectCardProps) {
  const { setOpen, setCurrentRow } = useProjects();
  const status = PROJECT_STATUS[project.status];

  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: project.id,
  });

  function openDialog(kind: "edit" | "delete") {
    setCurrentRow(project);
    setOpen(kind);
  }

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "relative flex items-center gap-3 rounded-xl border bg-card p-3 shadow-xs transition-colors duration-fast sm:gap-4 sm:p-4",
        "hover:border-primary/40",
        isDragging && "z-10 border-primary/50 shadow-lg",
      )}
    >
      <button
        ref={setActivatorNodeRef}
        type="button"
        className="-ml-1 flex size-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
        aria-label={`${project.name} verschieben (Position ${position})`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>

      <div className={cn("flex min-w-0 flex-1 items-center gap-3 sm:gap-4", !project.isVisible && "opacity-60")}>
        {project.logo ? (
          <img
            src={project.logo.url}
            alt=""
            className="size-11 shrink-0 rounded-lg border object-cover"
          />
        ) : (
          <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted">
            <ImageOff className="size-4 text-muted-foreground" aria-hidden />
          </div>
        )}

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold">
              {/* Stretched Button: die ganze Zeile öffnet "Bearbeiten". */}
              <button
                type="button"
                onClick={() => openDialog("edit")}
                className="text-left outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-2 focus-visible:after:ring-ring"
              >
                {project.name}
              </button>
            </h3>
            {project.shortDescription && (
              <p className="truncate text-xs text-muted-foreground">{project.shortDescription}</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
            {!project.isVisible && (
              <Badge variant="outline" className="gap-1">
                <EyeOff className="size-3" aria-hidden />
                Ausgeblendet
              </Badge>
            )}
            {project.category && <Badge variant="secondary">{project.category}</Badge>}
            {project.tags.map((tag) => (
              <Badge key={tag.tagId} variant="outline" className="hidden sm:inline-flex">
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <RowActions
        className="relative z-10"
        label={project.name}
        actions={[
          { label: "Bearbeiten", icon: Pencil, onSelect: () => openDialog("edit") },
          { label: "Löschen", icon: Trash2, destructive: true, onSelect: () => openDialog("delete") },
        ]}
      />
    </li>
  );
}
