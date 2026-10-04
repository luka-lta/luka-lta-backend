# Projects Dashboard Implementation Plan (Teil 2 von 3)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eine vollständige Projektverwaltung im Admin-Dashboard — Liste, Anlegen, Bearbeiten, Löschen, Bild-Upload mit Zuschnitt und Kompression, wiederverwendbare Tags und Drag-and-Drop-Sortierung — gegen die in Teil 1 gebaute API.

**Architecture:** React 18 + Vite + TanStack Query. Pro Domain ein API-Layer aus `schema.ts` (Zod), `endpoints.ts` (Axios) und `hooks.ts` (Query/Mutation), exakt nach dem Muster von `src/api/calendar/`. Die Seite liegt unter `src/feature/project-management/` mit einem Dialog-Context wie bei `src/feature/user/`. Darstellung als Card-Liste (Projekte haben ein Logo als visuelles Leitmerkmal), die Bausteine dafür aus `UserTable` wiederverwendet.

**Tech Stack:** React 18.3.1, TanStack Query 5, react-hook-form 7 + zod 3 + `@hookform/resolvers`, shadcn/ui, KiboUI (`tags`, `status`, `spinner`, neu: `dropzone`, `image-crop`), `@dnd-kit/*`, `sonner` für Toasts, Axios.

**Spec:** `../luka-lta-api/docs/plans/2026-10-03-centralized-project-management.md` (Abschnitte E, 17–23)

**Backend:** Teil 1, Branch `feature/project-management` im Repo `luka-lta-api`. Die API läuft lokal unter `http://localhost/api/v1` und enthält bereits 6 migrierte Projekte mit 20 Assets.

## Global Constraints

- TypeScript strict. **`npx tsc -b` muss nach jedem Task fehlerfrei bleiben** (Baseline: fehlerfrei).
- 2 Spaces Einrückung, Semikolons setzen, Imports ohne Datei-Endung dort, wo der Bestand das so macht — **in diesem Repo werden `.ts`/`.tsx`-Endungen in Imports überwiegend mitgeschrieben** (`@/api/axios.ts`). Dem Bestand der jeweiligen Datei folgen, nicht global umstellen.
- Pfad-Alias `@/` → `src/`.
- Alle API-Responses werden mit Zod geparst. Die API antwortet `{status, message, data:{…}}` — geparst wird **nur** `response.data.data`.
- Query-Keys als Array mit Domain zuerst: `["projects", …]`, `["project-tags"]`. Mutationen invalidieren domainweit.
- Fehler nach Mutationen über `toast.error(getApiErrorMessage(error))` **und** zusätzlich als `<Alert variant="destructive">` im Formular — so macht es der Bestand (`EditUserSheet`).
- **Niemals `error.message` direkt anzeigen.** Die API legt ihre echte Meldung in `data.error`; `error.message` von axios ist nur generischer HTTP-Status-Text, aus `409` würde also „Request failed with status code 409" statt der Begründung. Immer `getApiErrorMessage(error)` aus `@/lib/apiError.ts` verwenden — der Bestand macht das in `CalendarSidebar.tsx`, `EditSourceDialog.tsx` und `LocationDialog.tsx` bereits so. Das gilt für Toasts, für `<Alert>`-Boxen und für `ErrorState`.
- Keine neuen Dependencies außer den beiden ausdrücklich beauftragten KiboUI-Komponenten.
- **Keine Test-Infrastruktur** und kein Test-Runner im Repo (bewusste Entscheidung des Projektinhabers, identisch zu Teil 1). Niemals `vitest`, `jest` oder ein `test`-Script aufrufen.

## Verifizierte Umgebungs-Fakten (gemessen, nicht angenommen)

| Fakt | Wert |
|---|---|
| Branch | `feature/project-management`, von `origin/master` (7ab7b11) |
| Dev-Server | Vite, Port **5173**, läuft bereits |
| API-Basis | `VITE_API_URL=http://localhost/api/v1` (`.env.development`) |
| Typecheck | `npx tsc -b` → fehlerfrei |
| Lint | `npx eslint .` → **21 vorhandene Probleme** (9 Errors, 12 Warnings) in Fremddateien |
| Tests | existieren nicht |

### Lint ist kein grünes Gate

`npx eslint .` meldet 21 Altlasten in Dateien, die dieser Plan nicht anfasst (`src/App.tsx`, `src/api/utils.ts`, `src/components/form/AvatarInput.tsx`, `src/components/ui/chart.tsx`, `src/lib/geoStore.ts`, u. a.). Diese werden **nicht** mitgefixt. Pro Task wird deshalb nur gegen die eigenen Pfade geprüft:

```bash
npx eslint src/api/projects src/api/project-tags src/feature/project-management
```

Erwartet: keine Ausgabe für die eigenen Dateien.

### Auth funktioniert unverändert — nichts anzupassen

`src/api/axios.ts` setzt über den Request-Interceptor `config.headers.Authorization = jwt` auf **beiden** Instanzen (`api` und `apiForm`) — also der **rohe** JWT ohne `Bearer`-Prefix, genau wie die API es verlangt. Der `Origin`-Header kommt automatisch, weil Dev-Server (Port 5173) und API (Port 80) verschiedene Origins sind; im Browser ließe er sich ohnehin nicht setzen. Neue Endpunkte erben beides, solange sie `api` bzw. `apiForm` aus `@/api/axios.ts` benutzen. **Keine Änderung an `axios.ts` oder am Auth-Store.**

## Review Focus

Diese Punkte sind von der Spec impliziert, werden aber von keinem Typecheck erfasst. Jeder hat unten einen expliziten Verifikationsschritt im besitzenden Task:

1. **Leeres Tag-Dictionary.** Das Projekt startet mit null Tags. Das Tag-Feld muss in diesem Zustand sichtbar und benutzbar sein — der Bestand im Blog-Editor wrappt es in `{tags.length > 0 && …}`, womit man nie den ersten Tag anlegen könnte. (Task 4)
2. **Inline angelegter Tag landet im Formular.** Nach dem Anlegen muss die neue ID sofort im Formular-State stehen, ohne dass das Projekt gespeichert sein muss. (Task 4)
3. **Bild größer als das Limit.** Nach Zuschnitt und Kompression muss ein 2,3-MB-Screenshot klein genug ankommen; das Original darf nie ungefiltert rausgehen. (Task 5)
4. **Logo ersetzen.** Ein zweiter Logo-Upload muss die Karte sofort auf das neue Bild umstellen, ohne Reload und ohne doppeltes Logo. (Task 11)
5. **Deaktiviertes Projekt.** Muss in der Verwaltung sichtbar bleiben und dort als solches erkennbar sein, obwohl es aus der öffentlichen Liste verschwindet. (Task 11)

---

## File Structure

| Datei | Verantwortung |
|---|---|
| `src/api/project-tags/schema.ts` | Zod-Schema des Tag-Dictionaries |
| `src/api/project-tags/endpoints.ts` | `getProjectTags`, `createProjectTag` (gibt den geparsten Tag zurück) |
| `src/api/project-tags/hooks.ts` | `useProjectTags`, `useCreateProjectTag` |
| `src/api/projects/schema.ts` | Zod-Schemas für Projekt, Asset, Formular-Eingabe |
| `src/api/projects/endpoints.ts` | CRUD, Reorder, Asset-Upload/Delete |
| `src/api/projects/hooks.ts` | Query- und Mutation-Hooks |
| `src/components/kibo-ui/dropzone/` | per Registry installiert (dort liegen auch `calendar` und `editor`) |
| `src/components/kibo-ui/image-crop/` | per Registry installiert |
| `src/feature/project-management/index.tsx` | Seite: Kopf, Card-Liste, Sortierung |
| `src/feature/project-management/context/projects-context.tsx` | Dialog-/Row-State |
| `src/feature/project-management/components/ProjectCard.tsx` | eine Karte |
| `src/feature/project-management/components/ProjectCardSkeleton.tsx` | Ladezustand |
| `src/feature/project-management/components/ProjectTagsField.tsx` | Tag-Auswahl **mit** Inline-Anlage |
| `src/feature/project-management/components/ProjectImageInput.tsx` | Dropzone + Crop + Kompression |
| `src/feature/project-management/components/ProjectFormSheet.tsx` | Anlegen und Bearbeiten |
| `src/feature/project-management/components/DeleteProjectDialog.tsx` | Löschbestätigung |
| `src/feature/project-management/components/ProjectDialogs.tsx` | Dialog-Dispatcher am Context |
| `src/pages/Dashboard/ProjectsPage.tsx` | Seiten-Wrapper |
| `src/components/layout/data/sidebar-data.ts` | **geändert**: Gruppe `Portfolio-Management` |
| `src/AppRouter.tsx` | **geändert**: Route `/dashboard/projects` |

