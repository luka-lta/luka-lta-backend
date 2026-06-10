import {usePermissionsList} from './hooks/usePermissionsList';
import PermissionsTable from "@/feature/permissions/components/PermissionsTable.tsx";
import {Main} from "@/components/layout/main.tsx";
import {useSetPageTitle} from "@/hooks/useSetPageTitle.ts";
import {ErrorState} from "@/components/error-state.tsx";

function Permissions() {
    const [permissionsList, setFilterData] = usePermissionsList();
    useSetPageTitle('Backend - Permission Overview');

    if (permissionsList.error) {
        return (
            <div className='p-6'>
                <h2 className='text-2xl font-bold tracking-tight mb-4'>Permissions</h2>
                <ErrorState
                    title="Failed to load permissions"
                    message={permissionsList.error.message}
                    refetch={permissionsList.refetch}
                />
            </div>
        )
    }

    return (
        <Main>
            <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
                <div>
                    <h2 className='text-2xl font-bold tracking-tight'>Permissions</h2>
                    <p className='text-muted-foreground'>
                        Manage your permissions here.
                    </p>
                </div>
            </div>

            <PermissionsTable
                permissions={permissionsList.data?.permissions ?? []}
                maxPages={permissionsList.data?.totalPages}
                loading={permissionsList.isPending}
                setFilterData={setFilterData}
            />
        </Main>
    );
}

export default Permissions;
