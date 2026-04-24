import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib/utils";

const cardVariants = cva(
    "rounded-lg text-fg transition-all duration-200 ease-[cubic-bezier(0.22,0.61,0.36,1)]",
    {
        variants: {
            tone: {
                white: "bg-white shadow-sm",
                sunken: "bg-sand-100",
            },
            padding: {
                none: "p-0",
                sm: "p-4",
                md: "p-6",
                lg: "p-8",
            },
            hoverable: {
                true: "hover:shadow-md hover:-translate-y-px cursor-pointer",
                false: "",
            },
        },
        defaultVariants: {
            tone: "white",
            padding: "md",
            hoverable: false,
        },
    },
);

export interface CardProps
    extends HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof cardVariants> {}

const CardRoot = forwardRef<HTMLDivElement, CardProps>(
    ({ className, tone, padding, hoverable, onClick, ...props }, ref) => (
        <div
            ref={ref}
            onClick={onClick}
            className={cn(
                cardVariants({ tone, padding, hoverable }),
                onClick && !hoverable && "cursor-pointer",
                className,
            )}
            {...props}
        />
    ),
);
CardRoot.displayName = "Card";

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn("flex items-center justify-between gap-3 mb-3", className)}
            {...props}
        />
    ),
);
CardHeader.displayName = "Card.Header";

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn("flex items-center justify-between gap-3 mt-3", className)}
            {...props}
        />
    ),
);
CardFooter.displayName = "Card.Footer";

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
    as?: "h2" | "h3" | "h4";
}
const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
    ({ className, as: Tag = "h3", ...props }, ref) => (
        <Tag
            ref={ref}
            className={cn(
                "font-display text-xl font-semibold text-fg tracking-tight",
                className,
            )}
            {...props}
        />
    ),
);
CardTitle.displayName = "Card.Title";

const CardLabel = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
    ({ className, ...props }, ref) => (
        <span
            ref={ref}
            className={cn(
                "text-xs font-semibold uppercase tracking-caps text-fg-subtle",
                className,
            )}
            {...props}
        />
    ),
);
CardLabel.displayName = "Card.Label";

const CardBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn("text-base text-fg", className)}
            {...props}
        />
    ),
);
CardBody.displayName = "Card.Body";

type CardComponent = typeof CardRoot & {
    Header: typeof CardHeader;
    Title: typeof CardTitle;
    Label: typeof CardLabel;
    Body: typeof CardBody;
    Footer: typeof CardFooter;
};

export const Card = Object.assign(CardRoot, {
    Header: CardHeader,
    Title: CardTitle,
    Label: CardLabel,
    Body: CardBody,
    Footer: CardFooter,
}) as CardComponent;

export { cardVariants };
