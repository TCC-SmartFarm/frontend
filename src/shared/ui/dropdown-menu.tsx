/* eslint-disable react-refresh/only-export-components */
import { forwardRef } from "react";
import type { ComponentPropsWithoutRef, ElementRef } from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Check, Circle } from "lucide-react";

import { cn } from "@/shared/lib/utils";

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuGroup = DropdownMenuPrimitive.Group;
export const DropdownMenuPortal = DropdownMenuPrimitive.Portal;
export const DropdownMenuSub = DropdownMenuPrimitive.Sub;
export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

const contentClasses =
    "z-50 min-w-[12rem] rounded-lg bg-white shadow-lg p-1.5 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95";

const itemClasses =
    "relative flex items-center gap-2 rounded-md px-3 py-2 text-sm text-fg cursor-pointer outline-none select-none focus:bg-leaf-50 focus:text-leaf-700 data-[disabled]:opacity-40 data-[disabled]:cursor-not-allowed data-[disabled]:pointer-events-none";

export const DropdownMenuContent = forwardRef<
    ElementRef<typeof DropdownMenuPrimitive.Content>,
    ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 6, ...props }, ref) => (
    <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
            ref={ref}
            sideOffset={sideOffset}
            className={cn(contentClasses, className)}
            {...props}
        />
    </DropdownMenuPrimitive.Portal>
));
DropdownMenuContent.displayName = "DropdownMenuContent";

export const DropdownMenuItem = forwardRef<
    ElementRef<typeof DropdownMenuPrimitive.Item>,
    ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>
>(({ className, ...props }, ref) => (
    <DropdownMenuPrimitive.Item
        ref={ref}
        className={cn(itemClasses, className)}
        {...props}
    />
));
DropdownMenuItem.displayName = "DropdownMenuItem";

export const DropdownMenuLabel = forwardRef<
    ElementRef<typeof DropdownMenuPrimitive.Label>,
    ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label>
>(({ className, ...props }, ref) => (
    <DropdownMenuPrimitive.Label
        ref={ref}
        className={cn(
            "px-3 py-1.5 text-xs font-semibold uppercase tracking-caps text-fg-subtle",
            className,
        )}
        {...props}
    />
));
DropdownMenuLabel.displayName = "DropdownMenuLabel";

export const DropdownMenuSeparator = forwardRef<
    ElementRef<typeof DropdownMenuPrimitive.Separator>,
    ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
    <DropdownMenuPrimitive.Separator
        ref={ref}
        className={cn("-mx-1 my-1 h-px bg-border", className)}
        {...props}
    />
));
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

export const DropdownMenuCheckboxItem = forwardRef<
    ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
    ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
    <DropdownMenuPrimitive.CheckboxItem
        ref={ref}
        className={cn(itemClasses, "pl-8", className)}
        checked={checked}
        {...props}
    >
        <span className="absolute left-2 flex size-4 items-center justify-center">
            <DropdownMenuPrimitive.ItemIndicator>
                <Check size={14} strokeWidth={2.5} />
            </DropdownMenuPrimitive.ItemIndicator>
        </span>
        {children}
    </DropdownMenuPrimitive.CheckboxItem>
));
DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem";

export const DropdownMenuRadioItem = forwardRef<
    ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
    ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
    <DropdownMenuPrimitive.RadioItem
        ref={ref}
        className={cn(itemClasses, "pl-8", className)}
        {...props}
    >
        <span className="absolute left-2 flex size-4 items-center justify-center">
            <DropdownMenuPrimitive.ItemIndicator>
                <Circle size={8} className="fill-leaf-600 text-leaf-600" />
            </DropdownMenuPrimitive.ItemIndicator>
        </span>
        {children}
    </DropdownMenuPrimitive.RadioItem>
));
DropdownMenuRadioItem.displayName = "DropdownMenuRadioItem";
