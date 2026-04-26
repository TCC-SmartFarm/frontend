const stats = [
  { value: '50+',   label: 'Sensores ativos', sub: 'Em campo agora' },
  { value: '200+',  label: 'Hectares',         sub: 'Monitorados' },
  { value: '120k+', label: 'Leituras',          sub: 'Por mês' },
  { value: '38%',   label: 'Menos água',        sub: 'Em média' },
]

export const StatsRow = () => (
  <section className="mx-auto max-w-[1280px] px-10 pb-[70px] pt-5">
    <div className="grid grid-cols-4 divide-x divide-sand-200/60 border-b border-t border-sand-300/40">
      {stats.map((s) => (
        <div key={s.label} className="px-6 py-8">
          <div
            className="font-data font-semibold leading-none tracking-tight text-leaf-900 whitespace-nowrap"
            style={{ fontSize: 'clamp(32px, 3.4vw, 46px)' }}
          >
            {s.value}
          </div>
          <div className="mt-2.5 text-[13px] font-semibold text-fg">{s.label}</div>
          <div className="text-xs text-fg-subtle">{s.sub}</div>
        </div>
      ))}
    </div>
  </section>
)
