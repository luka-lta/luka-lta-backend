import { PageContainer, PageHeader } from "@/components/layout/page.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { LinkShortener } from "@/feature/tools/components/LinkShortener.tsx";
import { PaywallBlocker } from "@/feature/tools/components/PaywallBlocker.tsx";

function Tools() {
    return (
        <PageContainer title="Tools">
            <PageHeader title="Tools" description="Kleine Helfer für Links und Artikel." />

            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
                        <div className="space-y-1">
                            <CardTitle>Paywall umgehen</CardTitle>
                            <CardDescription>Öffnet Artikel über removepaywall.com.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <PaywallBlocker />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
                        <div className="space-y-1">
                            <CardTitle>Link kürzen</CardTitle>
                            <CardDescription>Noch ohne Backend – erzeugt nur Beispiel-Links.</CardDescription>
                        </div>
                        <Badge variant="warning">Demo</Badge>
                    </CardHeader>
                    <CardContent>
                        <LinkShortener />
                    </CardContent>
                </Card>
            </div>
        </PageContainer>
    );
}

export default Tools;
