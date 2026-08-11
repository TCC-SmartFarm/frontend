import { cn } from "@/shared/lib/utils";
import { LoadingIndicator } from "./loading-indicator";

interface LoadingOverlayProps {
  show: boolean;
  message?: string;
}

export const LoadingOverlay = ({ show, message = "Carregando sensores..." }: LoadingOverlayProps) => (
  <div
    className={cn(
      "fixed inset-0 z-[9999] flex items-center justify-center bg-bg/95 backdrop-blur-sm",
      // Na saída o overlay encolhe de leve enquanto some, para o painel parecer
      // chegar em vez de simplesmente aparecer. Mesmo easing do card de hover
      // do mapa, mantendo a linguagem de movimento coerente.
      // `scale` e não `transform`: no Tailwind v4 a utilitária scale-* escreve
      // na propriedade `scale`, e transicionar `transform` não a alcança.
      "transition-[opacity,scale] duration-300 ease-[cubic-bezier(0.2,0.7,0.3,1)]",
      show ? "scale-100 opacity-100" : "pointer-events-none scale-[0.98] opacity-0",
    )}
    aria-hidden={!show}
    role="status"
  >
    <LoadingIndicator message={message} />
  </div>
);
