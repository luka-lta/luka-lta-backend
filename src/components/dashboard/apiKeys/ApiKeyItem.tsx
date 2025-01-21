import {TableCell, TableRow} from "@/components/ui/table.tsx";
import {Button} from "@/components/ui/button.tsx";
import {formatDate} from "@/lib/utils.ts";
import {ApiKeyTypeSchema} from "@/shemas/ApiKeySchema.ts";
import {useCallback, useState} from "react";
import {EyeIcon, EyeOffIcon} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ApiKeyItemProps {
    apiKey: ApiKeyTypeSchema;
    handleDelete: (id: number) => void;
}

function UserItem({apiKey, handleDelete}: ApiKeyItemProps) {
    const [showFullKey, setShowFullKey] = useState(false)
    const [copied, setCopied] = useState(false)

    const toggleKeyVisibility = () => {
        setShowFullKey(!showFullKey)
    }

    const copyToClipboard = useCallback(() => {
        navigator.clipboard.writeText(apiKey.apiKey).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        })
    }, [apiKey.apiKey])

    const displayedKey = showFullKey ? apiKey.apiKey : `••••••••••••`

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
            <TableCell className="flex items-center space-x-2">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
              <span className="font-mono cursor-pointer" onClick={copyToClipboard}>
                {displayedKey}
              </span>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>
                                {copied ? "Copied!" : "Click to copy"}
                            </p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleKeyVisibility}
                    title={showFullKey ? "Hide API Key" : "Show API Key"}
                >
                    {showFullKey ? <EyeOffIcon className="h-4 w-4"/> : <EyeIcon className="h-4 w-4"/>}
                </Button>
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