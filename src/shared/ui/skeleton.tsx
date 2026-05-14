import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib/utils";

export const Skeleton = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("animate-pulse rounded-md bg-sand-200/70", className)}
    {...props}
  />
);
