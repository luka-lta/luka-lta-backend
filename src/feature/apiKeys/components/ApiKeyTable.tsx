import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { TimeCell } from "@/components/TimeCell.tsx";
import { Empty, EmptyMedia, EmptyTitle } from "@/components/ui/empty.tsx";
import { KeyRound, Trash } from "lucide-react";
import { ApiKeyType } from "@/api/apiKeys/schema.ts";

interface Props {
    apiKeys: ApiKeyType[];
    loading: boolean;
    onDelete: (apiKey: ApiKeyType) => void;
}

function ApiKeyTable({ apiKeys, loading, onDelete }: Props) {
    if (!loading && apiKeys.length === 0) {
        return (
            <Empty className="border rounded-lg py-12">
                <EmptyMedia variant="icon">
                    <KeyRound />
                </EmptyMedia>
                <EmptyTitle>No API keys yet</EmptyTitle>
            </Empty>
        );
    }

    return (
        <div className="border rounded-lg">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Label</TableHead>
                        <TableHead>Origin</TableHead>
                        <TableHead>Key</TableHead>
                        <TableHead>Permissions</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Expires</TableHead>
                        <TableHead className="w-10" />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {apiKeys.map((apiKey) => (
                        <TableRow key={apiKey.id}>
                            <TableCell className="font-medium">{apiKey.label}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{apiKey.origin}</TableCell>
                            <TableCell className="font-mono text-sm">{apiKey.keyPreview}</TableCell>
                            <TableCell>
                                <div className="flex flex-wrap gap-1">
                                    {apiKey.permissions.map((permission) => (
                                        <Badge key={permission.id} variant="secondary">
                                            {permission.name}
                                        </Badge>
                                    ))}
                                </div>
                            </TableCell>
                            <TableCell><TimeCell iso={apiKey.createdAt} /></TableCell>
                            <TableCell>
                                {apiKey.expiresAt ? <TimeCell iso={apiKey.expiresAt} /> : (
                                    <span className="text-muted-foreground text-sm">Never</span>
                                )}
                            </TableCell>
                            <TableCell>
                                <Button variant="ghost" size="icon" onClick={() => onDelete(apiKey)}>
                                    <Trash className="h-4 w-4 text-destructive" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

export default ApiKeyTable;