---

### Task 1: API-Layer für das Tag-Dictionary

**Files:**
- Create: `src/api/project-tags/schema.ts`
- Create: `src/api/project-tags/endpoints.ts`
- Create: `src/api/project-tags/hooks.ts`

**Interfaces:**
- Consumes: `api` aus `@/api/axios.ts`; die Endpunkte `GET /projects/tags` und `POST /projects/tags` aus Teil 1.
- Produces: `ProjectTag` (Typ), `projectTagSchema`, `getProjectTags(): Promise<ProjectTag[]>`, `createProjectTag(name: string): Promise<ProjectTag>`, `useProjectTags()`, `useCreateProjectTag()`.

**Wichtig:** `createProjectTag` **muss den geparsten Tag zurückgeben**. Das Pendant im Blog (`createBlogTag`) gibt `Promise<void>` zurück und verwirft damit die neue ID — Task 4 braucht sie aber, um sie direkt in den Formular-State zu legen. Ebenso darf das Schema **kein** `createdAt` verlangen: die Projects-Tag-Response liefert nur `tagId`, `name` und `slug` (das Blog-Schema verlangt `createdAt` und würde hier zur Laufzeit scheitern).

- [ ] **Step 1: `src/api/project-tags/schema.ts`**

```ts
import { z } from "zod";

export const projectTagSchema = z.object({
  tagId: z.number(),
  name: z.string(),
  slug: z.string(),
});

export const projectTagListSchema = z.object({
  tags: z.array(projectTagSchema),
});

export const projectTagResultSchema = z.object({
  tag: projectTagSchema,
});

export type ProjectTag = z.infer<typeof projectTagSchema>;
```

- [ ] **Step 2: `src/api/project-tags/endpoints.ts`**

```ts
import api from "@/api/axios.ts";
import { projectTagListSchema, projectTagResultSchema, type ProjectTag } from "@/api/project-tags/schema.ts";

export async function getProjectTags(): Promise<ProjectTag[]> {
  const response = await api.get("/projects/tags");
  return projectTagListSchema.parse(response.data.data).tags;
}

// Der Endpunkt ist idempotent: ein bereits vorhandener Name kommt mit 200 und
// dem bestehenden Tag zurueck, ein Slug-Konflikt mit einem anderen Namen als 409.
// Der geparste Tag wird zurueckgegeben, weil der Aufrufer die ID braucht.
export async function createProjectTag(name: string): Promise<ProjectTag> {
  const response = await api.post("/projects/tags", { name });
  return projectTagResultSchema.parse(response.data.data).tag;
}
```

- [ ] **Step 3: `src/api/project-tags/hooks.ts`**

```ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createProjectTag, getProjectTags } from "@/api/project-tags/endpoints.ts";

export function useProjectTags() {
  return useQuery({
    queryKey: ["project-tags"],
    queryFn: getProjectTags,
  });
}

export function useCreateProjectTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProjectTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-tags"] });
    },
  });
}
```

- [ ] **Step 4: Typecheck und Lint**

```bash
npx tsc -b
npx eslint src/api/project-tags
```
Erwartet: `tsc` ohne Fehler, `eslint` ohne Ausgabe.

- [ ] **Step 5: Gegen die laufende API prüfen**

Die API läuft lokal. Dieser Schnelltest bestätigt, dass das Schema zur echten Response passt — ein Zod-Mismatch fällt sonst erst in der UI auf:

```bash
curl -s http://localhost/api/v1/projects/tags \
  -H "Authorization: $(cd ../luka-lta-api && docker compose -f docker-compose.development.yml run --rm -T php-fpm-api php -r 'require "/app/vendor/autoload.php"; echo ReallySimpleJWT\Token::create("1", getenv("JWT_SECRET"), time()+86400, "backend.luka-lta.dev");' 2>/dev/null | tr -d "\r\n")" \
  -H 'Origin: http://localhost:5173' | jq '.data'
```
Erwartet: `{"tags": []}` (das Dictionary ist absichtlich leer). Prüfe, dass die Struktur `data.tags` ist und ein Tag-Objekt genau `tagId`, `name`, `slug` hätte — kein `createdAt`.

- [ ] **Step 6: Commit**

```bash
git add src/api/project-tags
git commit -m "$(cat <<'EOF'
feat: add project tag dictionary api layer

Returns the parsed tag from create so callers can use the new id directly,
unlike the blog equivalent which discards it.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01ELvDLKbqAAELWXHrqgZrZs
EOF
)"
```

---

### Task 2: API-Layer für Projekte

**Files:**
- Create: `src/api/projects/schema.ts`
- Create: `src/api/projects/endpoints.ts`
- Create: `src/api/projects/hooks.ts`

**Interfaces:**
- Consumes: `api` und `apiForm` aus `@/api/axios.ts`; `projectTagSchema` aus Task 1; die Projects-Endpunkte aus Teil 1.
- Produces: `Project`, `ProjectAsset`, `ProjectStatus`, `ProjectFormValues` (Typen); `projectSchema`; `getManagedProjects`, `getManagedProject`, `createProject`, `updateProject`, `deleteProject`, `reorderProjects`, `uploadProjectAsset`, `deleteProjectAsset`; die zugehörigen Hooks.

**Die Response-Form der API** (aus Teil 1, verbindlich): `id`, `name`, `slug`, `shortDescription`, `description`, `status`, `isVisible`, `category`, `tags[]` (`{tagId,name,slug}`), `techStack[]`, `websiteUrl`, `liveLabel`, `repositoryUrl`, `repositoryOwner`, `repositoryName`, `demoUrl`, `documentationUrl`, `role`, `year`, `isClientProject`, `sortOrder`, `logo`, `cover`, `screenshots[]`, `createdAt`, `updatedAt`. Assets haben `{id, type, url, alt, sortOrder}`; `logo` und `cover` sind nullable. **`year` ist eine Zahl**, nicht wie früher im Portfolio ein String.

- [ ] **Step 1: `src/api/projects/schema.ts`**

```ts
import { z } from "zod";
import { projectTagSchema } from "@/api/project-tags/schema.ts";

export const projectStatusSchema = z.enum(["development", "beta", "active", "paused", "archived"]);

export const projectAssetSchema = z.object({
  id: z.string(),
  type: z.enum(["logo", "cover", "screenshot"]),
  url: z.string(),
  alt: z.string().nullable(),
  sortOrder: z.number(),
});

export const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  shortDescription: z.string().nullable(),
  description: z.string().nullable(),
  status: projectStatusSchema,
  isVisible: z.boolean(),
  category: z.string().nullable(),
  tags: z.array(projectTagSchema),
  techStack: z.array(z.string()),
  websiteUrl: z.string().nullable(),
  liveLabel: z.string().nullable(),
  repositoryUrl: z.string().nullable(),
  repositoryOwner: z.string().nullable(),
  repositoryName: z.string().nullable(),
  demoUrl: z.string().nullable(),
  documentationUrl: z.string().nullable(),
  role: z.string().nullable(),
  year: z.number().nullable(),
  isClientProject: z.boolean(),
  sortOrder: z.number(),
  logo: projectAssetSchema.nullable(),
  cover: projectAssetSchema.nullable(),
  screenshots: z.array(projectAssetSchema),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
});

export const projectListSchema = z.object({
  projects: z.array(projectSchema),
});

export const projectResultSchema = z.object({
  project: projectSchema,
});

export const projectAssetResultSchema = z.object({
  asset: projectAssetSchema,
});

export type Project = z.infer<typeof projectSchema>;
export type ProjectAsset = z.infer<typeof projectAssetSchema>;
export type ProjectStatus = z.infer<typeof projectStatusSchema>;
export type ProjectAssetType = ProjectAsset["type"];

/** Nur die Felder, die das Formular schreibt. Assets laufen ueber eigene Endpunkte. */
export interface ProjectInput {
  name: string;
  slug?: string;
  shortDescription?: string | null;
  description?: string | null;
  status?: ProjectStatus;
  isVisible?: boolean;
  category?: string | null;
  tagIds?: number[];
  techStack?: string[];
  websiteUrl?: string | null;
  liveLabel?: string | null;
  repositoryUrl?: string | null;
  repositoryOwner?: string | null;
  repositoryName?: string | null;
  demoUrl?: string | null;
  documentationUrl?: string | null;
  role?: string | null;
  projectYear?: number | null;
  isClientProject?: boolean;
  sortOrder?: number;
}
```

**Achtung auf die Asymmetrie:** die API **liest** das Jahr als `year`, **schreibt** es aber als `projectYear`. Das ist in Teil 1 so festgelegt (`year` entspricht dem alten Portfolio-Feldnamen, `projectYear` der Spalte). Nicht vereinheitlichen.

