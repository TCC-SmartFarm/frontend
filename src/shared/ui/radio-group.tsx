import { forwardRef } from "react";
import type { ComponentPropsWithoutRef, ElementRef } from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";

import { cn } from "@/shared/lib/utils";

export type RadioGroupProps = ComponentPropsWithoutRef<
    typeof RadioGroupPrimitive.Root
>;

export const RadioGroup = forwardRef<
    ElementRef<typeof RadioGroupPrimitive.Root>,
    RadioGroupProps
>(({ className, ...props }, ref) => (
    <RadioGroupPrimitive.Root
        ref={ref}
        className={cn("flex flex-col gap-2", className)}
        {...props}
    />
));
RadioGroup.displayName = "RadioGroup";

export type RadioGroupItemProps = ComponentPropsWithoutRef<
    typeof RadioGroupPrimitive.Item
>;

export const RadioGroupItem = forwardRef<
    ElementRef<typeof RadioGroupPrimitive.Item>,
    RadioGroupItemProps
>(({ className, ...props }, ref) => (
    <RadioGroupPrimitive.Item
        ref={ref}
        className={cn(
            "inline-flex size-[18px] shrink-0 items-center justify-center rounded-full border border-border-strong bg-white outline-none transition-colors",
            "focus-visible:ring-[4px] focus-visible:ring-leaf-100 focus-visible:border-leaf-600",
            "data-[state=checked]:border-leaf-600",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            className,
        )}
        {...props}
    >
        <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
            <span className="size-2 rounded-full bg-leaf-600" />
        </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
));
RadioGroupItem.displayName = "RadioGroupItem";
