import { useState } from 'react'
import { Plus, Bell, ChevronDown, Droplets, Thermometer, Sun, Battery, Wind, CloudRain } from 'lucide-react'
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
  { key: 'light',     label: 'Luz',          unit: 'lx', icon: Sun,
    format: (v) => v.toLocaleString('pt-BR') },
  { key: 'airTemp',   label: 'Temp. ar',     unit: '°C', icon: Wind },
  { key: 'battery',   label: 'Bateria',      unit: '%',  icon: Battery },
]

// SVG viewBox 0 0 1100 780
const PIN_POSITIONS: Record<string, [number, number]> = {
  'MN-01': [430, 258],
  'MS-01': [268, 385],
  'SJ-01': [840, 168],
  'SJ-02': [942, 258],
  'CF-01': [968, 388],
  'CF-02': [628, 648],
  'HT-01': [745, 452],
  'HT-02': [382, 572],
  'PS-01': [638, 165],
  'FJ-01': [1065, 492],
}

const MAP_VIEWS = ['Status', 'Umidade', 'Culturas', 'Rótulos'] as const

export const DashboardMapPage = () => {
  const [selectedId, setSelectedId] = useState<string>(
    SENSORS.find(s => statusFor('soilMoist', READINGS[s.id].soilMoist) !== 'ok')?.id ?? SENSORS[0].id
  )
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [activeView, setActiveView] = useState<string>('Status')

  const onlineSensors = SENSORS.length
  const alertCount = SENSORS.filter(s => {
    const r = READINGS[s.id]
    return statusFor('battery', r.battery) !== 'ok' || statusFor('soilMoist', r.soilMoist) !== 'ok'
  }).length

  const selected = SENSORS.find(s => s.id === selectedId) ?? SENSORS[0]
  const selR = READINGS[selected.id]
  const selHasIssue = METRICS.some(m => statusFor(m.key, selR[m.key]) !== 'ok')

  return (
    <div className="relative h-full overflow-hidden">

      {/* ── Full-screen SVG map ── */}
      <svg
        viewBox="0 0 1100 780"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid slice"
        aria-label="Mapa da fazenda"
      >
        <defs>
          {/* Diagonal hatching for fields */}
          <pattern id="hatch-green" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="10" stroke="#4a7c22" strokeWidth="0.9" opacity="0.28"/>
          </pattern>
          <pattern id="hatch-light" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="10" stroke="#7a9060" strokeWidth="0.7" opacity="0.22"/>
          </pattern>
          {/* Dotted for sandy/horta area */}
          <pattern id="dots-sand" width="12" height="12" patternUnits="userSpaceOnUse">
            <circle cx="6" cy="6" r="1.2" fill="#9a8060" opacity="0.25"/>
          </pattern>
          <filter id="pin-shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#000" floodOpacity="0.25"/>
          </filter>
          <filter id="card-shadow">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000" floodOpacity="0.12"/>
          </filter>
        </defs>

        {/* Base terrain */}
        <rect width="1100" height="780" fill="#e8e0d0"/>

        {/* ── Field polygons ── */}
        {/* Top-left field */}
        <polygon points="155,25 495,25 495,248 155,248" fill="#8ab85c" opacity="0.7"/>
        <polygon points="155,25 495,25 495,248 155,248" fill="url(#hatch-green)"/>
        <polygon points="155,25 495,25 495,248 155,248" fill="none" stroke="#5a8a30" strokeWidth="1.2" opacity="0.4"/>

        {/* SOJA NORTE (top-right) */}
        <polygon points="530,22 1100,22 1100,278 530,278" fill="#7aaa50" opacity="0.65"/>
        <polygon points="530,22 1100,22 1100,278 530,278" fill="url(#hatch-green)"/>
        <polygon points="530,22 1100,22 1100,278 530,278" fill="none" stroke="#5a8a30" strokeWidth="1.2" opacity="0.4"/>

        {/* SOJA OESTE (left center) */}
        <polygon points="22,298 375,298 375,625 22,625" fill="#8ab85c" opacity="0.65"/>
        <polygon points="22,298 375,298 375,625 22,625" fill="url(#hatch-light)"/>
        <polygon points="22,298 375,298 375,625 22,625" fill="none" stroke="#5a8a30" strokeWidth="1.2" opacity="0.38"/>

        {/* CAFÉ MORRO (right, partially cut) */}
        <polygon points="1020,208 1100,198 1100,530 1020,540" fill="#8ab85c" opacity="0.6"/>
        <polygon points="1020,208 1100,198 1100,530 1020,540" fill="url(#hatch-light)"/>

        {/* HORTA CENTRAL (sandy area) */}
        <polygon points="618,368 900,348 910,608 605,620" fill="#c8b888" opacity="0.55"/>
        <polygon points="618,368 900,348 910,608 605,620" fill="url(#dots-sand)"/>
        <polygon points="618,368 900,348 910,608 605,620" fill="none" stroke="#9a8060" strokeWidth="1.2" opacity="0.4"/>

        {/* PASTO OESTE (bottom-left) */}
        <polygon points="22,648 495,648 495,780 22,780" fill="#9aae70" opacity="0.62"/>
        <polygon points="22,648 495,648 495,780 22,780" fill="url(#hatch-light)"/>
        <polygon points="22,648 495,648 495,780 22,780" fill="none" stroke="#5a8a30" strokeWidth="1.2" opacity="0.35"/>

        {/* CAFÉ VALE (bottom-right) */}
        <polygon points="648,682 1100,672 1100,780 648,780" fill="#7aaa50" opacity="0.6"/>
        <polygon points="648,682 1100,672 1100,780 648,780" fill="url(#hatch-light)"/>
        <polygon points="648,682 1100,672 1100,780 648,780" fill="none" stroke="#5a8a30" strokeWidth="1.2" opacity="0.35"/>

        {/* MILHARAL SUL (bottom-center hint) */}
        <polygon points="200,758 580,750 580,780 200,780" fill="#8ab85c" opacity="0.4"/>

        {/* ── Road (diagonal) ── */}
        <path d="M 155,305 C 350,310 600,480 800,640 T 1100,740"
          fill="none" stroke="#c4a870" strokeWidth="28" strokeLinecap="round" opacity="0.75"/>
        <path d="M 155,305 C 350,310 600,480 800,640 T 1100,740"
          fill="none" stroke="#d8bc8a" strokeWidth="10" strokeLinecap="round" strokeDasharray="28 14" opacity="0.5"/>

        {/* ── Water body ── */}
        <ellipse cx="318" cy="588" rx="62" ry="38" fill="#7ab4d0" opacity="0.7"/>
        <ellipse cx="318" cy="588" rx="62" ry="38" fill="none" stroke="#5a90b8" strokeWidth="1.2" opacity="0.5"/>
        <ellipse cx="310" cy="582" rx="28" ry="14" fill="#a8d0e8" opacity="0.45"/>

        {/* ── Farm building ── */}
        <g transform="translate(500,310)">
          {/* House body */}
          <rect x="-32" y="-20" width="64" height="44" rx="3" fill="#9a7040"/>
          {/* Roof */}
          <path d="M-38,-20 L0,-52 L38,-20 Z" fill="#7a5228"/>
          {/* Door */}
          <rect x="-10" y="8" width="20" height="16" rx="2" fill="#5a3810" opacity="0.8"/>
          {/* Windows */}
          <rect x="-28" y="-8" width="14" height="12" rx="1" fill="#d4b870" opacity="0.7"/>
          <rect x="14" y="-8" width="14" height="12" rx="1" fill="#d4b870" opacity="0.7"/>
        </g>

        {/* ── Field labels ── */}
        <text x="330" y="125" textAnchor="middle" fontFamily="var(--sf-font-display)" fontSize="15" fontWeight="700" fill="#4a6828" opacity="0.6" letterSpacing="2">SOJA NORTE</text>
        <text x="330" y="145" textAnchor="middle" fontFamily="var(--sf-font-display)" fontSize="11" fill="#5a7838" opacity="0.5">8 ha</text>

        <text x="810" y="140" textAnchor="middle" fontFamily="var(--sf-font-display)" fontSize="15" fontWeight="700" fill="#4a6828" opacity="0.6" letterSpacing="2">SOJA NORTE</text>
        <text x="810" y="160" textAnchor="middle" fontFamily="var(--sf-font-display)" fontSize="11" fill="#5a7838" opacity="0.5">12 ha</text>

        <text x="198" y="452" textAnchor="middle" fontFamily="var(--sf-font-display)" fontSize="14" fontWeight="700" fill="#4a6828" opacity="0.55" letterSpacing="2">SOJA OESTE</text>
        <text x="198" y="471" textAnchor="middle" fontFamily="var(--sf-font-display)" fontSize="11" fill="#5a7838" opacity="0.45">5 ha</text>

        <text x="760" y="488" textAnchor="middle" fontFamily="var(--sf-font-display)" fontSize="14" fontWeight="700" fill="#7a6030" opacity="0.6" letterSpacing="2">HORTA CENTRAL</text>
        <text x="760" y="507" textAnchor="middle" fontFamily="var(--sf-font-display)" fontSize="11" fill="#8a7040" opacity="0.5">3 ha</text>

        <text x="255" y="712" textAnchor="middle" fontFamily="var(--sf-font-display)" fontSize="14" fontWeight="700" fill="#4a6828" opacity="0.55" letterSpacing="2">PASTO OESTE</text>
        <text x="255" y="731" textAnchor="middle" fontFamily="var(--sf-font-display)" fontSize="11" fill="#5a7838" opacity="0.45">8 ha</text>

        <text x="870" y="738" textAnchor="middle" fontFamily="var(--sf-font-display)" fontSize="14" fontWeight="700" fill="#4a6828" opacity="0.55" letterSpacing="2">CAFÉ VALE</text>
        <text x="870" y="757" textAnchor="middle" fontFamily="var(--sf-font-display)" fontSize="11" fill="#5a7838" opacity="0.45">5 ha</text>

        <text x="1068" y="370" textAnchor="middle" fontFamily="var(--sf-font-display)" fontSize="12" fontWeight="700" fill="#4a6828" opacity="0.55" letterSpacing="1" transform="rotate(-90,1068,370)">CAFÉ MORRO</text>

        {/* ── Sensor pins ── */}
        {SENSORS.map(sensor => {
          const [cx, cy] = PIN_POSITIONS[sensor.id] ?? [0, 0]
          const r = READINGS[sensor.id]
          const st = statusFor('soilMoist', r.soilMoist) !== 'ok' || statusFor('battery', r.battery) !== 'ok'
          const isSelected = sensor.id === selectedId
          const isHovered = sensor.id === hoveredId
          const color = st ? '#c74020' : '#2d6814'
          const scale = isSelected || isHovered ? 1.25 : 1

          return (
            <g
              key={sensor.id}
              transform={`translate(${cx},${cy}) scale(${scale})`}
              style={{ cursor: 'pointer', transformOrigin: `${cx}px ${cy}px` }}
              onClick={() => setSelectedId(sensor.id)}
              onMouseEnter={() => setHoveredId(sensor.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Glow ring when selected */}
              {isSelected && (
                <circle r="22" fill={color} opacity="0.18"/>
              )}
              {/* Teardrop pin shape */}
              <path
                d="M0,-22 C-10,-22 -17,-15 -17,-7 C-17,4 0,22 0,22 C0,22 17,4 17,-7 C17,-15 10,-22 0,-22 Z"
                fill={color}
                filter="url(#pin-shadow)"
              />
              {/* Inner circle */}
              <circle cy="-7" r="7" fill="white" opacity="0.92"/>
              {/* Sensor icon (leaf-like dot) */}
              <circle cy="-7" r="3" fill={color} opacity="0.7"/>
            </g>
          )
        })}

        {/* ── Hover tooltip ── */}
        {hoveredId && (() => {
          const [px, py] = PIN_POSITIONS[hoveredId] ?? [0, 0]
          const sensor = SENSORS.find(s => s.id === hoveredId)
          if (!sensor) return null
          const r = READINGS[sensor.id]
          const st = statusFor('soilMoist', r.soilMoist)
          const col = st === 'ok' ? '#2d6814' : st === 'warn' ? '#9a6020' : '#c74020'
          const label = `${sensor.name}  ${r.soilMoist}%`
          const w = label.length * 6.8 + 20
          return (
            <g transform={`translate(${px - w / 2},${py - 64})`}>
              <rect width={w} height={26} rx="7" fill="rgba(255,255,255,0.97)" filter="url(#card-shadow)"/>
              <text y="17.5" fontFamily="var(--sf-font-display)" fontSize="12" fill={col}>
                <tspan x="10" fontWeight="700">{sensor.name}</tspan>
                <tspan fontWeight="600" opacity="0.75">{'  '}{r.soilMoist}%</tspan>
              </text>
            </g>
          )
        })()}
      </svg>

      {/* ── Top-left: Farm info + compass + scale + filter ── */}
      <div className="absolute left-4 top-4 flex flex-col gap-2">
        {/* Farm name + filter row */}
        <div className="flex items-stretch gap-2">
          <div className="rounded-xl border border-white/50 bg-white/92 px-4 py-2.5 shadow-sm backdrop-blur-md">
            <div className="font-display text-sm font-semibold text-fg">Fazenda Serra Verde</div>
            <div className="text-xs text-fg-subtle">48 ha · sincronizado há 2 min</div>
          </div>
          <button className="flex items-center gap-1.5 rounded-xl border border-white/50 bg-white/92 px-3 py-2.5 shadow-sm backdrop-blur-md hover:bg-white">
            <span className="font-display text-[12px] font-semibold text-fg">🌿 Todas as culturas</span>
            <ChevronDown size={13} strokeWidth={2} className="text-fg-muted"/>
          </button>
        </div>

        {/* Compass + scale */}
        <div className="flex items-center gap-3.5 rounded-xl border border-white/50 bg-white/88 px-3.5 py-2.5 shadow-sm backdrop-blur-md">
          {/* Compass rose */}
          <svg viewBox="0 0 32 32" className="size-7 shrink-0">
            <circle cx="16" cy="16" r="15" fill="none" stroke="#d0c8bc" strokeWidth="1"/>
            <polygon points="16,4 19,16 16,14 13,16" fill="#c74020"/>
            <polygon points="16,28 13,16 16,18 19,16" fill="#a09488"/>
            <text x="16" y="5.5" textAnchor="middle" fontSize="5.5" fontWeight="800" fill="#c74020" fontFamily="var(--sf-font-display)">N</text>
          </svg>
          {/* Scale bar */}
          <div className="flex flex-col gap-1">
            <div className="flex h-[5px] w-[56px] overflow-hidden rounded-sm">
              <div className="w-1/4 bg-fg-muted/60"/>
              <div className="w-1/4 bg-transparent border-t border-b border-fg-muted/40"/>
              <div className="w-1/4 bg-fg-muted/60"/>
              <div className="w-1/4 bg-transparent border-t border-b border-fg-muted/40"/>
            </div>
            <span className="font-mono text-[10px] text-fg-muted">200 m</span>
          </div>
        </div>
      </div>

      {/* ── Bottom center: map view toolbar ── */}
      <div className="absolute bottom-4" style={{ left: 'calc(50% - 142px - 136px)', transform: 'translateX(-50%)' }}>
        <div className="flex items-center gap-0.5 rounded-full border border-white/50 bg-white/92 p-1 shadow-sm backdrop-blur-md">
          {MAP_VIEWS.map(view => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={cn(
                'rounded-full px-3.5 py-1.5 font-display text-[12.5px] font-semibold transition-all',
                activeView === view ? 'bg-leaf-600 text-white shadow-xs' : 'text-fg-muted hover:text-fg'
              )}
            >
              {view}
            </button>
          ))}
        </div>
      </div>

      {/* ── Right floating panel ── */}
      <div className="absolute bottom-4 right-4 top-4 flex w-[272px] flex-col overflow-hidden rounded-2xl border border-white/50 bg-white/92 shadow-xl backdrop-blur-md">

        {/* Add sensor button */}
        <div className="shrink-0 p-3 pb-0">
          <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-leaf-700 py-2.5 font-display text-sm font-semibold text-white shadow-xs transition-colors hover:bg-leaf-600 active:scale-[0.98]">
            <Plus size={15} strokeWidth={2.5} aria-hidden/>
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

          <h2 className="font-display text-[18px] font-bold leading-tight text-fg">{selected.name}</h2>
          <p className="mt-0.5 text-[11px] text-fg-subtle">
            {selected.id} · {selected.crop} · {selected.serial}
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
                    <m.icon size={10} strokeWidth={2} className={cn('shrink-0', iconCls)} aria-hidden/>
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
            <button className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-leaf-700 py-2 font-display text-[13px] font-semibold text-white hover:bg-leaf-600">
              Abrir sensor
            </button>
            <button className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 font-display text-[13px] font-semibold text-fg-muted hover:border-leaf-600 hover:text-fg">
              <Bell size={13} strokeWidth={1.75} aria-hidden/>
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
                  onClick={() => setSelectedId(sensor.id)}
                  className={cn(
                    'w-full border-b border-border/40 px-4 py-2.5 text-left transition-colors last:border-b-0',
                    isActive ? 'bg-leaf-50/80 hover:bg-leaf-50' : 'hover:bg-sand-50/80',
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={cn('size-2 shrink-0 rounded-full', dotCls)}/>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate font-display text-[13px] font-semibold text-fg">
                          {sensor.name}
                        </span>
                        {showRegar && (
                          <Badge tone="alert" size="sm">regar</Badge>
                        )}
                      </div>
                      <div className="text-[11px] text-fg-subtle">
                        {sensor.id.toLowerCase()} · {sensor.crop.toLowerCase()}
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
