import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { PageContainer, PageHeader } from "@/components/layout/page.tsx";
import { ErrorState } from "@/components/feedback/error-state.tsx";
import { CardGridSkeleton } from "@/components/feedback/loading-state.tsx";
import { StatusBadge } from "@/components/feedback/status-badge.tsx";
import { TimeCell } from "@/components/TimeCell.tsx";
import { useAlerts, useContainers, useEvents, useHosts } from "@/api/homelab/hooks.ts";
import { hasActiveProblems } from "@/feature/homelab/data.ts";
import { toSqlUtcNow } from "@/lib/dateTimeUtils.ts";
import { cn } from "@/lib/utils.ts";
import type { Alert, Container, Event, Host } from "@/feature/homelab/types.ts";

export interface HomelabContext {
    hosts: Host[];
    containers: Container[];
    alerts: Alert[];
    events: Event[];
    projectFilter: string | null;
    setProjectFilter: (project: string | null) => void;
}

const SUB_PAGES = [
    { to: "/dashboard/homelab", label: "Überblick", title: "Homelab", description: "Hosts, Dienste und Warnungen auf einen Blick." },
    { to: "/dashboard/homelab/containers", label: "Container", title: "Container", description: "Alle Container mit Status, Ressourcen und Ports." },
    { to: "/dashboard/homelab/topology", label: "Topologie", title: "Topologie", description: "Wie Geräte, Dienste und Netze zusammenhängen." },
] as const;

function HomelabLayout() {
    const { pathname } = useLocation();
    const page = [...SUB_PAGES].reverse().find((p) => pathname.startsWith(p.to)) ?? SUB_PAGES[0];
    const isTopology = page.to.endsWith("/topology");

    const [lastUpdated, setLastUpdated] = useState(() => toSqlUtcNow());
    const [projectFilter, setProjectFilter] = useState<string | null>(null);

    const hostsQuery = useHosts();
    const containersQuery = useContainers();
    const alertsQuery = useAlerts();
    const eventsQuery = useEvents();

    const hosts = hostsQuery.data ?? [];
    const containers = containersQuery.data ?? [];
    const alerts = alertsQuery.data ?? [];
    const events = eventsQuery.data ?? [];

    const hasErrors = hasActiveProblems(containers, alerts);
    const isRefreshing = hostsQuery.isFetching || containersQuery.isFetching || alertsQuery.isFetching;
    const isPending = hostsQuery.isPending || containersQuery.isPending || alertsQuery.isPending;
    const isError = hostsQuery.isError || containersQuery.isError || alertsQuery.isError;

    function handleRefresh() {
        hostsQuery.refetch();
        containersQuery.refetch();
        alertsQuery.refetch();
        eventsQuery.refetch();
        setLastUpdated(toSqlUtcNow());
    }

    const context: HomelabContext = { hosts, containers, alerts, events, projectFilter, setProjectFilter };

    return (
        <PageContainer title={page.title} fill={isTopology}>
            <PageHeader
                title={page.title}
                meta={
                    !isPending && !isError ? (
                        hasErrors ? (
                            <StatusBadge tone="warning">Braucht Aufmerksamkeit</StatusBadge>
                        ) : (
                            <StatusBadge tone="success">Alles läuft</StatusBadge>
                        )
                    ) : undefined
                }
                description={
                    <>
                        {page.description} Stand <TimeCell iso={lastUpdated} full />
                    </>
                }
                actions={
                    <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
                        <RefreshCcw className={cn(isRefreshing && "animate-spin")} />
                        Aktualisieren
                    </Button>
                }
            />

            <nav aria-label="Homelab-Bereiche" className="-mt-2 flex gap-1 overflow-x-auto border-b">
                {SUB_PAGES.map((sub) => (
                    <NavLink
                        key={sub.to}
                        to={sub.to}
                        end
                        className={({ isActive }) =>
                            cn(
                                "-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors duration-fast",
                                isActive
                                    ? "border-primary text-foreground"
                                    : "border-transparent text-muted-foreground hover:text-foreground",
                            )
                        }
                    >
                        {sub.label}
                    </NavLink>
                ))}
            </nav>

            {isError ? (
                <ErrorState
                    title="Homelab-Daten konnten nicht geladen werden"
                    error={hostsQuery.error ?? containersQuery.error ?? alertsQuery.error}
                    onRetry={handleRefresh}
                />
            ) : isPending && !isTopology ? (
                <div className="space-y-6">
                    <CardGridSkeleton count={6} className="grid-cols-2 sm:grid-cols-3 lg:grid-cols-6" itemClassName="h-24" />
                    <CardGridSkeleton count={2} className="lg:grid-cols-2" itemClassName="h-72" />
                </div>
            ) : (
                <Outlet context={context} />
            )}
        </PageContainer>
    );
}

export default HomelabLayout;
