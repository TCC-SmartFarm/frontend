export const LandscapeBand = () => (
  <section className="px-6 pb-14">
    <div className="relative mx-auto h-[480px] max-w-[1280px] overflow-hidden rounded-3xl shadow-xl">
      <FarmLandscape />
      <div className="absolute bottom-6 left-7 max-w-[360px] text-white">
        <div className="text-[28px] font-semibold italic leading-[1.1] tracking-tight">
          A jornada para uma colheita melhor.
        </div>
      </div>
      <div className="absolute bottom-6 right-7 text-right text-xs text-white/85">
        Fazenda Serra Verde · MG
      </div>
    </div>
  </section>
)

export const FarmLandscape = () => (
  <svg
    viewBox="0 0 1280 480"
    preserveAspectRatio="xMidYMid slice"
    className="absolute inset-0 h-full w-full"
    aria-hidden
  >
    <defs>
      <linearGradient id="sky-grad" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor="#e8d8ad" />
        <stop offset="55%" stopColor="#c4cdb0" />
        <stop offset="100%" stopColor="#8ca27a" />
      </linearGradient>
      <linearGradient id="hill-2" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor="#7fa45a" />
        <stop offset="100%" stopColor="#5d8440" />
      </linearGradient>
      <linearGradient id="field-grad" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor="#a3c084" />
        <stop offset="100%" stopColor="#7fa45a" />
      </linearGradient>
    </defs>
    <rect width="1280" height="480" fill="url(#sky-grad)" />
    <circle cx="980" cy="140" r="60" fill="#f5e3b3" opacity="0.8" />
    <circle cx="980" cy="140" r="40" fill="#fef3d4" opacity="0.9" />
    <path d="M0 230 Q 200 200,400 215 T 800 200 Q 1000 195,1280 220 L1280 280 L0 280 Z" fill="#7d9670" opacity="0.6" />
    <path d="M0 280 Q 250 250,500 270 T 950 260 Q 1150 255,1280 280 L1280 350 L0 350 Z" fill="url(#hill-2)" opacity="0.85" />
    {[120,240,380,540,700,880,1050,1180].map((x, i) => (
      <g key={i} transform={`translate(${x},${268 + (i%3)*4})`}>
        <ellipse cx="0" cy="-2" rx="14" ry="16" fill="#35502a" />
        <ellipse cx="0" cy="-12" rx="10" ry="11" fill="#456830" />
      </g>
    ))}
    <path d="M0 350 Q 400 320,800 340 T 1280 350 L1280 480 L0 480 Z" fill="url(#field-grad)" />
    {[360,380,400,420,440,460].map((y, i) => (
      <path
        key={i}
        d={`M0 ${y+i*2} Q 400 ${y-6+i*2},800 ${y-2+i*2} T 1280 ${y+i*2}`}
        fill="none" stroke="#5d8440" strokeWidth="0.8" opacity={0.5 - i*0.05}
      />
    ))}
    {Array.from({length:40},(_,i) => (
      <line key={i} x1={i*36-60} y1={400} x2={i*36-30} y2={480} stroke="#456830" strokeWidth="2" opacity="0.35" />
    ))}
  </svg>
)
