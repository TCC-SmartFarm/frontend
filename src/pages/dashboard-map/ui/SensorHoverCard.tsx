import { evaluateParam, type ParamThresholdMap } from '@/shared/constants/thresholds'
import { cn } from '@/shared/lib/utils'
import { METRICS, formatMetric } from './metrics'
import { PIN_COLORS, PIN_PARAM_PRIORITY } from './sensor-pin'
import type { Sensor, SensorPayload } from '@/entities/sensor/model/types'
import type { SensorParam } from '@/entities/reading/model/types'

/**
 * Sujeito da frase do aviso. Todos femininos em pt-BR, então "está baixa/alta"
 * concorda sem precisar de gênero por parâmetro.
 */
const PARAM_SUBJECT: Record<SensorParam, string> = {
  battery: 'A bateria',
  soil_moisture: 'A umidade do solo',
  air_humidity: 'A umidade do ar',
  soil_temperature: 'A temperatura do solo',
  air_temperature: 'A temperatura do ar',
  luminosity: 'A luminosidade',
}

interface Issue {
  param: SensorParam
  tone: 'warn' | 'alert'
  message: string
}

/**
 * O aviso mostrado é o mesmo parâmetro que definiu o ícone do pin (mesma ordem
 * de prioridade), para o card explicar o que o mapa já está sinalizando.
 */
const topIssue = (
  reading: Partial<SensorPayload>,
  thresholds: ParamThresholdMap,
): Issue | null => {
  let warn: Issue | null = null
  for (const param of PIN_PARAM_PRIORITY) {
    const { status, side } = evaluateParam(thresholds, param, reading[param] ?? null)
    if (status === 'ok') continue
    const message =
      status === 'warn'
        ? `${PARAM_SUBJECT[param]} está perto do limite`
        : `${PARAM_SUBJECT[param]} está ${side === 'low' ? 'baixa' : 'alta'}`
    if (status === 'alert') return { param, tone: 'alert', message }
    warn ??= { param, tone: 'warn', message }
  }
  return warn
}

interface SensorHoverCardProps {
  sensor: Sensor
  thresholds: ParamThresholdMap
  /** Posição do pin dentro do container do mapa, em pixels. */
  x: number
  y: number
}

export const SensorHoverCard = ({ sensor, thresholds, x, y }: SensorHoverCardProps) => {
  const reading = sensor.lastReading ?? {}
  const issue = topIssue(reading, thresholds)
  const IssueIcon = issue ? METRICS.find((m) => m.key === issue.param)?.icon : undefined

  return (
    <div className="sf-hovercard" style={{ left: x, top: y }}>
      <div className="sf-hovercard__body">
        <div className="sf-hovercard__text">
          <div className="truncate font-display text-[17px] font-bold leading-tight text-fg">
            {sensor.name}
          </div>
          <div className="mt-0.5 truncate font-mono text-[10.5px] text-fg-subtle">
            {sensor.devEUI}
          </div>
        </div>

        {issue && IssueIcon && (
          <div
            className="sf-hovercard__text mt-2.5 flex items-center gap-2.5 rounded-xl px-2.5 py-2"
            style={{ background: PIN_COLORS[issue.tone] }}
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-white">
              <IssueIcon
                size={15}
                strokeWidth={2.4}
                style={{ color: PIN_COLORS[issue.tone] }}
                aria-hidden
              />
            </span>
            <span className="text-[12px] font-semibold leading-tight text-white">
              {issue.message}
            </span>
          </div>
        )}

        <div className="mt-2.5 grid grid-cols-3 gap-1.5">
          {METRICS.map((m) => {
            const value = reading[m.key] ?? null
            const status = evaluateParam(thresholds, m.key, value).status
            const iconCls =
              status === 'ok'
                ? 'text-ok-dot'
                : status === 'warn'
                  ? 'text-warn-dot'
                  : 'text-alert-dot'
            return (
              <div
                key={m.key}
                // Sem o rótulo, o ícone é a única pista do parâmetro — o title
                // devolve o nome para leitores de tela e para o hover do sistema.
                title={m.label}
                className="flex items-center gap-1.5 rounded-[8px] border border-border/50 bg-sand-50 px-2 py-2"
              >
                <m.icon size={15} strokeWidth={2} className={cn('shrink-0', iconCls)} aria-hidden />
                <span className="sf-hovercard__text truncate font-data text-[14px] font-bold tabular-nums leading-none text-fg">
                  {formatMetric(m, value)}
                  <span className="ml-0.5 font-sans text-[9.5px] font-medium text-fg-muted">
                    {m.unit}
                  </span>
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
