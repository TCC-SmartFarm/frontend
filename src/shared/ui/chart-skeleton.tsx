import { Skeleton } from "./skeleton";

interface ChartSkeletonProps {
  height?: number;
}

export const ChartSkeleton = ({ height = 280 }: ChartSkeletonProps) => (
  <div className="flex w-full flex-col gap-3">
    <Skeleton className="h-4 w-32" />
    <Skeleton className="w-full rounded-xl" style={{ height }} />
    <div className="flex justify-between">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-3 w-10" />
      ))}
    </div>
  </div>
);
