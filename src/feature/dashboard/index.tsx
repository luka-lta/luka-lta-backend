import TotalClicks from "@/feature/dashboard/components/TotalClicks.tsx";
import ClicksChart from "@/feature/dashboard/components/ClicksChart.tsx";
import TimeLineClicksChart from "@/feature/dashboard/components/TimeLineClicksChart.tsx";
import AuditLog from "@/feature/dashboard/components/AuditLog.tsx";
import {useClickSummary} from "./hooks/useClickSummary";
import {Badge} from "@/components/ui/badge.tsx";
import {AlertTriangle} from "lucide-react";
import {QueryErrorDisplay} from "@/components/QueryErrorDisplay.tsx";

function Dashboard() {
    const [clickSummary] = useClickSummary();

    if (clickSummary.error) {
        return (
            <div className='p-6'>
                <div className='mb-5'>
                    <div className='flex items-center gap-2 mb-2'>
                        <h1 className='text-2xl font-semibold'>Dashboard</h1>
                        <Badge variant='secondary' className='bg-zinc-900 text-red-600 hover:bg-zinc-900'>
                            <AlertTriangle/>
                        </Badge>
                    </div>
                    <QueryErrorDisplay query={clickSummary}/>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <h1>Informations</h1>
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                <div className="aspect-video rounded-xl bg-muted/50">
                    <TotalClicks totalClicks={clickSummary.data?.summary.totalClicks ?? 'N/A'}/>
                </div>
                <div className="aspect-video rounded-xl bg-muted/50">
                    <ClicksChart clicksMonthly={clickSummary.data?.summary.clicksMonthly ?? 'N/A'}/>
                </div>
                <div className="aspect-video rounded-xl bg-muted/50">
                    <TimeLineClicksChart clicksDaily={clickSummary.data?.summary.clicksDaily ?? 'N/A'}/>
                </div>
            </div>
            <h1>AuditLog</h1>
            <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min">
                <AuditLog/>
            </div>
        </div>
    );
}

export default Dashboard;