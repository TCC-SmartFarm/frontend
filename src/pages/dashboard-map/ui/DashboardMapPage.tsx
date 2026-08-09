import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import L from 'leaflet'
import { Badge } from '@/shared/ui/badge'
import { EmptyState } from '@/shared/ui/empty-state'
import { ErrorState } from '@/shared/ui/error-state'
import { resolveErrorVariant } from '@/shared/ui/error-state.helpers'
import { SensorListSkeleton } from '@/shared/ui/sensor-list-skeleton'
import { Skeleton } from '@/shared/ui/skeleton'
import { useSensorsList } from '@/entities/sensor/api/use-sensors-list'
import { env } from '@/shared/config/env'
import { useSelectedSensorStore } from '@/shared/stores/selected-sensor-store'
import { useThresholdsStore } from '@/shared/stores/thresholds-store'
import { statusForParam, type ParamThresholdMap } from '@/shared/constants/thresholds'
import { cn } from '@/shared/lib/utils'
import { createSensorIcon, pinKey, pinStateFor, type PinState } from './sensor-pin'
import { SensorHoverCard } from './SensorHoverCard'
import { METRICS, formatMetric } from './metrics'
import type { Sensor, SensorPayload } from '@/entities/sensor/model/types'

const MAP_CENTER: [number, number] = [-22.9, -47.05]
const MAP_ZOOM = 14

/** A janela de "offline" é de 45 min; reavaliar de minuto em minuto basta. */
const STALENESS_TICK_MS = 60 * 1000

const OFFLINE_PIN: PinState = { tone: 'offline', param: null }

/**
 * Espera antes de abrir o card de hover, para o mouse atravessando o mapa não
 * disparar um card por pin no caminho.
 */
const HOVER_DELAY_MS = 150

/** Classe aplicada direto no DOM: aumentar o pin não pode esperar o React. */
const PIN_HOVER_CLASS = 'sf-pin-wrap--hover'

const sensorHasIssue = (sensor: Sensor, thresholds: ParamThresholdMap): boolean => {
  const reading = sensor.lastReading
  if (!reading) return false
  return METRICS.some((m) => statusForParam(thresholds, m.key, reading[m.key] ?? null) !== 'ok')
}

