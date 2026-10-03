import { useNavigate, useOutletContext } from "react-router-dom";
import { SummaryKpis } from "@/feature/homelab/components/SummaryKpis.tsx";
import { AlertsPanel } from "@/feature/homelab/components/AlertsPanel.tsx";
import { ServiceGroups } from "@/feature/homelab/components/ServiceGroups.tsx";
import { HostOverview } from "@/feature/homelab/components/HostOverview.tsx";
import type { HomelabContext } from "@/feature/homelab/HomelabLayout.tsx";

function OverviewPage() {
    const { hosts, containers, alerts, events, projectFilter, setProjectFilter } = useOutletContext<HomelabContext>();
    const navigate = useNavigate();

    function handleSelectProject(project: string | null) {
        setProjectFilter(project);
        if (project !== null) navigate("/dashboard/homelab/containers");
    }

    return (
        <div className="space-y-6">
            <SummaryKpis containers={containers} hosts={hosts} alerts={alerts} events={events} />

            <AlertsPanel alerts={alerts} />

            <ServiceGroups
                containers={containers}
                alerts={alerts}
                activeProject={projectFilter}
                onSelectProject={handleSelectProject}
            />

            <HostOverview hosts={hosts} />
        </div>
    );
}

export default OverviewPage;
