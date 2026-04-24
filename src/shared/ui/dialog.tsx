import { forwardRef } from "react";
import type { ComponentPropsWithoutRef, ElementRef, HTMLAttributes } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/shared/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const DialogPortal = DialogPrimitive.Portal;

export const DialogOverlay = forwardRef<
    ElementRef<typeof DialogPrimitive.Overlay>,
    ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Overlay
        ref={ref}
        className={cn(
            "fixed inset-0 z-50 bg-[rgba(32,26,19,0.55)] backdrop-blur-sm",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
            className,
        )}
        {...props}
    />
));
DialogOverlay.displayName = "DialogOverlay";

export const DialogContent = forwardRef<
    ElementRef<typeof DialogPrimitive.Content>,
    ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
        showClose?: boolean;
    }
>(({ className, children, showClose = true, ...props }, ref) => (
    <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
            ref={ref}
            className={cn(
                "fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2",
                "rounded-xl bg-white p-6 shadow-xl outline-none",
                "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
                "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
                className,
            )}
            {...props}
        >
            {children}
            {showClose ? (
                <DialogPrimitive.Close
                    aria-label="Fechar"
                    className="absolute right-4 top-4 inline-flex size-8 items-center justify-center rounded-md text-fg-muted outline-none transition-colors hover:bg-sand-100 focus-visible:ring-[4px] focus-visible:ring-leaf-100"
                >
                    <X size={18} strokeWidth={1.75} />
                </DialogPrimitive.Close>
            ) : null}
        </DialogPrimitive.Content>
    </DialogPortal>
));
DialogContent.displayName = "DialogContent";

export const DialogHeader = ({
    className,
    ...props
}: HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("flex flex-col gap-1.5 mb-4", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

export const DialogFooter = ({
    className,
    ...props
}: HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            "flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-6",
            className,
        )}
        {...props}
    />
);
DialogFooter.displayName = "DialogFooter";

export const DialogTitle = forwardRef<
    ElementRef<typeof DialogPrimitive.Title>,
    ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Title
        ref={ref}
        className={cn(
            "font-display text-xl font-semibold text-fg tracking-tight",
            className,
        )}
        {...props}
    />
));
DialogTitle.displayName = "DialogTitle";

export const DialogDescription = forwardRef<
    ElementRef<typeof DialogPrimitive.Description>,
    ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Description
        ref={ref}
        className={cn("text-sm text-fg-muted leading-normal", className)}
        {...props}
    />
));
DialogDescription.displayName = "DialogDescription";
