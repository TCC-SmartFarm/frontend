import { useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import L from 'leaflet'
import { Plus, Bell, Droplets, Thermometer, Sun, Battery, Wind, CloudRain } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { EmptyState } from '@/shared/ui/empty-state'
import { ErrorState } from '@/shared/ui/error-state'
import { resolveErrorVariant } from '@/shared/ui/error-state.helpers'
import { SensorListSkeleton } from '@/shared/ui/sensor-list-skeleton'
import { Skeleton } from '@/shared/ui/skeleton'
import { useSensorsList } from '@/entities/sensor/api/use-sensors-list'
import { useSelectedSensorStore } from '@/shared/stores/selected-sensor-store'
import { statusForParam, type Status } from '@/shared/constants/thresholds'
import { cn } from '@/shared/lib/utils'
import type { Sensor, SensorPayload } from '@/entities/sensor/model/types'
import type { SensorParam } from '@/entities/reading/model/types'

interface MetricDef {
  key: SensorParam
  label: string
  unit: string
  icon: LucideIcon
  format?: (v: number) => string
}

const METRICS: MetricDef[] = [
  { key: 'soil_moisture', label: 'Umidade solo', unit: '%', icon: Droplets },
  { key: 'soil_temperature', label: 'Temp. solo', unit: '°C', icon: Thermometer },
  { key: 'air_humidity', label: 'Umidade ar', unit: '%', icon: CloudRain },
  { key: 'luminosity', label: 'Luz', unit: 'lx', icon: Sun, format: (v) => Math.round(v).toLocaleString('pt-BR') },
  { key: 'air_temperature', label: 'Temp. ar', unit: '°C', icon: Wind },
  { key: 'battery', label: 'Bateria', unit: '%', icon: Battery },
]

const STATUS_COLORS: Record<Status, string> = {
  ok: '#2d6814',
  warn: '#c78020',
  alert: '#c74020',
}

const MAP_CENTER: [number, number] = [-22.9, -47.05]
const MAP_ZOOM = 14

const overallStatus = (sensor: Sensor): Status => {
  const reading = sensor.lastReading
  if (!reading) return 'ok'
  const statuses = METRICS.map((m) => statusForParam(m.key, reading[m.key] ?? null))
  if (statuses.includes('alert')) return 'alert'
  if (statuses.includes('warn')) return 'warn'
  return 'ok'
}

const sensorHasIssue = (sensor: Sensor): boolean => {
  const reading = sensor.lastReading
  if (!reading) return false
  return METRICS.some((m) => statusForParam(m.key, reading[m.key] ?? null) !== 'ok')
}

const formatMetric = (m: MetricDef, value: number | null | undefined): string => {
  if (value === null || value === undefined) return '—'
  return m.format ? m.format(value) : String(Math.round(value))
}

function createSensorIcon(status: Status, selected: boolean): L.DivIcon {
  const color = STATUS_COLORS[status]
  const scale = selected ? 1.2 : 1
  const w = Math.round(34 * scale)
  const h = Math.round(44 * scale)

  const html = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 34 44">
      ${selected ? `<circle cx="17" cy="15" r="20" fill="${color}" opacity="0.18"/>` : ''}
      <path d="M17,2 C9,2 4,8 4,15 C4,25 17,42 17,42 C17,42 30,25 30,15 C30,8 25,2 17,2 Z"
        fill="${color}"
        style="filter: drop-shadow(0 2px 3px rgba(0,0,0,0.28))"
      />
      <circle cx="17" cy="15" r="7" fill="white" opacity="0.92"/>
      <circle cx="17" cy="15" r="3" fill="${color}" opacity="0.7"/>
    </svg>
  `

  return L.divIcon({
    html,
    className: 'sensor-pin',
    iconSize: [w, h],
    iconAnchor: [w / 2, h],
    tooltipAnchor: [0, -h + 4],
    popupAnchor: [0, -h + 6],
  })
}

function buildTooltipHTML(sensor: Sensor): string {
  const status = overallStatus(sensor)
  const color = STATUS_COLORS[status]
  const moisture = sensor.lastReading?.soil_moisture
  return `
    <div style="font-family: var(--sf-font-display); font-size: 12px; padding: 2px 0;">
      <strong>${sensor.name}</strong>
      ${
        moisture !== undefined && moisture !== null
          ? `<span style="color: ${color}; margin-left: 6px;">${Math.round(moisture)}%</span>`
          : ''
      }
    </div>
  `
}

function buildPopupHTML(sensor: Sensor): string {
  const reading = sensor.lastReading ?? ({} as Partial<SensorPayload>)
  const metrics = METRICS.map((m) => {
    const val = reading[m.key] ?? null
    const st = statusForParam(m.key, val)
    const color = STATUS_COLORS[st]
    const display = formatMetric(m, val)
    return `
      <div style="display: flex; flex-direction: column; gap: 2px; border: 1px solid #e7ddc8; background: #faf7f1; border-radius: 6px; padding: 6px;">
        <div style="display: flex; align-items: center; gap: 4px;">
          <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${color};"></span>
          <span style="font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: #6b5a3d;">${m.label}</span>
        </div>
        <div style="font-family: var(--sf-font-data); font-size: 13px; font-weight: 700; color: #201a13; line-height: 1;">
          ${display}<span style="font-family: var(--sf-font-body); font-size: 9px; font-weight: 500; color: #4e4130; margin-left: 2px;">${m.unit}</span>
        </div>
      </div>
    `
  }).join('')

  return `
    <div style="min-width: 240px; font-family: var(--sf-font-body);">
      <div style="margin-bottom: 8px;">
        <div style="font-family: var(--sf-font-display); font-size: 15px; font-weight: 700; color: #201a13; line-height: 1.2;">${sensor.name}</div>
        <div style="font-size: 11px; color: #6b5a3d;">${sensor.deviceId}${sensor.deviceType ? ' · ' + sensor.deviceType : ''}</div>
      </div>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; margin-bottom: 12px;">
        ${metrics}
      </div>
      <button
        class="popup-open-sensor-btn"
        data-sensor-id="${sensor.deviceId}"
        style="width: 100%; padding: 8px; border: none; border-radius: 10px; background: #35502a; color: white; font-family: var(--sf-font-display); font-size: 13px; font-weight: 600; cursor: pointer;"
      >
        Abrir sensor →
      </button>
    </div>
  `
}

export const DashboardMapPage = () => {
  const navigate = useNavigate()
  const navigateRef = useRef(navigate)

  const sensorsQuery = useSensorsList()
  const sensors = useMemo(() => sensorsQuery.data ?? [], [sensorsQuery.data])
  const selectedId = useSelectedSensorStore((s) => s.selectedSensorId)
  const setSelectedId = useSelectedSensorStore((s) => s.setSelectedSensorId)

  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Record<string, L.Marker>>({})
  const setSelectedIdRef = useRef(setSelectedId)

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
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)

    map.on('popupopen', (e: L.PopupEvent) => {
      const el = e.popup.getElement()
      const btn = el?.querySelector<HTMLButtonElement>('.popup-open-sensor-btn')
      if (!btn) return
      const handler = () => {
        const id = btn.getAttribute('data-sensor-id')
        if (id) navigateRef.current(`/dashboard/sensor/${id}`)
      }
      btn.addEventListener('click', handler)
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
      markersRef.current = {}
    }
  }, [])

  // Sync markers with sensors data
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const plottable = sensors.filter(
      (s) => s.latitude !== null && s.longitude !== null,
    )
    const plottableIds = new Set(plottable.map((s) => s.deviceId))

    Object.entries(markersRef.current).forEach(([id, marker]) => {
      if (!plottableIds.has(id)) {
        marker.remove()
        delete markersRef.current[id]
      }
    })

    plottable.forEach((sensor) => {
      const isSelected = sensor.deviceId === selectedId
      const status = overallStatus(sensor)
      const existing = markersRef.current[sensor.deviceId]
      const lat = sensor.latitude as number
      const lng = sensor.longitude as number

      if (existing) {
        existing.setLatLng([lat, lng])
        existing.setIcon(createSensorIcon(status, isSelected))
        existing.setTooltipContent(buildTooltipHTML(sensor))
        existing.setPopupContent(buildPopupHTML(sensor))
        return
      }

      const marker = L.marker([lat, lng], {
        icon: createSensorIcon(status, isSelected),
      })
      marker.bindTooltip(buildTooltipHTML(sensor), { direction: 'top', opacity: 1 })
      marker.bindPopup(buildPopupHTML(sensor), { minWidth: 260, maxWidth: 280 })
      marker.on('click', () => setSelectedIdRef.current(sensor.deviceId))
      marker.addTo(map)
      markersRef.current[sensor.deviceId] = marker
    })

    // Fit bounds when first batch arrives
    if (plottable.length > 0) {
      const bounds = L.latLngBounds(
        plottable.map((s) => [s.latitude as number, s.longitude as number]),
      )
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 })
    }
  }, [sensors, selectedId])

  // Update marker icons on selection change
  useEffect(() => {
    Object.entries(markersRef.current).forEach(([id, marker]) => {
      const sensor = sensors.find((s) => s.deviceId === id)
      if (!sensor) return
      marker.setIcon(createSensorIcon(overallStatus(sensor), id === selectedId))
    })
  }, [selectedId, sensors])

  const selected = sensors.find((s) => s.deviceId === selectedId) ?? null
  const selectedReading = selected?.lastReading ?? ({} as Partial<SensorPayload>)
  const selectedHasIssue = selected ? sensorHasIssue(selected) : false

  return (
    <div className="relative" style={{ height: 'calc(100vh - 60px)' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

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
            <div className="shrink-0 p-3 pb-0">
              <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-leaf-700 py-2.5 font-display text-sm font-semibold text-white shadow-xs transition-colors hover:bg-leaf-600 active:scale-[0.98]">
                <Plus size={15} strokeWidth={2.5} aria-hidden />
                Adicionar sensor
              </button>
            </div>

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
                  {selected.deviceId}
                </p>

                <div className="mt-3 grid grid-cols-3 gap-1.5">
                  {METRICS.map((m) => {
                    const val = selectedReading[m.key] ?? null
                    const st = statusForParam(m.key, val)
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

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => navigate(`/dashboard/sensor/${selected.deviceId}`)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-leaf-700 py-2 font-display text-[13px] font-semibold text-white hover:bg-leaf-600"
                  >
                    Abrir sensor
                  </button>
                  <button className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 font-display text-[13px] font-semibold text-fg-muted hover:border-leaf-600 hover:text-fg">
                    <Bell size={13} strokeWidth={1.75} aria-hidden />
                    Alerta
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
                  const moistSt = statusForParam('soil_moisture', reading.soil_moisture ?? null)
                  const battSt = statusForParam('battery', reading.battery ?? null)
                  const hasIssue = moistSt !== 'ok' || battSt !== 'ok'
                  const isAlert = moistSt === 'alert' || battSt === 'alert'
                  const isActive = sensor.deviceId === selectedId
                  const dotCls = isAlert ? 'bg-alert-dot' : hasIssue ? 'bg-warn-dot' : 'bg-ok-dot'
                  const moistDisplay =
                    typeof reading.soil_moisture === 'number'
                      ? `${Math.round(reading.soil_moisture)}%`
                      : '—'
                  const hasLocation = sensor.latitude !== null && sensor.longitude !== null

                  return (
                    <button
                      key={sensor.deviceId}
                      type="button"
                      onClick={() => {
                        setSelectedId(sensor.deviceId)
                        const marker = markersRef.current[sensor.deviceId]
                        if (marker && mapRef.current && hasLocation) {
                          mapRef.current.panTo([
                            sensor.latitude as number,
                            sensor.longitude as number,
                          ])
                          marker.openPopup()
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
                            {sensor.deviceId}
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
