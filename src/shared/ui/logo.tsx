import { cn } from "@/shared/lib/utils";
import logoFull from "@/shared/assets/logos/smartfarm-logo.png";
import logoMark from "@/shared/assets/logos/smartfarm-mark.png";

/**
 * `full` é a marca oficial inteira. `mark` são os 300px de cima dela — arco do
 * sol e broto, sem as linhas do campo.
 *
 * A redução existe porque o logo completo tem oito vãos brancos entre os raios
 * e cinco entre as linhas do campo. Abaixo de ~40px esses vãos não cabem em
 * pixel nenhum e o desenho vira um borrão esverdeado; medido nos tamanhos reais
 * da interface. Não é arte nova: é recorte do mesmo arquivo, mesma paleta.
 */
type LogoVariant = "full" | "mark";

const ART: Record<LogoVariant, { src: string; width: number; height: number }> = {
  full: { src: logoFull, width: 441, height: 539 },
  mark: { src: logoMark, width: 441, height: 300 },
};

interface LogoProps {
  /** Altura em pixels. A largura acompanha, mantendo a proporção. */
  size?: number;
  /** Use `mark` em qualquer slot abaixo de ~40px. */
  variant?: LogoVariant;
  className?: string;
}

/**
 * A marca oficial do SmartFarm.
 *
 * Entra **sem fundo**, no lugar do círculo verde chapado que existia antes: o
 * arco do sol já fecha o desenho por cima, e o verde do próprio logo sumia
 * contra o verde do círculo.
 */
export const Logo = ({ size = 28, variant = "full", className }: LogoProps) => {
  const art = ART[variant];
  return (
    <img
      src={art.src}
      alt="SmartFarm"
      width={Math.round((size * art.width) / art.height)}
      height={size}
      className={cn("shrink-0 select-none object-contain", className)}
      draggable={false}
    />
  );
};
