import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Compass, Languages, TextCursorIcon, Users} from "lucide-react";
import ClicksChart from "@/feature/dashboard/components/ClicksChart.tsx";
import Referrer from "@/feature/dashboard/components/referrer.tsx";
import {useClickSummary} from "@/feature/dashboard/hooks/useClickSummary.ts";
import {browserUsage, marketUsage, osUsage} from "@/feature/dashboard/data.ts";
import {Pages} from "@/feature/dashboard/components/Pages.tsx";
import {Devices} from "@/feature/dashboard/components/Devices.tsx";
import {Countries} from "@/feature/dashboard/components/Countries.tsx";

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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Card className="col-span-2">
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

                <Referrer className="col-span-1" />
                <Pages className="col-span-1" />
                <Devices className="col-span-1" />
                <Countries className="col-span-1" />
            </div>
        </>
    );
}

export default Overview;