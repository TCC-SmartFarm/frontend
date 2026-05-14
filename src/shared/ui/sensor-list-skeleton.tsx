import { Skeleton } from "./skeleton";

interface SensorListSkeletonProps {
  rows?: number;
}

export const SensorListSkeleton = ({ rows = 6 }: SensorListSkeletonProps) => (
  <div className="flex flex-col">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 border-b border-border/40 px-4 py-2.5 last:border-b-0">
        <Skeleton className="size-2 rounded-full" />
        <div className="min-w-0 flex-1">
          <Skeleton className="mb-1.5 h-3 w-32" />
          <Skeleton className="h-2.5 w-20" />
        </div>
        <Skeleton className="h-3 w-10" />
      </div>
    ))}
  </div>
);
