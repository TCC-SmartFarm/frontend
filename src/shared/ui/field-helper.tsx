import { forwardRef } from "react";
import type { HTMLAttributes } from "react";

import { cn } from "@/shared/lib/utils";

export const FieldHelper = forwardRef<
    HTMLSpanElement,
    HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
    <span
        ref={ref}
        className={cn("text-xs text-fg-subtle mt-1.5 block", className)}
        {...props}
    />
));
FieldHelper.displayName = "FieldHelper";

export const FieldError = forwardRef<
    HTMLSpanElement,
    HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
    <span
        ref={ref}
        role="alert"
        className={cn("text-xs text-alert-fg mt-1.5 block", className)}
        {...props}
    />
));
FieldError.displayName = "FieldError";
