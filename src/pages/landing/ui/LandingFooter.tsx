const cols = [
  {
    title: 'Produto',
    items: ['Como funciona', 'O que monitora', 'Sensores'],
  },
]

export const LandingFooter = () => (
  <footer className="px-10 pb-10 pt-[60px]" style={{ background: '#f3eee5' }}>
    <div className="mx-auto flex max-w-[1280px] flex-wrap items-start justify-between gap-10">
      <div>
        <div className="flex items-center gap-2.5">
          <span className="flex size-7 rounded-full bg-leaf-600" />
          <span className="font-display text-[18px] font-bold tracking-tight text-fg">SmartFarm</span>
        </div>
        <p className="mt-3.5 max-w-[280px] text-[13.5px] leading-relaxed text-fg-muted">
          Sensores e dados claros pra quem cuida da terra.
        </p>
      </div>

      {cols.map((c) => (
        <div key={c.title}>
          <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-fg-subtle">
            {c.title}
          </div>
          <ul className="mt-3.5 flex flex-col gap-2 p-0 list-none">
            {c.items.map((item) => (
              <li key={item}>
                <a href="#" className="text-[14px] text-fg-muted transition-colors hover:text-fg">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>

    <div className="mx-auto mt-10 flex max-w-[1280px] items-center border-t border-sand-300/40 pt-6 text-[12.5px] text-fg-subtle">
      <span>© 2026 SmartFarm · Feito no Brasil</span>
    </div>
  </footer>
)
