import { type ReactNode, useState } from "react";
import { AlertCircle, Check } from "lucide-react";
import { z } from "zod";
import { Controller, type FieldErrors, type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx";
import { TextInput } from "@/components/form/TextInput.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import { FormDialog } from "@/components/dialogs/form-dialog.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import { cn } from "@/lib/utils.ts";
import {
  useCreateProject,
  useDeleteProjectAsset,
  useUpdateProject,
  useUploadProjectAsset,
} from "@/api/projects/hooks.ts";
import type { Project, ProjectInput, ProjectStatus } from "@/api/projects/schema.ts";
import { ProjectTagsField } from "@/feature/project-management/components/ProjectTagsField.tsx";
import { ProjectImageInput } from "@/feature/project-management/components/ProjectImageInput.tsx";
import { getApiErrorMessage } from "@/lib/apiError.ts";
import { PROJECT_STATUS } from "@/feature/project-management/projectStatus.ts";

/** Slugs, die bereits von statischen Routen belegt sind (serverseitig ebenfalls geprueft). */
const RESERVED_SLUGS = ["manage", "order", "tags"];

const PROJECT_STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: "development", label: PROJECT_STATUS.development.label },
  { value: "beta", label: PROJECT_STATUS.beta.label },
  { value: "active", label: PROJECT_STATUS.active.label },
  { value: "paused", label: PROJECT_STATUS.paused.label },
  { value: "archived", label: PROJECT_STATUS.archived.label },
];

const projectFormSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich").max(100, "Höchstens 100 Zeichen"),
  slug: z
    .string()
    .max(100)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Nur Kleinbuchstaben, Ziffern und einzelne Bindestriche")
    .refine((value) => !RESERVED_SLUGS.includes(value), "Dieser Slug ist reserviert")
    .or(z.literal("")),
  shortDescription: z.string().max(255).or(z.literal("")),
  description: z.string().or(z.literal("")),
  status: z.enum(["development", "beta", "active", "paused", "archived"]),
  isVisible: z.boolean(),
  category: z.string().max(50).or(z.literal("")),
  tagIds: z.array(z.number()),
  techStack: z.string(),
  websiteUrl: z.string().url("Muss eine gültige http(s)-URL sein").or(z.literal("")),
  liveLabel: z.string().max(100).or(z.literal("")),
  repositoryUrl: z.string().url("Muss eine gültige http(s)-URL sein").or(z.literal("")),
  repositoryOwner: z.string().max(100).or(z.literal("")),
  repositoryName: z.string().max(100).or(z.literal("")),
  demoUrl: z.string().url("Muss eine gültige http(s)-URL sein").or(z.literal("")),
  documentationUrl: z.string().url("Muss eine gültige http(s)-URL sein").or(z.literal("")),
  role: z.string().max(100).or(z.literal("")),
  projectYear: z
    .string()
    .regex(/^\d{4}$/, "Jahr bitte vierstellig angeben")
    .or(z.literal("")),
  isClientProject: z.boolean(),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

type TabId = "general" | "links" | "details" | "media";

/**
 * Ordnet jedes Formularfeld genau einem Tab zu. Daraus leiten sich die
 * Fehlermarkierung der Tabs und der Sprung zum ersten fehlerhaften Tab ab.
 */
const TAB_FIELDS: Record<TabId, readonly (keyof ProjectFormValues)[]> = {
  general: ["name", "slug", "shortDescription", "description", "status", "isVisible", "category"],
  links: ["websiteUrl", "liveLabel", "repositoryUrl", "repositoryOwner", "repositoryName", "demoUrl", "documentationUrl"],
  details: ["tagIds", "techStack", "role", "projectYear", "isClientProject"],
  media: [],
};

const TABS: { id: TabId; label: string }[] = [
  { id: "general", label: "Allgemein" },
  { id: "links", label: "Links" },
  { id: "details", label: "Details" },
  { id: "media", label: "Bilder" },
];

/** Erster Tab, der laut Fehlerobjekt ein ungültiges Feld enthält. */
function findFirstTabWithError(errors: FieldErrors<ProjectFormValues>): TabId | null {
  for (const tab of TABS) {
    if (TAB_FIELDS[tab.id].some((name) => errors[name] !== undefined)) return tab.id;
  }
  return null;
}

interface PendingAsset {
  blob: Blob;
  fileName: string;
}

