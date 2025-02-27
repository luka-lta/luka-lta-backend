import ApiKeysTable from "@/components/dashboard/apiKeys/ApiKeysTable.tsx";
import SearchBar from "@/components/SearchBar.tsx";
import AddButton from "@/components/button/AddButton.tsx";

function ApiKeysPage() {
    const handleSearch = (searchTerm: string) => {
        console.log('Searching for:', searchTerm)
    }

    const handleAdd = () => {
        console.log('Adding new key...')
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold">Api-Key Management</h1>
            <div className="flex justify-between items-center">
                <SearchBar onSearch={handleSearch} placeholder={'Search key...'}/>
                <AddButton onClick={handleAdd} />
            </div>
            <ApiKeysTable/>
        </div>
    );
}

export default ApiKeysPage;