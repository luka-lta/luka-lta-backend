import type { ProjectStatus } from "@/api/projects/schema.ts";
import type { StatusTone } from "@/components/feedback/status-badge.tsx";

/** Anzeige der Projekt-Status: deutsches Label + Ton für `StatusBadge`. */
export const PROJECT_STATUS: Record<ProjectStatus, { label: string; tone: StatusTone }> = {
  active: { label: "Aktiv", tone: "success" },
  beta: { label: "Beta", tone: "info" },
  development: { label: "In Entwicklung", tone: "warning" },
  paused: { label: "Pausiert", tone: "neutral" },
  archived: { label: "Archiviert", tone: "neutral" },
};
