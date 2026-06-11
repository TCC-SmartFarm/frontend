import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Radio } from "lucide-react";
import { useSensorsList } from "@/entities/sensor/api/use-sensors-list";
import { useSelectedSensorStore } from "@/shared/stores/selected-sensor-store";
import { SENSOR_PARAMETERS, type ParameterMeta } from "@/shared/constants/parameters";
import { ROUTES } from "@/shared/constants/routes";
import { matchesSearch } from "@/shared/lib/search";
import { cn } from "@/shared/lib/utils";
import type { Sensor } from "@/entities/sensor/model/types";

interface SensorResult {
  kind: "sensor";
  sensor: Sensor;
}

interface ParamResult {
  kind: "param";
  key: string;
  meta: ParameterMeta;
}

type SearchResult = SensorResult | ParamResult;

const MAX_SENSOR_RESULTS = 8;

export const SensorSearch = ({ className }: { className?: string }) => {
  const navigate = useNavigate();
  const sensorsQuery = useSensorsList();
  const setSelectedSensorId = useSelectedSensorStore((s) => s.setSelectedSensorId);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const results = useMemo<SearchResult[]>(() => {
    const sensorResults: SearchResult[] = (sensorsQuery.data ?? [])
      .filter((s) => matchesSearch(query, s.name, s.nickname, s.deviceId, s.deviceType))
      .slice(0, MAX_SENSOR_RESULTS)
      .map((sensor) => ({ kind: "sensor" as const, sensor }));
    const paramResults: SearchResult[] = Object.entries(SENSOR_PARAMETERS)
      .filter(([, meta]) => matchesSearch(query, meta.label))
      .map(([key, meta]) => ({ kind: "param" as const, key, meta }));
    return [...sensorResults, ...paramResults];
  }, [sensorsQuery.data, query]);

  // Resultados podem encolher (filtro/carregamento) — mantém o índice válido
  const active = results.length > 0 ? Math.min(activeIndex, results.length - 1) : 0;

  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector(`[data-index="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  // Fecha ao clicar fora
  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  // Atalho Ctrl+K / Cmd+K
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const select = (result: SearchResult) => {
    if (result.kind === "sensor") {
      setSelectedSensorId(result.sensor.deviceId);
      navigate(ROUTES.DASHBOARD_SENSOR.replace(":id", result.sensor.deviceId));
    } else {
      navigate(result.meta.route);
    }
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
  };

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      if (results.length === 0) return;
      const delta = e.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((active + delta + results.length) % results.length);
      return;
    }
    if (e.key === "Enter" && open && results[active]) {
      e.preventDefault();
      select(results[active]);
    }
  };

  const firstParamIndex = results.findIndex((r) => r.kind === "param");

  return (
    <div ref={rootRef} className={cn("relative max-w-[380px] flex-1", className)}>
      <div className="flex items-center gap-2 rounded-[10px] border border-border bg-white px-3.5 py-2 text-fg-subtle transition-colors focus-within:border-leaf-600">
        <Search size={16} strokeWidth={1.75} aria-hidden className="shrink-0" />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls="sensor-search-listbox"
          aria-autocomplete="list"
          aria-label="Buscar sensor ou página"
          placeholder="Buscar sensor, talhão…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onInputKeyDown}
          className="min-w-0 flex-1 bg-transparent text-[14px] text-fg outline-none placeholder:text-fg-subtle"
        />
        <kbd className="hidden shrink-0 rounded border border-border bg-sand-50 px-1.5 py-0.5 font-mono text-[10px] text-fg-subtle lg:inline-block">
          Ctrl K
        </kbd>
      </div>

      {open && (
        <div
          ref={listRef}
          id="sensor-search-listbox"
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 max-h-[340px] overflow-auto rounded-[10px] border border-border bg-white py-1.5"
          style={{ boxShadow: "var(--sf-shadow-sm)" }}
        >
          {sensorsQuery.isPending ? (
            <div className="px-3.5 py-3 text-sm text-fg-subtle">Carregando sensores…</div>
          ) : results.length === 0 ? (
            <div className="px-3.5 py-3 text-sm text-fg-subtle">
              Nenhum resultado para “{query}”.
            </div>
          ) : (
            results.map((result, index) => {
              const isActive = index === active;
              const showSensorsHeading = index === 0 && result.kind === "sensor";
              const showParamsHeading = index === firstParamIndex && result.kind === "param";
              return (
                <div key={result.kind === "sensor" ? result.sensor.deviceId : result.key}>
                  {(showSensorsHeading || showParamsHeading) && (
                    <div className="px-3.5 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.1em] text-fg-subtle">
                      {showSensorsHeading ? "Sensores" : "Páginas"}
                    </div>
                  )}
                  <button
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    data-index={index}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => select(result)}
                    className={cn(
                      "flex w-full items-center gap-2.5 px-3.5 py-2 text-left transition-colors",
                      isActive ? "bg-sand-100" : "bg-transparent",
                    )}
                  >
                    {result.kind === "sensor" ? (
                      <>
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-leaf-600/10 text-leaf-700">
                          <Radio size={14} strokeWidth={1.75} aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-display text-sm font-semibold text-fg">
                            {result.sensor.name}
                          </span>
                          <span className="block truncate font-mono text-[11px] text-fg-subtle">
                            {result.sensor.deviceId}
                            {result.sensor.deviceType && ` · ${result.sensor.deviceType}`}
                          </span>
                        </span>
                      </>
                    ) : (
                      <>
                        <span
                          className="flex size-7 shrink-0 items-center justify-center rounded-lg"
                          style={{ background: `${result.meta.color}22`, color: result.meta.color }}
                        >
                          <result.meta.icon size={14} strokeWidth={1.75} aria-hidden />
                        </span>
                        <span className="flex-1 truncate font-display text-sm font-semibold text-fg">
                          {result.meta.label}
                        </span>
                        <span className="shrink-0 text-[11px] text-fg-subtle">Página</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
