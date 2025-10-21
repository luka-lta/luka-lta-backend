import {Main} from "@/components/layout/main.tsx";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs.tsx";
import NotificationsTable from "@/feature/notifications/components/NotificationsTable.tsx";
import {useState} from "react";
import {NotificationTypeSchema} from "@/feature/notifications/schema/NotificationSchema.ts";
import NotificationsProvider from "@/feature/notifications/context/notifications-context.tsx";
import NotificationsDialog from "@/feature/notifications/components/NotificationsDialog.tsx";
import {useSetPageTitle} from "@/hooks/useSetPageTitle.ts";

// eslint-disable-next-line react-refresh/only-export-components
export const notifications: NotificationTypeSchema[] = [
    {
        id: '1',
        name: 'Test',
        url: "https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml",
        providers: [
            'Discord'
        ],
        lastFetchedAt: Date.toString()
    },
    {
        id: '2',
        name: 'Test',
        url: "https://feeds.bbci.co.uk/news/world/rss.xml",
        providers: [
            'Discord',
            'Peter'
        ],
        lastFetchedAt: Date.toString()
    },
    {
        id: '3',
        name: 'Test',
        url: "https://www.heise.de/rss/heise-atom.xml",
        providers: [
            'Discord'
        ],
        lastFetchedAt: Date.toString()
    },
    {
        id: '4',
        name: 'Test',
        url: "https://www.reddit.com/r/programming/.rss",
        providers: [
            'Discord'
        ],
        lastFetchedAt: Date.toString()
    },
    {
        id: '5',
        name: 'Test',
        url: "https://hnrss.org/frontpage",
        providers: [
            'Discord'
        ],
        lastFetchedAt: Date.toString()
    },
];



function Notifications() {
    const [filterData, setFilterData] = useState<Record<string, string>>({});
    useSetPageTitle('luka-lta.dev | Notifications')

    return (
        <NotificationsProvider>
        <Main>
            <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
                <div>
                    <h2 className='text-2xl font-bold tracking-tight'>Notification list</h2>
                    <p className='text-muted-foreground'>
                        Manage all Notifications like RSS Feeds
                    </p>
                </div>
            </div>

            <Tabs defaultValue='notifications' className='pt-2'>
                <TabsList>
                    <TabsTrigger value='notifications'>Notifications</TabsTrigger>
                    <TabsTrigger value='providers'>Providers</TabsTrigger>
                </TabsList>
                <TabsContent value='notifications'>
                        <NotificationsTable notifications={notifications} maxPages={1} loading={false} setFilterData={setFilterData} />
                        <NotificationsDialog />
                </TabsContent>
                <TabsContent value='providers'>Hello Providers</TabsContent>
            </Tabs>
        </Main>
        </NotificationsProvider>
    );
}

export default Notifications;