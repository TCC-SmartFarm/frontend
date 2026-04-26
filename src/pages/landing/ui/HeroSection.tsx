import { cn } from '@/shared/lib/utils'
import { Alert } from '@/shared/ui/alert'
import { AlertTriangle } from 'lucide-react'

interface HeroSectionProps {
  onLogin: () => void
  isLoading: boolean
  error: Error | null | undefined
}

export const HeroSection = ({ onLogin, isLoading, error }: HeroSectionProps) => (
  <>
    {/* Floating pill nav */}
    <nav className="sticky top-4 z-30 flex justify-center px-6">
      <div className="flex items-center gap-1 rounded-full border border-white/70 bg-white/80 px-2 py-2 shadow-md backdrop-blur-xl">
        <div className="flex items-center gap-2 border-r border-sand-200/60 pr-4">
          <span className="flex size-5 rounded-full bg-leaf-600" />
          <span className="font-display text-[15px] font-bold tracking-tight text-fg">SmartFarm</span>
        </div>
        {(
          [
            ['#como-funciona', 'Como funciona'],
            ['#monitorar', 'O que monitora'],
            ['#por-que', 'Por que usar'],
            ['#planos', 'Planos'],
          ] as [string, string][]
        ).map(([href, label]) => (
          <a
            key={href}
            href={href}
            className="rounded-full px-3.5 py-1.5 text-[13.5px] font-medium text-fg-muted transition-colors hover:text-fg"
          >
            {label}
          </a>
        ))}
        <button
          onClick={onLogin}
          disabled={isLoading}
          className={cn(
            'ml-1 rounded-full px-[18px] py-2 font-display text-[13.5px] font-semibold text-white transition-all',
            'bg-leaf-900 hover:bg-leaf-800 disabled:opacity-50',
          )}
        >
          {isLoading ? 'Carregando…' : 'Entrar'}
        </button>
      </div>
    </nav>

    {/* Hero body */}
    <section className="relative mx-auto max-w-[980px] px-6 pb-[70px] pt-[90px] text-center">
      <DecorStar className="absolute left-15 top-20" />
      <DecorStar className="absolute right-20 top-[120px]" />
      <DecorStar className="absolute bottom-8 left-[20%] opacity-50" />

      <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-sand-200/60 bg-white/70 px-3.5 py-1.5 text-[12.5px] font-medium text-fg-muted">
        <span className="size-1.5 rounded-full bg-leaf-600" />
        Plataforma para pequenos e médios produtores
      </div>

      <h1
        className="m-0 font-display font-bold leading-[1.02] tracking-[-0.035em] text-leaf-900"
        style={{ fontSize: 'clamp(48px, 7vw, 92px)' }}
      >
        Saiba o que sua terra
        <br />
        precisa, de qualquer lugar.
      </h1>

      <p className="mx-auto mb-9 mt-7 max-w-[580px] text-[17px] leading-[1.55] text-fg-muted">
        Sensores simples, dados claros. A SmartFarm acompanha solo, ar e luz na sua
        propriedade e mostra tudo no seu celular — sem precisar ir até a roça pra ver.
      </p>

      {error && (
        <div className="mx-auto mb-6 max-w-lg">
          <Alert tone="alert" icon={AlertTriangle} title="Erro ao autenticar">
            {error.message}
          </Alert>
        </div>
      )}

      <button
        onClick={onLogin}
        disabled={isLoading}
        className="inline-flex items-center gap-2.5 rounded-full bg-leaf-900 px-8 py-4 font-display text-[15px] font-semibold text-white transition-all hover:bg-leaf-800 disabled:opacity-50"
      >
        Conhecer a plataforma
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
          <path d="M5 12h14M13 5l7 7-7 7" />
        </svg>
      </button>
    </section>
  </>
)

function DecorStar({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" className={cn('text-leaf-700 opacity-40', className)} aria-hidden>
      <path d="M12 0 L 14 10 L 24 12 L 14 14 L 12 24 L 10 14 L 0 12 L 10 10 Z" fill="currentColor" />
    </svg>
  )
}
