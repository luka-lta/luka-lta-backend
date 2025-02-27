import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {useState} from "react";
import UserItem from "@/components/dashboard/user/UserItem.tsx";
import {UserTypeSchema} from "@/shemas/UserSchema.ts";
import {ChevronDown, ChevronUp} from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog.tsx";
import {ScrollArea} from "@/components/ui/scroll-area.tsx";
import RowActions from "@/components/Row-actions.tsx";

interface UserTableProps {
    users: UserTypeSchema[];
    deleteUser: (id: number) => void;
}

export default function UserTable({users, deleteUser}: UserTableProps) {
    const [sortField, setSortField] = useState<keyof UserTypeSchema>("email")
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
    const [deleteUserId, setDeleteUserId] = useState<number | null>(null)

    const sortedUsers = [...users].sort((a, b) => {
        // @ts-ignore
        if (a[sortField] < b[sortField]) return sortDirection === "asc" ? -1 : 1
        // @ts-ignore
        if (a[sortField] > b[sortField]) return sortDirection === "asc" ? 1 : -1
        return 0
    })

    const handleSort = (field: keyof UserTypeSchema) => {
        if (field === sortField) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc")
        } else {
            setSortField(field)
            setSortDirection("asc")
        }
    }

    const SortIcon = ({field}: { field: keyof UserTypeSchema }) => {
        if (field !== sortField) return null
        return sortDirection === "asc" ? <ChevronUp className="ml-2 h-4 w-4"/> : <ChevronDown className="ml-2 h-4 w-4"/>
    }

    return (
        <>
            <ScrollArea className="rounded-md border p-3 max-h-[800px] overflow-y-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Avatar</TableHead>
                            <TableHead onClick={() => handleSort("email")} className="cursor-pointer">
                                Email <SortIcon field="email" />
                            </TableHead>
                            <TableHead onClick={() => handleSort('createdAt')} className="cursor-pointer">
                                Created <SortIcon field="createdAt" />
                            </TableHead>
                            <TableHead onClick={() => handleSort("updatedAt")} className="cursor-pointer">
                                Updated <SortIcon field="updatedAt" />
                            </TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedUsers.length > 0 ? (
                            sortedUsers.map((user) => (
                                <UserItem
                                    key={user.userId}
                                    user={user}
                                    handleDelete={(id) => setDeleteUserId(id)}
                                    handleEdit={() => {}}
                                />
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center">No users available</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </ScrollArea>

            <RowActions rowsPerPage={10} totalRows={users.length} />

            <ConfirmDialog
                isOpen={!!deleteUserId}
                onClose={() => setDeleteUserId(null)}
                onConfirm={async () => {
                    if (deleteUserId) {
                        await deleteUser(deleteUserId)
                        setDeleteUserId(null)
                    }
                }}
                title="Delete User"
                message="Are you sure you want to delete this user? This action cannot be undone."
            />
        </>
    )
}