- [ ] **Step 2: `src/api/projects/endpoints.ts`**

```ts
import api, { apiForm } from "@/api/axios.ts";
import {
  projectAssetResultSchema,
  projectListSchema,
  projectResultSchema,
  type Project,
  type ProjectAsset,
  type ProjectAssetType,
  type ProjectInput,
} from "@/api/projects/schema.ts";

export async function getManagedProjects(): Promise<Project[]> {
  const response = await api.get("/projects/manage");
  return projectListSchema.parse(response.data.data).projects;
}

export async function getManagedProject(projectId: string): Promise<Project> {
  const response = await api.get(`/projects/manage/${projectId}`);
  return projectResultSchema.parse(response.data.data).project;
}

export async function createProject(data: ProjectInput): Promise<Project> {
  const response = await api.post("/projects", data);
  return projectResultSchema.parse(response.data.data).project;
}

export async function updateProject(projectId: string, data: ProjectInput): Promise<Project> {
  const response = await api.patch(`/projects/${projectId}`, data);
  return projectResultSchema.parse(response.data.data).project;
}

export async function deleteProject(projectId: string): Promise<void> {
  await api.delete(`/projects/${projectId}`);
}

export interface ProjectOrderEntry {
  projectId: string;
  sortOrder: number;
}

export async function reorderProjects(projects: ProjectOrderEntry[]): Promise<void> {
  await api.patch("/projects/order", { projects });
}

export interface UploadProjectAssetInput {
  projectId: string;
  type: ProjectAssetType;
  file: Blob;
  fileName: string;
  altText?: string | null;
}

export async function uploadProjectAsset({
  projectId,
  type,
  file,
  fileName,
  altText,
}: UploadProjectAssetInput): Promise<ProjectAsset> {
  const formData = new FormData();
  formData.append("type", type);
  formData.append("file", file, fileName);

  if (altText) {
    formData.append("altText", altText);
  }

  const response = await apiForm.post(`/projects/${projectId}/assets`, formData);
  return projectAssetResultSchema.parse(response.data.data).asset;
}

export async function deleteProjectAsset(projectId: string, assetId: string): Promise<void> {
  await api.delete(`/projects/${projectId}/assets/${assetId}`);
}
```

- [ ] **Step 3: `src/api/projects/hooks.ts`**

```ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createProject,
  deleteProject,
  deleteProjectAsset,
  getManagedProject,
  getManagedProjects,
  reorderProjects,
  updateProject,
  uploadProjectAsset,
  type ProjectOrderEntry,
  type UploadProjectAssetInput,
} from "@/api/projects/endpoints.ts";
import type { ProjectInput } from "@/api/projects/schema.ts";

export function useManagedProjects() {
  return useQuery({
    queryKey: ["projects", "manage"],
    queryFn: getManagedProjects,
  });
}

export function useManagedProject(projectId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["projects", "manage", projectId],
    queryFn: () => getManagedProject(projectId),
    enabled,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: ProjectInput }) =>
      updateProject(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useReorderProjects() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projects: ProjectOrderEntry[]) => reorderProjects(projects),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useUploadProjectAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UploadProjectAssetInput) => uploadProjectAsset(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useDeleteProjectAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, assetId }: { projectId: string; assetId: string }) =>
      deleteProjectAsset(projectId, assetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
```

- [ ] **Step 4: Typecheck und Lint**

```bash
npx tsc -b
npx eslint src/api/projects
```

- [ ] **Step 5: Schema gegen die echten Daten prüfen**

Die API hat 6 migrierte Projekte. Dieser Schritt beweist, dass das Zod-Schema zur echten Response passt — der häufigste Fehler in diesem Task:

```bash
TOKEN=$(cd ../luka-lta-api && docker compose -f docker-compose.development.yml run --rm -T php-fpm-api php -r \
  'require "/app/vendor/autoload.php";
   echo ReallySimpleJWT\Token::create("1", getenv("JWT_SECRET"), time()+86400, "backend.luka-lta.dev");' \
  2>/dev/null | tr -d "\r\n")
curl -s http://localhost/api/v1/projects/manage \
  -H "Authorization: $TOKEN" -H 'Origin: http://localhost:5173' \
  | jq '.data.projects[0] | keys'
```
Vergleiche die Schlüsselliste **Feld für Feld** mit `projectSchema`. Jeder Schlüssel der Response muss im Schema vorkommen (sonst wird er stillschweigend verworfen), und jedes nicht-optionale Schema-Feld muss in der Response vorhanden sein (sonst wirft Zod zur Laufzeit). Prüfe insbesondere: heißt das Jahresfeld in der Response `year`? Sind `logo`/`cover` bei einem Projekt mit Bildern Objekte mit `{id,type,url,alt,sortOrder}`? Dokumentiere das Ergebnis.

- [ ] **Step 6: Commit**

```bash
git add src/api/projects
git commit -m "$(cat <<'EOF'
feat: add projects api layer

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01ELvDLKbqAAELWXHrqgZrZs
EOF
)"
```

---

### Task 3: KiboUI dropzone und image-crop installieren

**Files:**
- Create (per Registry): `src/components/ui/kibo-ui/dropzone/`
- Create (per Registry): `src/components/ui/kibo-ui/image-crop/`
- Modify: `package.json`, Lockfile

**Interfaces:**
- Produces: die Komponenten-Exports, die Task 5 verwendet. **Die exakten Exports und Props stehen erst nach der Installation fest** — deshalb ist der letzte Schritt dieses Tasks, sie aus den installierten Dateien herauszuschreiben.

- [ ] **Step 1: Installieren**

```bash
npx kibo-ui@latest add dropzone
npx kibo-ui@latest add image-crop
```

Falls der Registry-Befehl interaktiv nachfragt oder fehlschlägt, nicht improvisieren — melde das zurück, statt die Komponenten selbst zu schreiben. Beide erwarten shadcn/ui-Struktur, die vorhanden ist.

- [ ] **Step 2: Prüfen, was installiert wurde**

```bash
ls -la src/components/ui/kibo-ui/dropzone/ src/components/ui/kibo-ui/image-crop/
git diff package.json
```
Erwartet: je ein Verzeichnis mit `index.tsx`, und in `package.json` die neuen Abhängigkeiten `react-dropzone` sowie `react-image-crop`. Prüfe, dass **keine** bestehende Abhängigkeit in der Version verändert wurde — falls doch, melde es zurück.

- [ ] **Step 3: Typecheck und Lint**

```bash
npx tsc -b
npx eslint src/components/ui/kibo-ui/dropzone src/components/ui/kibo-ui/image-crop
```
`tsc` muss fehlerfrei bleiben. Sollte eine installierte Datei eslint-Findings produzieren, **nicht** umschreiben — Registry-Code wird wie Fremdcode behandelt; notiere die Findings im Report.

- [ ] **Step 4: Die API der Komponenten dokumentieren**

Dies ist der wichtigste Schritt dieses Tasks. Lies beide `index.tsx` vollständig und schreibe in den Report:

- Alle Exports mit ihren Props-Typen.
- Für `dropzone`: wie `accept`, `maxSize`, `maxFiles`, `onDrop`/`onFilesChange` (oder wie sie wirklich heißen) heißen und welche Signatur sie haben; wie Rejections gemeldet werden; welche Unterkomponenten für Empty-/Content-Zustand existieren.
- Für `image-crop`: wie der Zuschnitt ausgelöst wird, **wie das Ergebnis herauskommt** (Callback? Ref-Methode? Data-URL oder Blob?), und ob und wie eine Zielgröße bzw. Kompression konfiguriert wird — die Dokumentation verspricht „automatic image scaling and compression based on maximum file size", der Prop-Name dafür muss aus dem Code belegt werden.
- Ob die Komponenten `"use client"` tragen (harmlos in Vite) und ob sie Browser-APIs beim Import anfassen.

Task 5 wird gegen genau diese Signaturen geschrieben, also zitiere sie wörtlich.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/kibo-ui/dropzone src/components/ui/kibo-ui/image-crop package.json bun.lock package-lock.json
git commit -m "$(cat <<'EOF'
feat: add kibo-ui dropzone and image-crop components

