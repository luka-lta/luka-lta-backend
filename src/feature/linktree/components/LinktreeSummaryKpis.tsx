import { KpiCard } from "@/components/KpiCard.tsx";
import { CheckCircle2, Link as LinkIcon, PauseCircle, PowerOff } from "lucide-react";
import type { LinkItemTypeSchema } from "@/feature/linktree/schema/LinktreeSchema.ts";

interface LinktreeSummaryKpisProps {
	links: LinkItemTypeSchema[];
}

export function LinktreeSummaryKpis({ links }: LinktreeSummaryKpisProps) {
	const deactivated = links.filter((l) => l.deactivated).length;
	const active = links.filter((l) => !l.deactivated && l.isActive).length;
	const inactive = links.filter((l) => !l.deactivated && !l.isActive).length;

	return (
		<div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-4">
			<KpiCard title="Total links" value={links.length} icon={LinkIcon} iconBg="bg-sky-500/10" iconColor="text-sky-500" />
			<KpiCard title="Active" value={active} icon={CheckCircle2} iconBg="bg-emerald-500/10" iconColor="text-emerald-500" />
			<KpiCard title="Inactive" value={inactive} icon={PauseCircle} iconBg="bg-amber-500/10" iconColor="text-amber-500" />
			<KpiCard title="Deactivated" value={deactivated} icon={PowerOff} iconBg="bg-slate-500/10" iconColor="text-slate-500" />
		</div>
	);
}
