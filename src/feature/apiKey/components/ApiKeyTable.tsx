import {ApiKeyTypeSchema} from "@/feature/apiKey/schema/ApiKeySchema.ts";
import {DataTable} from "@/components/dataTable/DataTable.tsx";
import {useQueryClient} from "@tanstack/react-query";
import ApiKeyItem from "@/feature/apiKey/components/ApiKeyItem.tsx";

interface ApiKeyTableProps {
    apiKeys: ApiKeyTypeSchema[];
    maxPages: number;
    loading: boolean;
    setFilterData: (filterData: Record<string, string>) => void;
}

function ApiKeyTable({apiKeys, maxPages, loading, setFilterData}: ApiKeyTableProps) {
    const queryClient = useQueryClient();

    return (
        <div className='px-6'>
            <DataTable
                data={apiKeys}
                header={[
                    {label: 'Origin', sortName: 'origin'},
                    {label: 'Creator', sortName: 'creator'},
                    {label: 'Created At', sortName: 'created_at'},
                    {label: 'Expires', sortName: 'expires_at'},
                    {label: 'Key'},
                    {label: 'Permissions'},
                    {label: ''}
                ]}
                maxPages={maxPages}
                renderRow={(apiKey) => {
                  return (
                      <ApiKeyItem apiKey={apiKey} />
                  )
                }}
                onFilterChange={setFilterData}
                onCreateNew={() => alert('Create new')}
                onRefetchData={() => queryClient.invalidateQueries({queryKey: ['apikey', 'list']})}
                loading={loading}
            />
        </div>
    );
}

export default ApiKeyTable;