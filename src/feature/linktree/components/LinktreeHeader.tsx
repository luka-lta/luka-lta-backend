import { Status, StatusIndicator, StatusLabel } from "@/components/ui/kibo-ui/status/index.tsx";
import { RefreshButton } from "@/components/refresh-button.tsx";
import type { LinkItemTypeSchema } from "@/feature/linktree/schema/LinktreeSchema.ts";

interface LinktreeHeaderProps {
    links: LinkItemTypeSchema[];
    onRefresh: () => Promise<void>;
}

function needsAttentionCount(links: LinkItemTypeSchema[]): number {
    return links.filter((link) => link.deactivated || !link.isActive).length;
}

export function LinktreeHeader({ links, onRefresh }: LinktreeHeaderProps) {
    const attention = needsAttentionCount(links);
    const status = attention === 0 ? "online" : "degraded";

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-2">
            <div>
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold tracking-tight">Links</h1>
                    <Status status={status}>
                        <StatusIndicator />
                        <StatusLabel>
                            {attention === 0 ? "All links active" : `${attention} need${attention === 1 ? "s" : ""} attention`}
                        </StatusLabel>
                    </Status>
                </div>
                <p className="text-muted-foreground mt-1 text-sm">Manage your links here.</p>
            </div>
            <RefreshButton onRefresh={onRefresh} variant="outline" size="default" className="flex items-center gap-2" label="Refresh" />
        </div>
    );
}
