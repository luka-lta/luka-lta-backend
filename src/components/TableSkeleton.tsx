import { Skeleton } from "@/components/ui/skeleton";

export function TableSkeleton({
  rows = 10,
  children,
}: {
  rows?: number;
  children: (index: number) => React.ReactNode;
}) {
  return (
    <div className="flex flex-col divide-y px-6 pb-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-3">
          {children(i)}
        </div>
      ))}
    </div>
  );
}

export function SkeletonCell({ width, flex }: { width?: string; flex?: boolean }) {
  return <Skeleton className={`h-4 ${flex ? "flex-1" : (width ?? "w-20")}`} />;
}
