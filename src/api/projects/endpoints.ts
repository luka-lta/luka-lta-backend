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
