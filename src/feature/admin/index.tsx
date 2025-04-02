import ServicesCard from "@/feature/admin/components/ServicesCard.tsx";
import ReportsCard from "@/feature/admin/components/ReportsCard.tsx";

function Admin() {
    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <h1>Admin Dashboard</h1>
            <div className="grid auto-rows-min gap-4 md:grid-cols-2">
                <div className="aspect-video">
                    <ReportsCard/>
                </div>
                <div className="aspect-video rounded-xl bg-muted/50">
                    <ServicesCard/>
                </div>
            </div>
        </div>
    );
}

export default Admin;