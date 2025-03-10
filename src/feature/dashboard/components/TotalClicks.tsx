import {RefreshButton} from "@/components/button/RefreshButton.tsx";

function TotalClicks() {
    return (
        <div className="flex h-full w-full flex-col p-4">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-500">Total Clicks</h2>
                <RefreshButton onRefresh={() => Promise.resolve()}/>
            </div>
            <div className="flex flex-1 items-center justify-center">
                <h1 className="text-6xl font-bold">1</h1>
            </div>
        </div>
    );
}

export default TotalClicks;
