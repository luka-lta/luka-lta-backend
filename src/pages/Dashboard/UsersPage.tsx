import AddUserButton from "@/components/dashboard/user/button/AddUserButton.tsx";
import UserTable from "@/components/dashboard/user/UserTable.tsx";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink, PaginationNext,
    PaginationPrevious
} from "@/components/ui/pagination.tsx";

function UsersPage() {
    return (
        <div className="container mx-auto py-10 bg-muted/50 rounded-lg">
            <h1 className="text-2xl font-bold mb-5">User Management</h1>
            <AddUserButton/>
            <UserTable />

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

export default UsersPage;