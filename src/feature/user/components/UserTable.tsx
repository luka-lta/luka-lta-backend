import {UserTypeSchema} from "@/feature/user/schema/UserSchema.ts";
import {useQueryClient} from "@tanstack/react-query";
import {DataTable} from "@/components/dataTable/DataTable.tsx";
import {TableCell, TableRow} from "@/components/ui/table.tsx";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar.tsx";
import {splitAvatarUrl} from "@/lib/utils.ts";
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
import {SearchFilter} from "@/components/dataTable/filter/SearchFilter.tsx";
import EditUserSheet from "@/feature/user/components/EditUserSheet.tsx";
import InfoUserSheet from "@/feature/user/components/InfoUserSheet.tsx";

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
    const [infoUser, setInfoUser] = useState<null | UserTypeSchema>(null);

    return (
        <>
            {(editUser !== null) && (
                <EditUserSheet onClose={() => setEditUser(null)} user={editUser}/>
            )}

            {(infoUser !== null) && (
                <InfoUserSheet user={infoUser} onClose={() => setInfoUser(null)}/>
            )}

            {newUser && (
                <CreateUserDialog onClose={() => setNewUser(false)}/>
            )}

            <div className='px-6'>
                <DataTable
                    data={users}
                    header={[
                        {label: 'Avatar'},
                        {label: 'Username', sortName: 'username'},
                        {label: 'Email', sortName: 'email'},
                        {label: 'Role', sortName: 'role'},
                        {label: 'Status', sortName: 'is_active'},
                        {label: 'Last active', sortName: 'last_active'},
                        {label: ''},
                    ]}
                    maxPages={maxPages}
                    renderRow={(user) => {
                        return (
                            <TableRow key={user.userId} onClick={() => setInfoUser(user)}>
                                <TableCell className="flex items-center space-x-2">
                                    <Avatar>
                                        <AvatarImage src={splitAvatarUrl(user.avatarUrl)} alt={user.email}/>
                                        <AvatarFallback>{user.email[0]}</AvatarFallback>
                                    </Avatar>
                                </TableCell>
                                <TableCell>
                                    TODO
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    TODO
                                </TableCell>
                                <TableCell>
                                    TODO
                                </TableCell>
                                <TableCell>
                                    TODO
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
                    customFilter={[
                        <SearchFilter name={'email'} key={'search'}/>
                    ]}
                />
            </div>
        </>
    );
}

export default UserTable;