Needed for the project asset upload: dropzone for selection and validation,
image-crop for aspect-ratio cropping and size-targeted compression so large
screenshots never reach the upload limit.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01ELvDLKbqAAELWXHrqgZrZs
EOF
)"
```

Nur die Lockfiles stagen, die es im Repo wirklich gibt.

---

### Task 4: `ProjectTagsField` — Tag-Auswahl mit Inline-Anlage

**Files:**
- Create: `src/feature/project-management/components/ProjectTagsField.tsx`

**Interfaces:**
- Consumes: `useProjectTags`, `useCreateProjectTag` (Task 1); die KiboUI-Tags-Komponente aus `@/components/ui/kibo-ui/tags`.
- Produces: `<ProjectTagsField value={number[]} onChange={(ids: number[]) => void} />`, von Task 8 im Formular per `Controller` verwendet.

**Warum dieser Task eigenen Code braucht und nicht kopiert werden kann.** Das Tag-Feld im Blog-Editor (`src/feature/blog/components/editor/BlogEditorForm.tsx`) sieht wie eine Vorlage aus, ist aber keine:

1. Es kann **nur auswählen**. Es gibt dort keine Inline-Anlage, keine Mutation im Formular, und die KiboUI-Komponente selbst bringt keine „Create"-Funktion mit — sie ist ein cmdk-Combobox-Wrapper.
2. Der ganze Block ist in `{tags.length > 0 && …}` gewrappt. Für Projekte ist das Dictionary anfangs **leer**, womit das Feld unsichtbar wäre und man nie den ersten Tag anlegen könnte. Diese Bedingung darf nicht übernommen werden.

Die Anlage muss also hier gebaut werden: `TagsInput` controlled machen (die Komponente exponiert den Suchtext nicht über ihren Context, daher eigener State) und in `TagsEmpty` eine Anlage-Aktion rendern.

Bekanntes Verhalten der Fremdkomponente, das so bleibt: `TagsTrigger` rendert **immer** zusätzlich ein fest einkodiertes `Select a tag...` — auch wenn Tags gewählt sind. Nicht umschreiben, das ist Registry-Code.

- [ ] **Step 1: Komponente schreiben**

```tsx
import { useState } from "react";
import { CheckIcon, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Tags,
  TagsContent,
  TagsEmpty,
  TagsGroup,
  TagsInput,
  TagsItem,
  TagsList,
  TagsTrigger,
  TagsValue,
} from "@/components/ui/kibo-ui/tags";
import { Button } from "@/components/ui/button.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Spinner } from "@/components/ui/kibo-ui/spinner/index.tsx";
import { useCreateProjectTag, useProjectTags } from "@/api/project-tags/hooks.ts";
import { getApiErrorMessage } from "@/lib/apiError.ts";

interface Props {
  value: number[];
  onChange: (tagIds: number[]) => void;
}

export function ProjectTagsField({ value, onChange }: Props) {
  const [search, setSearch] = useState("");
  const tags = useProjectTags();
  const createTag = useCreateProjectTag();

  const available = tags.data ?? [];
  const selected = value.map(String);

  function handleRemove(tagId: string) {
    onChange(value.filter((id) => id !== Number(tagId)));
  }

  function handleSelect(tagId: string) {
    if (selected.includes(tagId)) {
      handleRemove(tagId);
      return;
    }

    onChange([...value, Number(tagId)]);
  }

  function handleCreate() {
    const name = search.trim();

    if (name === "") {
      return;
    }

    createTag.mutate(name, {
      onSuccess: (tag) => {
        // Der Endpunkt ist idempotent: bei einem bereits vorhandenen Namen kommt
        // der bestehende Tag zurueck. Deshalb vor dem Anhaengen auf Dubletten pruefen.
        if (!value.includes(tag.tagId)) {
          onChange([...value, tag.tagId]);
        }

        setSearch("");
        toast.success(`Tag "${tag.name}" ready to use.`);
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error));
      },
    });
  }

  return (
    <div className="space-y-1.5">
      <Label>Tags</Label>
      <Tags>
        <TagsTrigger>
          {selected.map((tagId) => (
            <TagsValue key={tagId} onRemove={() => handleRemove(tagId)}>
              {available.find((tag) => String(tag.tagId) === tagId)?.name ?? tagId}
            </TagsValue>
          ))}
        </TagsTrigger>
        <TagsContent>
          <TagsInput placeholder="Search or create a tag..." value={search} onValueChange={setSearch} />
          <TagsList>
            <TagsEmpty>
              {search.trim() === "" ? (
                "No tags yet."
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full justify-start"
                  disabled={createTag.isPending}
                  onClick={handleCreate}
                >
                  {createTag.isPending ? <Spinner size={14} className="mr-2" /> : <Plus className="mr-2 size-3.5" />}
                  Create "{search.trim()}"
                </Button>
              )}
            </TagsEmpty>
            <TagsGroup>
              {available.map((tag) => (
                <TagsItem key={tag.tagId} value={String(tag.tagId)} onSelect={handleSelect}>
                  {tag.name}
                  {selected.includes(String(tag.tagId)) && (
                    <CheckIcon className="text-muted-foreground" size={14} />
                  )}
                </TagsItem>
              ))}
            </TagsGroup>
          </TagsList>
        </TagsContent>
      </Tags>
    </div>
  );
}
```

**Falls `TagsInput` die Props `value`/`onValueChange` nicht akzeptiert** (das hängt an der cmdk-Version, die `CommandInput` durchreicht), dann den Suchtext stattdessen über ein `onInput`/`onChange` am gerenderten Input abgreifen — aber erst prüfen, nicht sofort umbauen, und die Abweichung im Report festhalten.

- [ ] **Step 2: Typecheck und Lint**

```bash
npx tsc -b
npx eslint src/feature/project-management
```

- [ ] **Step 3: Verifikation im Browser — Review Focus 1 und 2**

Der Dev-Server läuft auf `http://localhost:5173`. Die Komponente ist noch in keiner Seite eingebunden, also wird sie hier isoliert geprüft. Binde sie **temporär** in die bestehende Seite `src/pages/Dashboard/ProjectsPage.tsx` ein — die existiert noch nicht, also stattdessen temporär in `src/feature/notifications/index.tsx` am Seitenanfang mit einem lokalen `useState<number[]>([])` rendern, im Browser prüfen, und die temporäre Einbindung danach **vollständig zurücknehmen** (`git diff` muss am Ende nur die neue Komponente zeigen).

Zu belegen:
1. **Leeres Dictionary:** Das Feld ist sichtbar und anklickbar, obwohl noch kein Tag existiert. Im Popover erscheint „No tags yet.", und sobald man tippt, der Button `Create "…"`.
2. **Inline-Anlage:** Tippe `Analytics`, klicke `Create "Analytics"`. Erwartet: Toast, der Tag erscheint als Chip im Trigger, und er steht in der Liste zur Auswahl. Der lokale State enthält die neue ID.
3. **Idempotenz:** Tippe erneut `analytics` und lege an. Erwartet: kein Fehler, kein zweiter Chip, keine Dublette (der Endpunkt gibt den bestehenden Tag zurück, und der Dubletten-Guard verhindert das doppelte Anhängen).
4. **Slug-Konflikt:** Lege `C` an, dann `C++`. Erwartet: ein Fehler-Toast mit der 409-Meldung der API, kein stiller falscher Tag.
5. **Entfernen:** Chip über das X entfernen, der State verliert die ID.

Räume die Testtags danach auf:
```bash
cd ../luka-lta-api && docker compose -f docker-compose.development.yml exec -T mysql \
  sh -c 'exec mysql -u root -p"$MYSQL_ROOT_PASSWORD" luka_lta_api -e "DELETE FROM project_tags;"'
```

Mach von Punkt 1 und 2 je einen Screenshot und beschreib im Report, was zu sehen war.

- [ ] **Step 4: Commit**

```bash
git add src/feature/project-management/components/ProjectTagsField.tsx
git commit -m "$(cat <<'EOF'
feat: add project tags field with inline tag creation

The blog editor's tag field only selects from a prop and hides itself when the
dictionary is empty, which would make the first project tag impossible to
create. This builds the create affordance into the empty state instead.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01ELvDLKbqAAELWXHrqgZrZs
EOF
)"
```

---

### Task 5: `ProjectImageInput` — Dropzone, Zuschnitt, Kompression

**Files:**
- Create: `src/feature/project-management/components/ProjectImageInput.tsx`

**Interfaces:**
- Consumes: die in **Task 3 Step 4 dokumentierten** Exports und Props von `dropzone` und `image-crop`, importiert aus `@/components/kibo-ui/dropzone` bzw. `@/components/kibo-ui/image-crop` (nicht `ui/kibo-ui` — dort liegen sie nicht). Diese Signaturen stehen vor der Installation nicht fest — schreib die Verdrahtung gegen das, was dort wörtlich notiert wurde, nicht gegen Vermutungen.
- Produces: `<ProjectImageInput type="logo" | "cover" | "screenshot" currentUrl={string | null} onSelect={(blob: Blob, fileName: string) => void} onClear={() => void} disabled={boolean} />`

**Fachliche Anforderungen, die unabhängig von der Komponenten-API gelten:**

