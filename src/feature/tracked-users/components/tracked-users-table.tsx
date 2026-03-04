
import {DataTable} from "@/components/dataTable/DataTable.tsx";
import {TableCell, TableRow} from "@/components/ui/table.tsx";
import {SearchFilter} from "@/components/dataTable/filter/SearchFilter.tsx";
import {UsersResponse} from "@/api/analytics/endpoints/trackedUsers.ts";
import Flag from "react-flagkit";
import {Browser} from "@/components/browser.tsx";
import {OperatingSystem} from "@/components/operating-system.tsx";
import {DeviceIcon} from "@/components/device-icon.tsx";
import {generateName} from "@/lib/utils.ts";
import {TrackedUserAvatar} from "@/components/TrackedUserAvatar.tsx";
import {Link} from "react-router-dom";
import {ChannelIcon, extractDomain, getDisplayName} from "@/components/channel.tsx";
import {Favicon} from "@/components/Favicon.tsx";

interface UserTableProps {
    users: UsersResponse[];
    maxPages: number;
    loading: boolean;
    setFilterData: (filterData: Record<string, string>) => void;
}

function TrackedUsersTable({users, maxPages, loading, setFilterData}: UserTableProps) {

    function returnChannel(referrer: string, channel: string) {
        const domain = extractDomain(referrer);

        if (domain) {
            const displayName = getDisplayName(domain);
            return (
                <div
                    className="flex items-center gap-2 cursor-pointer hover:opacity-70"
                >
                    <Favicon domain={domain} className="w-4 h-4" />
                    <span>{displayName}</span>
                </div>
            )
        }

        return (
            <div
                className="flex items-center gap-2 cursor-pointer hover:opacity-70"
            >
                <ChannelIcon channel={channel} />
                <span>{channel}</span>
            </div>
        );
    }

    return (
        <>
            <div className='space-y-4'>
                <DataTable
                    data={users}
                    header={[
                        {label: 'User'},
                        {label: 'Country', sortName: 'username'},
                        {label: 'Channel', sortName: 'email'},
                        {label: 'Browser', sortName: 'role'},
                        {label: 'OS', sortName: 'is_active'},
                        {label: 'Device', sortName: 'last_active'},
                        {label: 'Pageviews', sortName: 'last_active'},
                        {label: 'Events', sortName: 'last_active'},
                        {label: 'Sessions', sortName: 'last_active'},
                        {label: 'Last seen', sortName: 'last_active'},
                        {label: 'First seen', sortName: 'last_active'},
                    ]}
                    maxPages={maxPages}
                    renderRow={(user) => {
                        const displayName = generateName(user.userId)
                        const linkId = encodeURIComponent(user.userId);
                        return (
                            <TableRow key={user.userId}>
                                <TableCell className="flex items-center space-x-2">
                                    <Link to={`/dashboard/tracked-users/${linkId}`} className="flex items-center gap-2">
                                        <TrackedUserAvatar userId={user.userId} size={20} />
                                        <span className="max-w-32 truncate hover:underline" title={displayName}>
                                          {displayName}
                                        </span>
                                    </Link>
                                </TableCell>
                                <TableCell>
                                    <div
                                        className="flex items-center gap-2 whitespace-nowrap cursor-pointer hover:opacity-70"
                                    >
                                        <Flag country={user.country} />
                                        {user.country}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {returnChannel(user.referrer, user.channel)}
                                </TableCell>
                                <TableCell>
                                    <div
                                        className="flex items-center gap-2 whitespace-nowrap cursor-pointer hover:opacity-70"
                                    >
                                        <Browser browser={user.browser} />
                                        {user.browser}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div
                                        className="flex items-center gap-2 whitespace-nowrap cursor-pointer hover:opacity-70"
                                    >
                                        <OperatingSystem os={user.os} />
                                        {user.os}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div
                                        className="flex items-center gap-2 whitespace-nowrap cursor-pointer hover:opacity-70"
                                    >
                                        <DeviceIcon deviceType={user.device} />
                                        {user.device}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {user.pageviews}
                                </TableCell>
                                <TableCell>
                                    {user.events}
                                </TableCell>
                                <TableCell>
                                    {user.sessions}
                                </TableCell>
                                <TableCell>
                                    {user.lastSeen}
                                </TableCell>
                                <TableCell>
                                    {user.firstSeen}
                                </TableCell>
                            </TableRow>
                        );
                    }}
                    onFilterChange={setFilterData}
                    loading={loading}
                    onRefetchData={() => {
                        console.log()
                    }}
                    customFilter={[
                        <SearchFilter name={'email'} key={'search'}/>
                    ]}
                />
            </div>
        </>
    );
}

export default TrackedUsersTable;