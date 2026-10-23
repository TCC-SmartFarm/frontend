import { Check, ChevronDown, WifiOff } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/ui/dropdown-menu'
import { cn } from '@/shared/lib/utils'
import { irrigationHeadline, irrigationTheme } from '../lib/irrigation-theme'
import type { SensorIrrigation } from '../lib/irrigation-summary'
import { NO_DATA_COLOR } from '../lib/strip-view'

interface SensorSwitcherProps {
  items: SensorIrrigation[]
  value: string
  onChange: (devEUI: string) => void
  /** `onColor`: sobre o fundo colorido do card. `onWhite`: sobre o painel de erro. */
  tone?: 'onColor' | 'onWhite'
}

/**
 * O nome do sensor no topo do card, virado menu: com vários sensores pedindo
 * atenção, o card mostra o mais urgente e daqui se troca para os outros, sem
 * uma lista ocupando o card — a lista completa já está no painel do mapa.
 */
export const SensorSwitcher = ({ items, value, onChange, tone = 'onColor' }: SensorSwitcherProps) => {
  const current = items.find((i) => i.sensor.devEUI === value) ?? items[0]
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'inline-flex min-w-0 items-center gap-1 rounded-md px-1.5 py-0.5 font-display text-[12px] font-semibold normal-case tracking-normal outline-none transition-colors',
          tone === 'onColor'
            ? 'bg-white/15 text-white hover:bg-white/25 focus-visible:ring-2 focus-visible:ring-white/60'
            : 'bg-sand-100 text-fg hover:bg-sand-200 focus-visible:ring-2 focus-visible:ring-leaf-200',
        )}
      >
        <span className="truncate">{current.sensor.name}</span>
        <ChevronDown size={13} strokeWidth={2.25} aria-hidden className="shrink-0" />
      </DropdownMenuTrigger>
      {/* z acima do popover do card (z-[1100]). */}
      <DropdownMenuContent align="end" sideOffset={6} className="z-[1200] w-64">
        {items.map((item) => {
          const theme = item.data ? irrigationTheme(item.data.irrigation.action) : null
          const Icon = theme?.icon ?? WifiOff
          const selected = item.sensor.devEUI === current.sensor.devEUI
          return (
            <DropdownMenuItem
              key={item.sensor.devEUI}
              onSelect={() => onChange(item.sensor.devEUI)}
              className="gap-2.5"
            >
              <span
                className="flex size-7 shrink-0 items-center justify-center rounded-md text-white"
                style={{ background: theme?.color ?? NO_DATA_COLOR }}
              >
                <Icon size={15} strokeWidth={1.75} aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-display text-[13px] font-semibold">{item.sensor.name}</span>
                <span className="block truncate text-[11.5px] text-fg-muted">
                  {item.data ? irrigationHeadline(item.data) : 'Está sem leitura recente'}
                </span>
              </span>
              {selected && <Check size={15} strokeWidth={2.25} aria-hidden className="shrink-0 text-leaf-600" />}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
