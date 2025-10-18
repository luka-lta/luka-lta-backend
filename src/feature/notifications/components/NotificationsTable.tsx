import {NotificationTypeSchema} from "@/feature/notifications/schema/NotificationSchema.ts";
import {DataTable} from "@/components/dataTable/DataTable.tsx";
import {TableCell, TableRow} from "@/components/ui/table.tsx";
import {SearchFilter} from "@/components/dataTable/filter/SearchFilter.tsx";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {Button} from "@/components/ui/button.tsx";
import {EllipsisVertical, Pencil, Trash} from "lucide-react";

interface NotificationsTableProps {
    notifications: NotificationTypeSchema[],
    maxPages: number;
    loading: boolean;
    setFilterData: (filterData: Record<string, string>) => void;
}

function NotificationsTable({notifications, maxPages, loading, setFilterData}: NotificationsTableProps) {
    return (
        <div className='space-y-4'>
            <DataTable
                data={notifications}
                header={[
                    {label: 'RSS Url', sortName: 'rss_feed_url'},
                    {label: 'Provider', sortName: 'provider'},
                    {label: ''}
                ]}
                maxPages={maxPages}
                renderRow={(notification) => {
                    return (
                        <TableRow key={notification.notificationId}>
                            <TableCell>
                                {notification.rssFeedUrl}
                            </TableCell>
                            <TableCell>
                                {notification.provider}
                            </TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant={'ghost'}><EllipsisVertical/></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onClick={(event) => {}}>
                                            <Pencil/>
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={(event) => {}}>
                                            <Trash/>
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>

                    )
                }}
                onFilterChange={setFilterData}
                onCreateNew={() => {}}
                loading={loading}
                onRefetchData={() => {}}
                customFilter={[
                    <SearchFilter name={'rss_feed_url'} key={'search'}/>
                ]}
            />
        </div>
    );
}

export default NotificationsTable;