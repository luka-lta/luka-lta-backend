import type { StatusTone } from "@/components/feedback/status-badge.tsx";
import type { LinkItemTypeSchema } from "@/feature/linktree/schema/LinktreeSchema.ts";

export type LinkStatus = 'active' | 'inactive' | 'deactivated';

export function getLinkStatus(link: Pick<LinkItemTypeSchema, 'deactivated' | 'isActive'>): LinkStatus {
    if (link.deactivated) return 'deactivated';
    return link.isActive ? 'active' : 'inactive';
}

export const LINK_STATUS: Record<LinkStatus, { label: string; tone: StatusTone }> = {
    active: { label: 'Aktiv', tone: 'success' },
    inactive: { label: 'Versteckt', tone: 'warning' },
    deactivated: { label: 'Deaktiviert', tone: 'neutral' },
};
