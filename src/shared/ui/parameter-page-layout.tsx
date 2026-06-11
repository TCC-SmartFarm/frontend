import { useMemo } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'
import { Badge } from './badge'
import { Card } from './card'
import { ChartSkeleton } from './chart-skeleton'
import { KpiCardsSkeleton } from './kpi-skeleton'
import { EmptyState } from './empty-state'
import { ErrorState } from './error-state'
import { resolveErrorVariant } from './error-state.helpers'
import { cn } from '@/shared/lib/utils'
import { useSensorsList } from '@/entities/sensor/api/use-sensors-list'
import { useSensorHistory } from '@/entities/reading/api/use-sensor-history'
import { useEnsureHistoryCoverage } from '@/entities/reading/api/use-ensure-history-coverage'
import { detectCoverage } from '@/entities/reading/lib/detect-coverage'
import { downsampleLTTB } from '@/entities/reading/lib/downsample'
import { useSelectedSensorStore } from '@/shared/stores/selected-sensor-store'
import { usePeriodStore } from '@/shared/stores/period-store'
import { periodToDays, periodLabel } from '@/shared/lib/period'
import { useDataAvailabilityToast } from '@/shared/lib/toast'
import { statusForParam, statusLabel as toStatusLabel } from '@/shared/constants/thresholds'
import { PeriodSelector } from '@/features/period-selector/ui/PeriodSelector'
import { SensorSelector } from '@/features/sensor-selector/ui/SensorSelector'
import type { SensorParam } from '@/entities/reading/model/types'

export interface ParamConfig {
  paramKey: SensorParam
  label: string
  unit: string
  icon: LucideIcon
  color: string
  idealMin: number
  idealMax: number
  formatValue?: (v: number) => string
}

interface ChartPoint {
  ts: number // epoch em ms, para o eixo de tempo contínuo do gráfico
  value: number
}

// Acima disso o downsampling LTTB entra para manter o gráfico fluido
const MAX_CHART_POINTS = 600

const HOUR_MS = 3_600_000
const DAY_MS = 86_400_000

const formatTimeLabel = (tsMs: number, days: number): string => {
  const date = new Date(tsMs)
  if (days <= 1) {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }
  if (days <= 31) {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  }
  return date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
}

const formatTooltipDateTime = (tsMs: number): string =>
  new Date(tsMs).toLocaleString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

// Gera ticks alinhados ao calendário (horas cheias, meias-noites ou inícios
// de mês conforme a cobertura real dos dados), limitado a ~8 marcas — com
// eixo numérico os ticks precisam ser explícitos.
const buildTimeTicks = (minMs: number, maxMs: number, spanDays: number): number[] => {
  if (maxMs <= minMs) return [minMs]
  const ticks: number[] = []
  if (spanDays <= 1) {
    const spanHours = Math.ceil((maxMs - minMs) / HOUR_MS)
    const stride = Math.max(1, Math.ceil(spanHours / 6)) * HOUR_MS
    for (let t = Math.ceil(minMs / HOUR_MS) * HOUR_MS; t <= maxMs; t += stride) {
      ticks.push(t)
    }
    return ticks
  }
  if (spanDays > 31) {
    const cursor = new Date(minMs)
    cursor.setHours(0, 0, 0, 0)
    cursor.setDate(1)
    if (cursor.getTime() < minMs) cursor.setMonth(cursor.getMonth() + 1)
    const months: number[] = []
    while (cursor.getTime() <= maxMs) {
      months.push(cursor.getTime())
      cursor.setMonth(cursor.getMonth() + 1)
    }
    if (months.length >= 2) {
      const stride = Math.max(1, Math.ceil(months.length / 8))
      return months.filter((_, i) => i % stride === 0)
    }
    // dados cobrem menos de dois meses: cai nos ticks diários abaixo
  }
  const stride = Math.max(1, Math.round(Math.ceil((maxMs - minMs) / DAY_MS) / 7))
  const midnight = new Date(minMs)
  midnight.setHours(0, 0, 0, 0)
  let t = midnight.getTime()
  if (t < minMs) t += DAY_MS
  for (; t <= maxMs; t += stride * DAY_MS) {
    ticks.push(t)
  }
  return ticks
}

