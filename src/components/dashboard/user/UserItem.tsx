import {UserTypeSchema} from "@/shemas/UserSchema.ts";
import {TableCell, TableRow} from "@/components/ui/table.tsx";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar.tsx";
import {Button} from "@/components/ui/button.tsx";
import {formatDate, splitAvatarUrl} from "@/lib/utils.ts";
import {Edit, Trash2} from "lucide-react";

interface UserItemProps {
    user: UserTypeSchema;
    handleDelete: (id: number) => void;
    handleEdit: (user: UserTypeSchema) => void;
}

function UserItem({user, handleDelete, handleEdit}: UserItemProps) {

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
                <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(user)}>
                        <Edit className="h-4 w-4"/>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(user.userId)}>
                        <Trash2 className="h-4 w-4"/>
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    );
}

export default UserItem;