import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Wifi, LineChart, MapPin } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/shared/lib/utils";

export type EmptyStateVariant = "no-sensors" | "no-data" | "no-location";

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  icon?: LucideIcon;
  title?: string;
  description?: string;
  action?: { label: string; onClick: () => void } | ReactNode;
  className?: string;
}

const VARIANT_DEFAULTS: Record<EmptyStateVariant, { icon: LucideIcon; title: string; description: string }> = {
  "no-sensors": {
    icon: Wifi,
    title: "Sem sensores cadastrados",
    description: "Configure um sensor pelo aplicativo móvel para começar a monitorar.",
  },
  "no-data": {
    icon: LineChart,
    title: "Sem dados neste período",
    description: "Tente um período maior ou aguarde novas leituras chegarem.",
  },
  "no-location": {
    icon: MapPin,
    title: "Sem localização disponível",
    description: "Nenhum dos seus sensores enviou coordenadas ainda.",
  },
};

export const EmptyState = ({
  variant = "no-sensors",
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) => {
  const defaults = VARIANT_DEFAULTS[variant];
  const Icon = icon ?? defaults.icon;
  const finalTitle = title ?? defaults.title;
  const finalDescription = description ?? defaults.description;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-white p-8 text-center",
        className,
      )}
    >
      <div className="flex size-14 items-center justify-center rounded-full bg-sand-100">
        <Icon size={24} strokeWidth={1.75} className="text-fg-muted" aria-hidden />
      </div>
      <h3 className="font-display text-xl font-bold text-fg">{finalTitle}</h3>
      {finalDescription && (
        <p className="max-w-sm text-sm text-fg-muted">{finalDescription}</p>
      )}
      {action && (
        <div className="mt-2">
          {typeof action === "object" && action !== null && "label" in action ? (
            <Button onClick={action.onClick}>{action.label}</Button>
          ) : (
            action
          )}
        </div>
      )}
    </div>
  );
};
