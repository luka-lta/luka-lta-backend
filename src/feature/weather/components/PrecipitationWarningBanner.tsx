import { CloudRain } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx";
import type { PrecipitationWarning } from "@/feature/weather/weatherData.ts";

export function PrecipitationWarningBanner({ warning }: { warning: PrecipitationWarning | null }) {
    if (warning === null) return null;

    return (
        <Alert variant="warning">
            <CloudRain />
            <AlertTitle>{warning.title}</AlertTitle>
            <AlertDescription className="text-muted-foreground">{warning.description}</AlertDescription>
        </Alert>
    );
}
