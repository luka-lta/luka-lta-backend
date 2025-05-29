import {ReactElement, useDeferredValue, useEffect} from 'react'
import {Table} from '../ui/table'
import {FilterWrapper} from "@/components/dataTable/filter/FilterWrapper.tsx";
import {useDataTableFilter} from "@/components/dataTable/useDataTableFilter.ts";
import {TableHeader} from "@/components/dataTable/TableHeader.tsx";
import {TableBodyLoading} from "@/components/dataTable/TableBodyLoading.tsx";
import {TableBody} from "@/components/dataTable/TableBody.tsx";
import Pagination from "@/components/dataTable/Pagination.tsx";

export type HeaderConfig = {
    label: string,
    sortName?: string,
}[];

export type DataTableFilter<TExtraFilter = Record<string, unknown>> = {
    page: number,
    pageSize: number,
    sortColumn?: string,
    sortDirection?: 'asc' | 'desc',
    search?: string,
} & TExtraFilter;

type DataTableProps<TData = unknown, TExtraFilter = Record<string, unknown>> = {
    data: TData[]
    header: HeaderConfig,
    customFilter?: ReactElement[],
    maxPages: number,
    loading?: boolean,
    renderRow: (rowData: TData, index: number, allData: TData[]) => ReactElement,
    onFilterChange: (filterData: DataTableFilter<TExtraFilter>) => void,
    onCreateNew: () => void,
    onRefetchData: () => void,
    emptyState?: string,
}

export function DataTable<TData = unknown, TExtraFilter = Record<string, unknown>>({
                                                                                       data,
                                                                                       header,
                                                                                       maxPages,
                                                                                       loading = false,
                                                                                       onCreateNew,
                                                                                       onFilterChange,
                                                                                       onRefetchData,
                                                                                       renderRow,
                                                                                       customFilter = [],
                                                                                       emptyState,
                                                                                   }: DataTableProps<TData, TExtraFilter>) {
    const {
        filter,
        onPaginationChange,
        onResetFilter,
        onUpdateFilterValue,
        onSortingChange,
    } = useDataTableFilter();

    const deferredFilter = useDeferredValue(filter as DataTableFilter<TExtraFilter>);
    useEffect(() => {
        onFilterChange(deferredFilter);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [deferredFilter]);

    return (
        <div className='max-h-[600px]'>
            <FilterWrapper
                customFilter={customFilter}
                filter={filter}
                onCreate={onCreateNew}
                onFilterValueChange={onUpdateFilterValue}
                onRefetchData={onRefetchData}
                onResetFilter={onResetFilter}
            />

            <div className="border rounded-lg max-h-[600px] overflow-auto">
                <Table>
                    <TableHeader
                        header={header}
                        onSortChange={onSortingChange}
                        sortColumn={filter.sortColumn}
                        sortDir={filter.sortDirection}
                    />
                    {loading ? (
                        <TableBodyLoading
                            header={header}
                            rows={filter.pageSize}
                        />
                    ) : data.length === 0 ? (
                        <tbody>
                        <tr>
                            <td
                                colSpan={header.length}
                                className="text-center py-8 bg-zinc-900 text-red-600 hover:bg-zinc-900 h-32"
                            >
                                {emptyState ?? 'No data found'}
                            </td>
                        </tr>
                        </tbody>
                    ) : (
                        <TableBody
                            data={data}
                            renderRow={renderRow}
                        />
                    )}
                </Table>
            </div>

            <Pagination
                maxPages={maxPages}
                onUpdatePagination={onPaginationChange}
                page={filter.page}
                rowsPerPage={filter.pageSize}
            />
        </div>
    );
}
