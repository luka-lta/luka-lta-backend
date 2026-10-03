import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Main } from "@/components/layout/main.tsx";
import { useSetPageTitle } from "@/hooks/useSetPageTitle.ts";
import { ErrorState } from "@/components/error-state.tsx";
import { HomelabHeader } from "@/feature/homelab/components/HomelabHeader.tsx";
import { useAlerts, useContainers, useEvents, useHosts } from "@/api/homelab/hooks.ts";
import { hasActiveProblems } from "@/feature/homelab/data.ts";
import { toSqlUtcNow } from "@/lib/dateTimeUtils.ts";
import type { Alert, Container, Event, Host } from "@/feature/homelab/types.ts";

export interface HomelabContext {
    hosts: Host[];
    containers: Container[];
    alerts: Alert[];
    events: Event[];
    projectFilter: string | null;
    setProjectFilter: (project: string | null) => void;
}

function HomelabLayout() {
    useSetPageTitle("Backend - Homelab");

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

    function handleRefresh() {
        hostsQuery.refetch();
        containersQuery.refetch();
        alertsQuery.refetch();
        setLastUpdated(toSqlUtcNow());
    }

    if (hostsQuery.isError || containersQuery.isError || alertsQuery.isError) {
        return (
            <Main>
                <ErrorState
                    title="Failed to load homelab data"
                    message="Could not reach the homelab API."
                    refetch={handleRefresh}
                />
            </Main>
        );
    }

    const context: HomelabContext = { hosts, containers, alerts, events, projectFilter, setProjectFilter };

    return (
        <Main>
            <div className="space-y-6">
                <HomelabHeader
                    status={hasErrors ? "degraded" : "online"}
                    lastUpdated={lastUpdated}
                    onRefresh={handleRefresh}
                    isRefreshing={isRefreshing}
                />
                <Outlet context={context} />
            </div>
        </Main>
    );
}

export default HomelabLayout;
