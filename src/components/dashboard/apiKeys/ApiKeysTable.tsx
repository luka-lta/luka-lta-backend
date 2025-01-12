import {Table, TableBody, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {useEffect} from "react";
import useApiKeyStore from "@/stores/ApiKeyStore.ts";
import ApiKeyItem from "@/components/dashboard/apiKeys/ApiKeyItem.tsx";
import LinkSkeleton from "@/components/dashboard/linktree/LinkSkeleton.tsx";

export default function ApiKeysTable() {
    const {apiKeys, triggerFetch, isLoading, error} = useApiKeyStore();

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
                        <TableHead>Origin</TableHead>
                        <TableHead>Creator</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Expires</TableHead>
                        <TableHead>Key</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                {isLoading ? (
                    <TableBody>
                        {Array(5).fill(null).map((_, index) => (
                            <LinkSkeleton key={index}/>
                        ))}
                    </TableBody>
                ) : apiKeys.length > 0 ? (
                    <TableBody>
                        {apiKeys.map((apiKey) => (
                            <ApiKeyItem
                                key={apiKey.id}
                                apiKey={apiKey}
                                handleDelete={handleDelete}
                            />
                        ))}
                    </TableBody>
                ) : (
                    <div className="text-center">
                        {error ? (
                            <p className="text-red-500">{error}</p>
                        ) : (
                            <p className="text-red-500">No links found</p>
                        )}
                    </div>
                )}
            </Table>
        </>
    )
}

