import { useMemo } from 'react'
import { TableBody as ShadTableBody, TableCell, TableRow } from '../ui/table'
import { HeaderConfig } from './DataTable'
import { Skeleton } from '../ui/skeleton'

type TableBodyLoadingProps = {
    rows: number,
    header: HeaderConfig
}

export const TableBodyLoading: React.FC<TableBodyLoadingProps> = ({ rows, header }) => {
    const elements = useMemo(() => {
        const cells = new Array(header.length)
            .fill(null)
            .map((_, index) => (<TableCell key={index}><Skeleton className='h-5 my-2 w-[50%]' /></TableCell>));

        return new Array(rows)
            .fill(null)
            .map((_, index) => <TableRow key={index}>{cells}</TableRow>)
    }, [rows, header]);

    return (
        <ShadTableBody>
            {elements}
        </ShadTableBody>
    )
}