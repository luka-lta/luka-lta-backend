import {UserTypeSchema} from "@/shemas/UserSchema.ts";
import {TableCell, TableRow} from "@/components/ui/table.tsx";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar.tsx";
import {Button} from "@/components/ui/button.tsx";
import {formatDate, splitAvatarUrl} from "@/lib/utils.ts";

interface UserItemProps {
    user: UserTypeSchema;
    handleDelete: (id: number) => void;
}

function UserItem({user, handleDelete}: UserItemProps) {

    return (
        <TableRow key={user.userId}>
            <TableCell>
                <Avatar>
                    <AvatarImage src={splitAvatarUrl(user.avatarUrl)} alt={user.email}/>
                    <AvatarFallback>{user.email[0]}</AvatarFallback>
                </Avatar>
            </TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
                {formatDate(user.createdAt)}
            </TableCell>
            <TableCell>
                {user.updatedAt ? formatDate(user.updatedAt) : "Unknown"}
            </TableCell>
            <TableCell>
                <Button variant="outline" className="mr-2">
                    Edit
                </Button>
                <Button variant="destructive" onClick={() => handleDelete(user.userId)}>
                    Delete
                </Button>
            </TableCell>
        </TableRow>
    );
}

export default UserItem;