1. **Akzeptierte Typen:** nur `image/jpeg`, `image/png`, `image/webp` — das ist genau die Allowlist der API. Alles andere wird vor dem Zuschnitt abgewiesen.
2. **Zielgröße:** das Ergebnis muss **unter 1 MiB** liegen. Begründung: das Limit der Anwendung ist 5 MiB, aber in Produktion kappt nginx derzeit bei 1 MiB (siehe Teil 1, offener Aktionspunkt). Eine Zielgröße unter dem kleinsten Deckel macht den Upload unabhängig von dieser offenen Infrastruktur-Frage.

   **Die Kompression der Komponente ist defekt und darf nicht benutzt werden** (in Task 3 im Code nachgewiesen): `getCroppedPngImage` nimmt `scaleFactor` als Parameter, wendet ihn aber nie auf `canvas.width`/`canvas.height` oder `drawImage` an. Die Rekursion bei `blob.size > maxImageSize` erzeugt deshalb ein byte-identisches PNG und läuft **endlos**, bis der Stack platzt — der Tab friert ein. Konsequenz für diesen Task: `maxImageSize` auf einen Wert setzen, den die Rekursion nie auslöst (`Number.MAX_SAFE_INTEGER`), und die Verkleinerung vollständig selbst machen. Die Komponente liefert damit nur Drag-and-Drop und Zuschnitt; die Größenreduktion gehört uns.
3. **Seitenverhältnis je Typ:** `logo` quadratisch (1:1), `cover` 16:9, `screenshot` frei. Als benannte Konstante, nicht als Literal im JSX.
4. **Ausgabe:** `onCrop?: (croppedImage: string) => void` liefert eine **PNG-Data-URL** als String, keinen Blob und keine File. Die API braucht Multipart, also muss die Data-URL in einen `Blob` konvertiert werden:

```ts
async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl);
  return response.blob();
}
```

5. **Dateiname:** aus Typ und Endung bilden (`logo.png`), nicht den Namen der Quelldatei übernehmen — die API baut den Object-Key ohnehin selbst und nutzt den Namen nicht.
6. **PNG vs. WebP:** die Crop-Komponente gibt PNG aus. Für fotografische Screenshots ist PNG groß. Wenn das PNG-Ergebnis über der Zielgröße liegt, über ein `<canvas>` nach WebP umkodieren (`canvas.toBlob(cb, "image/webp", quality)`) und die Qualität absenken, bis die Zielgröße erreicht ist. Die API akzeptiert WebP.
7. **Vorschau:** das aktuell gespeicherte Bild (`currentUrl`) anzeigen, solange keine neue Auswahl vorliegt; danach die Vorschau des Zuschnitts.
8. **Entfernen:** ein Weg, ein vorhandenes Asset zu löschen (`onClear`), getrennt vom Ersetzen.

**Verbindlich:** Die Komponente lädt **nicht** selbst hoch. Sie gibt den fertigen Blob nach oben; Task 8 entscheidet, wann hochgeladen wird (ein Asset-Upload braucht eine Projekt-ID, die beim Anlegen erst nach dem Speichern existiert).

- [ ] **Step 1: Komponente schreiben**

Schreib sie gegen die in Task 3 dokumentierte API. Halte dich an die acht Punkte oben. Konstanten oben in der Datei:

```ts
/** 1 MiB in bytes. Unter dem kleinsten Deckel der Kette (nginx in Produktion). */
const MAX_OUTPUT_BYTES = 1024 * 1024;

const ACCEPTED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

const ASPECT_RATIOS: Record<ProjectAssetType, number | undefined> = {
  logo: 1,
  cover: 16 / 9,
  screenshot: undefined,
};

/** Startqualitaet fuer die WebP-Umkodierung, wird bei Bedarf schrittweise gesenkt. */
const INITIAL_WEBP_QUALITY = 0.9;
const MIN_WEBP_QUALITY = 0.5;
const QUALITY_STEP = 0.1;
```

- [ ] **Step 2: Typecheck und Lint**

```bash
npx tsc -b
npx eslint src/feature/project-management
```

- [ ] **Step 3: Verifikation im Browser — Review Focus 3**

Wie in Task 4: temporär in eine bestehende Seite einbinden, prüfen, Einbindung zurücknehmen.

Zu belegen, mit der echten Datei `../luka-lta/public/static/images/projects/mexcal/mexcal-website.png` (2,3 MB):

1. Datei per Drag & Drop und per Klick auswählen — beides muss gehen.
2. Der Zuschnitt erscheint; bei `type="logo"` ist er auf 1:1 fixiert, bei `type="cover"` auf 16:9, bei `screenshot` frei.
3. Nach dem Bestätigen liegt ein Blob vor. **Logge seine Größe und seinen Typ** (`blob.size`, `blob.type`) und belege, dass `size < 1048576` ist — aus 2,3 MB muss also messbar weniger geworden sein. Nenne den konkreten Wert im Report.
4. Eine `.txt`-Datei (oder ein PDF) wird abgewiesen, ohne dass die Crop-Ansicht erscheint.
5. Ein bereits vorhandenes Bild wird als Vorschau angezeigt, wenn `currentUrl` gesetzt ist.

- [ ] **Step 4: Commit**

```bash
git add src/feature/project-management/components/ProjectImageInput.tsx
git commit -m "$(cat <<'EOF'
feat: add project image input with crop and size-targeted compression

Targets under 1 MiB because production nginx still caps bodies there, so
uploads work regardless of that open infrastructure item.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01ELvDLKbqAAELWXHrqgZrZs
EOF
)"
```

---

### Task 6: Seiten-Gerüst, Context, Sidebar und Route

**Files:**
- Create: `src/feature/project-management/context/projects-context.tsx`
- Create: `src/feature/project-management/index.tsx`
- Create: `src/pages/Dashboard/ProjectsPage.tsx`
- Modify: `src/components/layout/data/sidebar-data.ts`
- Modify: `src/AppRouter.tsx`

**Interfaces:**
- Consumes: `useManagedProjects` (Task 2), `Main`, `useSetPageTitle`, `ErrorState`, `useDialogState`.
- Produces: `useProjects()` (Context-Hook mit `open`, `setOpen`, `currentRow`, `setCurrentRow`), die Route `/dashboard/projects`, den Sidebar-Eintrag.

**Sidebar-Platzierung:** eigene Gruppe `Portfolio-Management` mit einem Eintrag `Projects`. Begründung: das Repo gibt eigenständigen CRUD-Bereichen eine eigene `…-Management`-Gruppe (`Access-Management`, `Linktree-Management`, `Blog-Management`); `Personal` ist für Read-mostly-Widgets (Calendar, Weather). Die Gruppe kommt **nach** `Blog-Management` und **vor** `Other`, damit `Other` (Settings) letzter Block bleibt. Icon: `FolderKanban` aus `lucide-react`.

- [ ] **Step 1: `projects-context.tsx`**

```tsx
import React, { useState } from "react";
import useDialogState from "@/hooks/use-dialog-state";
import type { Project } from "@/api/projects/schema.ts";

type ProjectsDialogType = "add" | "edit" | "delete";

interface ProjectsContextType {
  open: ProjectsDialogType | null;
  setOpen: (value: ProjectsDialogType | null) => void;
  currentRow: Project | null;
  setCurrentRow: React.Dispatch<React.SetStateAction<Project | null>>;
}

const ProjectsContext = React.createContext<ProjectsContextType | null>(null);

interface Props {
  children: React.ReactNode;
}

export default function ProjectsProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<ProjectsDialogType>(null);
  const [currentRow, setCurrentRow] = useState<Project | null>(null);

  return (
    <ProjectsContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </ProjectsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useProjects = () => {
  const context = React.useContext(ProjectsContext);

  if (!context) {
    throw new Error("useProjects has to be used within <ProjectsContext>");
  }

  return context;
};
```

- [ ] **Step 2: `src/feature/project-management/index.tsx` — Gerüst**

Zunächst nur Kopfzeile, Lade-, Fehler- und Leerzustand; die Karten kommen in Task 7, die Dialoge in Task 8/9, die Sortierung in Task 10. Der Platzhalter für die Liste ist ein `TODO`-freier, funktionierender Zustand: die Projekte werden gezählt angezeigt.

```tsx
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
        message={getApiErrorMessage(projects.error)}
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
```

- [ ] **Step 3: `src/pages/Dashboard/ProjectsPage.tsx`**

```tsx
import ProjectManagement from "@/feature/project-management";

function ProjectsPage() {
  return <ProjectManagement />;
}

export default ProjectsPage;
```

- [ ] **Step 4: Sidebar-Eintrag**