export const DashboardMapPage = () => {
  const navigate = useNavigate()
  const navigateRef = useRef(navigate)

  const sensorsQuery = useSensorsList()
  const sensors = useMemo(() => sensorsQuery.data ?? [], [sensorsQuery.data])
  const selectedId = useSelectedSensorStore((s) => s.selectedSensorId)
  const setSelectedId = useSelectedSensorStore((s) => s.setSelectedSensorId)
  const thresholds = useThresholdsStore((s) => s.thresholds)

  // Um sensor fica offline pela passagem do tempo, sem nenhum dado novo chegar;
  // sem este tick o pin continuaria pulsando até o próximo refetch da lista.
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), STALENESS_TICK_MS)
    return () => clearInterval(id)
  }, [])

  // Estado do pin calculado uma vez por (sensores × limites × tempo), em vez de
  // espalhar o mapa de limites pelos effects imperativos do Leaflet.
  const pinStateById = useMemo(
    () => new Map(sensors.map((s) => [s.devEUI, pinStateFor(s, thresholds, now)])),
    [sensors, thresholds, now],
  )

  // Card de hover: o id fica separado da posição para o card acompanhar o pin
  // quando a lista recarrega sem o mouse sair de cima.
  const [hovered, setHovered] = useState<{ id: string; x: number; y: number } | null>(null)
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hoveredIdRef = useRef<string | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Record<string, L.Marker>>({})
  const pinKeysRef = useRef<Record<string, string>>({})
  const setSelectedIdRef = useRef(setSelectedId)
  const hasFitBoundsRef = useRef(false)

  const closeHover = useCallback(() => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
    hoverTimerRef.current = null
    hoveredIdRef.current = null
    setHovered(null)
  }, [])

  useEffect(() => () => closeHover(), [closeHover])

  useEffect(() => {
    navigateRef.current = navigate
  }, [navigate])

  useEffect(() => {
    setSelectedIdRef.current = setSelectedId
  }, [setSelectedId])

  // Create map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = L.map(containerRef.current).setView(MAP_CENTER, MAP_ZOOM)
    // O tile.openstreetmap.org bloqueia apps deployados (política de uso).
    // Padrão: Carto (gratuito p/ uso não-comercial, sem chave); VITE_MAP_TILE_URL
    // permite trocar por MapTiler/Stadia sem mexer no código.
    const tileUrl =
      env.mapTileUrl ||
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
    L.tileLayer(tileUrl, {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map)

    // Arrastar/zoom move os pins sob o cursor: manter o card aberto o deixaria
    // ancorado numa posição velha, e o mouseout do marcador não dispara.
    map.on('movestart', closeHover)
    map.on('zoomstart', closeHover)

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
      markersRef.current = {}
    }
  }, [closeHover])

  // Sync markers with sensors data
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const plottable = sensors.filter(
      (s) => s.latitude !== null && s.longitude !== null,
    )
    const plottableIds = new Set(plottable.map((s) => s.devEUI))

    Object.entries(markersRef.current).forEach(([id, marker]) => {
      if (!plottableIds.has(id)) {
        marker.remove()
        delete markersRef.current[id]
        delete pinKeysRef.current[id]
      }
    })

    plottable.forEach((sensor) => {
      const isSelected = sensor.devEUI === selectedId
      const state = pinStateById.get(sensor.devEUI) ?? OFFLINE_PIN
      const key = pinKey(state, isSelected)
      const existing = markersRef.current[sensor.devEUI]
      const lat = sensor.latitude as number
      const lng = sensor.longitude as number

      if (existing) {
        existing.setLatLng([lat, lng])
        // Trocar o ícone recria o nó DOM e reinicia o halo; só quando muda algo.
        if (pinKeysRef.current[sensor.devEUI] !== key) {
          existing.setIcon(createSensorIcon(state, isSelected))
          pinKeysRef.current[sensor.devEUI] = key
          // O nó novo nasce sem a classe de hover; se o mouse ainda está em
          // cima, o pin encolheria sozinho no meio do refetch.
          if (hoveredIdRef.current === sensor.devEUI) {
            existing.getElement()?.classList.add(PIN_HOVER_CLASS)
          }
        }
        return
      }

      const marker = L.marker([lat, lng], {
        icon: createSensorIcon(state, isSelected),
      })
      pinKeysRef.current[sensor.devEUI] = key
      marker.on('click', () => setSelectedIdRef.current(sensor.devEUI))

      marker.on('mouseover', () => {
        // O pin cresce na hora; só o card espera, para o mouse atravessando o
        // mapa não abrir um card atrás do outro.
        marker.getElement()?.classList.add(PIN_HOVER_CLASS)
        hoveredIdRef.current = sensor.devEUI
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
        hoverTimerRef.current = setTimeout(() => {
          const current = mapRef.current
          if (!current || hoveredIdRef.current !== sensor.devEUI) return
          const point = current.latLngToContainerPoint(marker.getLatLng())
          setHovered({ id: sensor.devEUI, x: point.x, y: point.y })
        }, HOVER_DELAY_MS)
      })

      marker.on('mouseout', () => {
        marker.getElement()?.classList.remove(PIN_HOVER_CLASS)
        closeHover()
      })

      marker.addTo(map)
      markersRef.current[sensor.devEUI] = marker
    })

    // Só no primeiro lote: reenquadrar a cada mudança de seleção faria o mapa
    // pular sob o usuário toda vez que ele clicasse num sensor da lista.
    if (plottable.length > 0 && !hasFitBoundsRef.current) {
      hasFitBoundsRef.current = true
      const bounds = L.latLngBounds(
        plottable.map((s) => [s.latitude as number, s.longitude as number]),
      )
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 })
    }
  }, [sensors, selectedId, pinStateById, closeHover])

  const selected = sensors.find((s) => s.devEUI === selectedId) ?? null
  const selectedReading = selected?.lastReading ?? ({} as Partial<SensorPayload>)
  const selectedHasIssue = selected ? sensorHasIssue(selected, thresholds) : false
  const hoveredSensor = hovered ? sensors.find((s) => s.devEUI === hovered.id) : null

  return (
    <div className="relative" style={{ height: 'calc(100vh - 60px)' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {hovered && hoveredSensor && (
        <SensorHoverCard
          key={hoveredSensor.devEUI}
          sensor={hoveredSensor}
          thresholds={thresholds}
          x={hovered.x}
          y={hovered.y}
        />
      )}

      <div className="absolute bottom-4 right-4 top-4 z-[1000] flex w-[272px] flex-col overflow-hidden rounded-2xl border border-white/50 bg-white/92 shadow-xl backdrop-blur-md">
        {sensorsQuery.error ? (
          <div className="p-4">
            <ErrorState
              variant={resolveErrorVariant(sensorsQuery.error)}
              onRetry={() => sensorsQuery.refetch()}
            />
          </div>
        ) : sensorsQuery.isPending ? (
          <>
            <div className="shrink-0 p-3 pb-0">
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
            <div className="shrink-0 border-b border-border/60 px-4 pb-4 pt-3.5">
              <Skeleton className="mb-2 h-3 w-32" />
              <Skeleton className="mb-1 h-4 w-40" />
              <Skeleton className="h-3 w-28" />
              <div className="mt-3 grid grid-cols-3 gap-1.5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 rounded-md" />
                ))}
              </div>
            </div>
            <div className="flex-1">
              <SensorListSkeleton rows={6} />
            </div>
          </>
        ) : sensors.length === 0 ? (
          <div className="flex h-full items-center justify-center p-4">
            <EmptyState variant="no-sensors" />
          </div>
        ) : (
          <>
            {/* Cadastro de sensor ainda não implementado no back-end (não há POST /api/sensors).
                O sensor é provisionado pelo app mobile; ao reativar, reimportar `Plus` do lucide-react.
            <div className="shrink-0 p-3 pb-0">
              <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-leaf-700 py-2.5 font-display text-sm font-semibold text-white shadow-xs transition-colors hover:bg-leaf-600 active:scale-[0.98]">
                <Plus size={15} strokeWidth={2.5} aria-hidden />
                Adicionar sensor
              </button>
            </div>
            */}

            {selected && (
              <div className="shrink-0 border-b border-border/60 px-4 pb-4 pt-3.5">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-fg-subtle">
                    Sensor selecionado
                  </span>
                  {selectedHasIssue && (
                    <Badge tone="alert" size="sm" dot>
                      ação
                    </Badge>
                  )}
                </div>

                <h2 className="font-display text-[15px] font-bold leading-tight text-fg">
                  {selected.name}
                </h2>
                <p className="mt-0.5 truncate font-mono text-[11px] text-fg-subtle">
                  {selected.devEUI}
                </p>

                <div className="mt-3 grid grid-cols-3 gap-1.5">
                  {METRICS.map((m) => {
                    const val = selectedReading[m.key] ?? null
                    const st = statusForParam(thresholds, m.key, val)
                    const iconCls =
                      st === 'ok' ? 'text-ok-dot' : st === 'warn' ? 'text-warn-dot' : 'text-alert-dot'
                    const display = formatMetric(m, val)
                    return (
                      <div
                        key={m.key}
                        className="flex flex-col gap-0.5 rounded-[8px] border border-border/50 bg-sand-50 p-2"
                      >
                        <div className="flex items-center gap-1">
                          <m.icon
                            size={10}
                            strokeWidth={2}
                            className={cn('shrink-0', iconCls)}
                            aria-hidden
                          />
                          <span className="truncate text-[9px] font-semibold uppercase tracking-[0.06em] text-fg-subtle">
                            {m.label}
                          </span>
                        </div>
                        <div className="font-data text-[15px] font-bold tabular-nums leading-none text-fg">
                          {display}
                          <span className="ml-0.5 font-sans text-[10px] font-medium text-fg-muted">
                            {m.unit}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-3">
                  <button
                    onClick={() => navigate(`/dashboard/sensor/${selected.devEUI}`)}
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-leaf-700 py-2 font-display text-[13px] font-semibold text-white hover:bg-leaf-600"
                  >
                    Abrir sensor
                  </button>
                </div>
              </div>
            )}

            <div className="flex min-h-0 flex-1 flex-col">
              <div className="shrink-0 flex items-center justify-between px-4 py-2.5">
                <span className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-fg-subtle">
                  Todos os sensores
                </span>
                <span className="text-[11px] text-fg-muted">
                  {sensors.length} {sensors.length === 1 ? 'sensor' : 'sensores'}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto">
                {sensors.map((sensor) => {
                  const reading = sensor.lastReading ?? ({} as Partial<SensorPayload>)
                  const moistSt = statusForParam(
                    thresholds,
                    'soil_moisture',
                    reading.soil_moisture ?? null,
                  )
                  const battSt = statusForParam(thresholds, 'battery', reading.battery ?? null)
                  const hasIssue = moistSt !== 'ok' || battSt !== 'ok'
                  const isAlert = moistSt === 'alert' || battSt === 'alert'
                  const isActive = sensor.devEUI === selectedId
                  const dotCls = isAlert ? 'bg-alert-dot' : hasIssue ? 'bg-warn-dot' : 'bg-ok-dot'
                  const moistDisplay =
                    typeof reading.soil_moisture === 'number'
                      ? `${Math.round(reading.soil_moisture)}%`
                      : '—'
                  const hasLocation = sensor.latitude !== null && sensor.longitude !== null

                  return (
                    <button
                      key={sensor.devEUI}
                      type="button"
                      onClick={() => {
                        setSelectedId(sensor.devEUI)
                        if (mapRef.current && hasLocation) {
                          mapRef.current.panTo([
                            sensor.latitude as number,
                            sensor.longitude as number,
                          ])
                        }
                      }}
                      className={cn(
                        'w-full border-b border-border/40 px-4 py-2.5 text-left transition-colors last:border-b-0',
                        isActive ? 'bg-leaf-50/80 hover:bg-leaf-50' : 'hover:bg-sand-50/80',
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={cn('size-2 shrink-0 rounded-full', dotCls)} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate font-display text-[13px] font-semibold text-fg">
                              {sensor.name}
                            </span>
                            {!hasLocation && (
                              <Badge tone="neutral" size="sm">
                                sem GPS
                              </Badge>
                            )}
                          </div>
                          <div className="truncate font-mono text-[10px] text-fg-subtle">
                            {sensor.devEUI}
                          </div>
                        </div>
                        <span className="shrink-0 font-data text-[13px] font-semibold tabular-nums text-fg">
                          {moistDisplay}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
