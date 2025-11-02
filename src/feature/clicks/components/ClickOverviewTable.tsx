import {useQueryClient} from "@tanstack/react-query";
import {DataTable} from "@/components/dataTable/DataTable.tsx";
import {TableCell, TableRow} from "@/components/ui/table.tsx";
import {Button} from "@/components/ui/button.tsx";
import {EllipsisVertical, Pencil, Trash} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {SearchFilter} from "@/components/dataTable/filter/SearchFilter.tsx";
import {clickTypeSchema} from "@/feature/clicks/schema/clickSchema.ts";
import Flag from "react-flagkit";
import LongText from "@/components/long-text.tsx";

interface ClickTableProps {
    clicks: clickTypeSchema[];
    maxPages: number;
    loading: boolean;
    setFilterData: (filterData: Record<string, string>) => void;
}

function ClickOverviewTable({clicks, maxPages, loading, setFilterData}: ClickTableProps) {
    const queryClient = useQueryClient();

    return (
        <>
            <div className='space-y-4'>
                <DataTable
                    data={clicks}
                    header={[
                        {label: 'Click Tag'},
                        {label: 'URL', sortName: 'url'},
                        {label: 'IP Address', sortName: 'ip_address'},
                        {label: 'Market', sortName: 'market'},
                        {label: 'User Agent', sortName: 'user_agent'},
                        {label: 'Referrer', sortName: 'referrer'},
                        {label: 'Clicked at', sortName: 'clicked_at'},
                        {label: ''},
                    ]}
                    maxPages={maxPages}
                    renderRow={(click) => {
                        return (
                            <TableRow key={click.clickId}>
                                <TableCell>
                                    {click.clickTag}
                                </TableCell>
                                <TableCell>
                                    {click.url}
                                </TableCell>
                                <TableCell>
                                    {click.ipAddress ?? '-'}
                                </TableCell>
                                <TableCell>
                                    {click.market ? (
                                        <Flag country={click.market} />
                                    ) :  (
                                        '-'
                                    )}
                                </TableCell>
                                <TableCell>
                                    <LongText>{click.userAgent ?? '-'}</LongText>
                                </TableCell>
                                <TableCell>
                                    {click.referrer ?? '-'}
                                </TableCell>
                                <TableCell>
                                    {click.clickedAt}
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant={'ghost'}><EllipsisVertical/></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem>
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
                    onCreateNew={() => {}}
                    loading={loading}
                    onRefetchData={() => queryClient.invalidateQueries({queryKey: ['clicks', 'overview']})}
                    customFilter={[
                        <SearchFilter name={'click_tag'} key={'search'}/>
                    ]}
                />
            </div>
        </>
    );
}

export default ClickOverviewTable;