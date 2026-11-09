import { StatusBadge } from "@/components/feedback/status-badge.tsx";
import { getLinkStatus, LINK_STATUS } from "@/feature/linktree/linkStatus.ts";
import type { LinkItemTypeSchema } from "@/feature/linktree/schema/LinktreeSchema.ts";

export function LinkStatusBadge({ link }: { link: Pick<LinkItemTypeSchema, 'deactivated' | 'isActive'> }) {
    const status = LINK_STATUS[getLinkStatus(link)];
    return <StatusBadge tone={status.tone}>{status.label}</StatusBadge>;
}
