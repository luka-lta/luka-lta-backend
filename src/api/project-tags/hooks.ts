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
