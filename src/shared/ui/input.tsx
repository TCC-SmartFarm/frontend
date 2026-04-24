import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

import { cn } from "@/shared/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, error, type = "text", ...props }, ref) => (
        <input
            ref={ref}
            type={type}
            aria-invalid={error || undefined}
            className={cn(
                "w-full font-body text-[15px] px-[14px] py-[10px] rounded-md bg-white text-fg border inset-shadow-sm placeholder:text-fg-faint outline-none transition-colors duration-150",
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
Input.displayName = "Input";
