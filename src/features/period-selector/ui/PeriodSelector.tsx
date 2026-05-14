import { PERIOD_LIST, type Period } from "@/shared/lib/period";
import { cn } from "@/shared/lib/utils";

interface PeriodSelectorProps {
  value: Period;
  onChange: (period: Period) => void;
  disabled?: boolean;
  className?: string;
}

export const PeriodSelector = ({ value, onChange, disabled, className }: PeriodSelectorProps) => (
  <div className={cn("flex gap-1 rounded-[10px] bg-sand-100 p-1", className)} role="tablist">
    {PERIOD_LIST.map((option) => {
      const isActive = option.value === value;
      return (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={isActive}
          disabled={disabled}
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-lg px-3 py-1.5 font-display text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50",
            isActive ? "bg-white text-fg shadow-xs" : "text-fg-muted hover:text-fg",
          )}
        >
          {option.label}
        </button>
      );
    })}
  </div>
);
