import { EllipsisVertical, ImageOff, Pencil, Trash } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { Status, StatusIndicator, StatusLabel } from "@/components/ui/kibo-ui/status/index.tsx";
import { cn } from "@/lib/utils.ts";
import type { Project, ProjectStatus } from "@/api/projects/schema.ts";
import { useProjects } from "@/feature/project-management/context/projects-context.tsx";

/**
 * Die Status-Komponente (`@/components/ui/kibo-ui/status`) unterstuetzt vier
 * Varianten: `online`, `offline`, `maintenance`, `degraded`. Die fuenf
 * Projekt-Status werden darauf abgebildet; damit auch zwei auf dieselbe Farbe
 * gemappte Status (`paused`/`archived` -> `offline`) unterscheidbar bleiben,
 * zeigt das Label immer den echten Status-Text statt eines generischen Begriffs.
 */
const STATUS_MAP: Record<ProjectStatus, { status: "online" | "offline" | "maintenance" | "degraded"; label: string }> = {
  active: { status: "online", label: "Active" },
  beta: { status: "degraded", label: "Beta" },
  development: { status: "maintenance", label: "Development" },
  paused: { status: "offline", label: "Paused" },
  archived: { status: "offline", label: "Archived" },
};

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const { setOpen, setCurrentRow } = useProjects();
  const statusInfo = STATUS_MAP[project.status];

  return (
    <Card className={cn(!project.isVisible && "opacity-60")}>
      <CardContent className="flex items-start gap-4 p-4">
        {project.logo ? (
          <img
            src={project.logo.url}
            alt={project.logo.alt ?? project.name}
            className="size-12 shrink-0 rounded-md object-cover"
          />
        ) : (
          <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-muted">
            <ImageOff className="size-5 text-muted-foreground" />
          </div>
        )}

        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <h3 className="truncate font-medium leading-none">{project.name}</h3>
            {project.shortDescription && (
              <p className="mt-1 truncate text-muted-foreground text-sm">{project.shortDescription}</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Status status={statusInfo.status}>
              <StatusIndicator />
              <StatusLabel>{statusInfo.label}</StatusLabel>
            </Status>

            {!project.isVisible && <Badge variant="outline">Hidden</Badge>}

            {project.category && <Badge variant="secondary">{project.category}</Badge>}

            {project.tags.map((tag) => (
              <Badge key={tag.tagId} variant="outline">
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" onClick={(event) => event.stopPropagation()}>
              <EllipsisVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={(event) => {
                event.stopPropagation();
                setOpen("edit");
                setCurrentRow(project);
              }}
            >
              <Pencil />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(event) => {
                event.stopPropagation();
                setOpen("delete");
                setCurrentRow(project);
              }}
            >
              <Trash />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  );
}
