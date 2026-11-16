import { Monitor, Smartphone, Tablet } from "lucide-react";

const ICONS = { Desktop: Monitor, Mobile: Smartphone, Tablet } as const;

export function DeviceLabel({ device }: { device?: string | null }) {
    if (!device) return <span className="text-muted-foreground">—</span>;
    const Icon = device in ICONS ? ICONS[device as keyof typeof ICONS] : null;
    return (
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            {Icon && <Icon className="size-4 text-muted-foreground" aria-hidden />}
            {device}
        </span>
    );
}
