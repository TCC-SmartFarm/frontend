import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/shared/lib/utils";

const iconButtonVariants = cva(
    "inline-flex shrink-0 items-center justify-center rounded-md transition-all duration-200 ease-[cubic-bezier(0.22,0.61,0.36,1)] outline-none focus-visible:ring-[4px] focus-visible:ring-leaf-100 focus-visible:border-leaf-600 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 disabled:shadow-none",
    {
        variants: {
            variant: {
                primary: "bg-leaf-600 text-white shadow-sm hover:bg-leaf-700 hover:shadow-md active:bg-leaf-800",
                secondary: "bg-white text-fg shadow-sm border border-border-strong hover:bg-sand-50 hover:shadow-md",
                ghost: "bg-transparent text-fg-muted hover:bg-leaf-50 hover:text-leaf-700",
                danger: "bg-alert-dot text-white shadow-sm hover:brightness-95 hover:shadow-md",
            },
            size: {
                sm: "size-[30px]",
                md: "size-[38px]",
                lg: "size-[46px]",
            },
        },
        defaultVariants: {
            variant: "ghost",
            size: "md",
        },
    },
);

export interface IconButtonProps
    extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label">,
        VariantProps<typeof iconButtonVariants> {
    icon: LucideIcon;
    label: string;
}

const iconSizeFor = (size: IconButtonProps["size"]) =>
    size === "sm" ? 16 : size === "lg" ? 22 : 18;

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
    ({ className, variant, size = "md", icon: Icon, label, ...props }, ref) => (
        <button
            ref={ref}
            aria-label={label}
            className={cn(iconButtonVariants({ variant, size }), className)}
            {...props}
        >
            <Icon size={iconSizeFor(size)} strokeWidth={1.75} aria-hidden />
        </button>
    ),
);
IconButton.displayName = "IconButton";
