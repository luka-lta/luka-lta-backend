import {UserTypeSchema} from "@/feature/user/schema/UserSchema.ts";
import {useQueryClient} from "@tanstack/react-query";
import {DataTable} from "@/components/dataTable/DataTable.tsx";
import {TableCell, TableRow} from "@/components/ui/table.tsx";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar.tsx";
import {formatDate, splitAvatarUrl} from "@/lib/utils.ts";
import {Button} from "@/components/ui/button.tsx";
import {EllipsisVertical, Pencil, Trash} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {useState} from "react";
import CreateUserDialog from "@/feature/user/components/CreateUserDialog.tsx";
import EditUserDialog from "@/feature/user/components/EditUserDialog.tsx";

interface UserTableProps {
    users: UserTypeSchema[];
    maxPages: number;
    loading: boolean;
    setFilterData: (filterData: Record<string, string>) => void;
}

function UserTable({users, maxPages, loading, setFilterData}: UserTableProps) {
    const queryClient = useQueryClient();
    const [newUser, setNewUser] = useState(false);
    const [editUser, setEditUser] = useState<null | UserTypeSchema>(null);

    return (
        <>
            {(editUser !== null) && (
                <EditUserDialog onClose={() => setEditUser(null)} user={editUser}/>
            )}

            {newUser && (
                <CreateUserDialog onClose={() => setNewUser(false)}/>
            )}

            <div className='px-6'>
                <DataTable
                    data={users}
                    header={[
                        {label: 'Avatar'},
                        {label: 'Email', sortName: 'email'},
                        {label: 'Created At', sortName: 'created_at'},
                        {label: 'Updated At', sortName: 'updated_at'},
                        {label: ''},
                    ]}
                    maxPages={maxPages}
                    renderRow={(user) => {
                        return (
                            <TableRow key={user.userId}>
                                <TableCell className="flex items-center space-x-2">
                                    <Avatar>
                                        <AvatarImage src={splitAvatarUrl(user.avatarUrl)} alt={user.email}/>
                                        <AvatarFallback>{user.email[0]}</AvatarFallback>
                                    </Avatar>
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    {formatDate(user.createdAt)}
                                </TableCell>
                                <TableCell>
                                    {user.updatedAt ? formatDate(user.updatedAt) : "Unknown"}
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant={'ghost'}><EllipsisVertical/></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem onClick={(event) => {
                                                event.stopPropagation();
                                                setEditUser(user);
                                            }}>
                                                <Pencil/>
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Trash/>
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        );
                    }}
                    onFilterChange={setFilterData}
                    onCreateNew={() => setNewUser(true)}
                    loading={loading}
                    onRefetchData={() => queryClient.invalidateQueries({queryKey: ['users', 'list']})}
                />
            </div>
        </>
    );
}

export default UserTable;