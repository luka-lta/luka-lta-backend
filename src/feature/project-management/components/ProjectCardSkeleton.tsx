import { Skeleton } from "@/components/ui/skeleton.tsx";

export function ProjectCardSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-xs">
      <Skeleton className="size-6 rounded-md" />
      <Skeleton className="size-11 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-64 max-w-full" />
      </div>
      <Skeleton className="size-8 rounded-md" />
    </div>
  );
}