In `src/components/layout/data/sidebar-data.ts` `FolderKanban` zum bestehenden `lucide-react`-Import hinzufügen und die Gruppe zwischen `Blog-Management` und `Other` einfügen:

```ts
        {
            title: 'Portfolio-Management',
            items: [
                { title: 'Projects', icon: FolderKanban, url: '/dashboard/projects' },
            ],
        },
```

- [ ] **Step 5: Route**

In `src/AppRouter.tsx` den Import ergänzen und die Route zu den `/dashboard`-Children hinzufügen, neben den anderen Blatt-Routen:

```tsx
import ProjectsPage from "@/pages/Dashboard/ProjectsPage.tsx";
```
```tsx
            { path: 'projects', element: <ProjectsPage/> },
```

- [ ] **Step 6: Typecheck und Lint**

```bash
npx tsc -b
npx eslint src/feature/project-management src/pages/Dashboard/ProjectsPage.tsx src/components/layout/data/sidebar-data.ts src/AppRouter.tsx
```

- [ ] **Step 7: Verifikation im Browser**

Auf `http://localhost:5173` einloggen und prüfen:
1. In der Sidebar erscheint die Gruppe `Portfolio-Management` mit `Projects`, zwischen `Blog-Management` und `Settings`.
2. Der Klick führt auf `/dashboard/projects`, der Seitentitel im Tab ist `Backend - Projects`.
3. Die Seite zeigt `6 projects` — die migrierten Projekte werden also geladen. **Erscheint hier stattdessen ein Fehler, ist das Zod-Schema aus Task 2 falsch**; dann die Konsolenmeldung in den Report aufnehmen und zurückmelden, nicht das Schema raten.
4. Der Fehlerzustand: Dev-Tools → Netzwerk auf Offline, Seite neu laden. Erwartet: die `ErrorState`-Box mit Retry, keine weiße Seite.

Screenshot von Punkt 1 und 3.

- [ ] **Step 8: Commit**

```bash
git add src/feature/project-management src/pages/Dashboard/ProjectsPage.tsx src/components/layout/data/sidebar-data.ts src/AppRouter.tsx
git commit -m "$(cat <<'EOF'
feat: add projects management page shell, route and sidebar entry

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01ELvDLKbqAAELWXHrqgZrZs
EOF
)"
```

---

### Task 7: Projekt-Karten und Liste

**Files:**
- Create: `src/feature/project-management/components/ProjectCard.tsx`
- Create: `src/feature/project-management/components/ProjectCardSkeleton.tsx`
- Modify: `src/feature/project-management/index.tsx`

**Interfaces:**
- Consumes: `Project` (Task 2), `useProjects()` (Task 6), `Status`/`StatusIndicator`/`StatusLabel`, `DropdownMenu`, `Badge`, `Card`.
- Produces: `<ProjectCard project={Project} />`, `<ProjectCardSkeleton />`; die Liste in `index.tsx` ersetzt den Platzhalter aus Task 6.

**Darstellung je Karte:** Logo links (oder ein Platzhalter-Icon, wenn keins gesetzt ist), daneben Name und Kurzbeschreibung, darunter eine Zeile mit Status-Badge, `isVisible`-Hinweis, Kategorie und Tags. Rechts das Kebab-Menü mit `Edit` und `Delete`, genau wie in `UserTable`.

**Status-Darstellung:** Die `Status`-Komponente aus `@/components/ui/kibo-ui/status` erwartet einen `status`-String; im Bestand werden `"online"` und `"offline"` benutzt. Die fünf Projekt-Status werden darauf abgebildet, als benannte Konstante:

```ts
/** Die Status-Komponente kennt nur die Varianten des Bestands; hier die Zuordnung. */
const STATUS_VARIANT: Record<ProjectStatus, "online" | "offline" | "degraded"> = {
  active: "online",
  beta: "degraded",
  development: "degraded",
  paused: "offline",
  archived: "offline",
};
```

**Vor dem Schreiben prüfen:** welche `status`-Werte die Komponente wirklich unterstützt. `src/components/ui/kibo-ui/status/index.tsx` lesen und die Zuordnung an die tatsächlich vorhandenen Varianten anpassen. Falls nur `online`/`offline` existieren, `degraded` weglassen und `beta`/`development` ebenfalls auf `offline` abbilden — aber dann den Status zusätzlich als Text im Label zeigen, damit die fünf Zustände unterscheidbar bleiben.

**Unsichtbare Projekte** müssen in der Verwaltung erkennbar sein (Review Focus 5): ein eigener Badge `Hidden` neben dem Status, und die Karte etwas gedämpft (`opacity-60`).

- [ ] **Step 1: `ProjectCardSkeleton.tsx`**

```tsx
import { Card, CardContent } from "@/components/ui/card.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";

export function ProjectCardSkeleton() {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <Skeleton className="size-12 rounded-md" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-64" />
        </div>
        <Skeleton className="h-8 w-8" />
      </CardContent>
    </Card>
  );
}
```

Prüfe vorher, dass `@/components/ui/skeleton.tsx` existiert und `Skeleton` exportiert; falls nicht, die Platzhalter mit `<div className="animate-pulse rounded-md bg-muted" />` bauen.

- [ ] **Step 2: `ProjectCard.tsx`**

Setz die oben beschriebene Darstellung um. Das Kebab-Menü ruft `setOpen("edit")` bzw. `setOpen("delete")` und `setCurrentRow(project)` — identisch zum Muster in `UserTable`, inklusive `event.stopPropagation()` in den Handlern.

- [ ] **Step 3: Liste in `index.tsx` einsetzen**

Ersetz den Platzhalter (`<p>{items.length} projects</p>`) durch die Kartenliste, und den Ladezustand (`<p>Loading projects...</p>`) durch vier `ProjectCardSkeleton`. Ergänz im Seitenkopf rechts einen Button `+ Project`, der `setOpen("add")` auslöst — er muss auch dann erreichbar sein, wenn Projekte existieren (der Button im Leerzustand allein genügt nicht).

- [ ] **Step 4: Typecheck und Lint**

```bash
npx tsc -b
npx eslint src/feature/project-management
```

- [ ] **Step 5: Verifikation im Browser**

Auf `/dashboard/projects`:
1. Alle 6 migrierten Projekte erscheinen als Karten, jede mit Logo-Bild (die Assets wurden in Teil 1 importiert), Name, Kurzbeschreibung und Status-Badge `active`.
2. Die Reihenfolge entspricht `sortOrder` 0–5: luka-lta-api, mexcal, luka-lta-backend, kindled, dj-guide, luka-lta-frontend.
3. Die Logo-Bilder laden wirklich (kein gebrochenes Bild) — das belegt, dass die Asset-Proxy-URLs aus der API im Browser funktionieren.
4. Das Kebab-Menü öffnet sich und zeigt `Edit` und `Delete`.
5. Ladezustand: Netzwerk auf „Slow 3G" drosseln und neu laden — es müssen Skeleton-Karten erscheinen, kein Sprung von leer zu voll.

Screenshot der Liste.

- [ ] **Step 6: Commit**

```bash
git add src/feature/project-management
git commit -m "$(cat <<'EOF'
feat: add project cards with loading skeletons

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01ELvDLKbqAAELWXHrqgZrZs
EOF
)"
```

---

### Task 8: Formular zum Anlegen und Bearbeiten

**Files:**
- Create: `src/feature/project-management/components/ProjectFormSheet.tsx`
- Create: `src/feature/project-management/components/ProjectDialogs.tsx`
- Modify: `src/feature/project-management/index.tsx`

**Interfaces:**
- Consumes: `useCreateProject`, `useUpdateProject`, `useUploadProjectAsset`, `useDeleteProjectAsset` (Task 2); `ProjectTagsField` (Task 4); `ProjectImageInput` (Task 5); `useProjects()` (Task 6); `TextInput`, `Sheet`, `Select`, `Switch`, `Alert`, `Spinner`.
- Produces: `<ProjectFormSheet mode="create" | "edit" project={Project | null} open onOpenChange />`, `<ProjectDialogs />`.

**Ein Sheet für beide Modi.** Das Repo hat dafür sogar ein `// TODO: Edit and Create form in one component` in `EditUserSheet` — hier wird es von Anfang an so gebaut. `mode` steuert nur Titel, Button-Text und die Mutation.

**Felder** (alle aus dem Datenmodell, Assets separat):

