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
