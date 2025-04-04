import {RefreshButton} from "@/components/refresh-button.tsx";
import {useQueryClient} from "@tanstack/react-query";

interface TotalClicksProps {
    totalClicks: number|string;
}

function TotalClicks({totalClicks}: TotalClicksProps) {
    const queryClient = useQueryClient();

    return (
        <div className="flex h-full w-full flex-col p-4">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-500">Total Clicks</h2>
                <RefreshButton onRefresh={() => queryClient.invalidateQueries({queryKey: ['summary', 'click', 'list']})}/>
            </div>
            <div className="flex flex-1 items-center justify-center">
                <h1 className="text-6xl font-bold">{totalClicks}</h1>
            </div>
        </div>
    );
}

export default TotalClicks;