export const ParameterPageLayout = ({ config }: { config: ParamConfig }) => {
  const { paramKey, label, unit, icon: Icon, color, idealMin, idealMax, formatValue } = config
  const fmt = formatValue ?? ((v: number) => String(v))

  const sensorsQuery = useSensorsList()
  const sensors = sensorsQuery.data ?? []
  const selectedId = useSelectedSensorStore((s) => s.selectedSensorId)
  const setSelectedId = useSelectedSensorStore((s) => s.setSelectedSensorId)
  const period = usePeriodStore((s) => s.period)
  const setPeriod = usePeriodStore((s) => s.setPeriod)
  const days = periodToDays(period)

  useEnsureHistoryCoverage(selectedId, days)
  const historyQuery = useSensorHistory(selectedId, days)
  const readings = useMemo(() => historyQuery.data ?? [], [historyQuery.data])

  const coverage = useMemo(() => detectCoverage(readings, days), [readings, days])
  useDataAvailabilityToast(days, readings.length > 0 ? coverage.actualDays : undefined, selectedId)

  const series: ChartPoint[] = useMemo(() => {
    const points = readings
      .map((r) => {
        const value = r.value[paramKey]
        return value !== null && value !== undefined ? { ts: r.timestamp * 1000, value } : null
      })
      .filter((p): p is ChartPoint => p !== null)
    return downsampleLTTB(points, MAX_CHART_POINTS)
  }, [readings, paramKey])

  // Formato dos rótulos segue a cobertura real dos dados, não o período
  // pedido — se há só alguns dias de leituras, rótulos mensais repetiriam.
  const chartSpanDays =
    series.length > 1 ? (series[series.length - 1].ts - series[0].ts) / DAY_MS : 0

  const timeTicks = useMemo(() => {
    if (series.length === 0) return []
    return buildTimeTicks(series[0].ts, series[series.length - 1].ts, chartSpanDays)
  }, [series, chartSpanDays])

  const seriesValues = series.map((p) => p.value)
  const currentValue = seriesValues.length > 0 ? seriesValues[seriesValues.length - 1] : null
  const minVal = seriesValues.length > 0 ? Math.min(...seriesValues) : null
  const maxVal = seriesValues.length > 0 ? Math.max(...seriesValues) : null
  const avgVal =
    seriesValues.length > 0 ? seriesValues.reduce((a, b) => a + b, 0) / seriesValues.length : null

  const status = statusForParam(paramKey, currentValue)
  const statusTone = status === 'ok' ? 'ok' : status === 'warn' ? 'warn' : 'alert'

  const selected = sensors.find((s) => s.deviceId === selectedId) ?? null
  const otherSensors = sensors.filter((s) => s.deviceId !== selectedId).slice(0, 6)

  const isSensorsLoading = sensorsQuery.isPending
  const isHistoryLoading = !!selectedId && historyQuery.isPending && !historyQuery.data

  return (
    <div className="flex flex-col gap-6 p-8" style={{ maxWidth: 1240 }}>
      <div>
        <div className="mb-2 flex items-center gap-2 text-fg-subtle">
          <div
            className="flex size-8 items-center justify-center rounded-lg"
            style={{ background: `${color}22`, color }}
          >
            <Icon size={16} strokeWidth={1.75} aria-hidden />
          </div>
          <span className="text-xs font-semibold uppercase tracking-caps">Parâmetro</span>
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight text-fg">{label}</h1>
        <p className="mt-2 text-base text-fg-muted">
          Acompanhe {label.toLowerCase()} em cada sensor da sua propriedade.{' '}
          <strong>
            Faixa ideal: {idealMin}–{idealMax}
            {unit === 'lux' ? ' ' + unit : unit}
          </strong>
          .
        </p>
      </div>

      {sensorsQuery.error ? (
        <ErrorState
          variant={resolveErrorVariant(sensorsQuery.error)}
          onRetry={() => sensorsQuery.refetch()}
        />
      ) : isSensorsLoading ? (
        <KpiCardsSkeleton count={4} />
      ) : sensors.length === 0 ? (
        <EmptyState variant="no-sensors" />
      ) : (
        <>
          <SensorSelector
            sensors={sensors}
            value={selectedId}
            onChange={setSelectedId}
          />

          {selected && (
            <>
              <div className="grid gap-4" style={{ gridTemplateColumns: '1.3fr 1fr' }}>
                <Card tone="white" padding="none" className="p-7">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-caps text-fg-subtle">
                      Leitura atual · {selected.name}
                    </span>
                    {selected.lastReadingAt && (
                      <Badge tone="leaf" dot>
                        {new Date(selected.lastReadingAt * 1000).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Badge>
                    )}
                  </div>
                  {isHistoryLoading ? (
                    <div className="h-[120px] animate-pulse rounded-md bg-sand-200/70" />
                  ) : currentValue === null ? (
                    <div
                      className="font-data leading-[0.92] tracking-[-0.03em] text-fg-subtle tabular-nums"
                      style={{ fontSize: 'clamp(56px,6vw,104px)' }}
                    >
                      —<span className="ml-2 font-sans text-3xl font-medium text-fg-muted">{unit}</span>
                    </div>
                  ) : (
                    <div
                      className="font-data leading-[0.92] tracking-[-0.03em] text-fg tabular-nums"
                      style={{ fontSize: 'clamp(56px,6vw,104px)' }}
                    >
                      {fmt(currentValue)}
                      <span className="ml-2 font-sans text-3xl font-medium text-fg-muted">{unit}</span>
                    </div>
                  )}
                  {currentValue !== null && (
                    <div className="mt-4">
                      <Badge tone={statusTone} dot>
                        {toStatusLabel(status)}
                      </Badge>
                    </div>
                  )}
                  <div className="mt-5 grid grid-cols-3 gap-3 border-t border-border pt-4">
                    <MiniStat
                      label={`Mínima (${periodLabel(period).toLowerCase()})`}
                      value={minVal !== null ? fmt(minVal) : '—'}
                      unit={unit}
                    />
                    <MiniStat
                      label={`Máxima (${periodLabel(period).toLowerCase()})`}
                      value={maxVal !== null ? fmt(maxVal) : '—'}
                      unit={unit}
                    />
                    <MiniStat
                      label="Média"
                      value={avgVal !== null ? fmt(avgVal) : '—'}
                      unit={unit}
                    />
                  </div>
                </Card>

                <Card tone="white" padding="none" className="p-6">
                  <h3 className="mb-4 font-display text-base font-semibold text-fg">Sobre este sensor</h3>
                  <div className="flex flex-col gap-3 text-sm">
                    <InfoRow label="Identificação">
                      <span className="font-mono text-xs">{selected.deviceId}</span>
                    </InfoRow>
                    {selected.deviceType && (
                      <InfoRow label="Tipo">
                        <Badge tone="leaf" size="sm">
                          {selected.deviceType}
                        </Badge>
                      </InfoRow>
                    )}
                    <InfoRow label="Localização">
                      {selected.latitude !== null && selected.longitude !== null ? (
                        <span className="font-mono text-xs">
                          {selected.latitude.toFixed(4)}, {selected.longitude.toFixed(4)}
                        </span>
                      ) : (
                        <span className="text-fg-subtle">Sem dados</span>
                      )}
                    </InfoRow>
                    <InfoRow label="Bateria">
                      {typeof selected.lastReading?.battery === 'number' ? (
                        <span className="inline-flex items-center gap-1.5 font-semibold">
                          {Math.round(selected.lastReading.battery)}%
                        </span>
                      ) : (
                        <span className="text-fg-subtle">Sem dados</span>
                      )}
                    </InfoRow>
                    <InfoRow label="Última leitura">
                      {selected.lastReadingAt ? (
                        new Date(selected.lastReadingAt * 1000).toLocaleString('pt-BR')
                      ) : (
                        <span className="text-fg-subtle">Sem dados</span>
                      )}
                    </InfoRow>
                  </div>
                </Card>
              </div>

              <Card tone="white" padding="none" className="p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-display text-lg font-semibold text-fg">Histórico</h3>
                    <p className="mt-0.5 text-xs text-fg-subtle">
                      Passe o mouse sobre o gráfico para ver valores.
                    </p>
                  </div>
                  <PeriodSelector value={period} onChange={setPeriod} />
                </div>
                {historyQuery.error ? (
                  <ErrorState
                    variant={resolveErrorVariant(historyQuery.error)}
                    onRetry={() => historyQuery.refetch()}
                  />
                ) : isHistoryLoading ? (
                  <ChartSkeleton height={280} />
                ) : series.length === 0 ? (
                  <EmptyState variant="no-data" />
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={series} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--sf-border)" vertical={false} />
                      <XAxis
                        dataKey="ts"
                        type="number"
                        scale="time"
                        domain={['dataMin', 'dataMax']}
                        ticks={timeTicks}
                        tickFormatter={(ts: number) => formatTimeLabel(ts, chartSpanDays)}
                        tick={{
                          fontSize: 11,
                          fill: 'var(--sf-fg-subtle)',
                          fontFamily: 'var(--sf-font-mono)',
                        }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tick={{
                          fontSize: 11,
                          fill: 'var(--sf-fg-subtle)',
                          fontFamily: 'var(--sf-font-mono)',
                        }}
                        tickLine={false}
                        axisLine={false}
                        width={48}
                      />
                      <Tooltip
                        cursor={{ stroke: 'var(--sf-border)', strokeWidth: 1 }}
                        content={
                          <ChartTooltipContent
                            icon={Icon}
                            paramLabel={label}
                            unit={unit}
                            color={color}
                            fmt={fmt}
                          />
                        }
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={color}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, fill: color, stroke: 'none' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </Card>

              {otherSensors.length > 0 && (
                <Card tone="white" padding="none" className="p-6">
                  <h3 className="mb-4 font-display text-lg font-semibold text-fg">
                    {label} nos outros sensores
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {otherSensors.map((s) => {
                      const value = s.lastReading?.[paramKey] ?? null
                      const st = statusForParam(paramKey, value)
                      const dotClass =
                        st === 'ok' ? 'bg-ok-dot' : st === 'warn' ? 'bg-warn-dot' : 'bg-alert-dot'
                      return (
                        <button
                          key={s.deviceId}
                          type="button"
                          onClick={() => setSelectedId(s.deviceId)}
                          className="flex items-center gap-3 rounded-[10px] border border-border bg-sand-50 px-3.5 py-3 text-left transition-all hover:border-leaf-600 hover:shadow-xs"
                        >
                          <span className={cn('size-2.5 shrink-0 rounded-full', dotClass)} />
                          <div className="min-w-0 flex-1">
                            <div className="truncate font-display text-sm font-semibold text-fg">
                              {s.name}
                            </div>
                            <div className="truncate font-mono text-[11px] text-fg-subtle">
                              {s.deviceId}
                            </div>
                          </div>
                          <div className="shrink-0 font-data text-xl font-semibold tabular-nums text-fg">
                            {value !== null ? fmt(value) : '—'}
                            <span className="ml-0.5 font-sans text-xs font-medium text-fg-muted">
                              {unit}
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </Card>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}

function MiniStat({
  label,
  value,
  unit,
}: {
  label: string
  value: string | number
  unit: string
}) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-caps text-fg-subtle">{label}</div>
      <div className="mt-0.5 font-data text-2xl font-semibold tabular-nums text-fg">
        {value}
        <span className="ml-1 font-sans text-sm font-medium text-fg-muted">{unit}</span>
      </div>
    </div>
  )
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-fg-subtle">{label}</span>
      <span className="text-fg">{children}</span>
    </div>
  )
}

interface ChartTooltipContentProps {
  // injetadas pelo recharts quando o tooltip está ativo
  active?: boolean
  payload?: ReadonlyArray<{ value?: number | string }>
  label?: number
  // configuração do parâmetro exibido
  icon: LucideIcon
  paramLabel: string
  unit: string
  color: string
  fmt: (v: number) => string
}

function ChartTooltipContent({
  active,
  payload,
  label,
  icon: Icon,
  paramLabel,
  unit,
  color,
  fmt,
}: ChartTooltipContentProps) {
  if (!active || !payload || payload.length === 0 || typeof label !== 'number') return null
  const raw = payload[0]?.value
  if (typeof raw !== 'number') return null
  return (
    <div
      className="rounded-[10px] border border-border bg-white px-3.5 py-2.5"
      style={{ boxShadow: 'var(--sf-shadow-sm)', fontFamily: 'var(--sf-font-display)' }}
    >
      <div className="font-mono text-[11px] text-fg-subtle">{formatTooltipDateTime(label)}</div>
      <div className="mt-1.5 flex items-center gap-2 text-[13px]">
        <span
          className="flex size-5 items-center justify-center rounded-md"
          style={{ background: `${color}22`, color }}
        >
          <Icon size={12} strokeWidth={2} aria-hidden />
        </span>
        <span className="text-fg-muted">{paramLabel}</span>
        <span className="font-semibold tabular-nums" style={{ color }}>
          {fmt(raw)} {unit}
        </span>
      </div>
    </div>
  )
}
