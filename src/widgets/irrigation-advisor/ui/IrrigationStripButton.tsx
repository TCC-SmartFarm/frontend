import type { ComponentPropsWithRef } from 'react'
import { ChevronDown, CloudRain } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import type { StripView } from '../lib/strip-view'

// Largura fixa: a faixa troca de texto quando as consultas terminam, e sem
// largura fixa a busca ao lado pularia de posição.
export const STRIP_BOX = 'h-11 w-[370px] shrink-0 rounded-xl'

interface IrrigationStripButtonProps extends ComponentPropsWithRef<'button'> {
  view: StripView
}

/**
 * O visual da faixa, separado da busca de dados: o `IrrigationStrip` o usa
 * como gatilho do popover (via `asChild`, que injeta ref e handlers — daí o
 * repasse de `...props`), e ele pode ser renderizado sozinho com um `view`
 * qualquer para conferir as variações.
 */
export const IrrigationStripButton = ({ view, className, ...props }: IrrigationStripButtonProps) => {
  const { icon: Icon } = view
  return (
    <button
      type="button"
      aria-label="Ver recomendação de irrigação"
      {...props}
      className={cn(
        STRIP_BOX,
        'group relative flex items-center gap-3 overflow-hidden px-3.5 text-left outline-none transition-[box-shadow,translate] duration-200 ease-[cubic-bezier(0.2,0.7,0.3,1)]',
        'hover:-translate-y-px hover:shadow-md focus-visible:ring-[3px] focus-visible:ring-leaf-200',
        view.color ? 'text-white shadow-sm' : 'border border-border bg-white text-fg-muted',
        className,
      )}
      style={view.color ? { background: view.color } : undefined}
    >
      {view.color && (
        <div aria-hidden className="pointer-events-none absolute -right-6 -top-10 size-24 rounded-full bg-white/12" />
      )}
      <Icon size={20} strokeWidth={1.75} aria-hidden className="relative shrink-0" />
      <div className="relative min-w-0 flex-1 leading-tight">
        <div className="truncate font-display text-[14.5px] font-bold">{view.headline}</div>
        {/* Gotas = umidade do solo, como em todo o painel. A chuva, à
            direita, usa a nuvem: são dois números em %, e sem ícone o
            da direita não diz o que é. */}
        <div className={cn('flex items-center gap-1 truncate text-[11px]', view.color ? 'text-white/85' : 'text-fg-subtle')}>
          {view.detail}
        </div>
      </div>
      {view.rain !== null && (
        <div className="relative shrink-0 text-right leading-tight" title="Maior chance de chuva prevista para os próximos 6 dias">
          <div className="flex items-center justify-end gap-1 font-data text-[13px] font-semibold tabular-nums">
            <CloudRain size={14} strokeWidth={2} aria-hidden />
            {Math.round(view.rain)}%
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
  )
}
