import {TableCell, TableRow} from "@/components/ui/table.tsx";
import {Button} from "@/components/ui/button.tsx";
import {formatDate} from "@/lib/utils.ts";
import {ApiKeyTypeSchema} from "@/shemas/ApiKeySchema.ts";

interface ApiKeyItemProps {
    apiKey: ApiKeyTypeSchema;
    handleDelete: (id: number) => void;
}

function UserItem({apiKey, handleDelete}: ApiKeyItemProps) {

    return (
        <TableRow key={apiKey.id}>
            <TableCell>{apiKey.origin}</TableCell>
            <TableCell>{apiKey.createdBy}</TableCell>
            <TableCell>
                {formatDate(apiKey.createdAt.toString())}
            </TableCell>
            <TableCell>
                {apiKey.expiresAt ? formatDate(apiKey.expiresAt.toString()) : "Never"}
            </TableCell>
            <TableCell>
                <Button variant="outline" className="mr-2">
                    Edit
                </Button>
                <Button variant="destructive" onClick={() => handleDelete(apiKey.id)}>
                    Delete
                </Button>
            </TableCell>
        </TableRow>
    );
}

export default UserItem;