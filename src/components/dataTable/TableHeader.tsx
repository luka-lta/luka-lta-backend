import { ArrowDownUp, ArrowUpDown } from 'lucide-react'
import { Button } from '../ui/button'
import { TableHead, TableRow, TableHeader as ShadTableHeader } from '../ui/table'
import { HeaderConfig } from './DataTable'

type TableHeaderProps = {
    header: HeaderConfig,
    onSortChange: (headerName?: string, sortOrder?: 'asc' | 'desc') => void,
    sortColumn?: string,
    sortDir?: 'asc' | 'desc',
}

export const TableHeader: React.FC<TableHeaderProps> = ({ header, onSortChange, sortColumn, sortDir }) => {
    return (
        <ShadTableHeader>
            <TableRow>
                {header.map((header) => {
                    if (!header.sortName) {
                        // Column is not sortable
                        return (
                            <TableHead className='select-none' key={header.label}>{header.label}</TableHead>
                        )
                    }

                    if (header.sortName !== sortColumn) {
                        // Column is sortable, but not currently sorted
                        return (
                            <TableHead key={header.label}>
                                <Button
                                    variant='ghost'
                                    className='p-0 hover:bg-transparant'
                                    onClick={() => onSortChange(header.sortName, 'asc')}
                                >
                                    {header.label}
                                </Button>
                            </TableHead>
                        )
                    }

                    // Column is currenctly sorted
                    const icon = sortDir === 'asc' ? <ArrowUpDown /> : <ArrowDownUp />;
                    return (
                        <TableHead key={header.label}>
                            <Button
                                variant='ghost'
                                className='p-0 hover:bg-transparant'
                                onClick={() => {
                                    if (sortDir === 'asc') {
                                        onSortChange(header.sortName, 'desc');
                                    } else {
                                        onSortChange();
                                    }
                                }}>
                                {header.label}{icon}
                            </Button>
                        </TableHead>
                    )
                })}
            </TableRow>
        </ShadTableHeader>
    )
}