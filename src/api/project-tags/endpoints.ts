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
