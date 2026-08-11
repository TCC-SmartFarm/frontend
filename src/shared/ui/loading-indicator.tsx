import { Leaf } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface LoadingIndicatorProps {
  message?: string;
  className?: string;
}

/**
 * Anel de carregamento com a folha ao centro.
 *
 * Vive em componente próprio porque é usado em dois lugares que aparecem em
 * sequência — a tela de callback e o overlay do dashboard. Como o desenho e a
 * posição são idênticos nos dois, a troca de rota entre eles passa
 * despercebida: só a mensagem muda.
 */
export const LoadingIndicator = ({ message, className }: LoadingIndicatorProps) => (
  <div className={cn("flex flex-col items-center gap-5", className)}>
    <div className="relative">
      <div className="size-16 animate-spin rounded-full border-4 border-leaf-100 border-t-leaf-600" />
      <div className="absolute inset-0 flex items-center justify-center">
        <Leaf size={26} strokeWidth={2} className="text-leaf-600" aria-hidden />
      </div>
    </div>

    {/* Altura fixa: sem ela, uma mensagem mais longa que quebre em duas linhas
        empurraria o anel para cima e a continuidade entre as telas se perderia.
        A `key` remonta o nó a cada texto novo, disparando a animação de entrada. */}
    <div className="flex h-5 items-center">
      {message && (
        <p
          key={message}
          className="sf-loading-message font-display text-sm font-semibold text-fg-muted"
        >
          {message}
        </p>
      )}
    </div>
  </div>
);
