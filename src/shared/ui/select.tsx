import { forwardRef } from "react";
import type { ComponentPropsWithoutRef, ElementRef } from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

import { cn } from "@/shared/lib/utils";

export const Select = SelectPrimitive.Root;
export const SelectGroup = SelectPrimitive.Group;
export const SelectValue = SelectPrimitive.Value;

export const SelectTrigger = forwardRef<
    ElementRef<typeof SelectPrimitive.Trigger>,
    ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
    <SelectPrimitive.Trigger
        ref={ref}
        className={cn(
            "flex w-full items-center justify-between gap-2 rounded-md border border-border-strong bg-white px-[14px] py-[10px] text-[15px] text-fg font-body inset-shadow-sm outline-none transition-colors",
            "data-[placeholder]:text-fg-faint",
            "focus-visible:border-leaf-600 focus-visible:ring-[4px] focus-visible:ring-leaf-100",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            className,
        )}
        {...props}
    >
        {children}
        <SelectPrimitive.Icon asChild>
            <ChevronDown size={16} strokeWidth={1.75} className="text-fg-muted" />
        </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = "SelectTrigger";

export const SelectScrollUpButton = forwardRef<
    ElementRef<typeof SelectPrimitive.ScrollUpButton>,
    ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
    <SelectPrimitive.ScrollUpButton
        ref={ref}
        className={cn("flex cursor-default items-center justify-center py-1", className)}
        {...props}
    >
        <ChevronUp size={14} />
    </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = "SelectScrollUpButton";

export const SelectScrollDownButton = forwardRef<
    ElementRef<typeof SelectPrimitive.ScrollDownButton>,
    ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
    <SelectPrimitive.ScrollDownButton
        ref={ref}
        className={cn("flex cursor-default items-center justify-center py-1", className)}
        {...props}
    >
        <ChevronDown size={14} />
    </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName = "SelectScrollDownButton";

export const SelectContent = forwardRef<
    ElementRef<typeof SelectPrimitive.Content>,
    ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
    <SelectPrimitive.Portal>
        <SelectPrimitive.Content
            ref={ref}
            position={position}
            className={cn(
                "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-lg bg-white shadow-lg",
                "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
                "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
                position === "popper" &&
                    "data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1",
                className,
            )}
            {...props}
        >
            <SelectScrollUpButton />
            <SelectPrimitive.Viewport
                className={cn(
                    "p-1",
                    position === "popper" &&
                        "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]",
                )}
            >
                {children}
            </SelectPrimitive.Viewport>
            <SelectScrollDownButton />
        </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
));
SelectContent.displayName = "SelectContent";

export const SelectLabel = forwardRef<
    ElementRef<typeof SelectPrimitive.Label>,
    ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
    <SelectPrimitive.Label
        ref={ref}
        className={cn(
            "px-3 py-1.5 text-xs font-semibold uppercase tracking-caps text-fg-subtle",
            className,
        )}
        {...props}
    />
));
SelectLabel.displayName = "SelectLabel";

export const SelectItem = forwardRef<
    ElementRef<typeof SelectPrimitive.Item>,
    ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
    <SelectPrimitive.Item
        ref={ref}
        className={cn(
            "relative flex w-full cursor-pointer select-none items-center gap-2 rounded-md py-2 pl-8 pr-3 text-sm text-fg outline-none",
            "focus:bg-leaf-50 focus:text-leaf-700",
            "data-[state=checked]:font-semibold data-[state=checked]:text-leaf-700",
            "data-[disabled]:pointer-events-none data-[disabled]:opacity-40",
            className,
        )}
        {...props}
    >
        <span className="absolute left-2 flex size-4 items-center justify-center">
            <SelectPrimitive.ItemIndicator>
                <Check size={14} strokeWidth={2.5} className="text-leaf-600" />
            </SelectPrimitive.ItemIndicator>
        </span>
        <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
));
SelectItem.displayName = "SelectItem";

export const SelectSeparator = forwardRef<
    ElementRef<typeof SelectPrimitive.Separator>,
    ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
    <SelectPrimitive.Separator
        ref={ref}
        className={cn("-mx-1 my-1 h-px bg-border", className)}
        {...props}
    />
));
SelectSeparator.displayName = "SelectSeparator";
