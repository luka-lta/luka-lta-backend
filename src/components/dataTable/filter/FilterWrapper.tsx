import { Button } from '@/components/ui/button'
import { Plus, RotateCw, Trash } from 'lucide-react'
import { ReactElement } from 'react'
import { DataTableFilter } from '../DataTable'
import { CustomFilterContext } from './CustomFilterContext'

type FilterWrapperProps = {
    onRefetchData: () => void,
    onFilterValueChange: (name: string, value: unknown) => void,
    onResetFilter: () => void,
    onCreate: () => void,
    customFilter: ReactElement[],
    filter: DataTableFilter,
}

export const FilterWrapper: React.FC<FilterWrapperProps> = ({
                                                                onCreate,
                                                                onRefetchData,
                                                                onResetFilter,
                                                                onFilterValueChange,
                                                                customFilter,
                                                                filter,
                                                            }) => {
    return (
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
                <CustomFilterContext.Provider value={{ onFilterValueChange, filter }}>
                    {customFilter}
                </CustomFilterContext.Provider>
            </div>

            <div className="flex items-center gap-2">
                <Button variant="outline" className="gap-2" onClick={onResetFilter}>
                    <Trash className="h-4 w-4" />
                    Clear Filters
                </Button>
                <Button variant="outline" size="icon" onClick={onRefetchData}>
                    <RotateCw className="h-4 w-4" />
                </Button>
                <Button className="gap-2" variant={'default'} onClick={onCreate}>
                    <Plus className="h-4 w-4" />
                    New
                </Button>
            </div>
        </div>
    )
}