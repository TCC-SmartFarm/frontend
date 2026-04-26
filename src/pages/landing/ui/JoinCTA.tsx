import { FarmLandscape } from './LandscapeBand'

interface JoinCTAProps {
  onLogin: () => void
}

export const JoinCTA = ({ onLogin }: JoinCTAProps) => (
  <section className="px-10 py-[60px]">
    <div className="relative mx-auto h-[360px] max-w-[1280px] overflow-hidden rounded-[28px]">
      <FarmLandscape />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(26,40,26,0.2) 0%, rgba(26,40,26,0.55) 100%)' }} />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-10 text-center">
        <h2
          className="m-0 max-w-[700px] font-display font-bold leading-[1.02] tracking-[-0.03em] text-white"
          style={{ fontSize: 56 }}
        >
          Bora colocar a SmartFarm na sua terra hoje.
        </h2>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <input
            placeholder="seu@email.com"
            className="min-w-[280px] rounded-full border-0 bg-white/95 px-[22px] py-3.5 font-sans text-[15px] text-fg outline-none placeholder:text-fg-subtle"
            aria-label="Seu e-mail"
          />
          <button
            onClick={onLogin}
            className="rounded-full bg-leaf-900 px-7 py-3.5 font-display text-[15px] font-semibold text-white transition-all hover:bg-leaf-800"
          >
            Começar →
          </button>
        </div>
      </div>
    </div>
  </section>
)
