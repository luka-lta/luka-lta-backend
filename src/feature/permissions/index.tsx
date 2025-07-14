import {usePermissionsList} from './hooks/usePermissionsList';
import {Badge} from "@/components/ui/badge.tsx";
import {AlertTriangle} from "lucide-react";
import {QueryErrorDisplay} from "@/components/QueryErrorDisplay.tsx";
import PermissionsTable from "@/feature/permissions/components/PermissionsTable.tsx";
import {Main} from "@/components/layout/main.tsx";

function Permissions() {
    const [permissionsList, setFilterData] = usePermissionsList();

    if (permissionsList.error) {
        return (
            <div className='p-6'>
                <div className='mb-5'>
                    <div className='flex items-center gap-2 mb-2'>
                        <h1 className='text-2xl font-semibold'>Permissions</h1>
                        <Badge variant='secondary' className='bg-zinc-900 text-red-600 hover:bg-zinc-900'>
                            <AlertTriangle/>
                        </Badge>
                    </div>
                    <QueryErrorDisplay query={permissionsList}/>
                </div>
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
                    maxPages={permissionsList.data?.totalPages ?? 999}
                    loading={permissionsList.isPending}
                    setFilterData={setFilterData}
                />
        </Main>
    );
}

export default Permissions;