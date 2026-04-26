import { Check } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

interface Plan {
  name: string
  price: string
  period: string
  sensors: string
  features: string[]
  cta: string
  featured?: boolean
}

const plans: Plan[] = [
  {
    name: 'Começar',
    price: 'Grátis',
    period: 'pra sempre',
    sensors: 'Até 2 sensores',
    features: [
      'Mapa e dashboard completos',
      'Histórico de 30 dias',
      'Alertas no app',
    ],
    cta: 'Começar grátis',
  },
  {
    name: 'Propriedade',
    price: 'R$ 79',
    period: '/mês',
    sensors: 'Até 10 sensores',
    features: [
      'Tudo do Começar',
      'Histórico ilimitado',
      'Alertas por SMS e WhatsApp',
      'Thresholds por sensor',
      'Suporte por WhatsApp',
    ],
    cta: 'Assinar plano',
    featured: true,
  },
  {
    name: 'Fazenda',
    price: 'R$ 199',
    period: '/mês',
    sensors: 'Sensores ilimitados',
    features: [
      'Tudo do Propriedade',
      'Múltiplas propriedades',
      'Relatórios PDF mensais',
      'Acesso para equipe',
      'Suporte prioritário',
    ],
    cta: 'Falar com vendas',
  },
]

interface PricingSectionProps {
  onGetStarted: () => void
}

export const PricingSection = ({ onGetStarted }: PricingSectionProps) => (
  <section id="planos" className="bg-white px-10 py-[100px]">
    <div className="mx-auto max-w-[1280px]">
      <div className="mb-14 text-center">
        <h2
          className="m-0 font-display font-bold leading-[1.02] tracking-[-0.03em] text-leaf-900"
          style={{ fontSize: 56 }}
        >
          Planos <em className="font-semibold italic text-leaf-600">simples.</em>
        </h2>
        <p className="mx-auto mt-4 max-w-[540px] text-[17px] text-fg-muted">
          Comece grátis. Cresça quando fizer sentido. Cancele quando quiser.
        </p>
      </div>

      <div className="grid grid-cols-3 items-end gap-[18px]">
        {plans.map((p) => (
          <div
            key={p.name}
            className={cn(
              'flex flex-col gap-5 rounded-3xl p-9',
              p.featured
                ? 'bg-leaf-900 text-white shadow-2xl -translate-y-3'
                : 'border border-border bg-[#f3eee5]',
            )}
          >
            <div>
              <div
                className={cn(
                  'text-[13px] font-semibold uppercase tracking-[0.08em]',
                  p.featured ? 'text-leaf-300' : 'text-fg-muted',
                )}
              >
                {p.name}
                {p.featured && ' · mais escolhido'}
              </div>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="font-data text-[56px] font-semibold leading-none tracking-[-0.02em]">
                  {p.price}
                </span>
                <span className={cn('text-[14px]', p.featured ? 'text-leaf-200' : 'text-fg-muted')}>
                  {p.period}
                </span>
              </div>
              <div className="mt-2 text-[14px] font-semibold">{p.sensors}</div>
            </div>

            <div className={cn('h-px', p.featured ? 'bg-white/15' : 'bg-sand-300/40')} />

            <ul className="flex flex-1 flex-col gap-2.5 text-[14px]">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <Check
                    size={16}
                    strokeWidth={2.5}
                    className={cn('mt-0.5 shrink-0', p.featured ? 'text-leaf-300' : 'text-leaf-600')}
                    aria-hidden
                  />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={onGetStarted}
              className={cn(
                'mt-auto rounded-full px-6 py-3.5 font-display text-[14.5px] font-semibold transition-all hover:brightness-95',
                p.featured
                  ? 'bg-white text-leaf-900'
                  : 'bg-leaf-900 text-white hover:bg-leaf-800',
              )}
            >
              {p.cta}
            </button>
          </div>
        ))}
      </div>

      <p className="mt-8 text-center text-[13px] text-fg-subtle">
        Sensor vendido à parte: R$ 290 cada · Garantia de 2 anos · Bateria dura ~6 meses
      </p>
    </div>
  </section>
)
