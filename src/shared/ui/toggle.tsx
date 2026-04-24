import { forwardRef } from "react";
import type { ComponentPropsWithoutRef, ElementRef } from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib/utils";

export const toggleVariants = cva(
    "inline-flex items-center justify-center gap-2 rounded-md font-display font-semibold transition-all duration-200 ease-[cubic-bezier(0.22,0.61,0.36,1)] outline-none focus-visible:ring-[4px] focus-visible:ring-leaf-100 focus-visible:border-leaf-600 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] bg-transparent text-fg-muted hover:bg-leaf-50 hover:text-leaf-700 data-[state=on]:bg-leaf-50 data-[state=on]:text-leaf-700",
    {
        variants: {
            size: {
                sm: "h-[30px] px-3 text-[13px]",
                md: "h-[38px] px-[14px] text-[15px]",
                lg: "h-[46px] px-[18px] text-[17px]",
            },
        },
        defaultVariants: {
            size: "md",
        },
    },
);

export interface ToggleProps
    extends ComponentPropsWithoutRef<typeof TogglePrimitive.Root>,
        VariantProps<typeof toggleVariants> {}

export const Toggle = forwardRef<
    ElementRef<typeof TogglePrimitive.Root>,
    ToggleProps
>(({ className, size, ...props }, ref) => (
    <TogglePrimitive.Root
        ref={ref}
        className={cn(toggleVariants({ size }), className)}
        {...props}
    />
));
Toggle.displayName = "Toggle";
