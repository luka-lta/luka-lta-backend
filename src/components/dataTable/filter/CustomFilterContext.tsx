import { createContext } from 'react';
import { DataTableFilter } from '../DataTable';

export const CustomFilterContext = createContext<{
    onFilterValueChange: (name: string, data: unknown) => void
    filter: DataTableFilter,
}>({
    onFilterValueChange: () => {
        throw new Error('CustomFilterContext called outside of context');
    },
    filter: { page: -1, pageSize: -1 },
})