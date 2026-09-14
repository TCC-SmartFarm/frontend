import { cn } from "@/shared/lib/utils";
import { Alert } from "@/shared/ui/alert";
import { AlertTriangle, LogIn } from "lucide-react";
import { Logo } from "@/shared/ui/logo"

interface HeroSectionProps {
  onLogin: () => void;
  isLoading: boolean;
  error: Error | null | undefined;
}

export const HeroSection = ({
  onLogin,
  isLoading,
  error,
}: HeroSectionProps) => (
  <>
    {/* Floating pill nav */}
    <nav className="sticky top-3 z-30 flex justify-center px-4 md:top-4 md:px-6">
      {/*
        No celular a barra é logo + botão de entrar, e nada mais. Os três links
        de âncora ficavam em três linhas num aparelho estreito, empurrando a
        pílula para ~140px de altura e cortando o "Entrar" na borda direita.
        Eles não fazem falta ali: a landing é uma página só, rolável.

        O corte é em `md` (768px), não em `sm`: marca, três links e botão somam
        ~580px, que cabem em 640px no papel mas ficam espremidos de verdade.
      */}
      <div
        className={cn(
          "flex w-full items-center justify-between gap-1 rounded-full border border-white/70",
          "bg-white/80 px-2 py-1.5 shadow-md backdrop-blur-xl",
          "md:w-auto md:justify-start md:py-2",
        )}
      >
        <div className="flex items-center gap-2 pl-1 md:border-r md:border-sand-200/60 md:pl-0 md:pr-4">
          <Logo size={20} variant="mark" />
          <span className="font-display text-[15px] font-bold tracking-tight text-fg">
            SmartFarm
          </span>
        </div>

        <div className="hidden items-center gap-1 md:flex">
          {(
            [
              ["#como-funciona", "Como funciona"],
              ["#monitorar", "O que monitora"],
              ["#por-que", "Por que usar"],
            ] as [string, string][]
          ).map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="rounded-full px-3.5 py-1.5 text-[13.5px] font-medium text-fg-muted transition-colors hover:text-fg"
            >
              {label}
            </a>
          ))}
        </div>

        <button
          onClick={onLogin}
          disabled={isLoading}
          // aria-label porque no celular o botão é só o ícone: sem ele o leitor
          // de tela anuncia um botão sem nome.
          aria-label="Entrar"
          aria-busy={isLoading}
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-full font-display text-[13.5px]",
            "font-semibold text-white transition-all",
            "bg-leaf-900 hover:bg-leaf-800 disabled:opacity-50",
            "md:ml-1 md:size-auto md:px-[18px] md:py-2",
          )}
        >
          <LogIn className="size-[18px] md:hidden" aria-hidden />
          <span className="hidden md:inline">{isLoading ? "Carregando…" : "Entrar"}</span>
        </button>
      </div>
    </nav>

    {/* Hero body */}
    <section className="relative mx-auto max-w-[980px] px-6 pb-[70px] pt-[90px] text-center">
      <DecorStar className="absolute left-15 top-20" />
      <DecorStar className="absolute right-20 top-[120px]" />
      <DecorStar className="absolute bottom-8 left-[20%] opacity-50" />

      <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-sand-200/60 bg-white/70 px-3.5 py-1.5 text-[12.5px] font-medium text-fg-muted">
        <span className="size-1.5 rounded-full bg-leaf-600" />
        Plataforma para pequenos e médios produtores
      </div>

      <h1
        className="m-0 font-display font-bold leading-[1.02] tracking-[-0.035em] text-leaf-900"
        style={{ fontSize: "clamp(48px, 7vw, 92px)" }}
      >
        Saiba o que sua terra
        <br />
        precisa, de qualquer lugar.
      </h1>

      <p className="mx-auto mb-9 mt-7 max-w-[580px] text-[17px] leading-[1.55] text-fg-muted">
        Tecnologia acessível, gestão simplificada. Acompanhe as condições de
        solo, clima e luminosidade da sua propriedade em tempo real, direto do
        seu computador, eliminando a necessidade de vistorias manuais
        constantes.
      </p>

      {error && (
        <div className="mx-auto mb-6 max-w-lg">
          <Alert tone="alert" icon={AlertTriangle} title="Erro ao autenticar">
            {error.message}
          </Alert>
        </div>
      )}

      <button
        onClick={onLogin}
        disabled={isLoading}
        className="inline-flex items-center gap-2.5 rounded-full bg-leaf-900 px-8 py-4 font-display text-[15px] font-semibold text-white transition-all hover:bg-leaf-800 disabled:opacity-50"
      >
        Conhecer a plataforma
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          aria-hidden
        >
          <path d="M5 12h14M13 5l7 7-7 7" />
        </svg>
      </button>
    </section>
  </>
);

function DecorStar({ className }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      className={cn("text-leaf-700 opacity-40", className)}
      aria-hidden
    >
      <path
        d="M12 0 L 14 10 L 24 12 L 14 14 L 12 24 L 10 14 L 0 12 L 10 10 Z"
        fill="currentColor"
      />
    </svg>
  );
}
