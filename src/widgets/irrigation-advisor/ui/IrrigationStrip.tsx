import { useState } from 'react'
import { useSensorsList } from '@/entities/sensor/api/use-sensors-list'
import { useIrrigationList } from '@/entities/irrigation/api/use-irrigation'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { Skeleton } from '@/shared/ui/skeleton'
import { summarizeIrrigation, type SensorIrrigation } from '../lib/irrigation-summary'
import { stripView } from '../lib/strip-view'
import { IrrigationPopoverBody } from './IrrigationPopoverBody'
import { IrrigationStripButton, STRIP_BOX } from './IrrigationStripButton'

/**
 * Faixa de irrigação do cabeçalho: um resumo da propriedade inteira, baixo o
 * bastante para caber nos 60 px da barra. O detalhe fica no card que abre ao
 * clicar, para não cobrir o mapa.
 *
 * Consulta todos os sensores e mostra o que pede atenção: se ninguém precisa
 * de nada, "tudo certo"; se um precisa, ele; se vários, a contagem — e o card
 * aberto lista cada um, do mais urgente para o menos.
 */
export const IrrigationStrip = () => {
  const { data: sensors = [] } = useSensorsList()
  const queries = useIrrigationList(sensors.map((s) => s.devEUI))
  const [open, setOpen] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)

  if (sensors.length === 0) return null

  const items: SensorIrrigation[] = sensors.map((sensor, i) => ({
    sensor,
    data: queries[i]?.data,
    error: queries[i]?.error,
    refetch: () => void queries[i]?.refetch(),
  }))
  const summary = summarizeIrrigation(items, queries.some((q) => q.isPending))

  if (summary.kind === 'loading') return <Skeleton className={STRIP_BOX} />

  const view = stripView(summary, sensors.length)

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        // Reabrir o card sempre começa pelo resumo, não pelo último sensor visto.
        if (!next) setDetailId(null)
      }}
    >
      <PopoverTrigger asChild>
        <IrrigationStripButton view={view} />
      </PopoverTrigger>

      {/* z acima dos painéis do Leaflet (z-[1000]), senão o card abre por baixo
          da lista de sensores do mapa. A altura máxima é o espaço que sobra
          abaixo da faixa: em notebook o card inteiro não cabe, e sem isso o
          rodapé ficaria fora da tela, sem como rolar até ele.

          onOpenAutoFocus: por padrão o Radix foca o primeiro elemento focável
          do conteúdo ao abrir — no card, o botão "i" do rodapé —, e o tooltip
          dele abre com foco, então aparecia aberto toda vez. O foco vai para o
          próprio container (tabIndex -1 do FocusScope): o Tab do teclado
          continua entrando no card, e o tooltip só abre com mouse ou Tab. */}
      <PopoverContent
        align="start"
        onOpenAutoFocus={(e) => {
          e.preventDefault()
          ;(e.currentTarget as HTMLElement).focus()
        }}
        className="z-[1100] max-h-[var(--radix-popover-content-available-height)] w-[400px] overflow-y-auto rounded-2xl [scrollbar-width:thin] bg-transparent p-0 shadow-xl motion-reduce:animate-none"
      >
        <IrrigationPopoverBody summary={summary} detailId={detailId} onSelect={setDetailId} />
      </PopoverContent>
    </Popover>
  )
}
