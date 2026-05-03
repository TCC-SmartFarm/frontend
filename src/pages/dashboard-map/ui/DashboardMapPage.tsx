import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import L from 'leaflet'
import { Plus, Bell, Droplets, Thermometer, Sun, Battery, Wind, CloudRain } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { SENSORS, READINGS, statusFor, type ParamKey } from '@/shared/constants/sensor-mock'
import { cn } from '@/shared/lib/utils'

interface MetricDef {
  key: ParamKey
  label: string
  unit: string
  icon: LucideIcon
  format?: (v: number) => string
}

const METRICS: MetricDef[] = [
  { key: 'soilMoist', label: 'Umidade solo', unit: '%',  icon: Droplets },
  { key: 'soilTemp',  label: 'Temp. solo',   unit: '°C', icon: Thermometer },
  { key: 'airHumid',  label: 'Umidade ar',   unit: '%',  icon: CloudRain },
  { key: 'light',     label: 'Luz',          unit: 'lx', icon: Sun, format: (v) => v.toLocaleString('pt-BR') },
  { key: 'airTemp',   label: 'Temp. ar',     unit: '°C', icon: Wind },
  { key: 'battery',   label: 'Bateria',      unit: '%',  icon: Battery },
]

const STATUS_COLORS: Record<string, string> = {
  ok:    '#2d6814',
  warn:  '#c78020',
  alert: '#c74020',
}

const MAP_CENTER: [number, number] = [-22.900, -47.050]
const MAP_ZOOM = 14

function overallStatus(sensorId: string): 'ok' | 'warn' | 'alert' {
  const r = READINGS[sensorId]
  if (!r) return 'ok'
  const statuses = METRICS.map(m => statusFor(m.key, r[m.key]))
  if (statuses.includes('alert')) return 'alert'
  if (statuses.includes('warn')) return 'warn'
  return 'ok'
}

