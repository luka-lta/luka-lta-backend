import { TriangleAlert } from "lucide-react";
import type { PrecipitationWarning } from "@/feature/weather/weatherData.ts";

export function PrecipitationWarningBanner({ warning }: { warning: PrecipitationWarning | null }) {
    if (warning === null) return null;

    return (
        <div className="flex items-start gap-2.5 rounded-md border border-amber-500/30 bg-amber-500/5 px-3.5 py-3 text-sm">
            <TriangleAlert className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
            <div>
                <p className="font-medium text-amber-600 dark:text-amber-500">{warning.title}</p>
                <p className="text-muted-foreground">{warning.description}</p>
            </div>
        </div>
    );
}
