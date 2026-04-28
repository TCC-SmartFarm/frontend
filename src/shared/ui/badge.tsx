/* eslint-disable react-refresh/only-export-components */
import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib/utils";

const badgeVariants = cva(
    "inline-flex items-center gap-1.5 font-semibold rounded-full whitespace-nowrap",
    {
        variants: {
            tone: {
                ok:     "bg-ok-bg text-ok-fg",
                warn:   "bg-warn-bg text-warn-fg",
                alert:  "bg-alert-bg text-alert-fg",
                info:   "bg-info-bg text-info-fg",
                leaf:   "bg-leaf-50 text-leaf-700",
                neutral:"bg-sand-100 text-sand-700",
            },
            size: {
                sm: "text-xs px-2 py-[3px]",
                md: "text-[13px] px-3 py-[5px]",
            },
        },
        defaultVariants: {
            tone: "neutral",
            size: "md",
        },
    },
);

const dotColor: Record<NonNullable<VariantProps<typeof badgeVariants>["tone"]>, string> = {
    ok: "bg-ok-dot",
    warn: "bg-warn-dot",
    alert: "bg-alert-dot",
    info: "bg-info-dot",
    leaf: "bg-leaf-600",
    neutral: "bg-sand-500",
};

export interface BadgeProps
    extends HTMLAttributes<HTMLSpanElement>,
        VariantProps<typeof badgeVariants> {
    dot?: boolean;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
    ({ className, tone = "neutral", size = "md", dot, children, ...props }, ref) => (
        <span
            ref={ref}
            className={cn(badgeVariants({ tone, size }), className)}
            {...props}
        >
            {dot ? (
                <span
                    aria-hidden
                    className={cn(
                        "rounded-full",
                        size === "sm" ? "size-[6px]" : "size-[7px]",
                        dotColor[tone ?? "neutral"],
                    )}
                />
            ) : null}
            {children}
        </span>
    ),
);
Badge.displayName = "Badge";

export { badgeVariants };