| Feld | Control | Pflicht |
|---|---|---|
| `name` | `TextInput` | ja |
| `slug` | `TextInput` | nein — leer lassen heißt „aus dem Namen ableiten" |
| `shortDescription` | `TextInput` | nein |
| `description` | `Textarea` | nein |
| `status` | `Select` mit den fünf Werten | ja, Default `development` |
| `isVisible` | `Switch`, Default an | — |
| `category` | `TextInput` | nein |
| Tags | `ProjectTagsField` | nein |
| `techStack` | Komma-separiertes `TextInput`, beim Submit zu `string[]` | nein |
| `websiteUrl`, `repositoryUrl`, `demoUrl`, `documentationUrl` | `TextInput` type `url` | nein |
| `liveLabel`, `repositoryOwner`, `repositoryName`, `role` | `TextInput` | nein |
| `projectYear` | `TextInput` type `number` | nein |
| `isClientProject` | `Switch` | — |
| Logo, Cover | je ein `ProjectImageInput` | nein |

**Zod-Schema fürs Formular** — spiegelt die serverseitigen Regeln, damit Fehler sofort sichtbar sind, ohne dem Server zu widersprechen:

```ts
const RESERVED_SLUGS = ["manage", "order", "tags"];

const projectFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z
    .string()
    .max(100)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Only lowercase letters, digits and single hyphens")
    .refine((value) => !RESERVED_SLUGS.includes(value), "This slug is reserved")
    .or(z.literal("")),
  shortDescription: z.string().max(255).or(z.literal("")),
  description: z.string().or(z.literal("")),
  status: z.enum(["development", "beta", "active", "paused", "archived"]),
  isVisible: z.boolean(),
  category: z.string().max(50).or(z.literal("")),
  tagIds: z.array(z.number()),
  techStack: z.string(),
  websiteUrl: z.string().url("Must be a valid http(s) URL").or(z.literal("")),
  liveLabel: z.string().max(100).or(z.literal("")),
  repositoryUrl: z.string().url("Must be a valid http(s) URL").or(z.literal("")),
  repositoryOwner: z.string().max(100).or(z.literal("")),
  repositoryName: z.string().max(100).or(z.literal("")),
  demoUrl: z.string().url("Must be a valid http(s) URL").or(z.literal("")),
  documentationUrl: z.string().url("Must be a valid http(s) URL").or(z.literal("")),
  role: z.string().max(100).or(z.literal("")),
  projectYear: z.string(),
  isClientProject: z.boolean(),
});
```

Die reservierten Slugs stehen hier bewusst doppelt (Server **und** Client): der Server ist die Autorität und antwortet mit 400, aber ein sofortiger Feldfehler ist die bessere Bedienung. Wenn der Server trotzdem 400 liefert, wird die Meldung wie im Bestand per `form.setError` auf das Feld gelegt.

**Leere Strings werden beim Submit zu `null`** — die API unterscheidet „Feld nicht mitgeschickt" (unverändert) von „`null`" (leeren). Das Formular schickt im Edit-Modus immer alle Felder, also werden leere Eingaben zu `null`, damit Leeren funktioniert. `techStack` wird an Kommata gesplittet, getrimmt und leere Einträge verworfen. `projectYear` wird zu `number | null`.

**Assets: Reihenfolge des Speicherns.** Ein Asset-Upload braucht eine Projekt-ID, die beim Anlegen erst nach dem Speichern existiert. Deshalb hält das Sheet die ausgewählten Blobs in lokalem State und der Submit läuft in zwei Phasen:

1. Projekt anlegen bzw. aktualisieren → liefert das `Project` mit `id`.
2. Für jeden vorliegenden Blob `uploadProjectAsset` mit dieser `id` aufrufen, sequenziell (nicht parallel — die Singleton-Logik für Logo und Cover ersetzt serverseitig das jeweils vorhandene Asset, und paralleles Ersetzen wäre ein Rennen).
3. Erst danach `onOpenChange(false)` und Erfolgs-Toast.

Schlägt Phase 2 fehl, bleibt das Sheet offen, das Projekt ist aber gespeichert — der Toast muss das klar sagen (`"Project saved, but the image upload failed: …"`), nicht nur „Fehler".

- [ ] **Step 1: `ProjectFormSheet.tsx` schreiben**

Nach dem Muster von `EditUserSheet` (Sheet, Separator, Abschnitts-Überschriften, Footer mit Cancel und Submit, `Spinner` im Pending-Zustand, Fehler-`Alert` über dem Footer). **Nicht** das `new FormData(formRef.current!)`-Muster übernehmen: hier gehen die Felder als JSON, und Assets laufen über eigene Endpunkte.

Im Edit-Modus kommen die `defaultValues` aus dem `project`-Prop; `techStack` wird zum Anzeigen mit `", "` gejoint, `projectYear` zu String. Null-Werte werden zu `""`.

- [ ] **Step 2: `ProjectDialogs.tsx` schreiben**

Nach dem Muster von `UserDialogs`: liest `open` und `currentRow` aus dem Context, rendert das Sheet im Create-Modus für `open === "add"` und im Edit-Modus für `open === "edit" && currentRow`. Beim Schließen `setCurrentRow(null)` verzögert (`setTimeout(…, 500)`), damit die Schließ-Animation nicht auf leeren Daten läuft. Der Delete-Dialog kommt in Task 9 dazu.

- [ ] **Step 3: In `index.tsx` einbinden**

`<ProjectDialogs />` innerhalb des `ProjectsProvider`, nach `<Main>` — exakt wie `<UserDialogs />` in `src/feature/user/index.tsx`.

- [ ] **Step 4: Typecheck und Lint**

```bash
npx tsc -b
npx eslint src/feature/project-management
```

- [ ] **Step 5: Verifikation im Browser**

Auf `/dashboard/projects`:
1. **Anlegen, minimal:** `+ Project`, nur `name` = `Plan Test`, speichern. Erwartet: Sheet schließt, Erfolgs-Toast, die Karte erscheint **sofort** ohne Reload (Query-Invalidierung), Slug ist `plan-test`.
2. **Validierung:** Anlegen mit `slug` = `tags` → sofortiger Feldfehler, kein Request. Mit `websiteUrl` = `nicht-eine-url` → Feldfehler.
3. **Server-Fehler:** Anlegen mit `name` = `Plan Test` erneut (gleicher Slug) → Fehler-Toast mit der 409-Meldung, Sheet bleibt offen, keine zweite Karte.
4. **Bearbeiten:** Bei `Plan Test` `Edit`, Status auf `active`, `techStack` = `PHP, MySQL`, Tags: einen neuen Tag inline anlegen, speichern. Erwartet: Karte zeigt den neuen Status und die Tags, ohne Reload.
5. **Leeren:** Bei `Plan Test` `shortDescription` füllen, speichern, erneut öffnen, Feld leeren, speichern. Erwartet: das Feld ist danach wirklich leer (beweist, dass `""` → `null` greift).
6. **Logo-Upload im Create-Flow:** Ein neues Projekt mit Namen **und** Logo anlegen. Erwartet: beide Phasen laufen, die Karte zeigt direkt das Logo.

Räum beide Testprojekte danach über die UI (`Delete` folgt in Task 9 — bis dahin per curl) wieder weg und prüfe, dass wieder 6 Projekte stehen.

Screenshots von Punkt 1, 2 und 6.

- [ ] **Step 6: Commit**

```bash
git add src/feature/project-management
git commit -m "$(cat <<'EOF'
feat: add project create and edit sheet

Assets upload in a second phase after the project is saved, because an asset
upload needs the project id which does not exist yet while creating.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01ELvDLKbqAAELWXHrqgZrZs
EOF
)"
```

---

### Task 9: Löschen

**Files:**
- Create: `src/feature/project-management/components/DeleteProjectDialog.tsx`
- Modify: `src/feature/project-management/components/ProjectDialogs.tsx`

**Interfaces:**
- Consumes: `useDeleteProject` (Task 2), `AlertDialog`-Familie, `useProjects()`.
- Produces: `<DeleteProjectDialog project={Project} open onOpenChange />`

**Text** (aus der Spec, Punkt 21):

> Projekt löschen?
> „{name}" wird dauerhaft gelöscht. Dabei werden auch die zugehörigen Projekt-Assets entfernt.
> [Abbrechen] [Projekt löschen]

Die Assets werden serverseitig mitgelöscht (Teil 1 räumt die MinIO-Objekte vor dem DB-Delete auf) — der Text sagt das, damit klar ist, dass die Bilder mitgehen.

Kein Vorab-Check auf Fremdreferenzen: auf `projects` verweist keine andere Entität.

- [ ] **Step 1: Dialog schreiben**

`AlertDialog` aus `@/components/ui/alert-dialog.tsx`, `AlertDialogAction` mit `variant="destructive"`, Pending-Zustand am Action-Button (`Spinner`), `toast.success` nach Erfolg und `toast.error` im Fehlerfall.

- [ ] **Step 2: In `ProjectDialogs.tsx` ergänzen**

Für `open === "delete" && currentRow`.

- [ ] **Step 3: Typecheck und Lint**

