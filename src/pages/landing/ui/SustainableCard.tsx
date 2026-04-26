export const SustainableCard = () => (
  <section className="px-10 py-[60px]" style={{ background: '#f3eee5' }}>
    <div className="mx-auto grid max-w-[1280px] grid-cols-[auto_1fr] items-center gap-12 rounded-3xl bg-leaf-50 px-14 py-12">
      <div className="flex size-[140px] shrink-0 items-center justify-center rounded-[28px] bg-white shadow-sm">
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" aria-hidden>
          <circle cx="40" cy="40" r="36" stroke="var(--sf-leaf-700)" strokeWidth="1.5" />
          <path d="M40 16 Q 28 32,28 48 Q 28 60,40 64 Q 52 60,52 48 Q 52 32,40 16 Z" fill="var(--sf-leaf-600)" />
          <path d="M40 28 L 40 64 M 32 40 Q 36 44,40 44 M 48 44 Q 44 48,40 48" stroke="#fff" strokeWidth="1" strokeLinecap="round" />
        </svg>
      </div>
      <h3 className="m-0 text-[36px] font-semibold leading-[1.15] tracking-tight text-leaf-900">
        Cuidando da terra hoje, garantindo colheita amanhã. Tecnologia que serve a quem produz.
      </h3>
    </div>
  </section>
)
