import {PermissionsTypeSchema} from "@/feature/permissions/schema/PermissionsSchema.ts";
import {useQueryClient} from "@tanstack/react-query";
import {DataTable} from "@/components/dataTable/DataTable.tsx";
import {TableCell, TableRow} from "@/components/ui/table.tsx";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {Button} from "@/components/ui/button.tsx";
import {EllipsisVertical, Pencil, Trash} from "lucide-react";
import {SearchFilter} from "@/components/dataTable/filter/SearchFilter.tsx";

interface UserTableProps {
    permissions: PermissionsTypeSchema[];
    maxPages: number;
    loading: boolean;
    setFilterData: (filterData: Record<string, string>) => void;
}

function PermissionsTable({permissions, maxPages, loading, setFilterData}: UserTableProps) {
    const queryClient = useQueryClient();

    return (
        <div className='px-6'>
            <DataTable
                data={permissions}
                header={[
                    {label: 'Name', sortName: 'name'},
                    {label: 'Description'},
                    {label: ''},
                ]}
                maxPages={maxPages}
                renderRow={(permission) => {
                    return (
                        <TableRow key={permission.permissionId}>
                            <TableCell>{permission.name}</TableCell>
                            <TableCell>{permission.description}</TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant={'ghost'}><EllipsisVertical/></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onClick={(event) => {
                                            event.stopPropagation();
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
                onCreateNew={() => alert('New')}
                loading={loading}
                onRefetchData={() => queryClient.invalidateQueries({queryKey: ['permissions', 'list']})}
                customFilter={[
                    <SearchFilter name={'name'} key={'search'}/>
                ]}
            />
        </div>
    );
}

export default PermissionsTable;