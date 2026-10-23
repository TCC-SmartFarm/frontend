import type { IrrigationSummary, SensorIrrigation } from '../lib/irrigation-summary'
import { IrrigationCard } from './IrrigationCard'
import { IrrigationErrorPanel } from './IrrigationErrorPanel'
import { SensorSwitcher } from './SensorSwitcher'

interface IrrigationPopoverBodyProps {
  summary: Exclude<IrrigationSummary, { kind: 'loading' }>
  /** Sensor escolhido no seletor; `null` = o padrão (o mais urgente, ou o primeiro). */
  detailId: string | null
  onSelect: (devEUI: string) => void
}

interface DetailProps {
  item: SensorIrrigation
  /** Sensores entre os quais o seletor do canto alterna. Com menos de dois, não há seletor. */
  pool?: SensorIrrigation[]
  onSelect: (devEUI: string) => void
}

const Detail = ({ item, pool, onSelect }: DetailProps) => {
  const switcher =
    pool && pool.length > 1 ? (
      <SensorSwitcher
        items={pool}
        value={item.sensor.devEUI}
        onChange={onSelect}
        tone={item.data ? 'onColor' : 'onWhite'}
      />
    ) : undefined

  if (!item.data) {
    return (
      <IrrigationErrorPanel
        error={item.error}
        onRetry={item.refetch}
        sensorName={item.sensor.name}
        header={switcher}
      />
    )
  }
  return (
    <IrrigationCard
      data={item.data}
      sensorName={item.sensor.name}
      sensorSlot={switcher}
    />
  )
}

/**
 * O que aparece dentro do card aberto. É sempre o card detalhado de um sensor;
 * o que muda é qual sensor e se dá para trocar:
 *
 * - todos normais: o primeiro, trocando entre todos pelo nome no canto
 * - um pedindo atenção: ele, sem seletor
 * - vários pedindo atenção: o mais urgente, trocando entre os que pedem atenção
 */
export const IrrigationPopoverBody = ({ summary, detailId, onSelect }: IrrigationPopoverBodyProps) => {
  const pick = (pool: SensorIrrigation[]) => pool.find((i) => i.sensor.devEUI === detailId) ?? pool[0]

  switch (summary.kind) {
    case 'unavailable':
      return (
        <IrrigationErrorPanel
          error={summary.items[0].error}
          onRetry={() => summary.items.forEach((i) => i.refetch())}
          // Com um sensor só, o erro é dele; com vários, é de todos ao mesmo tempo.
          sensorName={summary.items.length === 1 ? summary.items[0].sensor.name : undefined}
        />
      )
    case 'all-normal':
      return <Detail item={pick(summary.items)} pool={summary.items} onSelect={onSelect} />
    case 'single-problem':
      return <Detail item={summary.focus} onSelect={onSelect} />
    case 'multi-problem':
      return <Detail item={pick(summary.problems)} pool={summary.problems} onSelect={onSelect} />
  }
}
