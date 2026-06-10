import {useSetPageTitle} from "@/hooks/useSetPageTitle.ts";
import {Main} from "@/components/layout/main.tsx";
import {useGetTrackedUsers} from "@/api/analytics/hooks/useGetTrackedUsers.ts";
import TrackedUsersTable from "@/feature/tracked-users/components/tracked-users-table.tsx";
import {ErrorState} from "@/components/error-state.tsx";

function TrackedUsers() {
    useSetPageTitle('Backend - Tracked-Users');
    const { data, isLoading, isError, refetch } = useGetTrackedUsers({
        page: 1,
        pageSize: 50,
        sortBy: 'asc',
        sortOrder: 'asc',
        search: '',
        searchField: '',
    });

    if (isError) {
        return (
            <div className='p-6'>
                <h2 className='text-2xl font-bold tracking-tight mb-4'>Tracked-Users</h2>
                <ErrorState
                    title="Failed to load tracked users"
                    message="An error occurred while fetching data"
                    refetch={refetch}
                />
            </div>
        )
    }

    return (
        <Main>
            <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
                <div>
                    <h2 className='text-2xl font-bold tracking-tight'>Tracked-Users List</h2>
                    <p className='text-muted-foreground'>
                        Analyze all Tracked-Users
                    </p>
                </div>
            </div>

            <TrackedUsersTable
                users={data?.data ?? []}
                maxPages={undefined}
                loading={isLoading}
                setFilterData={() => {}}
            />
        </Main>
    );
}

export default TrackedUsers;
