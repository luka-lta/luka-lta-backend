import { Button } from "@/components/ui/button.tsx";
import { RefreshCcw } from "lucide-react";
import { Status, StatusIndicator, StatusLabel } from "@/components/ui/kibo-ui/status/index.tsx";
import { TimeCell } from "@/components/TimeCell.tsx";

interface HomelabHeaderProps {
    status: "online" | "degraded";
    lastUpdated: string;
    onRefresh: () => void;
    isRefreshing: boolean;
}

export function HomelabHeader({ status, lastUpdated, onRefresh, isRefreshing }: HomelabHeaderProps) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold tracking-tight">Homelab</h1>
                    <Status status={status}>
                        <StatusIndicator />
                        <StatusLabel>
                            {status === "online" ? "All systems operational" : "Attention needed"}
                        </StatusLabel>
                    </Status>
                </div>
                <p className="text-muted-foreground mt-1 text-sm">
                    Last updated <TimeCell iso={lastUpdated} full />
                </p>
            </div>
            <Button variant="outline" onClick={onRefresh} disabled={isRefreshing}>
                <RefreshCcw className={isRefreshing ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
                Refresh
            </Button>
        </div>
    );
}
