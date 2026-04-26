import { useState, useMemo } from 'react'
import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Battery, Wifi } from 'lucide-react'
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
import { cn } from '../lib/utils'
import {
  SENSORS,
  READINGS,
  seriesFor,
  statusFor,
  statusLabel,
  type ParamKey,
} from '../constants/sensor-mock'

export interface ParamConfig {
  paramKey: ParamKey
  label: string
  unit: string
  icon: LucideIcon
  color: string
  idealMin: number
  idealMax: number
  formatValue?: (v: number) => string
}

export const ParameterPageLayout = ({ config }: { config: ParamConfig }) => {
  const { paramKey, label, unit, icon: Icon, color, idealMin, idealMax, formatValue } = config
  const fmt = formatValue ?? ((v: number) => String(v))

  const [sensorId, setSensorId] = useState(SENSORS[0].id)
  const [range, setRange] = useState('24h')

  const sensor = SENSORS.find((s) => s.id === sensorId) ?? SENSORS[0]
  const currentValue = READINGS[sensor.id]?.[paramKey] ?? 0
  const status = statusFor(paramKey, currentValue)
  const series = useMemo(() => seriesFor(paramKey, sensor.id, range), [paramKey, sensor.id, range])

  const seriesValues = series.map((p) => p.value)
  const minVal = Math.min(...seriesValues).toFixed(1)
  const maxVal = Math.max(...seriesValues).toFixed(1)

  const statusTone = status === 'ok' ? 'ok' : status === 'warn' ? 'warn' : 'alert'
  const otherSensors = SENSORS.filter((s) => s.id !== sensor.id).slice(0, 6)

  return (
    <div className="flex flex-col gap-6 p-8" style={{ maxWidth: 1240 }}>
      {/* Page header */}
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

      {/* Sensor selector */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-caps text-fg-subtle">Sensor</span>
        <div className="flex flex-wrap gap-2">
          {SENSORS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSensorId(s.id)}
              className={cn(
                'rounded-full px-3 py-1.5 font-display text-sm font-semibold transition-all',
                s.id === sensorId
                  ? 'bg-leaf-600 text-white shadow-xs'
                  : 'border border-border bg-bg-raised text-fg-muted hover:border-leaf-600 hover:text-fg',
              )}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Hero grid */}
      <div className="grid gap-4" style={{ gridTemplateColumns: '1.3fr 1fr' }}>
        {/* Current reading card */}
        <Card tone="white" padding="none" className="p-7">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-caps text-fg-subtle">
              Leitura atual · {sensor.name}
            </span>
            <Badge tone="leaf" dot>Online</Badge>
          </div>
          <div
            className="font-data leading-[0.92] tracking-[-0.03em] text-fg tabular-nums"
            style={{ fontSize: 'clamp(56px,6vw,104px)' }}
          >
            {fmt(currentValue)}
            <span className="ml-2 font-sans text-3xl font-medium text-fg-muted">{unit}</span>
          </div>
          <div className="mt-4">
            <Badge tone={statusTone} dot>{statusLabel(status)}</Badge>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3 border-t border-border pt-4">
            <MiniStat label={`Mínima (${range})`} value={minVal} unit={unit} />
            <MiniStat label={`Máxima (${range})`} value={maxVal} unit={unit} />
            <MiniStat label="Faixa ideal" value={`${idealMin}–${idealMax}`} unit={unit} />
          </div>
        </Card>

        {/* Sensor info card */}
        <Card tone="white" padding="none" className="p-6">
          <h3 className="mb-4 font-display text-base font-semibold text-fg">Sobre este sensor</h3>
          <div className="flex flex-col gap-3 text-sm">
            <InfoRow label="Talhão"><span className="font-semibold">{sensor.name}</span></InfoRow>
            <InfoRow label="Cultivo"><Badge tone="leaf" size="sm">{sensor.crop}</Badge></InfoRow>
            <InfoRow label="Plantado em">{sensor.planted}</InfoRow>
            <InfoRow label="Profundidade">{sensor.depth}</InfoRow>
            <InfoRow label="Bateria">
              <span className="inline-flex items-center gap-1.5 font-semibold">
                <Battery
                  size={14}
                  strokeWidth={1.75}
                  aria-hidden
                  className={sensor.battery < 25 ? 'text-alert-dot' : 'text-leaf-700'}
                />
                {sensor.battery}%
              </span>
            </InfoRow>
            <InfoRow label="Sinal">
              <span className="inline-flex items-center gap-1.5 font-semibold">
                <Wifi size={14} strokeWidth={1.75} aria-hidden className="text-leaf-700" />
                {sensor.signal}
              </span>
            </InfoRow>
            <InfoRow label="Código">
              <span className="font-mono text-xs">{sensor.serial}</span>
            </InfoRow>
          </div>
        </Card>
      </div>

      {/* Chart card */}
      <Card tone="white" padding="none" className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold text-fg">Histórico</h3>
            <p className="mt-0.5 text-xs text-fg-subtle">Passe o mouse sobre o gráfico para ver valores.</p>
          </div>
          <div className="flex gap-1 rounded-[10px] bg-sand-100 p-1">
            {(['24h', '7 dias', '30 dias'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={cn(
                  'rounded-lg px-3.5 py-1.5 font-display text-sm font-semibold transition-all',
                  range === r ? 'bg-white text-fg shadow-xs' : 'text-fg-muted hover:text-fg',
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={series} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--sf-border)" vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 11, fill: 'var(--sf-fg-subtle)', fontFamily: 'var(--sf-font-mono)' }}
              tickLine={false}
              axisLine={false}
              interval={Math.floor(series.length / 6)}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--sf-fg-subtle)', fontFamily: 'var(--sf-font-mono)' }}
              tickLine={false}
              axisLine={false}
              width={48}
            />
            <Tooltip
              contentStyle={{
                background: '#fff',
                border: '1px solid var(--sf-border)',
                borderRadius: 10,
                boxShadow: 'var(--sf-shadow-sm)',
                fontFamily: 'var(--sf-font-display)',
                fontSize: 13,
              }}
              formatter={(value: unknown) => [`${value ?? ''} ${unit}`, label]}
              labelStyle={{ color: 'var(--sf-fg-subtle)', fontSize: 11 }}
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
      </Card>

      {/* Other sensors */}
      <Card tone="white" padding="none" className="p-6">
        <h3 className="mb-4 font-display text-lg font-semibold text-fg">
          {label} nos outros sensores
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {otherSensors.map((s) => {
            const v = READINGS[s.id]?.[paramKey] ?? 0
            const st = statusFor(paramKey, v)
            const dotClass =
              st === 'ok' ? 'bg-ok-dot' : st === 'warn' ? 'bg-warn-dot' : 'bg-alert-dot'
            return (
              <button
                key={s.id}
                onClick={() => setSensorId(s.id)}
                className="flex items-center gap-3 rounded-[10px] border border-border bg-sand-50 px-3.5 py-3 text-left transition-all hover:border-leaf-600 hover:shadow-xs"
              >
                <span className={cn('size-2.5 shrink-0 rounded-full', dotClass)} />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-display text-sm font-semibold text-fg">{s.name}</div>
                  <div className="text-xs text-fg-subtle">{s.crop}</div>
                </div>
                <div className="shrink-0 font-data text-xl font-semibold tabular-nums text-fg">
                  {fmt(v)}
                  <span className="ml-0.5 font-sans text-xs font-medium text-fg-muted">{unit}</span>
                </div>
              </button>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

function MiniStat({ label, value, unit }: { label: string; value: string | number; unit: string }) {
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

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-fg-subtle">{label}</span>
      <span className="text-fg">{children}</span>
    </div>
  )
}
