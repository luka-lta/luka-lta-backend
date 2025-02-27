import UserTable from "@/components/dashboard/user/UserTable.tsx";
import SearchBar from "@/components/SearchBar.tsx";
import useUserStore from "@/stores/UserStore.ts";
import {useEffect, useState} from "react";
import {UserTypeSchema} from "@/shemas/UserSchema.ts";
import AddButton from "@/components/button/AddButton.tsx";

function UsersPage() {
    const {users, triggerFetch, deleteUser} = useUserStore();
    const [filteredUsers, setFilteredUsers] = useState<UserTypeSchema[]>([])

    useEffect(() => {
        triggerFetch();
    }, []);

    useEffect(() => {
        setFilteredUsers(users);
    }, [users]);


    const handleSearch = (searchTerm: string) => {
        const filtered = users.filter((user) => user.email.toLowerCase().includes(searchTerm.toLowerCase()))
        setFilteredUsers(filtered)
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold">User Management</h1>
            <div className="flex justify-between items-center">
                <SearchBar onSearch={handleSearch} placeholder='Search user...'/>
                <AddButton onClick={() => undefined}/>
            </div>
            {filteredUsers.length > 0 && (
                <UserTable deleteUser={deleteUser} users={filteredUsers}/>
            )}
            {filteredUsers.length === 0 && (
                <p className="justify-items-center">No users found</p>
            )}
        </div>
    );
}

export default UsersPage;