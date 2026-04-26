const params = [
  { label: 'Umidade do solo', value: '68%',   sub: 'Ideal · estável',    icon: 'droplets',    color: '#2e6b7a' },
  { label: 'Temp. solo',      value: '24°C',  sub: 'Dentro do ideal',   icon: 'thermometer', color: '#b97239' },
  { label: 'Umidade ar',      value: '62%',   sub: 'Estável',            icon: 'cloudRain',   color: '#5d87a0' },
  { label: 'Luminosidade',    value: '1.240', sub: 'lux · dia claro',    icon: 'sun',         color: '#c89a1f' },
  { label: 'Temp. ar',        value: '28°C',  sub: 'Subindo',            icon: 'thermSun',    color: '#a14a2e' },
  { label: 'Bateria',         value: '87%',   sub: '~ 6 meses',          icon: 'battery',     color: '#456830' },
]

export const WhatYouMonitor = () => (
  <section id="monitorar" className="px-10 py-[90px]" style={{ background: '#f3eee5' }}>
    <div className="mx-auto max-w-[1280px]">
      <h2
        className="m-0 mb-4 max-w-[720px] font-display font-bold leading-[1.02] tracking-[-0.03em] text-leaf-900"
        style={{ fontSize: 56 }}
      >
        Tudo que <em className="font-semibold italic text-leaf-600">importa</em>
        <br />na sua lavoura.
      </h2>
      <p className="mb-14 text-[17px] text-fg-muted max-w-[580px]">
        6 leituras essenciais, em uma tela. Sem jargão.
      </p>

      <div className="grid grid-cols-12 gap-4">
        <BigTile p={params[0]} className="col-span-6 row-span-2" style={{ minHeight: 460 }} />
        <Tile p={params[1]} className="col-span-3" style={{ minHeight: 220 }} />
        <Tile p={params[2]} className="col-span-3" style={{ minHeight: 220 }} />
        <DarkTile p={params[3]} className="col-span-4" style={{ minHeight: 220 }} />
        <Tile p={params[4]} className="col-span-2" style={{ minHeight: 220 }} />
        <SideTile p={params[5]} className="col-span-6" style={{ minHeight: 220 }} />
      </div>
    </div>
  </section>
)

interface P { label: string; value: string; sub: string; icon: string; color: string }

function BigTile({ p, className, style }: { p: P; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-[22px] bg-white p-7 ${className ?? ''}`}
      style={style}
    >
      <div className="flex items-center gap-2.5 text-fg-muted">
        <div className="flex size-8 items-center justify-center rounded-lg" style={{ background: `${p.color}22`, color: p.color }}>
          <ParamIcon name={p.icon} size={18} />
        </div>
        <span className="text-xs font-semibold uppercase tracking-[0.08em]">{p.label}</span>
      </div>
      <div
        className="mt-6 font-data font-semibold leading-[0.9] tracking-[-0.03em] text-leaf-900"
        style={{ fontSize: 96 }}
      >
        {p.value}
      </div>
      <div className="mt-3 text-[15px] text-fg-muted">{p.sub}</div>
      <svg viewBox="0 0 480 160" preserveAspectRatio="none" className="absolute bottom-0 left-0 h-[160px] w-full" aria-hidden>
        <rect x="0" y="60" width="480" height="60" fill={p.color} opacity="0.08" />
        <path d="M0 100 Q 80 90,160 95 T 320 80 Q 400 75,480 88" fill="none" stroke={p.color} strokeWidth="2.5" />
        <path d="M0 100 Q 80 90,160 95 T 320 80 Q 400 75,480 88 L480 160 L0 160 Z" fill={p.color} opacity="0.05" />
      </svg>
    </div>
  )
}

function Tile({ p, className, style }: { p: P; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`flex flex-col justify-between rounded-[22px] bg-white p-[22px] ${className ?? ''}`}
      style={style}
    >
      <div className="flex items-center gap-2 text-fg-muted">
        <div className="flex size-[26px] items-center justify-center rounded-[7px]" style={{ background: `${p.color}22`, color: p.color }}>
          <ParamIcon name={p.icon} size={14} />
        </div>
        <span className="text-[11.5px] font-semibold uppercase tracking-[0.06em]">{p.label}</span>
      </div>
      <div>
        <div
          className="font-data font-semibold leading-none tracking-[-0.02em] text-leaf-900 whitespace-nowrap overflow-hidden text-ellipsis"
          style={{ fontSize: 'clamp(24px,2.4vw,34px)' }}
        >
          {p.value}
        </div>
        <div className="mt-1.5 text-[12.5px] text-fg-muted">{p.sub}</div>
      </div>
    </div>
  )
}

function DarkTile({ p, className, style }: { p: P; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`relative flex flex-col justify-between overflow-hidden rounded-[22px] p-6 ${className ?? ''}`}
      style={{ background: '#1a281a', color: '#fff', ...style }}
    >
      <div className="text-xs font-semibold uppercase tracking-[0.08em] text-leaf-200 opacity-85">{p.label}</div>
      <div>
        <div className="font-data text-5xl font-semibold tracking-[-0.02em]">{p.value}</div>
        <div className="mt-1.5 text-[13px] text-leaf-200 opacity-85">{p.sub}</div>
      </div>
      <div
        className="absolute -right-8 -top-8 size-[150px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(200,154,31,0.5), transparent 70%)' }}
      />
    </div>
  )
}

function SideTile({ p, className, style }: { p: P; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`flex items-center gap-6 rounded-[22px] bg-white p-6 ${className ?? ''}`}
      style={style}
    >
      <div className="flex-1">
        <div className="text-xs font-semibold uppercase tracking-[0.08em] text-fg-muted">{p.label}</div>
        <div
          className="mt-3 font-data font-semibold leading-none tracking-[-0.02em] text-leaf-900"
          style={{ fontSize: 60 }}
        >
          {p.value}
        </div>
        <div className="mt-2 text-[13px] text-fg-muted">{p.sub}</div>
      </div>
      <div
        className="flex shrink-0 size-[110px] items-center justify-center rounded-full"
        style={{ background: `${p.color}15`, color: p.color }}
      >
        <ParamIcon name={p.icon} size={44} />
      </div>
    </div>
  )
}

function ParamIcon({ name, size }: { name: string; size: number }) {
  const paths: Record<string, React.ReactNode> = {
    droplets: <><path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.09 3 12.25c0 2.22 1.8 4.05 4 4.05z"/><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"/></>,
    thermometer: <><path d="M7.21 15.01a5 5 0 1 0 9.58 0"/><path d="M12 2v9"/><circle cx="12" cy="15" r="2" fill="currentColor" stroke="none"/></>,
    cloudRain: <path d="M7 18a4 4 0 0 1-1.69-7.62 5.5 5.5 0 0 1 10.8-1.18 4.5 4.5 0 0 1 .89 8.8M8 14v6M12 15v6M16 14v6"/>,
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></>,
    thermSun: <><path d="M10 13V5a2 2 0 1 1 4 0v8a4 4 0 1 1-4 0z"/><path d="M16 4h2M16 8h2"/></>,
    battery: <><rect x="2" y="8" width="18" height="8" rx="1.5"/><path d="M22 12v-2"/></>,
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  )
}
