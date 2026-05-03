import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Droplets, Thermometer, Sun, Battery, Wind, CloudRain } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { SENSORS, READINGS, statusFor, statusLabel, type ParamKey } from '@/shared/constants/sensor-mock'
import { cn } from '@/shared/lib/utils'
import { ROUTES } from '@/shared/constants/routes'

interface MetricDef {
  key: ParamKey
  label: string
  unit: string
  icon: LucideIcon
  format?: (v: number) => string
}

const METRICS: MetricDef[] = [
  { key: 'soilMoist', label: 'Umidade do solo',   unit: '%',  icon: Droplets },
  { key: 'soilTemp',  label: 'Temp. do solo',     unit: '°C', icon: Thermometer },
  { key: 'airHumid',  label: 'Umidade do ar',     unit: '%',  icon: CloudRain },
  { key: 'light',     label: 'Luminosidade',      unit: 'lx', icon: Sun, format: (v) => v.toLocaleString('pt-BR') },
  { key: 'airTemp',   label: 'Temp. do ar',       unit: '°C', icon: Wind },
  { key: 'battery',   label: 'Bateria',           unit: '%',  icon: Battery },
]

const STATUS_CLASSES: Record<string, string> = {
  ok:    'border-ok-dot/30    bg-ok-dot/8',
  warn:  'border-warn-dot/30  bg-warn-dot/8',
  alert: 'border-alert-dot/30 bg-alert-dot/8',
}

const ICON_CLASSES: Record<string, string> = {
  ok:    'text-ok-dot',
  warn:  'text-warn-dot',
  alert: 'text-alert-dot',
}

export const SensorDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const sensor = SENSORS.find(s => s.id === id)
  const readings = id ? READINGS[id] : null

  if (!sensor || !readings) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
        <p className="text-fg-muted">Sensor <span className="font-mono">{id}</span> não encontrado.</p>
        <button
          onClick={() => navigate(ROUTES.DASHBOARD_MAP)}
          className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 font-display text-sm font-semibold text-fg hover:bg-sand-50"
        >
          <ArrowLeft size={15} strokeWidth={2} />
          Voltar ao mapa
        </button>
      </div>
    )
  }

  const overallStatus = (() => {
    const statuses = METRICS.map(m => statusFor(m.key, readings[m.key]))
    if (statuses.includes('alert')) return 'alert'
    if (statuses.includes('warn')) return 'warn'
    return 'ok'
  })()

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">

      {/* Back button */}
      <button
        onClick={() => navigate(ROUTES.DASHBOARD_MAP)}
        className="flex items-center gap-1.5 text-sm font-medium text-fg-muted hover:text-fg"
      >
        <ArrowLeft size={15} strokeWidth={2} />
        Voltar ao mapa
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-fg">{sensor.nickname}</h1>
          <p className="mt-0.5 text-sm text-fg-subtle">
            {sensor.name} · {sensor.serial} · {sensor.depth} profundidade · {sensor.crop}
          </p>
          <p className="mt-1 text-xs text-fg-muted">Plantio: {sensor.planted} · Sinal: {sensor.signal}</p>
        </div>
        <Badge
          tone={overallStatus === 'ok' ? 'ok' : overallStatus === 'warn' ? 'warn' : 'alert'}
          size="md"
          dot
        >
          {statusLabel(overallStatus)}
        </Badge>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {METRICS.map(m => {
          const val    = readings[m.key]
          const status = statusFor(m.key, val)
          const display = m.format ? m.format(val) : String(val)

          return (
            <div
              key={m.key}
              className={cn(
                'flex flex-col gap-3 rounded-2xl border p-4',
                STATUS_CLASSES[status],
              )}
            >
              <div className="flex items-center gap-2">
                <m.icon size={16} strokeWidth={1.75} className={cn('shrink-0', ICON_CLASSES[status])} aria-hidden />
                <span className="text-xs font-semibold uppercase tracking-wide text-fg-subtle">
                  {m.label}
                </span>
              </div>

              <div className="font-data text-3xl font-bold tabular-nums leading-none text-fg">
                {display}
                <span className="ml-1 font-sans text-base font-medium text-fg-muted">{m.unit}</span>
              </div>

              <Badge
                tone={status === 'ok' ? 'ok' : status === 'warn' ? 'warn' : 'alert'}
                size="sm"
              >
                {statusLabel(status)}
              </Badge>
            </div>
          )
        })}
      </div>
    </div>
  )
}
