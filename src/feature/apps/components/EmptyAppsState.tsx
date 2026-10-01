import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { Boxes, Plus } from "lucide-react";

interface EmptyAppsStateProps {
    onCreate: () => void;
}

export function EmptyAppsState({ onCreate }: EmptyAppsStateProps) {
    return (
        <Empty className="border">
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <Boxes />
                </EmptyMedia>
                <EmptyTitle>Noch keine Apps angelegt</EmptyTitle>
                <EmptyDescription>
                    Lege deine erste App an — z. B. eine App-Store-App, eine Kundenwebseite oder ein SaaS-Produkt.
                </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
                <Button onClick={onCreate}>
                    <Plus className="h-4 w-4" />
                    Erste App anlegen
                </Button>
            </EmptyContent>
        </Empty>
    );
}
