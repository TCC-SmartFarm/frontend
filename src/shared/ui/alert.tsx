/* eslint-disable react-refresh/only-export-components */
import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/shared/lib/utils";

const alertVariants = cva(
    "flex items-start gap-3.5 px-4 py-3.5 rounded-xl",
    {
        variants: {
            tone: {
                ok:    "bg-ok-bg text-ok-fg",
                warn:  "bg-warn-bg text-warn-fg",
                alert: "bg-alert-bg text-alert-fg",
                info:  "bg-info-bg text-info-fg",
            },
        },
        defaultVariants: {
            tone: "info",
        },
    },
);

const iconTileBg: Record<NonNullable<VariantProps<typeof alertVariants>["tone"]>, string> = {
    ok: "bg-ok-dot",
    warn: "bg-warn-dot",
    alert: "bg-alert-dot",
    info: "bg-info-dot",
};

export interface AlertProps
    extends Omit<HTMLAttributes<HTMLDivElement>, "title">,
        VariantProps<typeof alertVariants> {
    icon?: LucideIcon;
    title?: ReactNode;
    action?: ReactNode;
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
    ({ className, tone = "info", icon: Icon, title, action, children, ...props }, ref) => (
        <div
            ref={ref}
            role="alert"
            className={cn(alertVariants({ tone }), className)}
            {...props}
        >
            {Icon ? (
                <div
                    className={cn(
                        "size-9 rounded-md flex items-center justify-center flex-shrink-0 text-white",
                        iconTileBg[tone ?? "info"],
                    )}
                >
                    <Icon size={20} strokeWidth={1.75} aria-hidden />
                </div>
            ) : null}
            <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                {title ? (
                    <span className="font-display font-semibold text-[15px] leading-snug">
                        {title}
                    </span>
                ) : null}
                {children ? (
                    <span className="text-sm leading-[1.45]">{children}</span>
                ) : null}
            </div>
            {action ? <div className="self-center flex-shrink-0">{action}</div> : null}
        </div>
    ),
);
Alert.displayName = "Alert";

export { alertVariants };
