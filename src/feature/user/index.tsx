import {useUserList} from "@/feature/user/hooks/useUserList.ts";
import UserTable from "@/feature/user/components/UserTable.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import {AlertTriangle} from "lucide-react";
import {QueryErrorDisplay} from "@/components/QueryErrorDisplay.tsx";
import {Main} from "@/components/layout/main.tsx";
import UsersProvider from "@/feature/user/context/users-context.tsx";
import UserDialogs from "@/feature/user/components/UserDialogs.tsx";
import {useSetPageTitle} from "@/hooks/useSetPageTitle.ts";

function Users() {
    const [userList, setFilterData] = useUserList();
    useSetPageTitle('Backend - User Overview');

    if (userList.error) {
        return (
            <div className='p-6'>
                <div className='mb-5'>
                    <div className='flex items-center gap-2 mb-2'>
                        <h1 className='text-2xl font-semibold'>Users</h1>
                        <Badge variant='secondary' className='bg-zinc-900 text-red-600 hover:bg-zinc-900'>
                            <AlertTriangle/>
                        </Badge>
                    </div>
                    <QueryErrorDisplay query={userList}/>
                </div>
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
                    maxPages={userList.data?.totalPages ?? 999}
                    loading={userList.isPending}
                    setFilterData={setFilterData}
                />
            </Main>

            <UserDialogs />
        </UsersProvider>
    );
}

export default Users;