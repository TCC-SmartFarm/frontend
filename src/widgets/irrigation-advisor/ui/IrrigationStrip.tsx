import { ChevronDown, CloudRain, Droplets, RotateCw, Sprout } from 'lucide-react'
import { useSensorsList } from '@/entities/sensor/api/use-sensors-list'
import { irrigationErrorMessage, useIrrigation } from '@/entities/irrigation/api/use-irrigation'
import { useSelectedSensorStore } from '@/shared/stores/selected-sensor-store'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { Skeleton } from '@/shared/ui/skeleton'
import { cn } from '@/shared/lib/utils'
import { irrigationHeadline, irrigationTheme } from '../lib/irrigation-theme'
import { IrrigationCard } from './IrrigationCard'

// Largura fixa: a faixa troca de texto quando o sensor muda ou a consulta
// termina, e sem largura fixa a busca ao lado pularia de posição.
const STRIP = 'h-11 w-[370px] shrink-0 rounded-xl'

/**
 * Faixa de irrigação do cabeçalho: baixa o bastante para caber nos 60 px da
 * barra, com a recomendação legível de relance. O detalhe fica no card que
 * abre ao clicar, para não cobrir o mapa.
 *
 * Segue o sensor selecionado (o mesmo das páginas de parâmetro). O MSS
 * responde por sensor, então um painel com vários mostra um de cada vez.
 */
export const IrrigationStrip = () => {
  const { data: sensors } = useSensorsList()
  const selectedId = useSelectedSensorStore((s) => s.selectedSensorId)
  const setSelectedId = useSelectedSensorStore((s) => s.setSelectedSensorId)
  const selected = sensors?.find((s) => s.devEUI === selectedId) ?? null
  const query = useIrrigation(selected?.devEUI ?? null)

  if (!sensors || sensors.length === 0) return null
  if (query.isPending) return <Skeleton className={STRIP} />

  const data = query.data
  const theme = data ? irrigationTheme(data.irrigation.action) : null
  const Icon = theme?.icon ?? Sprout

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Ver recomendação de irrigação"
          className={cn(
            STRIP,
            'group relative flex items-center gap-3 overflow-hidden px-3.5 text-left outline-none transition-[box-shadow,translate] duration-200 ease-[cubic-bezier(0.2,0.7,0.3,1)]',
            'hover:-translate-y-px hover:shadow-md focus-visible:ring-[3px] focus-visible:ring-leaf-200',
            data ? 'text-white shadow-sm' : 'border border-border bg-white text-fg-muted',
          )}
          style={data ? { background: theme!.color } : undefined}
        >
          {data && (
            <div
              aria-hidden
              className="pointer-events-none absolute -right-6 -top-10 size-24 rounded-full bg-white/12"
            />
          )}
          <Icon size={20} strokeWidth={1.75} aria-hidden className="relative shrink-0" />
          <div className="relative min-w-0 flex-1 leading-tight">
            <div className="truncate font-display text-[14.5px] font-bold">
              {data ? irrigationHeadline(data) : 'Sem recomendação no momento'}
            </div>
            {/* Gotas = umidade do solo, como em todo o painel. A chuva, à
                direita, usa a nuvem: são dois números em %, e sem ícone o
                da direita não diz o que é. */}
            <div
              className={cn(
                'flex items-center gap-1 truncate text-[11px]',
                data ? 'text-white/85' : 'text-fg-subtle',
              )}
            >
              {data ? (
                <>
                  <Droplets size={12} strokeWidth={2.25} aria-hidden className="shrink-0" />
                  {Math.round(data.sensor.soil_moisture_kalman_filtered)}% de umidade no solo
                </>
              ) : (
                'Clique aqui para entender o porquê'
              )}
            </div>
          </div>
          {data && (
            <div
              className="relative shrink-0 text-right leading-tight"
              title="Maior chance de chuva prevista para os próximos 6 dias"
            >
              <div className="flex items-center justify-end gap-1 font-data text-[13px] font-semibold tabular-nums">
                <CloudRain size={14} strokeWidth={2} aria-hidden />
                {Math.round(data.forecast_summary.max_precipitation_probability_percent)}%
              </div>
            </div>
          )}
          <ChevronDown
            size={15}
            strokeWidth={2}
            aria-hidden
            className="relative shrink-0 opacity-70 transition-transform group-data-[state=open]:rotate-180"
          />
        </button>
      </PopoverTrigger>

      {/* z acima dos painéis do Leaflet (z-[1000]), senão o card abre por baixo
          da lista de sensores do mapa. A altura máxima é o espaço que sobra
          abaixo da faixa: em notebook o card inteiro não cabe, e sem isso o
          rodapé ficaria fora da tela, sem como rolar até ele. */}
      <PopoverContent
        align="start"
        className="z-[1100] max-h-[var(--radix-popover-content-available-height)] w-[400px] overflow-y-auto rounded-2xl [scrollbar-width:thin] bg-transparent p-0 shadow-xl motion-reduce:animate-none"
      >
        {sensors.length > 1 && (
          <div className="flex gap-1.5 overflow-x-auto bg-white p-2">
            {sensors.map((s) => (
              <button
                key={s.devEUI}
                type="button"
                onClick={() => setSelectedId(s.devEUI)}
                className={cn(
                  'shrink-0 rounded-full px-3 py-1 font-display text-xs font-semibold transition-colors',
                  s.devEUI === selectedId
                    ? 'bg-leaf-600 text-white'
                    : 'border border-border text-fg-muted hover:border-leaf-600 hover:text-fg',
                )}
              >
                {s.name}
              </button>
            ))}
          </div>
        )}
        {data ? (
          <IrrigationCard data={data} sensorName={selected?.name ?? data.sensor_id} />
        ) : (
          <div className="flex flex-col items-start gap-3 bg-white p-6">
            <h3 className="font-display text-lg font-bold text-fg">
              Não conseguimos montar a recomendação agora
            </h3>
            <p className="text-sm text-fg-muted">{irrigationErrorMessage(query.error)}</p>
            <button
              type="button"
              onClick={() => query.refetch()}
              className="inline-flex items-center gap-1.5 rounded-md border border-border-strong px-3 py-1.5 font-display text-[13px] font-semibold text-fg hover:bg-sand-50"
            >
              <RotateCw size={13} strokeWidth={2} aria-hidden />
              Tentar novamente
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
