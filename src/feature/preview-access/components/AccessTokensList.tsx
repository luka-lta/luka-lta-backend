import { AccessTokenTypeSchema } from "../schema/PreviewAccessSchema";
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
import {Badge} from "@/components/ui/badge.tsx";
import {cn} from "@/lib/utils.ts";
import {useState} from "react";
import CreateAccessTokenDialog from "@/feature/preview-access/components/CreateAccessTokenDialog.tsx";

interface AccessTokensListProps {
    accessTokens: AccessTokenTypeSchema[];
    maxPages: number;
    loading: boolean;
    setFilterData: (filterData: Record<string, string>) => void;
}

function AccessTokensList({accessTokens, maxPages, loading, setFilterData}: AccessTokensListProps) {
    const queryClient = useQueryClient();
    const [newToken, setNewToken] = useState(false);

    return (
        <>
            {newToken && (
                <CreateAccessTokenDialog onClose={() => setNewToken(false)}/>
            )}
            <div className='px-6'>
                <DataTable
                    data={accessTokens}
                    header={[
                        {label: 'Token', sortName: 'token'},
                        {label: 'Created by'},
                        {label: 'Max Uses'},
                        {label: 'Usages'},
                        {label: 'Status', sortName: 'status'},
                        {label: ''},
                    ]}
                    maxPages={maxPages}
                    renderRow={(accessToken) => {
                        return (
                            <TableRow key={accessToken.token}>
                                <TableCell>{accessToken.token}</TableCell>
                                <TableCell>{accessToken.createdBy.email}</TableCell>
                                <TableCell>{accessToken.maxUse}</TableCell>
                                <TableCell>{accessToken.used}</TableCell>
                                <TableCell>
                                    <Badge variant={"default"}
                                           className={cn("ml-2 bg-red-500 text-white", accessToken.isActive && "bg-green-500 text-black")}>
                                        {accessToken.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                </TableCell>
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
                    onCreateNew={() => setNewToken(true)}
                    loading={loading}
                    onRefetchData={() => queryClient.invalidateQueries({queryKey: ['access', 'tokens', 'list']})}
                />
            </div>
        </>
    );
}

export default AccessTokensList;