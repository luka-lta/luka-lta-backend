import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {TextCursorIcon, Users} from "lucide-react";
import ClicksChart from "@/feature/dashboard/components/ClicksChart.tsx";
import BrowserUsage from "@/feature/dashboard/components/browser-usage.tsx";
import {useClickSummary} from "@/feature/dashboard/hooks/useClickSummary.ts";
import {browserUsage} from "@/feature/dashboard/data.ts";

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
{/*                    <CardContent>
                        <div className='text-2xl font-bold'>{clickSummary.data?.summary.totalClicks}</div>
                        <p className='text-muted-foreground text-xs'>
                            +20.1% from last month
                        </p>
                    </CardContent>*/}
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
                        <CardTitle className='text-sm font-medium'>Sales</CardTitle>
                        <svg
                            xmlns='http://www.w3.org/2000/svg'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth='2'
                            className='text-muted-foreground h-4 w-4'
                        >
                            <rect width='20' height='14' x='2' y='5' rx='2' />
                            <path d='M2 10h20' />
                        </svg>
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>+12,234</div>
                        <p className='text-muted-foreground text-xs'>
                            +19% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                        <CardTitle className='text-sm font-medium'>
                            Active Now
                        </CardTitle>
                        <svg
                            xmlns='http://www.w3.org/2000/svg'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth='2'
                            className='text-muted-foreground h-4 w-4'
                        >
                            <path d='M22 12h-4l-3 9L9 3l-3 9H2' />
                        </svg>
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>+573</div>
                        <p className='text-muted-foreground text-xs'>
                            +201 since last hour
                        </p>
                    </CardContent>
                </Card>
            </div>
            <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
                <Card className='col-span-1 lg:col-span-4'>
                    <CardHeader>
                        <CardTitle>Click Overview</CardTitle>
                        <CardDescription>last 5 months</CardDescription>
                    </CardHeader>
                    <CardContent className='pl-2'>
                        <ClicksChart clicksMonthly={clickSummary.data?.summary.clicksMonthly ?? []} />
                    </CardContent>
                </Card>
                <Card className='col-span-1 lg:col-span-3'>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <BrowserUsage />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

export default Overview;