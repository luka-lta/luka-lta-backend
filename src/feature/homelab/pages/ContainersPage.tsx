import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import { ContainerTable } from "@/feature/homelab/components/ContainerTable.tsx";
import { ContainerDetailSheet } from "@/feature/homelab/components/ContainerDetailSheet.tsx";
import { ResourceCharts } from "@/feature/homelab/components/ResourceCharts.tsx";
import { PortsOverview } from "@/feature/homelab/components/PortsOverview.tsx";
import { useContainer } from "@/api/homelab/hooks.ts";
import type { HomelabContext } from "@/feature/homelab/HomelabLayout.tsx";

function ContainersPage() {
    const { hosts, containers, projectFilter, setProjectFilter } = useOutletContext<HomelabContext>();
    const [selectedContainerId, setSelectedContainerId] = useState<string | null>(null);

    const containerDetailQuery = useContainer(selectedContainerId);
    const selectedHost = containerDetailQuery.data
        ? hosts.find((h) => h.id === containerDetailQuery.data?.hostId)
        : undefined;

    return (
        <div className="space-y-6">
            <Tabs defaultValue="list">
                <TabsList>
                    <TabsTrigger value="list">Containers</TabsTrigger>
                    <TabsTrigger value="ports">Ports</TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="space-y-6 pt-4">
                    <ContainerTable
                        containers={containers}
                        hosts={hosts}
                        onSelectContainer={(container) => setSelectedContainerId(container.id)}
                        projectFilter={projectFilter}
                        onClearProjectFilter={() => setProjectFilter(null)}
                    />

                    <ResourceCharts hosts={hosts} />
                </TabsContent>

                <TabsContent value="ports" className="pt-4">
                    <PortsOverview containers={containers} hosts={hosts} />
                </TabsContent>
            </Tabs>

            <ContainerDetailSheet
                open={selectedContainerId !== null}
                container={containerDetailQuery.data ?? null}
                host={selectedHost}
                isLoading={containerDetailQuery.isLoading}
                onOpenChange={(open) => {
                    if (!open) setSelectedContainerId(null);
                }}
            />
        </div>
    );
}

export default ContainersPage;
