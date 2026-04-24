import { forwardRef } from "react";
import type { ComponentPropsWithoutRef, ElementRef } from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

import { cn } from "@/shared/lib/utils";

export type CheckboxProps = ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>;

export const Checkbox = forwardRef<
    ElementRef<typeof CheckboxPrimitive.Root>,
    CheckboxProps
>(({ className, ...props }, ref) => (
    <CheckboxPrimitive.Root
        ref={ref}
        className={cn(
            "peer inline-flex size-[18px] shrink-0 items-center justify-center rounded-[5px] border border-border-strong bg-white transition-colors outline-none",
            "focus-visible:ring-[4px] focus-visible:ring-leaf-100 focus-visible:border-leaf-600",
            "data-[state=checked]:bg-leaf-600 data-[state=checked]:border-leaf-600 data-[state=checked]:text-white",
            "data-[state=indeterminate]:bg-leaf-600 data-[state=indeterminate]:border-leaf-600 data-[state=indeterminate]:text-white",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            className,
        )}
        {...props}
    >
        <CheckboxPrimitive.Indicator className="flex items-center justify-center">
            <Check size={12} strokeWidth={2.5} />
        </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
));
Checkbox.displayName = "Checkbox";
