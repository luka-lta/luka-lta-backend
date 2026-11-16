import { toast } from "sonner";
import { useActivateLink } from "@/api/linktree/hooks.ts";
import { getApiErrorMessage } from "@/lib/apiError.ts";
import type { LinkItemTypeSchema } from "@/feature/linktree/schema/LinktreeSchema.ts";

/** Reaktivieren braucht keine Bestätigung — direkt ausführen, Rückmeldung per Toast. */
export function useReactivateLink() {
    const activate = useActivateLink();
    return (link: LinkItemTypeSchema) =>
        activate.mutate(link.id, {
            onSuccess: () => toast.success(`„${link.displayname}“ ist wieder aktiv`),
            onError: (error) => toast.error(getApiErrorMessage(error)),
        });
}