function createSensorIcon(status: 'ok' | 'warn' | 'alert', selected: boolean): L.DivIcon {
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

function buildTooltipHTML(sensor: typeof SENSORS[number]) {
  const r = READINGS[sensor.id]
  const status = overallStatus(sensor.id)
  const color = STATUS_COLORS[status]
  return `
    <div style="font-family: var(--sf-font-display); font-size: 12px; padding: 2px 0;">
      <strong>${sensor.nickname}</strong>
      <span style="color: ${color}; margin-left: 6px;">${r.soilMoist}%</span>
    </div>
  `
}

function buildPopupHTML(sensor: typeof SENSORS[number]) {
  const r = READINGS[sensor.id]
  const metrics = METRICS.map(m => {
    const val = r[m.key]
    const st = statusFor(m.key, val)
    const color = STATUS_COLORS[st]
    const display = m.format ? m.format(val) : String(val)
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
        <div style="font-family: var(--sf-font-display); font-size: 15px; font-weight: 700; color: #201a13; line-height: 1.2;">${sensor.nickname}</div>
        <div style="font-size: 11px; color: #6b5a3d;">${sensor.name} · ${sensor.serial} · ${sensor.crop}</div>
      </div>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; margin-bottom: 12px;">
        ${metrics}
      </div>
      <button
        class="popup-open-sensor-btn"
        data-sensor-id="${sensor.id}"
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
  navigateRef.current = navigate

  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Record<string, L.Marker>>({})
  const selectedIdRef = useRef<string>('')

  const [selectedId, setSelectedId] = useState<string>(
    SENSORS.find(s => overallStatus(s.id) !== 'ok')?.id ?? SENSORS[0].id
  )
  selectedIdRef.current = selectedId

  // Create map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current).setView(MAP_CENTER, MAP_ZOOM)

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)

    // Markers
    SENSORS.forEach(sensor => {
      const isSelected = sensor.id === selectedIdRef.current
      const marker = L.marker(
        [sensor.latitude, sensor.longitude],
        { icon: createSensorIcon(overallStatus(sensor.id), isSelected) }
      )

      marker.bindTooltip(buildTooltipHTML(sensor), { direction: 'top', opacity: 1 })
      marker.bindPopup(buildPopupHTML(sensor), { minWidth: 260, maxWidth: 280 })
      marker.on('click', () => setSelectedId(sensor.id))

      marker.addTo(map)
      markersRef.current[sensor.id] = marker
    })

    // Handle "Abrir sensor" button clicks inside any open popup
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

  // Update marker icons when selection changes
  useEffect(() => {
    Object.entries(markersRef.current).forEach(([id, marker]) => {
      marker.setIcon(createSensorIcon(overallStatus(id), id === selectedId))
    })
  }, [selectedId])

  const selected = SENSORS.find(s => s.id === selectedId) ?? SENSORS[0]
  const selR = READINGS[selected.id]
  const selHasIssue = METRICS.some(m => statusFor(m.key, selR[m.key]) !== 'ok')
  const onlineSensors = SENSORS.length

  return (
    <div className="relative" style={{ height: 'calc(100vh - 60px)' }}>
      {/* Map */}
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* Right floating panel */}
      <div className="absolute bottom-4 right-4 top-4 z-[1000] flex w-[272px] flex-col overflow-hidden rounded-2xl border border-white/50 bg-white/92 shadow-xl backdrop-blur-md">

        {/* Add sensor button */}
        <div className="shrink-0 p-3 pb-0">
          <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-leaf-700 py-2.5 font-display text-sm font-semibold text-white shadow-xs transition-colors hover:bg-leaf-600 active:scale-[0.98]">
            <Plus size={15} strokeWidth={2.5} aria-hidden />
            Adicionar sensor
          </button>
        </div>

        {/* Selected sensor */}
        <div className="shrink-0 border-b border-border/60 px-4 pb-4 pt-3.5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-fg-subtle">
              Sensor selecionado
            </span>
            {selHasIssue && <Badge tone="alert" size="sm" dot>ação</Badge>}
          </div>

          <h2 className="font-display text-[15px] font-bold leading-tight text-fg">{selected.nickname}</h2>
          <p className="mt-0.5 text-[11px] text-fg-subtle">
            {selected.name} · {selected.crop} · {selected.serial}
          </p>

          {/* 3×2 metrics grid */}
          <div className="mt-3 grid grid-cols-3 gap-1.5">
            {METRICS.map(m => {
              const val = selR[m.key]
              const st  = statusFor(m.key, val)
              const iconCls =
                st === 'ok' ? 'text-ok-dot' : st === 'warn' ? 'text-warn-dot' : 'text-alert-dot'
              const display = m.format ? m.format(val) : String(val)
              return (
                <div key={m.key} className="flex flex-col gap-0.5 rounded-[8px] border border-border/50 bg-sand-50 p-2">
                  <div className="flex items-center gap-1">
                    <m.icon size={10} strokeWidth={2} className={cn('shrink-0', iconCls)} aria-hidden />
                    <span className="truncate text-[9px] font-semibold uppercase tracking-[0.06em] text-fg-subtle">
                      {m.label}
                    </span>
                  </div>
                  <div className="font-data text-[15px] font-bold tabular-nums leading-none text-fg">
                    {display}
                    <span className="ml-0.5 font-sans text-[10px] font-medium text-fg-muted">{m.unit}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Action buttons */}
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => navigate(`/dashboard/sensor/${selected.id}`)}
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

        {/* All sensors list */}
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="shrink-0 flex items-center justify-between px-4 py-2.5">
            <span className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-fg-subtle">
              Todos os sensores
            </span>
            <span className="text-[11px] text-fg-muted">
              {onlineSensors} de {onlineSensors}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {SENSORS.map(sensor => {
              const r        = READINGS[sensor.id]
              const moistSt  = statusFor('soilMoist', r.soilMoist)
              const battSt   = statusFor('battery',   r.battery)
              const hasIssue = moistSt !== 'ok' || battSt !== 'ok'
              const isAlert  = moistSt === 'alert' || battSt === 'alert'
              const isActive = sensor.id === selectedId
              const dotCls   = isAlert ? 'bg-alert-dot' : hasIssue ? 'bg-warn-dot' : 'bg-ok-dot'
              const showRegar = r.soilMoist < 35

              return (
                <button
                  key={sensor.id}
                  onClick={() => {
                    setSelectedId(sensor.id)
                    const marker = markersRef.current[sensor.id]
                    if (marker && mapRef.current) {
                      mapRef.current.panTo([sensor.latitude, sensor.longitude])
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
                          {sensor.nickname}
                        </span>
                        {showRegar && (
                          <Badge tone="alert" size="sm">regar</Badge>
                        )}
                      </div>
                      <div className="text-[11px] text-fg-subtle">
                        {sensor.name.toLowerCase()} · {sensor.crop.toLowerCase()}
                      </div>
                    </div>
                    <span className="shrink-0 font-data text-[13px] font-semibold tabular-nums text-fg">
                      {r.soilMoist}%
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
