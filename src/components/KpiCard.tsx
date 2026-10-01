import {Card, CardContent} from "@/components/ui/card.tsx";
import {cn} from "@/lib/utils.ts";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import {ArrowRight} from "lucide-react";
import {Link} from "react-router-dom";

interface KpiCardProps {
    title: string;
    value?: number;
    icon: React.ElementType;
    href?: string;
    iconBg: string;
    iconColor: string;
    subtitle?: React.ReactNode;
    valueFormatter?: (value: number) => string;
}

export function KpiCard({ title, value, icon: Icon, href, iconBg, iconColor, subtitle, valueFormatter }: KpiCardProps) {
    const inner = (
        <Card className={cn("group relative transition-all duration-150", href && "hover:shadow-md cursor-pointer")}>
            <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                    <span className="text-sm font-medium text-muted-foreground">{title}</span>
                    <div className={cn("p-2 rounded-lg shrink-0", iconBg)}>
                        <Icon className={cn("h-4 w-4", iconColor)} />
                    </div>
                </div>
                <div className="flex items-end justify-between gap-2">
                    <div>
                        {value !== undefined ? (
                            <p className="text-2xl font-bold tabular-nums">{valueFormatter ? valueFormatter(value) : value.toLocaleString()}</p>
                        ) : (
                            <Skeleton className="h-8 w-20 mt-0.5" />
                        )}
                        {subtitle && <div className="mt-1">{subtitle}</div>}
                    </div>
                    {href && (
                        <ArrowRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0 mb-0.5" />
                    )}
                </div>
            </CardContent>
        </Card>
    );

    if (href) return <Link to={href}>{inner}</Link>;
    return inner;
}