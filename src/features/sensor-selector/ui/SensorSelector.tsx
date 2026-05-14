import { Badge } from "@/shared/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { cn } from "@/shared/lib/utils";
import type { Sensor } from "@/entities/sensor/model/types";

interface SensorSelectorProps {
  sensors: Sensor[];
  value: string | null;
  onChange: (deviceId: string) => void;
  className?: string;
}

export const SensorSelector = ({ sensors, value, onChange, className }: SensorSelectorProps) => {
  if (sensors.length === 0) return null;

  if (sensors.length === 1) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <span className="text-xs font-semibold uppercase tracking-caps text-fg-subtle">Sensor</span>
        <Badge tone="leaf">{sensors[0].name}</Badge>
      </div>
    );
  }

  if (sensors.length <= 5) {
    return (
      <div className={cn("flex flex-wrap items-center gap-3", className)}>
        <span className="text-xs font-semibold uppercase tracking-caps text-fg-subtle">Sensor</span>
        <div className="flex flex-wrap gap-2">
          {sensors.map((s) => (
            <button
              key={s.deviceId}
              type="button"
              onClick={() => onChange(s.deviceId)}
              className={cn(
                "rounded-full px-3 py-1.5 font-display text-sm font-semibold transition-all",
                s.deviceId === value
                  ? "bg-leaf-600 text-white shadow-xs"
                  : "border border-border bg-bg-raised text-fg-muted hover:border-leaf-600 hover:text-fg",
              )}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="text-xs font-semibold uppercase tracking-caps text-fg-subtle">Sensor</span>
      <Select value={value ?? undefined} onValueChange={onChange}>
        <SelectTrigger className="w-[260px]">
          <SelectValue placeholder="Selecione um sensor" />
        </SelectTrigger>
        <SelectContent>
          {sensors.map((s) => (
            <SelectItem key={s.deviceId} value={s.deviceId}>
              {s.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
