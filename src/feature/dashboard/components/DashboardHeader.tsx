import { Status, StatusIndicator, StatusLabel } from "@/components/ui/kibo-ui/status/index.tsx";
import { RefreshButton } from "@/components/refresh-button.tsx";

function getGreeting(name: string): string {
    const hour = new Date().getHours();
    if (hour < 5) return `Good night, ${name}`;
    if (hour < 12) return `Good morning, ${name}`;
    if (hour < 17) return `Good afternoon, ${name}`;
    if (hour < 21) return `Good evening, ${name}`;
    return `Hey, ${name}`;
}

function getTodayLabel(): string {
    return new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}

interface DashboardHeaderProps {
    username: string;
    status: "online" | "degraded";
    onRefresh: () => Promise<void>;
}

export function DashboardHeader({ username, status, onRefresh }: DashboardHeaderProps) {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">
                    {getGreeting(username)} <span className="wave">👋</span>
                </h1>
                <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{getTodayLabel()}</span>
                    <span aria-hidden>·</span>
                    <Status status={status}>
                        <StatusIndicator />
                        <StatusLabel>{status === "online" ? "All systems operational" : "Attention needed"}</StatusLabel>
                    </Status>
                </div>
            </div>
            <RefreshButton onRefresh={onRefresh} variant="ghost" size="icon" />
        </div>
    );
}
