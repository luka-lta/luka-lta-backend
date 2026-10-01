import { MdError } from "react-icons/md";
import { ICON_MAP } from "@/lib/icons.ts";

interface LinkIconProps {
    name?: string | null;
    className?: string;
}

export function LinkIcon({ name, className }: LinkIconProps) {
    const Icon = name ? ICON_MAP[name] : undefined;

    if (!Icon) {
        return <MdError className={className ?? "text-red-500"} title="Invalid or missing icon" />;
    }

    return <Icon className={className} />;
}
