import LinksTable from "@/components/dashboard/linktree/LinksTable.tsx";

function LinktreePage() {
    return (
        <div className="container mx-auto py-10 bg-muted/50 rounded-lg">
            <h1 className="text-2xl font-bold mb-5">Linktree Management</h1>
            <div className="mt-8">
                <LinksTable />
            </div>
        </div>
    )
}

export default LinktreePage;