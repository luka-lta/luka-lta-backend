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
