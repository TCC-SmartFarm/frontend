import { createContext, forwardRef, useContext } from "react";
import type { ComponentPropsWithoutRef, ElementRef } from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import type { VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib/utils";
import { toggleVariants } from "./toggle";

type ToggleGroupContextValue = VariantProps<typeof toggleVariants>;

const ToggleGroupContext = createContext<ToggleGroupContextValue>({
    size: "md",
});

export type ToggleGroupProps =
    ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> &
        ToggleGroupContextValue;

export const ToggleGroup = forwardRef<
    ElementRef<typeof ToggleGroupPrimitive.Root>,
    ToggleGroupProps
>(({ className, size, children, ...props }, ref) => (
    <ToggleGroupPrimitive.Root
        ref={ref}
        className={cn(
            "inline-flex items-center gap-1 rounded-md bg-sand-100 p-1",
            className,
        )}
        {...props}
    >
        <ToggleGroupContext.Provider value={{ size }}>
            {children}
        </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
));
ToggleGroup.displayName = "ToggleGroup";

export type ToggleGroupItemProps = ComponentPropsWithoutRef<
    typeof ToggleGroupPrimitive.Item
> &
    ToggleGroupContextValue;

export const ToggleGroupItem = forwardRef<
    ElementRef<typeof ToggleGroupPrimitive.Item>,
    ToggleGroupItemProps
>(({ className, children, size, ...props }, ref) => {
    const ctx = useContext(ToggleGroupContext);
    const resolvedSize = size ?? ctx.size ?? "md";
    return (
        <ToggleGroupPrimitive.Item
            ref={ref}
            className={cn(
                "inline-flex items-center justify-center gap-1.5 rounded-sm px-3 py-1.5 text-sm font-semibold text-fg-muted transition-colors outline-none",
                "hover:text-fg",
                "data-[state=on]:bg-white data-[state=on]:text-fg data-[state=on]:shadow-sm",
                "focus-visible:ring-[4px] focus-visible:ring-leaf-100",
                "disabled:opacity-40 disabled:cursor-not-allowed",
                resolvedSize === "sm" && "h-7 text-xs px-2.5",
                resolvedSize === "lg" && "h-9 text-base px-4",
                className,
            )}
            {...props}
        >
            {children}
        </ToggleGroupPrimitive.Item>
    );
});
ToggleGroupItem.displayName = "ToggleGroupItem";
