import { ArrowDownRight, ArrowRight, ArrowUpRight, CalendarDays, CloudRain, Droplets, Hourglass, Info } from 'lucide-react'
import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import type { IrrigationResponse } from '@/entities/irrigation/model/types'
import { cn } from '@/shared/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import {
  TREND_SENTENCE,
  irrigationDescription,
  irrigationHeadline,
  irrigationTheme,
  recommendedDayLabel,
  weekdayShort,
} from '../lib/irrigation-theme'

interface IrrigationCardProps {
  data: IrrigationResponse
  sensorName: string
}

const TREND_ICON = {
  increasing: ArrowUpRight,
  decreasing: ArrowDownRight,
  stable: ArrowRight,
} as const

const SOIL_LABEL = {
  dry: 'o solo está seco',
  intermediate: 'o solo está na faixa intermediária',
  wet: 'o solo está úmido',
} as const

const pct = (v: number) => `${Math.round(v)}%`
const mm = (v: number) => `${v.toFixed(v >= 10 ? 0 : 1)} mm`

/**
 * Card aberto ao clicar na faixa do cabeçalho. Bloco de cor sólida, no estilo
 * de widget de clima: a cor e o ícone dizem a situação antes do texto.
 *
 * Cada informação vem como frase com ícone, e não como rótulo + número: o
 * público não tem intimidade com painel de dados, e "Prevista em 24 h · 100%"
 * já foi lido como chance de chuva quando era a umidade do solo.
 */
export const IrrigationCard = ({ data, sensorName }: IrrigationCardProps) => {
  const { irrigation, soil_moisture_prediction: prediction, forecast_summary: summary } = data
  const { icon: Icon, color } = irrigationTheme(irrigation.action)
  const days = data.forecast_today_and_next_5_days
  const readingTime = new Date(data.sensor.timestamp).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="relative overflow-hidden rounded-2xl text-white" style={{ background: color }}>
      {/* Círculos decorativos, como o sol dos widgets de clima. Ficam atrás do
          conteúdo e não recebem clique. */}
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-white/10" />
      <div aria-hidden className="pointer-events-none absolute -right-4 -top-4 size-28 rounded-full bg-white/10" />

      <div className="relative flex flex-col gap-4 p-6">
        <div className="flex items-center justify-between gap-3 text-[11px] font-bold uppercase tracking-[0.1em] text-white/75">
          <span>Irrigação</span>
          <span className="truncate normal-case tracking-normal">{sensorName}</span>
        </div>

        <div className="flex items-start gap-4">
          <Icon size={48} strokeWidth={1.5} aria-hidden className="mt-1 shrink-0" />
          <div className="min-w-0">
            <h3 className="font-display text-2xl font-bold leading-tight tracking-tight">
              {irrigationHeadline(data)}
            </h3>
            <p className="mt-1.5 text-[13px] leading-snug text-white/85">{irrigationDescription(data)}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/20 pt-4">
          <div className="flex items-end gap-3">
            <span className="font-data text-5xl font-semibold leading-none tabular-nums">
              {pct(data.sensor.soil_moisture_kalman_filtered)}
            </span>
            <span className="flex items-start gap-1.5 pb-1 text-[13px] leading-snug text-white/85">
              <Droplets size={15} strokeWidth={2} aria-hidden className="mt-px shrink-0" />
              de umidade no solo agora, ou seja, {SOIL_LABEL[irrigation.soil_status]}
            </span>
          </div>

          <ul className="flex flex-col gap-2 text-[13px] leading-snug">
            <InfoLine icon={TREND_ICON[prediction.trend_status]}>
              {TREND_SENTENCE[prediction.trend_status]} nas últimas leituras
            </InfoLine>
            <InfoLine icon={Hourglass}>
              Ela deve ficar em torno de <strong>{pct(prediction.predicted_at_horizon)}</strong> nas próximas{' '}
              {prediction.horizon_hours} horas
            </InfoLine>
            <InfoLine icon={CloudRain}>
              São esperados <strong>{mm(summary.total_precipitation_mm)}</strong> de chuva somando os próximos 6 dias
            </InfoLine>
            {irrigation.recommended_day && (
              <InfoLine icon={CalendarDays}>
                O melhor dia para irrigar é <strong>{recommendedDayLabel(irrigation.recommended_day)}</strong>
              </InfoLine>
            )}
          </ul>
        </div>

        {/* Faixa de chuva dos 6 dias. A barra é a probabilidade; o dia
            recomendado ganha contorno, para ligar a recomendação à previsão. */}
        <div className="flex flex-col gap-2">
          <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-white/75">
            <CloudRain size={13} strokeWidth={2.25} aria-hidden />
            Chance de chuva nos próximos dias
          </span>
          <div className="grid grid-cols-6 gap-1.5">
            {days.map((day, i) => {
              const recommended = day.date === irrigation.recommended_day
              return (
                <div
                  key={day.date}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-lg bg-white/10 px-1 py-2',
                    recommended && 'ring-2 ring-white',
                  )}
                >
                  <span className="text-[10.5px] font-bold uppercase text-white/80">
                    {i === 0 ? 'Hoje' : weekdayShort(day.date)}
                  </span>
                  <div className="flex h-8 w-2 items-end overflow-hidden rounded-full bg-white/15">
                    <div
                      className="w-full rounded-full bg-white"
                      style={{ height: `${Math.max(4, day.precipitation_probability_percent)}%` }}
                    />
                  </div>
                  <span className="font-data text-[12px] font-semibold tabular-nums">
                    {pct(day.precipitation_probability_percent)}
                  </span>
                  <span className="text-[10px] tabular-nums text-white/70">{mm(day.precipitation_mm)}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Só a origem dos dados fica à vista; os avisos de uso vão no "i",
            para o rodapé não competir com a recomendação. */}
        <div className="flex items-start gap-2 text-[11px] leading-relaxed text-white/70">
          <p>
            Essa recomendação leva em conta a última leitura do sensor, feita às {readingTime}, junto com a
            previsão do tempo para a região da sua plantação
          </p>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label="Mais sobre esta recomendação"
                className="mt-px shrink-0 rounded-full text-white/80 outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-white/60"
              >
                <Info size={15} strokeWidth={2} aria-hidden />
              </button>
            </TooltipTrigger>
            {/* z acima do popover do card (z-[1100]), senão abre por baixo dele. */}
            <TooltipContent side="top" className="z-[1200] max-w-[260px] leading-relaxed">
              {prediction.confidence_status === 'high_uncertainty' &&
                'A estimativa para as próximas horas ainda tem uma margem de erro grande, então encare esses números como uma ideia aproximada. '}
              A recomendação existe para ajudar na decisão, então antes de irrigar vale sempre dar uma conferida no
              campo.
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  )
}

const InfoLine = ({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) => (
  <li className="flex items-start gap-2 text-white/90 [&_strong]:font-semibold [&_strong]:text-white">
    <Icon size={15} strokeWidth={2} aria-hidden className="mt-px shrink-0 text-white/80" />
    <span>{children}</span>
  </li>
)
