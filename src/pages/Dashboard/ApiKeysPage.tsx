import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink, PaginationNext,
    PaginationPrevious
} from "@/components/ui/pagination.tsx";
import ApiKeysTable from "@/components/dashboard/apiKeys/ApiKeysTable.tsx";

function ApiKeysPage() {
    return (
        <div className="container mx-auto py-10 bg-muted/50 rounded-lg">
            <h1 className="text-2xl font-bold mb-5">Api-Key Management</h1>
            <ApiKeysTable />

            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious href="#" />
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationLink href="#">1</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationLink href="#">2</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationNext href="#" />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
}

export default ApiKeysPage;