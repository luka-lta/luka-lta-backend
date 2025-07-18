import {useUsers} from "@/feature/user/context/users-context.tsx";
import UserDeleteDialog from "@/feature/user/components/UserDeleteDialog.tsx";
import CreateUserDialog from "@/feature/user/components/CreateUserDialog.tsx";
import EditUserSheet from "@/feature/user/components/sheet/EditUserSheet.tsx";
import InfoUserSheet from "@/feature/user/components/sheet/InfoUserSheet.tsx";

function UserDialogs() {
    const {open, setOpen, currentRow, setCurrentRow} = useUsers()

    return (
        <>
            <CreateUserDialog
                key='user-add'
                open={open === 'add'}
                onOpenChange={() => setOpen('add')}
            />

            {currentRow && (
                <>
                    <InfoUserSheet
                        key={`user-info-${currentRow.userId}`}
                        open={open === 'info'}
                        onOpenChange={() => {
                            setOpen('info')
                            setTimeout(() => {
                                setCurrentRow(null)
                            }, 500)
                        }}
                        currentRow={currentRow}
                    />

                    <EditUserSheet
                        key={`user-edit-${currentRow.userId}`}
                        open={open === 'edit'}
                        onOpenChange={() => {
                            setOpen('edit')
                            setTimeout(() => {
                                setCurrentRow(null)
                            }, 500)
                        }}
                        currentRow={currentRow}
                    />

                    <UserDeleteDialog
                        key={`user-delete-${currentRow.userId}`}
                        open={open === 'delete'}
                        onOpenChange={() => {
                            setOpen('delete')
                            setTimeout(() => {
                                setCurrentRow(null)
                            }, 500)
                        }}
                        currentRow={currentRow}
                    />
                </>
            )}
        </>
    );
}

export default UserDialogs;