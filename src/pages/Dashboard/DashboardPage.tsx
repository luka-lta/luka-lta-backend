import AuditLog from "@/components/dashboard/home/AuditLog.tsx";
import ClicksChart from "@/components/dashboard/home/ClicksChart.tsx";
import TotalClicks from "@/components/dashboard/home/TotalClicks.tsx";
import TimeLineClicksChart from "@/components/dashboard/home/TimeLineClicksChart.tsx";

export default function DashboardPage() {
    const clickData = [
        { timestamp: '2025-01-01', clicks: 80 },
        { timestamp: '2025-01-02', clicks: 110 },
        { timestamp: '2025-01-03', clicks: 150 },
        { timestamp: '2025-01-04', clicks: 200 },
        { timestamp: '2025-01-05', clicks: 170 },
        { timestamp: '2025-01-06', clicks: 130 },
        { timestamp: '2025-01-07', clicks: 180 },
        { timestamp: '2025-01-08', clicks: 220 },
        { timestamp: '2025-01-09', clicks: 210 },
        { timestamp: '2025-01-10', clicks: 190 },
        { timestamp: '2025-01-11', clicks: 240 },
        { timestamp: '2025-01-12', clicks: 270 },
        { timestamp: '2025-01-13', clicks: 300 },
        { timestamp: '2025-01-14', clicks: 310 },
        { timestamp: '2025-01-15', clicks: 280 },
        { timestamp: '2025-01-16', clicks: 320 },
        { timestamp: '2025-01-17', clicks: 350 },
        { timestamp: '2025-01-18', clicks: 370 },
        { timestamp: '2025-01-19', clicks: 330 },
        { timestamp: '2025-01-20', clicks: 340 },
        { timestamp: '2025-01-21', clicks: 380 },
        { timestamp: '2025-01-22', clicks: 410 },
        { timestamp: '2025-01-23', clicks: 420 },
        { timestamp: '2025-01-24', clicks: 450 },
        { timestamp: '2025-01-25', clicks: 460 },
        { timestamp: '2025-01-26', clicks: 500 },
        { timestamp: '2025-01-27', clicks: 490 },
        { timestamp: '2025-01-28', clicks: 530 },
        { timestamp: '2025-01-29', clicks: 540 },
        { timestamp: '2025-01-30', clicks: 550 },
        { timestamp: '2025-01-31', clicks: 560 },
        { timestamp: '2025-02-01', clicks: 580 },
        { timestamp: '2025-02-02', clicks: 600 },
        { timestamp: '2025-02-03', clicks: 620 },
        { timestamp: '2025-02-04', clicks: 630 },
        { timestamp: '2025-02-05', clicks: 650 },
        { timestamp: '2025-02-06', clicks: 680 },
        { timestamp: '2025-02-07', clicks: 700 },
    ];

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <h1>Informations</h1>
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                <div className="aspect-video rounded-xl bg-muted/50">
                    <TotalClicks/>
                </div>
                <div className="aspect-video rounded-xl bg-muted/50">
                    <ClicksChart/>
                </div>
                <div className="aspect-video rounded-xl bg-muted/50">
                    <TimeLineClicksChart data={clickData} />
                </div>
            </div>
            <h1>AuditLog</h1>
            <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min">
                <AuditLog/>
            </div>
        </div>
    );
}