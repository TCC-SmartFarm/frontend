import { forwardRef } from "react";
import type { ComponentPropsWithoutRef, ElementRef } from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";

import { cn } from "@/shared/lib/utils";

export type SeparatorProps = ComponentPropsWithoutRef<
    typeof SeparatorPrimitive.Root
>;

export const Separator = forwardRef<
    ElementRef<typeof SeparatorPrimitive.Root>,
    SeparatorProps
>(
    (
        { className, orientation = "horizontal", decorative = true, ...props },
        ref,
    ) => (
        <SeparatorPrimitive.Root
            ref={ref}
            decorative={decorative}
            orientation={orientation}
            className={cn(
                "shrink-0 bg-border",
                orientation === "horizontal" ? "h-px w-full" : "w-px h-full",
                className,
            )}
            {...props}
        />
    ),
);
Separator.displayName = "Separator";
