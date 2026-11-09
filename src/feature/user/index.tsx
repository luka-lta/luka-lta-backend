import { useCreateIntent } from "@/hooks/useCreateIntent";
import { Plus } from "lucide-react";
import { useUserList } from "@/api/user/hooks.ts";
import UserTable from "@/feature/user/components/UserTable.tsx";
import UsersProvider, { useUsers } from "@/feature/user/context/users-context.tsx";
import UserDialogs from "@/feature/user/components/UserDialogs.tsx";
import { PageContainer, PageHeader } from "@/components/layout/page.tsx";
import { ErrorState } from "@/components/feedback/error-state.tsx";
import { Button } from "@/components/ui/button.tsx";

function UsersContent() {
    const [userList, setFilterData] = useUserList();
    const { setOpen } = useUsers();
    useCreateIntent(() => setOpen('add'));

    return (
        <PageContainer title="Benutzer">
            <PageHeader
                title="Benutzer"
                description="Zugänge zum Admin-Bereich verwalten."
                actions={
                    <Button onClick={() => setOpen('add')}>
                        <Plus />
                        Benutzer anlegen
                    </Button>
                }
            />

            {userList.error ? (
                <ErrorState title="Benutzer konnten nicht geladen werden" error={userList.error} onRetry={() => userList.refetch()} />
            ) : (
                <UserTable
                    users={userList.data?.users ?? []}
                    maxPages={userList.data?.totalPages}
                    loading={userList.isPending}
                    setFilterData={setFilterData}
                />
            )}
        </PageContainer>
    );
}

function Users() {
    return (
        <UsersProvider>
            <UsersContent />
            <UserDialogs />
        </UsersProvider>
    );
}

export default Users;
