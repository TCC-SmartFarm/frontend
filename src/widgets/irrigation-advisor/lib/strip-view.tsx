import type { ReactNode } from 'react'
import { Droplets, Sprout, WifiOff } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { irrigationHeadline, irrigationTheme } from './irrigation-theme'
import { countByNeed, maxRainChance, type IrrigationSummary, type SensorIrrigation } from './irrigation-summary'

const NORMAL_COLOR = irrigationTheme('not_needed_now').color
// Sensor sem resposta do MSS não tem ação, então não tem cor de ação: usa a
// mesma terracota do "confira o sensor", que é o que o produtor deve fazer.
export const NO_DATA_COLOR = 'var(--sf-clay-400)'

export interface StripView {
  /** `null` = faixa branca, sem recomendação. */
  color: string | null
  icon: LucideIcon
  headline: string
  detail: ReactNode
  rain: number | null
}

const moisture = (item: SensorIrrigation) => Math.round(item.data!.sensor.soil_moisture_kalman_filtered)

const withDrop = (text: string) => (
  <>
    <Droplets size={12} strokeWidth={2.25} aria-hidden className="shrink-0" />
    {text}
  </>
)

/** O que vai escrito na faixa, para cada situação do resumo. */
export const stripView = (summary: Exclude<IrrigationSummary, { kind: 'loading' }>, total: number): StripView => {
  switch (summary.kind) {
    case 'unavailable':
      return {
        color: null,
        icon: Sprout,
        headline: 'Sem recomendação no momento',
        detail: 'Clique aqui para entender o porquê',
        rain: null,
      }
    case 'all-normal': {
      const [only] = summary.items
      return {
        color: NORMAL_COLOR,
        icon: Sprout,
        headline: total === 1 ? irrigationHeadline(only.data!) : 'Tudo certo por aqui!',
        detail:
          total === 1
            ? withDrop(`${moisture(only)}% de umidade no solo`)
            : withDrop(`Os ${total} sensores estão com o solo úmido`),
        rain: maxRainChance(summary.items),
      }
    }
    case 'single-problem': {
      const { focus } = summary
      if (!focus.data) {
        return {
          color: NO_DATA_COLOR,
          icon: WifiOff,
          headline: 'Um sensor está sem leitura',
          detail: focus.sensor.name,
          rain: null,
        }
      }
      const theme = irrigationTheme(focus.data.irrigation.action)
      return {
        color: theme.color,
        icon: theme.icon,
        headline: irrigationHeadline(focus.data),
        // Com mais de um sensor, a faixa precisa dizer de qual é o aviso.
        detail:
          total === 1
            ? withDrop(`${moisture(focus)}% de umidade no solo`)
            : withDrop(`${focus.sensor.name} · ${moisture(focus)}% de umidade`),
        rain: focus.data.forecast_summary.max_precipitation_probability_percent,
      }
    }
    case 'multi-problem': {
      const [worst] = summary.problems
      const theme = worst.data ? irrigationTheme(worst.data.irrigation.action) : null
      const { irrigate, check } = countByNeed(summary.problems)
      const parts = [
        irrigate > 0 && `${irrigate} para irrigar`,
        check > 0 && `${check} para conferir`,
      ].filter(Boolean)
      return {
        color: theme?.color ?? NO_DATA_COLOR,
        icon: theme?.icon ?? WifiOff,
        // "precisam de atenção" estoura os 370 px da faixa; o card aberto usa a frase longa.
        headline: `${summary.problems.length} sensores pedem atenção`,
        detail: parts.join(' · '),
        rain: maxRainChance(summary.problems),
      }
    }
  }
}
