import {Card, CardContent, CardHeader} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function BlogLoading() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="flex flex-col">
                    <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-4 w-full" />
                            </div>
                            <Skeleton className="h-6 w-6 rounded" />
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-between space-y-4">
                        <Skeleton className="w-full h-32 rounded-md" />

                        <div className="space-y-3">
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-4 w-1/3" />
                            <div className="flex gap-2">
                                <Skeleton className="h-8 w-full rounded" />
                                <Skeleton className="h-8 w-8 rounded" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

export default BlogLoading;