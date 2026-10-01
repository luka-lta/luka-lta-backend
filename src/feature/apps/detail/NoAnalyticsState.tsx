import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { LineChart, Settings2 } from "lucide-react";

interface NoAnalyticsStateProps {
    onConfigure: () => void;
}

export function NoAnalyticsState({ onConfigure }: NoAnalyticsStateProps) {
    return (
        <Empty className="border">
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <LineChart />
                </EmptyMedia>
                <EmptyTitle>Keine Analytics-Quelle verbunden</EmptyTitle>
                <EmptyDescription>
                    Verbinde App Store Connect, Firebase oder eine eigene Quelle, um Analytics für diese App zu sehen.
                </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
                <Button onClick={onConfigure}>
                    <Settings2 className="h-4 w-4" />
                    Quelle konfigurieren
                </Button>
            </EmptyContent>
        </Empty>
    );
}
