import { Status, StatusIndicator, StatusLabel } from "@/components/ui/kibo-ui/status/index.tsx";
import { TimeCell } from "@/components/TimeCell.tsx";
import { RefreshButton } from "@/components/refresh-button.tsx";

function getGreeting(name: string): { greeting: string; sub: string } {
    const hour = new Date().getHours();
    if (hour < 5) return { greeting: `Good night, ${name}`, sub: "Burning the midnight oil?" };
    if (hour < 12) return { greeting: `Good morning, ${name}`, sub: "Ready to build something great today?" };
    if (hour < 17) return { greeting: `Good afternoon, ${name}`, sub: "Hope the afternoon is treating you well." };
    if (hour < 21) return { greeting: `Good evening, ${name}`, sub: "Wrapping up for the day?" };
    return { greeting: `Hey, ${name}`, sub: "Still at it — respect." };
}

interface DashboardHeaderProps {
    username: string;
    status: "online" | "degraded";
    lastUpdated: string;
    onRefresh: () => Promise<void>;
}

export function DashboardHeader({ username, status, lastUpdated, onRefresh }: DashboardHeaderProps) {
    const { greeting, sub } = getGreeting(username);

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold tracking-tight">
                        {greeting} <span className="wave">👋</span>
                    </h1>
                    <Status status={status}>
                        <StatusIndicator />
                        <StatusLabel>{status === "online" ? "All systems operational" : "Attention needed"}</StatusLabel>
                    </Status>
                </div>
                <p className="text-muted-foreground mt-1 text-sm">
                    {sub} · Last updated <TimeCell iso={lastUpdated} full />
                </p>
            </div>
            <RefreshButton onRefresh={onRefresh} variant="outline" className="flex items-center gap-2" label="Refresh" />
        </div>
    );
}
