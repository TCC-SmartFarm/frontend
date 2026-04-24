import { forwardRef } from "react";
import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import type { NavLinkProps } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/shared/ui/tooltip";

export interface SidebarItemProps
    extends Omit<NavLinkProps, "children" | "className"> {
    icon: LucideIcon;
    label: string;
    badge?: ReactNode;
    collapsed?: boolean;
    className?: string;
}

const baseClasses =
    "group flex items-center gap-3 h-11 px-3 rounded-md text-sm font-medium text-fg-muted transition-colors outline-none hover:bg-leaf-50 hover:text-leaf-700 focus-visible:ring-[4px] focus-visible:ring-leaf-100 aria-[current=page]:bg-leaf-50 aria-[current=page]:text-leaf-700 aria-[current=page]:font-semibold";

export const SidebarItem = forwardRef<HTMLAnchorElement, SidebarItemProps>(
    ({ icon: Icon, label, badge, collapsed, className, to, ...props }, ref) => {
        const link = (
            <NavLink
                ref={ref}
                to={to}
                className={cn(
                    baseClasses,
                    collapsed && "justify-center px-0 w-11",
                    className,
                )}
                {...props}
            >
                <Icon
                    size={20}
                    strokeWidth={1.75}
                    aria-hidden
                    className="shrink-0"
                />
                {!collapsed ? (
                    <>
                        <span className="truncate">{label}</span>
                        {badge ? (
                            <span className="ml-auto">{badge}</span>
                        ) : null}
                    </>
                ) : null}
            </NavLink>
        );

        if (!collapsed) return link;

        return (
            <Tooltip>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right">{label}</TooltipContent>
            </Tooltip>
        );
    },
);
SidebarItem.displayName = "SidebarItem";
