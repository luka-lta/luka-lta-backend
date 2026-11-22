import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { cn } from "@/lib/utils.ts";

interface InfoCardProps {
    icon: LucideIcon;
    title: string;
    /** Right-aligned header content, e.g. a timestamp. */
    aside?: ReactNode;
    className?: string;
    children: ReactNode;
}

/** Shell for the secondary weather blocks below the main view. */
export function InfoCard({ icon: Icon, title, aside, className, children }: InfoCardProps) {
    return (
        <Card className={cn("flex flex-col", className)}>
            <CardHeader className="flex-row items-center justify-between gap-3 space-y-0 p-5 pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Icon className="size-4" aria-hidden />
                    {title}
                </CardTitle>
                {aside && <span className="text-xs text-muted-foreground">{aside}</span>}
            </CardHeader>
            <CardContent className="flex flex-1 flex-col p-5 pt-0">{children}</CardContent>
        </Card>
    );
}
