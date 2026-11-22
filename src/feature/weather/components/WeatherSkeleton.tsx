import { Skeleton } from "@/components/ui/skeleton.tsx";

/** Mirrors the loaded layout so nothing jumps when the data arrives. */
export function WeatherSkeleton() {
    return (
        <div className="space-y-4" aria-busy="true" aria-label="Wetterdaten werden geladen">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,24rem)]">
                <div className="min-w-0 space-y-4">
                    <Skeleton className="h-60 rounded-xl" />
                    <Skeleton className="h-80 rounded-xl" />
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-80 rounded-xl" />
                    <Skeleton className="h-64 rounded-xl" />
                </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Skeleton className="h-52 rounded-xl" />
                <Skeleton className="h-52 rounded-xl" />
                <Skeleton className="h-52 rounded-xl" />
            </div>
        </div>
    );
}