```bash
npx tsc -b
npx eslint src/feature/project-management
```

- [ ] **Step 4: Verifikation im Browser**

1. Leg ein Testprojekt mit einem Logo an.
2. `Delete` im Kebab-Menü → der Dialog nennt den Projektnamen und erwähnt die Assets.
3. `Abbrechen` → nichts passiert, die Karte bleibt.
4. `Projekt löschen` → Karte verschwindet sofort, Erfolgs-Toast.
5. Prüf, dass auch das Asset weg ist:
```bash
cd ../luka-lta-api && docker compose -f docker-compose.development.yml exec -T mysql \
  sh -c 'exec mysql -N -u root -p"$MYSQL_ROOT_PASSWORD" luka_lta_api -e "SELECT COUNT(*) FROM projects; SELECT COUNT(*) FROM project_assets;"'
```
Erwartet: wieder 6 Projekte und 20 Assets — also genau der Stand vor dem Test.

- [ ] **Step 5: Commit**

```bash
git add src/feature/project-management
git commit -m "$(cat <<'EOF'
feat: add project delete confirmation

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01ELvDLKbqAAELWXHrqgZrZs
EOF
)"
```

---

### Task 10: Sortierung per Drag and Drop

**Files:**
- Modify: `src/feature/project-management/index.tsx`
- Modify: `src/feature/project-management/components/ProjectCard.tsx`

**Interfaces:**
- Consumes: `useReorderProjects` (Task 2); `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/modifiers` (alle bereits Dependencies).
- Produces: sortierbare Kartenliste.

**Umsetzung:** `DndContext` mit `closestCenter`, `SortableContext` mit `verticalListSortingStrategy`, `restrictToVerticalAxis` aus `@dnd-kit/modifiers`. Jede Karte wird über `useSortable` zu einem Sortable; der Zieh-Griff ist ein eigenes Element (`GripVertical`) mit den `listeners`, **nicht** die ganze Karte — sonst kollidiert das Ziehen mit dem Kebab-Menü.

**Persistenz:** `onDragEnd` berechnet die neue Reihenfolge lokal (optimistisch im UI), und schickt dann **eine** `reorderProjects`-Mutation mit allen Paaren `{projectId, sortOrder}` in der neuen Reihenfolge, Index als `sortOrder`. Kein Debounce nötig — ein Drop ist ein diskretes Ereignis.

**Wichtig:** Die lokale Reihenfolge muss bis zur Invalidierung halten, sonst springt die Liste zurück. Also die Reihenfolge in lokalem State spiegeln und bei neuen Query-Daten übernehmen.

- [ ] **Step 1: Umsetzen**

- [ ] **Step 2: Typecheck und Lint**

```bash
npx tsc -b
npx eslint src/feature/project-management
```

- [ ] **Step 3: Verifikation im Browser**

1. Zieh `kindled` (Position 4) an die erste Stelle. Erwartet: die Karte bleibt oben, kein Zurückspringen.
2. Seite neu laden. Erwartet: die Reihenfolge ist persistiert.
3. Prüf die Werte serverseitig:
```bash
cd ../luka-lta-api && docker compose -f docker-compose.development.yml exec -T mysql \
  sh -c 'exec mysql -u root -p"$MYSQL_ROOT_PASSWORD" luka_lta_api -e "SELECT slug, sort_order FROM projects ORDER BY sort_order;"'
```
Erwartet: `sort_order` 0–5 ohne Lücken und ohne Dubletten, `kindled` auf 0.
4. Das Kebab-Menü muss weiter normal bedienbar sein (Klick darf keinen Drag auslösen).
5. Stell die ursprüngliche Reihenfolge danach wieder her (luka-lta-api, mexcal, luka-lta-backend, kindled, dj-guide, luka-lta-frontend) und belege das mit derselben Abfrage.

- [ ] **Step 4: Commit**

```bash
git add src/feature/project-management
git commit -m "$(cat <<'EOF'
feat: add drag and drop ordering for projects

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01ELvDLKbqAAELWXHrqgZrZs
EOF
)"
```

---

### Task 11: Abschluss-Durchlauf im Browser

**Files:** keine — dieser Task schreibt nur dann Code, wenn er einen Fehler findet.

Dies ist das Gate, das kein Typecheck ersetzt: die Verwaltung einmal vollständig wie ein Mensch bedienen. Der Dev-Server läuft auf `http://localhost:5173`.

- [ ] **Step 1: Kompletter Durchlauf**

Mit Screenshots zu jedem Punkt:

1. **Liste:** alle 6 Projekte, Logos laden, Reihenfolge korrekt, Status-Badges lesbar.
2. **Anlegen mit allem:** neues Projekt mit Name, Slug, beiden Beschreibungen, Status `beta`, Kategorie, zwei Tags (einer davon inline neu angelegt), `techStack` mit drei Einträgen, allen vier URLs, Rolle, Jahr, `isClientProject` an, Logo **und** Cover. Speichern. Erwartet: Karte erscheint vollständig, kein Reload.
3. **Review Focus 4 — Logo ersetzen:** bei diesem Projekt ein anderes Logo hochladen. Erwartet: die Karte zeigt sofort das neue Bild. Dann serverseitig prüfen, dass es **genau ein** Logo gibt:
```bash
cd ../luka-lta-api && docker compose -f docker-compose.development.yml exec -T mysql \
  sh -c 'exec mysql -u root -p"$MYSQL_ROOT_PASSWORD" luka_lta_api -e "SELECT p.slug, a.type, COUNT(*) FROM project_assets a JOIN projects p ON p.project_id=a.project_id GROUP BY p.slug, a.type ORDER BY p.slug;"'
```
4. **Review Focus 5 — unsichtbar schalten:** `isVisible` aus, speichern. Erwartet: die Karte bleibt in der Verwaltung sichtbar, erkennbar als `Hidden` und gedämpft. Dann prüfen, dass sie öffentlich verschwunden ist:
```bash
curl -s http://localhost/api/v1/projects | jq '[.data.projects[].slug]'
```
Der Slug darf dort **nicht** auftauchen, während `/projects/manage` ihn weiter liefert.
5. **Bearbeiten und Leeren:** ein Feld füllen, speichern, leeren, speichern — das Feld ist danach wirklich leer.
6. **Löschen:** das Testprojekt löschen, Karte verschwindet, Assets sind weg.
7. **Leerzustand:** nicht provozieren (die echten Daten bleiben stehen) — stattdessen belegen, dass die Empty-State-Komponente aus Task 6 noch im Code steht und der `+ Project`-Button im Kopf unabhängig davon existiert.
8. **Fehlerzustand:** Netzwerk offline, neu laden → `ErrorState` mit Retry; online, Retry klicken → Liste lädt.
9. **Browser-Konsole:** während des gesamten Durchlaufs offen halten. **Am Ende muss sie frei von Fehlern und von React-Warnungen sein** (keine Key-Warnungen, keine „controlled/uncontrolled"-Wechsel, keine fehlgeschlagenen Requests außer dem absichtlichen Offline-Test). Jede verbleibende Meldung wörtlich in den Report.

- [ ] **Step 2: Endzustand bestätigen**

```bash
cd ../luka-lta-api && docker compose -f docker-compose.development.yml exec -T mysql \
  sh -c 'exec mysql -u root -p"$MYSQL_ROOT_PASSWORD" luka_lta_api -e "SELECT COUNT(*) AS projects FROM projects; SELECT COUNT(*) AS assets FROM project_assets; SELECT COUNT(*) AS tags FROM project_tags;"'
curl -s http://localhost/api/v1/projects | jq '.data.projects | length'
```
Erwartet: 6 Projekte, 20 Assets, öffentlich 6. Tags dürfen von den Tests übrig sein — die gehören ins Dictionary und sind kein Müll; nenn die Anzahl im Report.

- [ ] **Step 3: Typecheck und Lint abschließend**

```bash
npx tsc -b
npx eslint src/api/projects src/api/project-tags src/feature/project-management src/pages/Dashboard/ProjectsPage.tsx
```

- [ ] **Step 4: Nur committen, wenn etwas gefixt wurde**

Fand der Durchlauf keinen Fehler, gibt es keinen Commit — dann besteht der Task nur aus dem Report. Andernfalls den Fix committen und im Report benennen, was gefunden wurde.

---

## Abschluss Teil 2

Danach ist die Verwaltung bedienbar und Teil 3 (öffentliches Portfolio auf die API umstellen, Hardcode entfernen) kann folgen. Für Teil 3 gilt der in Teil 1 notierte Hinweis: `luka-lta` hat auf `feature-portfolio-updates` uncommittete Änderungen, unter anderem in genau der Datei, die ersetzt wird — die müssen zuerst committed werden.
