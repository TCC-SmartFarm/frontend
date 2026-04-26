const cards = [
  {
    title: 'Acompanhe a lavoura',
    body: 'Solo, ar, luz e bateria — tudo num só painel.',
    illust: 'monitor' as const,
  },
  {
    title: 'Plante com ciência',
    body: 'Histórico que mostra padrões antes invisíveis.',
    illust: 'science' as const,
  },
  {
    title: 'Decisões automáticas',
    body: 'Avisos certeiros: regue agora, espere até amanhã.',
    illust: 'auto' as const,
  },
]

export const NextGenSolutions = () => (
  <section id="por-que" className="bg-white px-10 py-[100px]">
    <div className="mx-auto max-w-[1280px]">
      <h2
        className="m-0 mb-14 max-w-[720px] font-display font-bold leading-[1.02] tracking-[-0.03em] text-leaf-900"
        style={{ fontSize: 56 }}
      >
        Soluções que respeitam quem já{' '}
        <em className="font-semibold italic text-leaf-600">entende</em> de terra.
      </h2>
      <div className="grid grid-cols-3 gap-[18px]">
        {cards.map((c) => (
          <div key={c.title} className="flex flex-col gap-4">
            <div className="relative h-[220px] overflow-hidden rounded-[18px] bg-sand-100">
              <SolutionIllust kind={c.illust} />
            </div>
            <h3 className="m-0 text-[22px] font-semibold tracking-tight">{c.title}</h3>
            <p className="m-0 text-[14.5px] leading-[1.5] text-fg-muted">{c.body}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
)

function SolutionIllust({ kind }: { kind: 'monitor' | 'science' | 'auto' }) {
  if (kind === 'monitor') {
    return (
      <svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
        <rect width="400" height="220" fill="#1a281a" />
        <rect x="40" y="30" width="320" height="160" rx="10" fill="#262625" />
        <rect x="60" y="50" width="120" height="60" rx="6" fill="#35502a" />
        <text x="120" y="88" textAnchor="middle" fontFamily="var(--sf-font-data)" fontSize="22" fontWeight="600" fill="#a3c084">68%</text>
        <rect x="200" y="50" width="80" height="60" rx="6" fill="#456830" />
        <text x="240" y="88" textAnchor="middle" fontFamily="var(--sf-font-data)" fontSize="18" fontWeight="600" fill="#e2ecd9">24°</text>
        <rect x="290" y="50" width="50" height="60" rx="6" fill="#5d8440" />
        <rect x="60" y="120" width="280" height="60" rx="6" fill="#1a281a" />
        <path d="M70 160 Q 120 150,170 155 T 270 140 T 330 130" fill="none" stroke="#7fa45a" strokeWidth="2" />
      </svg>
    )
  }
  if (kind === 'science') {
    return (
      <svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
        <rect width="400" height="220" fill="#a3c084" />
        <path d="M0 150 Q 100 130,200 140 T 400 135 L400 220 L0 220 Z" fill="#7fa45a" />
        {Array.from({length:20},(_,i) => (
          <line key={i} x1={i*25} y1="150" x2={i*25+30} y2="220" stroke="#5d8440" strokeWidth="1.5" opacity="0.4" />
        ))}
        <g transform="translate(180,80)">
          <circle cx="0" cy="0" r="14" fill="#e7ddc8" />
          <path d="M-18 14 Q 0 10,18 14 L14 60 L-14 60 Z" fill="#5d87a0" />
          <rect x="-22" y="60" width="14" height="36" fill="#262625" />
          <rect x="8" y="60" width="14" height="36" fill="#262625" />
          <rect x="20" y="20" width="32" height="22" rx="3" fill="#fff" />
        </g>
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
      <rect width="400" height="220" fill="#7fa45a" />
      <path d="M0 100 Q 100 80,200 90 T 400 100 L400 220 L0 220 Z" fill="#5d8440" />
      <g transform="translate(200,130)" stroke="#fff" strokeWidth="1.5" fill="none" opacity="0.7">
        <path d="M-80 0 Q -40 -60,0 -70 Q 40 -60,80 0" />
        <path d="M-60 0 Q -30 -45,0 -52 Q 30 -45,60 0" />
        <path d="M-40 0 Q -20 -30,0 -34 Q 20 -30,40 0" />
      </g>
      <circle cx="200" cy="130" r="6" fill="#262625" />
      <line x1="200" y1="130" x2="200" y2="160" stroke="#262625" strokeWidth="2" />
    </svg>
  )
}
