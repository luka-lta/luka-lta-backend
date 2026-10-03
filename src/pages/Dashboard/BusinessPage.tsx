import { Main } from "@/components/layout/main.tsx";
import { BusinessTab } from "@/feature/dashboard/business/BusinessTab.tsx";
import { useSetPageTitle } from "@/hooks/useSetPageTitle.ts";

function BusinessPage() {
    useSetPageTitle("Backend - Business");

    return (
        <Main>
            <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight">Business</h2>
                <p className="text-muted-foreground">Umsatz, MRR und offene Rechnungen im Überblick.</p>
            </div>
            <BusinessTab />
        </Main>
    );
}

export default BusinessPage;
