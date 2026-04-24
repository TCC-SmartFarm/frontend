import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/shared/lib/utils";

const buttonVariants = cva(
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-md font-display font-semibold whitespace-nowrap transition-all duration-200 ease-[cubic-bezier(0.22,0.61,0.36,1)] outline-none focus-visible:ring-[4px] focus-visible:ring-leaf-100 focus-visible:border-leaf-600 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 disabled:shadow-none",
    {
        variants: {
            variant: {
                primary: "bg-leaf-600 text-white shadow-sm hover:bg-leaf-700 hover:shadow-md active:bg-leaf-800",
                secondary: "bg-white text-fg shadow-sm border border-border-strong hover:bg-sand-50 hover:shadow-md",
                ghost: "bg-transparent text-leaf-700 hover:bg-leaf-50",
                danger: "bg-alert-dot text-white shadow-sm hover:brightness-95 hover:shadow-md",
            },
            size: {
                sm: "h-[30px] px-3 text-[13px] gap-1.5",
                md: "h-[38px] px-[18px] text-[15px]",
                lg: "h-[46px] px-[22px] text-[17px]",
            },
        },
        defaultVariants: {
            variant: "primary",
            size: "md",
        },
    },
);

type ButtonVariantProps = VariantProps<typeof buttonVariants>;

export interface ButtonProps
    extends ButtonHTMLAttributes<HTMLButtonElement>,
        ButtonVariantProps {
    icon?: LucideIcon;
    iconPosition?: "left" | "right";
    asChild?: boolean;
}

const iconSizeFor = (size: ButtonVariantProps["size"]) =>
    size === "sm" ? 14 : 16;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant = "primary",
            size = "md",
            icon: Icon,
            iconPosition = "left",
            asChild = false,
            children,
            ...props
        },
        ref,
    ) => {
        const Comp = asChild ? Slot : "button";
        const iconSize = iconSizeFor(size);
        const iconNode = Icon ? (
            <Icon size={iconSize} strokeWidth={1.75} aria-hidden />
        ) : null;

        return (
            <Comp
                ref={ref}
                className={cn(buttonVariants({ variant, size }), className)}
                {...props}
            >
                {asChild ? (
                    children
                ) : (
                    <>
                        {iconPosition === "left" && iconNode}
                        {children}
                        {iconPosition === "right" && iconNode}
                    </>
                )}
            </Comp>
        );
    },
);
Button.displayName = "Button";

export { buttonVariants };
