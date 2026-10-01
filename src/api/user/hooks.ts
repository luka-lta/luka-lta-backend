import {useState} from "react";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {createUser, CreateUserInput, deleteUser, fetchUserList, updateUser} from "@/api/user/endpoints.ts";

export function useUserList() {
    const [filterData, setFilterData] = useState<Record<string, string>>({});

    const queryData = useQuery({
        queryKey: ['users', 'list', filterData],
        queryFn: () => fetchUserList(filterData),
    });

    return [queryData, setFilterData] as const;
}

export function useCreateUser() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateUserInput) => createUser(data),
        onSuccess: () => qc.invalidateQueries({queryKey: ['users', 'list']}),
    });
}

export function useUpdateUser(userId: number) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (formData: FormData) => updateUser(userId, formData),
        onSuccess: () => qc.invalidateQueries({queryKey: ['users', 'list']}),
    });
}

export function useDeleteUser() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (userId: number) => deleteUser(userId),
        onSuccess: () => qc.invalidateQueries({queryKey: ['users', 'list']}),
    });
}
