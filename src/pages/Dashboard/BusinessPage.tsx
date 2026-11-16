import { PageContainer, PageHeader } from "@/components/layout/page.tsx";
import { BusinessTab } from "@/feature/dashboard/business/BusinessTab.tsx";

function BusinessPage() {
    return (
        <PageContainer title="Business">
            <PageHeader
                title="Business"
                description="Umsatz, MRR und offene Rechnungen. Noch ohne Buchhaltungs-Anbindung – alle Zahlen sind Beispieldaten."
            />
            <BusinessTab />
        </PageContainer>
    );
}

export default BusinessPage;
