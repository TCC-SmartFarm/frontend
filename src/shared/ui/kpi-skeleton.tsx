import { Card } from "./card";
import { Skeleton } from "./skeleton";

interface KpiCardsSkeletonProps {
  count?: number;
}

export const KpiCardsSkeleton = ({ count = 3 }: KpiCardsSkeletonProps) => (
  <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}>
    {Array.from({ length: count }).map((_, i) => (
      <Card key={i} tone="white" padding="none" className="p-5">
        <Skeleton className="mb-2 h-3 w-24" />
        <Skeleton className="h-10 w-32" />
      </Card>
    ))}
  </div>
);
