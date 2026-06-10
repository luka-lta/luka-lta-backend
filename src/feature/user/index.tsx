import {useUserList} from "@/feature/user/hooks/useUserList.ts";
import UserTable from "@/feature/user/components/UserTable.tsx";
import {Main} from "@/components/layout/main.tsx";
import UsersProvider from "@/feature/user/context/users-context.tsx";
import UserDialogs from "@/feature/user/components/UserDialogs.tsx";
import {useSetPageTitle} from "@/hooks/useSetPageTitle.ts";
import {ErrorState} from "@/components/error-state.tsx";

function Users() {
    const [userList, setFilterData] = useUserList();
    useSetPageTitle('Backend - User Overview');

    if (userList.error) {
        return (
            <div className='p-6'>
                <h2 className='text-2xl font-bold tracking-tight mb-4'>User List</h2>
                <ErrorState
                    title="Failed to load users"
                    message={userList.error.message}
                    refetch={userList.refetch}
                />
            </div>
        )
    }

    return (
        <UsersProvider>
            <Main>
                <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
                    <div>
                        <h2 className='text-2xl font-bold tracking-tight'>User List</h2>
                        <p className='text-muted-foreground'>
                            Manage your users and their roles here.
                        </p>
                    </div>
                </div>

                <UserTable
                    users={userList.data?.users ?? []}
                    maxPages={userList.data?.totalPages}
                    loading={userList.isPending}
                    setFilterData={setFilterData}
                />
            </Main>

            <UserDialogs />
        </UsersProvider>
    );
}

export default Users;
