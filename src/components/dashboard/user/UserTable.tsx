import {Table, TableBody, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import useUserStore from "@/stores/UserStore.ts";
import {useEffect} from "react";
import UserItem from "@/components/dashboard/user/UserItem.tsx";

export default function UserTable() {
    const {users, triggerFetch} = useUserStore();

    useEffect(() => {
        triggerFetch();
    }, []);

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this user?')) {
            console.log('Deleting user with id:', id)
            // TODO: Implement delete user
        }
    }

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Avatar</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Updated</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <UserItem
                            key={user.userId}
                            user={user}
                            handleDelete={handleDelete}
                        />
                    ))}
                </TableBody>
            </Table>
        </>
    )
}

