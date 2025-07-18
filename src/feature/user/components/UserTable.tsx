import {UserTypeSchema} from "@/feature/user/schema/UserSchema.ts";
import {useQueryClient} from "@tanstack/react-query";
import {DataTable} from "@/components/dataTable/DataTable.tsx";
import {TableCell, TableRow} from "@/components/ui/table.tsx";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar.tsx";
import {cn, formatDate, splitAvatarUrl} from "@/lib/utils.ts";
import {Button} from "@/components/ui/button.tsx";
import {EllipsisVertical, Pencil, Trash} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {SearchFilter} from "@/components/dataTable/filter/SearchFilter.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import {useUsers} from "@/feature/user/context/users-context.tsx";

interface UserTableProps {
    users: UserTypeSchema[];
    maxPages: number;
    loading: boolean;
    setFilterData: (filterData: Record<string, string>) => void;
}

function UserTable({users, maxPages, loading, setFilterData}: UserTableProps) {
    const queryClient = useQueryClient();
    const { setOpen, setCurrentRow } = useUsers()

    return (
        <>
            <div className='space-y-4'>
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
                            <TableRow key={user.userId} onClick={() => {
                                setOpen('info');
                                setCurrentRow(user);
                            }}>
                                <TableCell className="flex items-center space-x-2">
                                    <Avatar>
                                        <AvatarImage src={splitAvatarUrl(user.avatarUrl)} alt={user.email}/>
                                        <AvatarFallback>{user.email[0]}</AvatarFallback>
                                    </Avatar>
                                </TableCell>
                                <TableCell>
                                    {user.username}
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    TODO
                                </TableCell>
                                <TableCell>
                                    <Badge variant={"default"} className={cn("ml-2 bg-red-500 text-white", user.isActive && "bg-green-500 text-black")}>
                                        {user.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {user.lastActive ? formatDate(user.lastActive.toString()) : "N/A"}
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant={'ghost'}><EllipsisVertical/></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem onClick={(event) => {
                                                event.stopPropagation();
                                                setOpen('edit')
                                                setCurrentRow(user);
                                            }}>
                                                <Pencil/>
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={(event) => {
                                                event.stopPropagation();
                                                setOpen('delete')
                                                setCurrentRow(user);
                                            }}>
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
                    onCreateNew={() => setOpen('add')}
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