import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {fetchSelfUser, updateSelfPassword, updateSelfUser} from "@/api/self/endpoints.ts";

export function useSelfUser() {
    const queryData = useQuery({
        queryKey: ['self', 'user'],
        queryFn: fetchSelfUser,
    })

    return [queryData] as const;
}

export function useUpdateSelfUser() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (formData: FormData) => updateSelfUser(formData),
        onSuccess: () => qc.invalidateQueries({queryKey: ['self', 'user']}),
    });
}

export function useUpdateSelfPassword() {
    return useMutation({
        mutationFn: (password: string) => updateSelfPassword(password),
    });
}
