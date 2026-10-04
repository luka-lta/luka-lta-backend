import { useState, type FormEvent } from "react";
import { z } from "zod";
import { Controller, type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx";
import { Button } from "@/components/ui/button.tsx";
import { TextInput } from "@/components/form/TextInput.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { Spinner } from "@/components/ui/kibo-ui/spinner/index.tsx";
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

/** Slugs, die bereits von statischen Routen belegt sind (serverseitig ebenfalls geprueft). */
const RESERVED_SLUGS = ["manage", "order", "tags"];

const PROJECT_STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: "development", label: "Development" },
  { value: "beta", label: "Beta" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "archived", label: "Archived" },
];

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

type ProjectFormValues = z.infer<typeof projectFormSchema>;

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

    try {
      const savedProject =
        mode === "edit" && project
          ? await updateProject.mutateAsync({ projectId: project.id, data })
          : await createProject.mutateAsync(data);

      try {
        setIsUploadingAssets(true);
        await uploadPendingAssets(savedProject.id);
        setIsUploadingAssets(false);
      } catch (assetError) {
        setIsUploadingAssets(false);
        const message = `Project saved, but the image upload failed: ${getApiErrorMessage(assetError)}`;
        setAssetErrorMessage(message);
        toast.error(message);
        return;
      }

      resetLocalState();
      onOpenChange(false);
      toast.success(mode === "edit" ? "Project updated successfully!" : "Project created successfully!");
    } catch (saveErrorValue) {
      const message = getApiErrorMessage(saveErrorValue);

      if (message.toLowerCase().includes("slug")) {
        form.setError("slug", { type: "manual", message });
      }

      toast.error(message);
    }
  };

  /**
   * `ImageCropApply`/`ImageCropReset` (inside `ProjectImageInput`) render plain
   * `<button>` elements without an explicit `type`, which defaults to `type="submit"`
   * for a button nested in a `<form>`. Without this guard, clicking "Apply" on the
   * image cropper would submit the whole project form prematurely. Only the real
   * submit button carries `data-project-form-submit`, so every other nested button
   * is rejected here instead.
   */
  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const isRealSubmit = submitter instanceof HTMLElement && submitter.dataset.projectFormSubmit === "true";

    if (!isRealSubmit) {
      event.preventDefault();
      return;
    }

    void form.handleSubmit(onSubmit)(event);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 p-0 sm:max-w-2xl">
        <form onSubmit={handleFormSubmit} className="flex min-h-0 flex-1 flex-col">
          <DialogHeader className="px-6 pb-4 pt-6">
            <DialogTitle className="text-xl">{mode === "edit" ? "Edit Project" : "Create Project"}</DialogTitle>
            <DialogDescription>
              {mode === "edit"
                ? "Update this project's information."
                : "Add a new project to the public portfolio."}
            </DialogDescription>
          </DialogHeader>

          <Separator />

          <div className="max-h-[80vh] space-y-6 overflow-y-auto px-6 py-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Basics</h3>

              <TextInput name="name" id="project-name" label="Name" form={form} type="text" />
              <TextInput
                name="slug"
                id="project-slug"
                label="Slug"
                form={form}
                type="text"
                placeholder="Leave empty to derive from name"
              />
              <TextInput
                name="shortDescription"
                id="project-short-description"
                label="Short Description"
                form={form}
                type="text"
              />

              <div className="flex flex-col items-start gap-2">
                <Label htmlFor="project-description">Description</Label>
                <Controller
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <Textarea id="project-description" className="w-full" {...field} />
                  )}
                />
              </div>

              <div className="flex flex-col items-start gap-2">
                <Label htmlFor="project-status">Status</Label>
                <Controller
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="project-status" className="w-full">
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

              <div className="flex flex-col items-start gap-2">
                <Label htmlFor="project-is-visible">Visible</Label>
                <Controller
                  control={form.control}
                  name="isVisible"
                  render={({ field }) => (
                    <Switch
                      id="project-is-visible"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>

              <TextInput name="category" id="project-category" label="Category" form={form} type="text" />

              <Controller
                control={form.control}
                name="tagIds"
                render={({ field }) => <ProjectTagsField value={field.value} onChange={field.onChange} />}
              />

              <TextInput
                name="techStack"
                id="project-tech-stack"
                label="Tech Stack"
                form={form}
                type="text"
                placeholder="PHP, MySQL"
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Links</h3>

              <TextInput name="websiteUrl" id="project-website-url" label="Website URL" form={form} type="url" />
              <TextInput name="liveLabel" id="project-live-label" label="Live Label" form={form} type="text" />
              <TextInput
                name="repositoryUrl"
                id="project-repository-url"
                label="Repository URL"
                form={form}
                type="url"
              />
              <TextInput
                name="repositoryOwner"
                id="project-repository-owner"
                label="Repository Owner"
                form={form}
                type="text"
              />
              <TextInput
                name="repositoryName"
                id="project-repository-name"
                label="Repository Name"
                form={form}
                type="text"
              />
              <TextInput name="demoUrl" id="project-demo-url" label="Demo URL" form={form} type="url" />
              <TextInput
                name="documentationUrl"
                id="project-documentation-url"
                label="Documentation URL"
                form={form}
                type="url"
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Details</h3>

              <TextInput name="role" id="project-role" label="Role" form={form} type="text" />
              <TextInput name="projectYear" id="project-year" label="Year" form={form} type="number" />

              <div className="flex flex-col items-start gap-2">
                <Label htmlFor="project-is-client-project">Client Project</Label>
                <Controller
                  control={form.control}
                  name="isClientProject"
                  render={({ field }) => (
                    <Switch
                      id="project-is-client-project"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Images</h3>

              <div className="space-y-1.5">
                <Label>Logo</Label>
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

              <div className="space-y-1.5">
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

            {(saveError || assetErrorMessage) && (
              <Alert variant="destructive" className="animate-in fade-in-50">
                <AlertTitle>{mode === "edit" ? "Error updating project" : "Error creating project"}</AlertTitle>
                <AlertDescription className="mt-2">
                  {assetErrorMessage ?? getApiErrorMessage(saveError)}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <Separator />

          <DialogFooter className="flex-col gap-2 px-6 py-4 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              type="button"
              className="w-full sm:w-auto"
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              className="w-full sm:w-auto"
              type="submit"
              data-project-form-submit="true"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Spinner size={16} className="mr-2" />
                  Saving...
                </>
              ) : mode === "edit" ? (
                "Save Changes"
              ) : (
                "Create Project"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
