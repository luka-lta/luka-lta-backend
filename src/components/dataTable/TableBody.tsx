import { ReactElement, useMemo } from 'react'
import { TableBody as ShadTableBody } from '../ui/table'

type TableBodyProps<TData = unknown> = {
    data: TData[]
    renderRow: (rowData: TData, index: number, allData: TData[]) => ReactElement,
}

export function TableBody<TData>({ data, renderRow }: TableBodyProps<TData>) {
    const elements = useMemo(() => {
        return data.map(renderRow);
    }, [data, renderRow]);

    return (
        <ShadTableBody>
            {elements}
        </ShadTableBody>
    )
}