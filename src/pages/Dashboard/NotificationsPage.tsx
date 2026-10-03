import Notifications from "@/feature/notifications";
import { Main } from "@/components/layout/main.tsx";
import { useSetPageTitle } from "@/hooks/useSetPageTitle.ts";

export default function NotificationsPage() {
    useSetPageTitle("Backend - Benachrichtigungen");

    return (
        <Main>
            <Notifications />
        </Main>
    );
}
