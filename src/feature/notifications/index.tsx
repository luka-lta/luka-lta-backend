import {Main} from "@/components/layout/main.tsx";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs.tsx";
import NotificationsTable from "@/feature/notifications/components/NotificationsTable.tsx";
import {useState} from "react";

export const notifications = [
    {
        notificationId: 1,
        rssFeedUrl: "https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml",
        provider: "New York Times",
    },
    {
        notificationId: 2,
        rssFeedUrl: "https://feeds.bbci.co.uk/news/world/rss.xml",
        provider: "BBC News",
    },
    {
        notificationId: 3,
        rssFeedUrl: "https://www.heise.de/rss/heise-atom.xml",
        provider: "Heise Online",
    },
    {
        notificationId: 4,
        rssFeedUrl: "https://www.reddit.com/r/programming/.rss",
        provider: "Reddit - Programming",
    },
    {
        notificationId: 5,
        rssFeedUrl: "https://hnrss.org/frontpage",
        provider: "Hacker News",
    },
]


function Notifications() {
    const [filterData, setFilterData] = useState<Record<string, string>>({});

    return (
        <Main>
            <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
                <div>
                    <h2 className='text-2xl font-bold tracking-tight'>Notification list</h2>
                    <p className='text-muted-foreground'>
                        Manage all Notifications like RSS Feeds
                    </p>
                </div>
            </div>

            <Tabs defaultValue='notifications'>
                <TabsList>
                    <TabsTrigger value='notifications'>Notifications</TabsTrigger>
                    <TabsTrigger value='providers'>Providers</TabsTrigger>
                </TabsList>
                <TabsContent value='notifications'>
                    <NotificationsTable notifications={notifications} maxPages={1} loading={false} setFilterData={setFilterData} />
                </TabsContent>
                <TabsContent value='providers'>Hello Providers</TabsContent>
            </Tabs>
        </Main>
    );
}

export default Notifications;