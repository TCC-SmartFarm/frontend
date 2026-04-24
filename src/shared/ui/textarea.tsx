import { forwardRef } from "react";
import type { TextareaHTMLAttributes } from "react";

import { cn } from "@/shared/lib/utils";

export interface TextareaProps
    extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, error, ...props }, ref) => (
        <textarea
            ref={ref}
            aria-invalid={error || undefined}
            className={cn(
                "w-full min-h-[80px] resize-y font-body text-[15px] leading-normal px-[14px] py-[10px] rounded-md bg-white text-fg border inset-shadow-sm placeholder:text-fg-faint outline-none transition-colors duration-150",
                "focus-visible:border-leaf-600 focus-visible:ring-[4px] focus-visible:ring-leaf-100",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                error
                    ? "border-alert-dot focus-visible:border-alert-dot focus-visible:ring-alert-bg"
                    : "border-border-strong",
                className,
            )}
            {...props}
        />
    ),
);
Textarea.displayName = "Textarea";
