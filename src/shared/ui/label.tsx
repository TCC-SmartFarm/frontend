import { forwardRef } from "react";
import type { ComponentPropsWithoutRef, ElementRef } from "react";
import * as LabelPrimitive from "@radix-ui/react-label";

import { cn } from "@/shared/lib/utils";

export interface LabelProps
    extends ComponentPropsWithoutRef<typeof LabelPrimitive.Root> {
    required?: boolean;
}

export const Label = forwardRef<
    ElementRef<typeof LabelPrimitive.Root>,
    LabelProps
>(({ className, required, children, ...props }, ref) => (
    <LabelPrimitive.Root
        ref={ref}
        className={cn(
            "text-xs font-semibold uppercase tracking-caps text-fg-subtle select-none",
            className,
        )}
        {...props}
    >
        {children}
        {required ? (
            <span aria-hidden className="ml-0.5 text-alert-dot">
                *
            </span>
        ) : null}
    </LabelPrimitive.Root>
));
Label.displayName = "Label";
