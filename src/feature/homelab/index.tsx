import { useState } from "react";
import { Main } from "@/components/layout/main.tsx";
import { useSetPageTitle } from "@/hooks/useSetPageTitle.ts";
import { ErrorState } from "@/components/error-state.tsx";
import { HomelabHeader } from "@/feature/homelab/components/HomelabHeader.tsx";
import { SummaryKpis } from "@/feature/homelab/components/SummaryKpis.tsx";
import { HostOverview } from "@/feature/homelab/components/HostOverview.tsx";
import { ContainerTable } from "@/feature/homelab/components/ContainerTable.tsx";
import { ContainerDetailSheet } from "@/feature/homelab/components/ContainerDetailSheet.tsx";
import { AlertsPanel } from "@/feature/homelab/components/AlertsPanel.tsx";
import { ResourceCharts } from "@/feature/homelab/components/ResourceCharts.tsx";
import InfrastructureMap from "@/feature/homelab/topology/index.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import { useAlerts, useContainer, useContainers, useHosts } from "@/api/homelab/hooks.ts";
import { toSqlUtcNow } from "@/lib/dateTimeUtils.ts";
import { motion } from "motion/react";

function Homelab() {
    useSetPageTitle("Backend - Homelab");

    const [lastUpdated, setLastUpdated] = useState(() => toSqlUtcNow());
    const [selectedContainerId, setSelectedContainerId] = useState<string | null>(null);

    const hostsQuery = useHosts();
    const containersQuery = useContainers();
    const alertsQuery = useAlerts();
    const containerDetailQuery = useContainer(selectedContainerId);

    const hosts = hostsQuery.data ?? [];
    const containers = containersQuery.data ?? [];
    const alerts = alertsQuery.data ?? [];
    const selectedHost = containerDetailQuery.data
        ? hosts.find((h) => h.id === containerDetailQuery.data?.hostId)
        : undefined;

    const hasErrors = containers.some((c) => c.status === "warning" || c.status === "unhealthy");
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

    return (
        <Main>
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="space-y-6"
            >
                <HomelabHeader
                    status={hasErrors ? "degraded" : "online"}
                    lastUpdated={lastUpdated}
                    onRefresh={handleRefresh}
                    isRefreshing={isRefreshing}
                />

                <Tabs defaultValue="overview">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="topology">Topology</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6 pt-4">
                        <SummaryKpis containers={containers} hosts={hosts} />

                        <AlertsPanel alerts={alerts} />

                        <HostOverview hosts={hosts} />

                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold">Containers</h2>
                            <ContainerTable
                                containers={containers}
                                hosts={hosts}
                                onSelectContainer={(container) => setSelectedContainerId(container.id)}
                            />
                        </div>

                        <ResourceCharts hosts={hosts} />
                    </TabsContent>

                    <TabsContent value="topology" className="pt-4">
                        <InfrastructureMap />
                    </TabsContent>
                </Tabs>
            </motion.div>

            <ContainerDetailSheet
                open={selectedContainerId !== null}
                container={containerDetailQuery.data ?? null}
                host={selectedHost}
                isLoading={containerDetailQuery.isLoading}
                onOpenChange={(open) => {
                    if (!open) setSelectedContainerId(null);
                }}
            />
        </Main>
    );
}

export default Homelab;
