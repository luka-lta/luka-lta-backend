import {useState} from 'react'
import {Button} from '@/components/ui/button'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import EditUserModal from "@/components/dashboard/user/modal/EditUserModal.tsx";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar.tsx";

type User = {
    id: number
    avatar: string
    name: string
    email: string
    role: string
}

export default function UserTable({users}: { users: User[] }) {
    const [editingUser, setEditingUser] = useState<User | null>(null)

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
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell>
                                <Avatar>
                                    <AvatarImage src={user.avatar} alt={user.name} />
                                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                                </Avatar>
                            </TableCell>
                            <TableCell>{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.role}</TableCell>
                            <TableCell>
                                <Button variant="outline" className="mr-2" onClick={() => setEditingUser(user)}>
                                    Edit
                                </Button>
                                <Button variant="destructive" onClick={() => handleDelete(user.id)}>
                                    Delete
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            {editingUser && (
                <EditUserModal user={editingUser} onClose={() => setEditingUser(null)}/>
            )}
        </>
    )
}

