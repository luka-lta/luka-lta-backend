import { useCallback, useState } from 'react'
import { DataTableFilter } from './DataTable';

export function useDataTableFilter() {
    const [filter, setFilter] = useState<DataTableFilter>({ page: 1, pageSize: 20 });

    const onUpdateFilterValue = useCallback((name: string, data: unknown) => {
        setFilter((prev) => {
            return {
                ...prev,
                [name]: data,
            };
        })
    }, []);

    const onResetFilter = useCallback(() => {
        setFilter((prev) => {
            return {
                page: prev.page,
                pageSize: prev.pageSize,
            };
        })
    }, []);

    const onPaginationChange = useCallback((page: number, pageSize: number) => {
        setFilter((prev) => {
            return {
                ...prev,
                page,
                pageSize,
            }
        });
    }, []);

    const onSortingChange = useCallback((sortColumn?: string, sortDirection?: 'asc'|'desc') => {
        setFilter((prev) => {
            return {
                ...prev,
                sortColumn,
                sortDirection,
            }
        });
    }, [])

    return {
        filter,
        onUpdateFilterValue,
        onResetFilter,
        onPaginationChange,
        onSortingChange,
    } as const;
}