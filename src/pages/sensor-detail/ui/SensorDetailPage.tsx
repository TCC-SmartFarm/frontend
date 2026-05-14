import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Droplets, Thermometer, Sun, Battery, Wind, CloudRain } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { EmptyState } from '@/shared/ui/empty-state'
import { ErrorState } from '@/shared/ui/error-state'
import { resolveErrorVariant } from '@/shared/ui/error-state.helpers'
import { Skeleton } from '@/shared/ui/skeleton'
import { useSensorsList } from '@/entities/sensor/api/use-sensors-list'
import { statusForParam, statusLabel, type Status } from '@/shared/constants/thresholds'
import { cn } from '@/shared/lib/utils'
import { ROUTES } from '@/shared/constants/routes'
import type { SensorPayload } from '@/entities/sensor/model/types'
import type { SensorParam } from '@/entities/reading/model/types'

interface MetricDef {
  key: SensorParam
  label: string
  unit: string
  icon: LucideIcon
  format?: (v: number) => string
}

const METRICS: MetricDef[] = [
  { key: 'soil_moisture', label: 'Umidade do solo', unit: '%', icon: Droplets, format: (v) => Math.round(v).toString() },
  { key: 'soil_temperature', label: 'Temp. do solo', unit: '°C', icon: Thermometer, format: (v) => v.toFixed(1) },
  { key: 'air_humidity', label: 'Umidade do ar', unit: '%', icon: CloudRain, format: (v) => Math.round(v).toString() },
  { key: 'luminosity', label: 'Luminosidade', unit: 'lx', icon: Sun, format: (v) => Math.round(v).toLocaleString('pt-BR') },
  { key: 'air_temperature', label: 'Temp. do ar', unit: '°C', icon: Wind, format: (v) => v.toFixed(1) },
  { key: 'battery', label: 'Bateria', unit: '%', icon: Battery, format: (v) => Math.round(v).toString() },
]

const STATUS_CLASSES: Record<Status, string> = {
  ok: 'border-ok-dot/30 bg-ok-dot/8',
  warn: 'border-warn-dot/30 bg-warn-dot/8',
  alert: 'border-alert-dot/30 bg-alert-dot/8',
}

const ICON_CLASSES: Record<Status, string> = {
  ok: 'text-ok-dot',
  warn: 'text-warn-dot',
  alert: 'text-alert-dot',
}

export const SensorDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const sensorsQuery = useSensorsList()

  if (sensorsQuery.error) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <ErrorState
          variant={resolveErrorVariant(sensorsQuery.error)}
          onRetry={() => sensorsQuery.refetch()}
        />
      </div>
    )
  }

  if (sensorsQuery.isPending) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 p-6">
        <Skeleton className="h-5 w-32" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  const sensors = sensorsQuery.data ?? []
  const sensor = sensors.find((s) => s.deviceId === id)

  if (!sensor) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 p-6">
        <button
          type="button"
          onClick={() => navigate(ROUTES.DASHBOARD_MAP)}
          className="flex items-center gap-1.5 text-sm font-medium text-fg-muted hover:text-fg"
        >
          <ArrowLeft size={15} strokeWidth={2} />
          Voltar ao mapa
        </button>
        <ErrorState
          variant="notFound"
          description={`O sensor ${id} não está disponível na sua conta.`}
        />
      </div>
    )
  }

  const reading = sensor.lastReading ?? ({} as Partial<SensorPayload>)
  const hasAnyValue = METRICS.some((m) => {
    const v = reading[m.key]
    return v !== null && v !== undefined
  })

  const overallStatus: Status = (() => {
    const statuses = METRICS.map((m) => statusForParam(m.key, reading[m.key] ?? null))
    if (statuses.includes('alert')) return 'alert'
    if (statuses.includes('warn')) return 'warn'
    return 'ok'
  })()

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <button
        type="button"
        onClick={() => navigate(ROUTES.DASHBOARD_MAP)}
        className="flex items-center gap-1.5 text-sm font-medium text-fg-muted hover:text-fg"
      >
        <ArrowLeft size={15} strokeWidth={2} />
        Voltar ao mapa
      </button>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-fg">{sensor.name}</h1>
          <p className="mt-0.5 font-mono text-xs text-fg-subtle">
            {sensor.deviceId}
            {sensor.deviceType && ` · ${sensor.deviceType}`}
          </p>
          {sensor.lastReadingAt && (
            <p className="mt-1 text-xs text-fg-muted">
              Última leitura: {new Date(sensor.lastReadingAt * 1000).toLocaleString('pt-BR')}
            </p>
          )}
        </div>
        {hasAnyValue && (
          <Badge tone={overallStatus} size="md" dot>
            {statusLabel(overallStatus)}
          </Badge>
        )}
      </div>

      {!hasAnyValue ? (
        <EmptyState
          variant="no-data"
          title="Sem leituras recentes"
          description="Este sensor ainda não enviou dados. Aguarde a próxima leitura."
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {METRICS.map((m) => {
            const val = reading[m.key] ?? null
            const status = statusForParam(m.key, val)
            const display = val !== null && val !== undefined ? (m.format ? m.format(val) : String(val)) : '—'

            return (
              <div
                key={m.key}
                className={cn(
                  'flex flex-col gap-3 rounded-2xl border p-4',
                  val !== null && val !== undefined ? STATUS_CLASSES[status] : 'border-border bg-sand-50',
                )}
              >
                <div className="flex items-center gap-2">
                  <m.icon
                    size={16}
                    strokeWidth={1.75}
                    className={cn(
                      'shrink-0',
                      val !== null && val !== undefined ? ICON_CLASSES[status] : 'text-fg-subtle',
                    )}
                    aria-hidden
                  />
                  <span className="text-xs font-semibold uppercase tracking-wide text-fg-subtle">
                    {m.label}
                  </span>
                </div>

                <div className="font-data text-3xl font-bold tabular-nums leading-none text-fg">
                  {display}
                  <span className="ml-1 font-sans text-base font-medium text-fg-muted">{m.unit}</span>
                </div>

                {val !== null && val !== undefined && (
                  <Badge tone={status} size="sm">
                    {statusLabel(status)}
                  </Badge>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
