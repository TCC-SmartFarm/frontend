import type { LucideIcon } from "lucide-react";
import { AlertTriangle, WifiOff, SearchX, ServerCrash, RotateCw } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/shared/lib/utils";
import type { ErrorVariant } from "./error-state.helpers";

interface ErrorStateProps {
  variant?: ErrorVariant;
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

const VARIANT_DEFAULTS: Record<ErrorVariant, { icon: LucideIcon; title: string; description: string }> = {
  generic: {
    icon: AlertTriangle,
    title: "Algo deu errado",
    description: "Não foi possível carregar os dados. Tente novamente.",
  },
  network: {
    icon: WifiOff,
    title: "Sem conexão",
    description: "Não conseguimos falar com o servidor. Verifique sua conexão e tente de novo.",
  },
  notFound: {
    icon: SearchX,
    title: "Sensor não encontrado",
    description: "O sensor solicitado não está disponível.",
  },
  server: {
    icon: ServerCrash,
    title: "Erro no servidor",
    description: "Algo deu errado do nosso lado. Tente novamente em instantes.",
  },
};

export const ErrorState = ({
  variant = "generic",
  title,
  description,
  onRetry,
  className,
}: ErrorStateProps) => {
  const defaults = VARIANT_DEFAULTS[variant];
  const Icon = defaults.icon;
  const finalTitle = title ?? defaults.title;
  const finalDescription = description ?? defaults.description;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-white p-8 text-center",
        className,
      )}
    >
      <div className="flex size-14 items-center justify-center rounded-full bg-alert-bg">
        <Icon size={24} strokeWidth={1.75} className="text-alert-fg" aria-hidden />
      </div>
      <h3 className="font-display text-xl font-bold text-fg">{finalTitle}</h3>
      {finalDescription && (
        <p className="max-w-sm text-sm text-fg-muted">{finalDescription}</p>
      )}
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} className="mt-2 gap-1.5">
          <RotateCw size={14} strokeWidth={2} aria-hidden />
          Tentar novamente
        </Button>
      )}
    </div>
  );
};

