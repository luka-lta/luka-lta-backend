import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Compass, Languages, TextCursorIcon, Users} from "lucide-react";
import ClicksChart from "@/feature/dashboard/components/ClicksChart.tsx";
import BrowserUsage from "@/feature/dashboard/components/browser-usage.tsx";
import {useClickSummary} from "@/feature/dashboard/hooks/useClickSummary.ts";
import {browserUsage, marketUsage, osUsage} from "@/feature/dashboard/data.ts";
import OsUsage from "@/feature/dashboard/components/os-usage.tsx";
import MarketUsage from "@/feature/dashboard/components/market-usage.tsx";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs.tsx";

function Overview() {
    const [clickSummary] = useClickSummary();

    return (
        <>
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                        <CardTitle className='text-sm font-medium'>
                            Total Clicks
                        </CardTitle>
                        <TextCursorIcon className='text-muted-foreground h-4 w-4' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>{clickSummary.data?.summary.totalClicks}</div>
                        <p className='text-muted-foreground text-xs'>
                            +20.1% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                        <CardTitle className='text-sm font-medium'>
                            Browser tracked
                        </CardTitle>
                        <Users className='text-muted-foreground h-4 w-4'/>
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>{browserUsage.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                        <CardTitle className='text-sm font-medium'>Operating Systems tracked</CardTitle>
                        <Compass className='text-muted-foreground h-4 w-4' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>{osUsage.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                        <CardTitle className='text-sm font-medium'>
                            Markets tracked
                        </CardTitle>
                        <Languages className='text-muted-foreground h-4 w-4' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>{marketUsage.length}</div>
                    </CardContent>
                </Card>
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
                <Card className="col-span-1 lg:col-span-4">
                    <CardHeader>
                        <CardTitle>Click Overview</CardTitle>
                        <CardDescription>last 5 months</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ClicksChart
                            clicksMonthly={clickSummary.data?.summary.clicksMonthly ?? []}
                        />
                    </CardContent>
                </Card>

                {/* TODO: Scrollable */}
                <Card className="col-span-1 lg:col-span-3">
                    <CardHeader>
                        <div className="flex flex-col space-y-2">
                            <CardTitle>Usages</CardTitle>
                            <Tabs defaultValue="browser" className="w-full">
                                <TabsList className="grid grid-cols-3">
                                    <TabsTrigger value="browser">Browsers</TabsTrigger>
                                    <TabsTrigger value="os">Operating Systems</TabsTrigger>
                                    <TabsTrigger value="market">Markets</TabsTrigger>
                                </TabsList>

                                <TabsContent value="browser">
                                    <BrowserUsage />
                                </TabsContent>
                                <TabsContent value="os">
                                    <OsUsage />
                                </TabsContent>
                                <TabsContent value="market">
                                    <MarketUsage />
                                </TabsContent>
                            </Tabs>
                        </div>
                    </CardHeader>
                </Card>
            </div>
        </>
    );
}

export default Overview;