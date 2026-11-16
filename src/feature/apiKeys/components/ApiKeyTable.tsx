import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { KeyRound, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { TimeCell } from "@/components/TimeCell.tsx";
import { DataTable } from "@/components/data/data-table.tsx";
import { RowActions } from "@/components/data/row-actions.tsx";
import { TablePagination } from "@/components/data/table-pagination.tsx";
import { EmptyState } from "@/components/feedback/empty-state.tsx";
import { ApiKeyType } from "@/api/apiKeys/schema.ts";

interface Props {
    apiKeys: ApiKeyType[];
    loading: boolean;
    onDelete: (apiKey: ApiKeyType) => void;
    onCreate: () => void;
}

const col = createColumnHelper<ApiKeyType>();

function ApiKeyTable({ apiKeys, loading, onDelete, onCreate }: Props) {
    const columns = [
        col.accessor('label', {
            header: 'Bezeichnung',
            cell: ({ row }) => (
                <div className="min-w-0">
                    <p className="font-medium">{row.original.label}</p>
                    <p className="truncate font-mono text-xs text-muted-foreground">{row.original.origin}</p>
                </div>
            ),
            meta: { skeletonClassName: 'w-40' },
        }),
        col.accessor('keyPreview', {
            header: 'Key',
            cell: ({ getValue }) => <code className="font-mono text-xs text-muted-foreground">{getValue()}</code>,
            meta: { className: 'hidden md:table-cell' },
        }),
        col.accessor('permissions', {
            header: 'Berechtigungen',
            cell: ({ getValue }) => (
                <div className="flex flex-wrap gap-1">
                    {getValue().map((permission) => (
                        <Badge key={permission.id} variant="neutral" className="font-mono">{permission.name}</Badge>
                    ))}
                </div>
            ),
            meta: { className: 'hidden lg:table-cell', skeletonClassName: 'w-32' },
        }),
        col.accessor('createdAt', {
            header: 'Erstellt',
            cell: ({ getValue }) => <TimeCell iso={getValue()} />,
            meta: { className: 'hidden sm:table-cell' },
        }),
        col.accessor('expiresAt', {
            header: 'Läuft ab',
            cell: ({ getValue }) => {
                const v = getValue();
                return v ? <TimeCell iso={v} /> : <span className="text-sm text-muted-foreground">Nie</span>;
            },
        }),
        col.display({
            id: 'actions',
            header: () => <span className="sr-only">Aktionen</span>,
            meta: { className: 'w-12 text-right', skeletonClassName: 'w-6' },
            cell: ({ row }) => (
                <RowActions
                    label={row.original.label}
                    actions={[{ label: 'Löschen', icon: Trash2, destructive: true, onSelect: () => onDelete(row.original) }]}
                />
            ),
        }),
    ];

    const table = useReactTable({ data: apiKeys, columns, getCoreRowModel: getCoreRowModel() });

    return (
        <DataTable
            table={table}
            loading={loading}
            skeletonRows={3}
            empty={
                <EmptyState
                    variant="plain"
                    icon={KeyRound}
                    title="Noch keine API-Keys"
                    description="Erstelle einen Key, damit sich ein Agent oder eine Integration anmelden kann."
                    action={<Button variant="outline" size="sm" onClick={onCreate}><Plus />API-Key erstellen</Button>}
                />
            }
            footer={!loading && apiKeys.length > 0 ? <TablePagination page={1} rowCount={apiKeys.length} onPageChange={() => undefined} /> : undefined}
        />
    );
}

export default ApiKeyTable;
