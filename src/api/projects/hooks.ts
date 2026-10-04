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
