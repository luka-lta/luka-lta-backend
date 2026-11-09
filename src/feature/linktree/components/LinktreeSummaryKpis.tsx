import { StatCard, StatGrid } from "@/components/data/stat-card.tsx";
import { getLinkStatus } from "@/feature/linktree/linkStatus.ts";
import type { LinkItemTypeSchema } from "@/feature/linktree/schema/LinktreeSchema.ts";

interface LinktreeSummaryKpisProps {
    links: LinkItemTypeSchema[];
    loading: boolean;
}

/** Zählt die Links der aktuell geladenen Seite nach Status. */
export function LinktreeSummaryKpis({ links, loading }: LinktreeSummaryKpisProps) {
    const count = (status: ReturnType<typeof getLinkStatus>) => links.filter((l) => getLinkStatus(l) === status).length;
    const value = (n: number) => (loading ? undefined : n);

    return (
        <StatGrid>
            <StatCard label="Links" value={value(links.length)} />
            <StatCard label="Aktiv" value={value(count('active'))} />
            <StatCard label="Versteckt" value={value(count('inactive'))} hint="Auf der Seite ausgeblendet" />
            <StatCard label="Deaktiviert" value={value(count('deactivated'))} hint="Leiten nicht mehr weiter" />
        </StatGrid>
    );
}
