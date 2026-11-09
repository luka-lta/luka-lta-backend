import { Link2 } from "lucide-react";
import { ICON_MAP } from "@/lib/icons.ts";

interface LinkIconProps {
    name?: string | null;
    className?: string;
}

/** Icon eines Links; ohne (gültiges) Icon ein neutrales Link-Symbol. */
export function LinkIcon({ name, className }: LinkIconProps) {
    const Icon = name ? ICON_MAP[name] : undefined;
    if (!Icon) return <Link2 className={className ?? "size-4 text-muted-foreground"} aria-hidden />;
    return <Icon className={className} aria-hidden />;
}
