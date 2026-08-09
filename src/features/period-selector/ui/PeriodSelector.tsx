import { PERIOD_LIST, isPeriodAvailable, type Period } from "@/shared/lib/period";
import { cn } from "@/shared/lib/utils";

interface PeriodSelectorProps {
  value: Period;
  onChange: (period: Period) => void;
  /**
   * Dias de histórico realmente disponíveis para o sensor. Períodos maiores que
   * isso ficam bloqueados. `undefined` = ainda não sabemos (query carregando):
   * nesse caso nada é bloqueado, senão o seletor nasceria todo apagado.
   */
  availableDays?: number;
  className?: string;
}

export const PeriodSelector = ({
  value,
  onChange,
  availableDays,
  className,
}: PeriodSelectorProps) => (
  <div
    className={cn("flex flex-wrap gap-1 rounded-[10px] bg-sand-100 p-1", className)}
    role="tablist"
  >
    {PERIOD_LIST.map((option) => {
      const isActive = option.value === value;
      const isBlocked = !isPeriodAvailable(option, availableDays);
      return (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={isActive}
          // aria-disabled em vez de `disabled`: um botão desabilitado não emite
          // pointer events, então o title explicando o motivo nunca apareceria.
          aria-disabled={isBlocked || undefined}
          title={
            isBlocked ? `Apenas ${availableDays} dias de dados disponíveis` : undefined
          }
          onClick={() => {
            if (!isBlocked) onChange(option.value);
          }}
          className={cn(
            "rounded-lg px-3 py-1.5 font-display text-sm font-semibold transition-all",
            isBlocked
              ? "cursor-not-allowed text-fg-muted opacity-50"
              : isActive
                ? "bg-white text-fg shadow-xs"
                : "text-fg-muted hover:text-fg",
          )}
        >
          {option.label}
        </button>
      );
    })}
  </div>
);
