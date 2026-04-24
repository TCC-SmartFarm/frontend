import { forwardRef } from "react";
import type { ComponentPropsWithoutRef, ElementRef } from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "@/shared/lib/utils";

export type SwitchProps = ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>;

export const Switch = forwardRef<
    ElementRef<typeof SwitchPrimitive.Root>,
    SwitchProps
>(({ className, ...props }, ref) => (
    <SwitchPrimitive.Root
        ref={ref}
        className={cn(
            "relative inline-flex h-6 w-[42px] shrink-0 items-center rounded-full bg-sand-300 transition-colors outline-none",
            "data-[state=checked]:bg-leaf-600",
            "focus-visible:ring-[4px] focus-visible:ring-leaf-100",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            className,
        )}
        {...props}
    >
        <SwitchPrimitive.Thumb
            className={cn(
                "pointer-events-none block size-5 rounded-full bg-white shadow-sm transition-transform",
                "translate-x-0.5 data-[state=checked]:translate-x-[21px]",
            )}
        />
    </SwitchPrimitive.Root>
));
Switch.displayName = "Switch";
