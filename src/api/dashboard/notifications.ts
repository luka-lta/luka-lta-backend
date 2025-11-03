import {useQuery, UseQueryResult} from "@tanstack/react-query";
import {NotificationTypeSchema} from "@/feature/notifications/schema/NotificationSchema.ts";
import {FetchWrapper} from "@/lib/fetchWrapper.ts";

function getNotifications(): Promise<NotificationTypeSchema[]> {
    const fetchWrapper = new FetchWrapper(FetchWrapper.baseUrl);

    return fetchWrapper.get('/notifications/types');
}

export const NOTIFICATIONS_QUERY_KEY = 'notifications';

export function useNotifications(): UseQueryResult<NotificationTypeSchema[]> {
    return useQuery({
        queryKey: [NOTIFICATIONS_QUERY_KEY],
        queryFn: getNotifications,
    });
}