interface Props {
  mode: "create" | "edit";
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function toNullableString(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function buildDefaultValues(project: Project | null): ProjectFormValues {
  if (!project) {
    return {
      name: "",
      slug: "",
      shortDescription: "",
      description: "",
      status: "development",
      isVisible: true,
      category: "",
      tagIds: [],
      techStack: "",
      websiteUrl: "",
      liveLabel: "",
      repositoryUrl: "",
      repositoryOwner: "",
      repositoryName: "",
      demoUrl: "",
      documentationUrl: "",
      role: "",
      projectYear: "",
      isClientProject: false,
    };
  }

  return {
    name: project.name,
    slug: project.slug,
    shortDescription: project.shortDescription ?? "",
    description: project.description ?? "",
    status: project.status,
    isVisible: project.isVisible,
    category: project.category ?? "",
    tagIds: project.tags.map((tag) => tag.tagId),
    techStack: project.techStack.join(", "),
    websiteUrl: project.websiteUrl ?? "",
    liveLabel: project.liveLabel ?? "",
    repositoryUrl: project.repositoryUrl ?? "",
    repositoryOwner: project.repositoryOwner ?? "",
    repositoryName: project.repositoryName ?? "",
    demoUrl: project.demoUrl ?? "",
    documentationUrl: project.documentationUrl ?? "",
    role: project.role ?? "",
    projectYear: project.year !== null ? String(project.year) : "",
    isClientProject: project.isClientProject,
  };
}

function buildProjectInput(values: ProjectFormValues): ProjectInput {
  const techStack = values.techStack
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item !== "");

  const trimmedSlug = values.slug.trim();
  const trimmedYear = values.projectYear.trim();

  return {
    name: values.name,
    slug: trimmedSlug === "" ? undefined : trimmedSlug,
    shortDescription: toNullableString(values.shortDescription),
    description: toNullableString(values.description),
    status: values.status,
    isVisible: values.isVisible,
    category: toNullableString(values.category),
    tagIds: values.tagIds,
    techStack,
    websiteUrl: toNullableString(values.websiteUrl),
    liveLabel: toNullableString(values.liveLabel),
    repositoryUrl: toNullableString(values.repositoryUrl),
    repositoryOwner: toNullableString(values.repositoryOwner),
    repositoryName: toNullableString(values.repositoryName),
    demoUrl: toNullableString(values.demoUrl),
    documentationUrl: toNullableString(values.documentationUrl),
    role: toNullableString(values.role),
    projectYear: trimmedYear === "" ? null : Number(trimmedYear),
    isClientProject: values.isClientProject,
  };
}

export function ProjectFormDialog({ mode, project, open, onOpenChange }: Props) {
  const [logoAsset, setLogoAsset] = useState<PendingAsset | null>(null);
  const [logoRemoved, setLogoRemoved] = useState(false);
  const [coverAsset, setCoverAsset] = useState<PendingAsset | null>(null);
  const [coverRemoved, setCoverRemoved] = useState(false);
  const [assetErrorMessage, setAssetErrorMessage] = useState<string | null>(null);
  const [isUploadingAssets, setIsUploadingAssets] = useState(false);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [visitedTabs, setVisitedTabs] = useState<TabId[]>(["general"]);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: buildDefaultValues(project),
  });

  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const uploadAsset = useUploadProjectAsset();
  const deleteAsset = useDeleteProjectAsset();

  const isSaving = createProject.isPending || updateProject.isPending || isUploadingAssets;
  const saveError = createProject.error ?? updateProject.error ?? null;

  function resetLocalState() {
    setLogoAsset(null);
    setLogoRemoved(false);
    setCoverAsset(null);
    setCoverRemoved(false);
    setAssetErrorMessage(null);
    setCreatedProjectId(null);
    setActiveTab("general");
    setVisitedTabs(["general"]);
    createProject.reset();
    updateProject.reset();
  }

  function selectTab(tab: TabId) {
    setActiveTab(tab);
    setVisitedTabs((previous) => (previous.includes(tab) ? previous : [...previous, tab]));
  }

  /** Bei ungültigem Formular zum ersten Tab mit Fehler springen und dort fokussieren. */
  function handleInvalid(invalidFields: FieldErrors<ProjectFormValues>) {
    const targetTab = findFirstTabWithError(invalidFields);
    if (!targetTab) return;

    selectTab(targetTab);
    const firstField = TAB_FIELDS[targetTab].find((name) => invalidFields[name] !== undefined);
    if (firstField) {
      // Das Feld wird erst nach dem Tab-Wechsel gemountet.
      setTimeout(() => form.setFocus(firstField), 0);
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      form.reset(buildDefaultValues(project));
      resetLocalState();
    }
    onOpenChange(nextOpen);
  }

  async function uploadPendingAssets(projectId: string) {
    if (logoAsset) {
      await uploadAsset.mutateAsync({
        projectId,
        type: "logo",
        file: logoAsset.blob,
        fileName: logoAsset.fileName,
      });
    } else if (logoRemoved && project?.logo) {
      await deleteAsset.mutateAsync({ projectId, assetId: project.logo.id });
    }

    if (coverAsset) {
      await uploadAsset.mutateAsync({
        projectId,
        type: "cover",
        file: coverAsset.blob,
        fileName: coverAsset.fileName,
      });
    } else if (coverRemoved && project?.cover) {
      await deleteAsset.mutateAsync({ projectId, assetId: project.cover.id });
    }
  }

  const onSubmit: SubmitHandler<ProjectFormValues> = async (values) => {
    setAssetErrorMessage(null);
    const data = buildProjectInput(values);
    const targetId = mode === "edit" ? project?.id : createdProjectId;

    try {
      const savedProject = targetId
        ? await updateProject.mutateAsync({ projectId: targetId, data })
        : await createProject.mutateAsync(data);

      if (mode === "create") {
        setCreatedProjectId(savedProject.id);
      }

      try {
        setIsUploadingAssets(true);
        await uploadPendingAssets(savedProject.id);
        setIsUploadingAssets(false);
      } catch (assetError) {
        setIsUploadingAssets(false);
        const message = `Projekt gespeichert, aber der Bild-Upload ist fehlgeschlagen: ${getApiErrorMessage(assetError)}`;
        setAssetErrorMessage(message);
        toast.error(message);
        selectTab("media");
        return;
      }

      resetLocalState();
      handleOpenChange(false);
      toast.success(mode === "edit" ? "Projekt gespeichert" : "Projekt angelegt");
    } catch (saveErrorValue) {
      const message = getApiErrorMessage(saveErrorValue);

      if (message.toLowerCase().includes("slug")) {
        form.setError("slug", { type: "manual", message });
        selectTab("general");
        form.setFocus("slug");
      }

      toast.error(message);
    }
  };

  const submitLabel =
    mode === "edit" ? "Speichern" : createdProjectId ? "Bild-Upload wiederholen" : "Projekt anlegen";

  return (
    <FormDialog
      open={open}
      onOpenChange={handleOpenChange}
      size="lg"
      title={mode === "edit" ? "Projekt bearbeiten" : "Projekt anlegen"}
      description={
        mode === "edit"
          ? "Änderungen erscheinen direkt im öffentlichen Portfolio."
          : "Neues Projekt für das öffentliche Portfolio."
      }
      onSubmit={form.handleSubmit(onSubmit, handleInvalid)}
      submitLabel={submitLabel}
      isSubmitting={isSaving}
    >
      <Tabs value={activeTab} onValueChange={(value) => selectTab(value as TabId)} className="space-y-5">
        <TabsList className="grid h-auto w-full grid-cols-4">
          {TABS.map((tab) => {
            const hasError = TAB_FIELDS[tab.id].some((name) => form.formState.errors[name] !== undefined);
            const isDone = visitedTabs.includes(tab.id) && tab.id !== activeTab;

            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={cn("gap-1.5", hasError && "text-destructive data-[state=active]:text-destructive")}
              >
                {tab.label}
                {hasError ? (
                  <AlertCircle aria-hidden className="size-3.5" />
                ) : (
                  isDone && <Check aria-hidden className="size-3.5 text-muted-foreground" />
                )}
                {hasError && <span className="sr-only">enthält Fehler</span>}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Mindesthöhe hält die Dialoghöhe beim Tab-Wechsel ruhig. */}
        <div className="sm:min-h-[26rem]">
          <TabsContent value="general" className="mt-0 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <TextInput name="name" id="project-name" label="Name" form={form} type="text" />
              <TextInput
                name="slug"
                id="project-slug"
                label="Slug"
                form={form}
                type="text"
                optional
                placeholder="wird aus dem Namen erzeugt"
              />
            </div>
            <TextInput
              name="shortDescription"
              id="project-short-description"
              label="Kurzbeschreibung"
              form={form}
              type="text"
              optional
              description="Ein Satz für Karten und Übersichten."
            />
            <div className="space-y-2">
              <Label htmlFor="project-description">
                Beschreibung <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              <Controller
                control={form.control}
                name="description"
                render={({ field }) => <Textarea id="project-description" rows={4} {...field} />}
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="project-status">Status</Label>
                <Controller
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="project-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PROJECT_STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <TextInput name="category" id="project-category" label="Kategorie" form={form} type="text" optional />
            </div>
            <SwitchField
              id="project-is-visible"
              label="Im Portfolio anzeigen"
              description="Ausgeblendete Projekte bleiben hier erhalten, sind öffentlich aber nicht sichtbar."
              control={
                <Controller
                  control={form.control}
                  name="isVisible"
                  render={({ field }) => (
                    <Switch id="project-is-visible" checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
              }
            />
          </TabsContent>

          <TabsContent value="links" className="mt-0 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <TextInput name="websiteUrl" id="project-website-url" label="Website" form={form} type="url" optional placeholder="https://" />
              <TextInput name="liveLabel" id="project-live-label" label="Link-Beschriftung" form={form} type="text" optional />
            </div>
            <TextInput
              name="repositoryUrl"
              id="project-repository-url"
              label="Repository"
              form={form}
              type="url"
              optional
              placeholder="https://github.com/…"
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <TextInput name="repositoryOwner" id="project-repository-owner" label="Repository-Owner" form={form} type="text" optional />
              <TextInput name="repositoryName" id="project-repository-name" label="Repository-Name" form={form} type="text" optional />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <TextInput name="demoUrl" id="project-demo-url" label="Demo" form={form} type="url" optional placeholder="https://" />
              <TextInput name="documentationUrl" id="project-documentation-url" label="Dokumentation" form={form} type="url" optional placeholder="https://" />
            </div>
          </TabsContent>

          <TabsContent value="details" className="mt-0 space-y-5">
            <Controller
              control={form.control}
              name="tagIds"
              render={({ field }) => <ProjectTagsField value={field.value} onChange={field.onChange} />}
            />
            <TextInput
              name="techStack"
              id="project-tech-stack"
              label="Tech-Stack"
              form={form}
              type="text"
              optional
              placeholder="PHP, MySQL, React"
              description="Mehrere Einträge mit Komma trennen."
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <TextInput name="role" id="project-role" label="Rolle" form={form} type="text" optional placeholder="z. B. Full-Stack" />
              <TextInput name="projectYear" id="project-year" label="Jahr" form={form} type="number" optional />
            </div>
            <SwitchField
              id="project-is-client-project"
              label="Kundenprojekt"
              control={
                <Controller
                  control={form.control}
                  name="isClientProject"
                  render={({ field }) => (
                    <Switch id="project-is-client-project" checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
              }
            />
          </TabsContent>

          <TabsContent value="media" className="mt-0 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Logo <span className="font-normal text-muted-foreground">(quadratisch)</span></Label>
                <ProjectImageInput
                  type="logo"
                  currentUrl={logoRemoved ? null : project?.logo?.url ?? null}
                  disabled={isSaving}
                  onSelect={(blob, fileName) => {
                    setLogoRemoved(false);
                    setLogoAsset({ blob, fileName });
                  }}
                  onClear={() => {
                    setLogoAsset(null);
                    setLogoRemoved(true);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Cover</Label>
                <ProjectImageInput
                  type="cover"
                  currentUrl={coverRemoved ? null : project?.cover?.url ?? null}
                  disabled={isSaving}
                  onSelect={(blob, fileName) => {
                    setCoverRemoved(false);
                    setCoverAsset({ blob, fileName });
                  }}
                  onClear={() => {
                    setCoverAsset(null);
                    setCoverRemoved(true);
                  }}
                />
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {(saveError || assetErrorMessage) && (
        <Alert variant="destructive">
          <AlertTitle>
            {assetErrorMessage
              ? "Bild-Upload fehlgeschlagen"
              : mode === "edit"
                ? "Projekt konnte nicht gespeichert werden"
                : "Projekt konnte nicht angelegt werden"}
          </AlertTitle>
          <AlertDescription>{assetErrorMessage ?? getApiErrorMessage(saveError)}</AlertDescription>
        </Alert>
      )}
    </FormDialog>
  );
}

function SwitchField({
  id,
  label,
  description,
  control,
}: {
  id: string;
  label: string;
  description?: string;
  control: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border px-4 py-3">
      <div className="space-y-0.5">
        <Label htmlFor={id} className="cursor-pointer">{label}</Label>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      {control}
    </div>
  );
}
