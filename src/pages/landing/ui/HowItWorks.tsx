const steps = [
  {
    n: "01",
    label: "Instalar sensor",
    body: "Configure o sensor de forma simples com o nosso aplicativo.",
    illust: "install" as const,
  },
  {
    n: "02",
    label: "Receber dados",
    body: "Receba dados atualizados continuamente.",
    illust: "receive" as const,
  },
  {
    n: "03",
    label: "Decidir melhor",
    body: "Acesso em qualquer lugar, para planejar e monitorar.",
    illust: "decide" as const,
  },
];

export const HowItWorks = () => (
  <section id="como-funciona" className="bg-white px-10 py-[90px]">
    <div className="mx-auto max-w-[1280px]">
      <div className="mb-12 flex items-end justify-between gap-10">
        <h2
          className="m-0 max-w-[560px] font-display font-bold leading-[1.02] tracking-[-0.03em] text-leaf-900"
          style={{ fontSize: 56 }}
        >
          Comece em{" "}
          <em className="font-semibold italic text-leaf-600">3 passos</em>.
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-[18px]">
        {steps.map((s, i) => (
          <div
            key={s.n}
            className="flex flex-col gap-3.5"
            style={{ transform: i === 1 ? "translateY(40px)" : undefined }}
          >
            <div className="relative h-[280px] overflow-hidden rounded-[18px] bg-sand-100">
              <StepIllust kind={s.illust} />
              <span className="absolute left-3.5 top-3.5 rounded-full bg-white/90 px-2.5 py-1 font-mono text-[11px] font-bold tracking-[0.05em] backdrop-blur-sm">
                {s.n}
              </span>
            </div>
            <h3 className="m-0 mt-2 text-[22px] font-semibold tracking-tight">
              {s.label}
            </h3>
            <p className="m-0 text-[14.5px] leading-[1.5] text-fg-muted">
              {s.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

function StepIllust({ kind }: { kind: "install" | "receive" | "decide" }) {
  if (kind === "install") {
    return (
      <svg
        viewBox="0 0 400 280"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <rect width="400" height="280" fill="#d3c3a2" />
        <rect y="160" width="400" height="120" fill="#8a7550" />
        {Array.from({ length: 15 }, (_, i) => (
          <line
            key={i}
            x1={i * 30 - 20}
            y1="160"
            x2={i * 30 + 10}
            y2="280"
            stroke="#6b5a3d"
            strokeWidth="2"
            opacity="0.4"
          />
        ))}
        <g transform="translate(180,130)">
          <path d="M20 60 Q 10 30,0 10 Q 5 30,20 50" fill="#5d8440" />
          <path d="M20 60 Q 30 30,40 10 Q 35 30,20 50" fill="#7fa45a" />
          <line
            x1="20"
            y1="60"
            x2="20"
            y2="100"
            stroke="#456830"
            strokeWidth="3"
          />
        </g>
        <g transform="translate(260,80)">
          <rect
            x="-8"
            y="0"
            width="16"
            height="40"
            rx="3"
            fill="#fff"
            stroke="#262625"
            strokeWidth="1.5"
          />
          <circle cx="0" cy="14" r="4" fill="#7fa45a" />
          <circle cx="0" cy="24" r="2" fill="#c89a1f" />
          <line
            x1="0"
            y1="40"
            x2="0"
            y2="160"
            stroke="#262625"
            strokeWidth="2"
          />
          <path
            d="M-3 50 L 0 60 L 3 50 M-3 80 L 0 90 L 3 80"
            stroke="#262625"
            strokeWidth="1"
            fill="none"
          />
        </g>
      </svg>
    );
  }
  if (kind === "receive") {
    return (
      <svg
        viewBox="0 0 400 280"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <rect width="400" height="280" fill="#e2ecd9" />
        <path
          d="M0 200 Q 100 180,200 195 T 400 200 L400 280 L0 280 Z"
          fill="#a3c084"
        />
        <path
          d="M0 220 Q 100 210,200 218 T 400 225 L400 280 L0 280 Z"
          fill="#7fa45a"
        />
        <g
          transform="translate(120,130)"
          stroke="#456830"
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M0 0 Q 0 -25,-20 -25" opacity="0.9" />
          <path d="M0 0 Q 0 -45,-40 -45" opacity="0.6" />
          <path d="M0 0 Q 0 -65,-60 -65" opacity="0.35" />
          <circle cx="0" cy="0" r="6" fill="#456830" stroke="none" />
        </g>
        <g transform="translate(230,60)">
          <rect
            width="120"
            height="180"
            rx="16"
            fill="#fff"
            stroke="#262625"
            strokeWidth="2"
          />
          <rect x="12" y="20" width="96" height="14" rx="3" fill="#e7ddc8" />
          <rect x="12" y="42" width="96" height="50" rx="6" fill="#f3ede0" />
          <text
            x="60"
            y="70"
            textAnchor="middle"
            fontFamily="var(--sf-font-data)"
            fontSize="22"
            fontWeight="600"
            fill="#456830"
          >
            68%
          </text>
          <rect x="12" y="100" width="96" height="14" rx="3" fill="#e7ddc8" />
          <rect x="12" y="120" width="96" height="14" rx="3" fill="#e7ddc8" />
          <rect x="12" y="140" width="96" height="14" rx="3" fill="#e7ddc8" />
        </g>
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 400 280"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden
    >
      <rect width="400" height="280" fill="#262625" />
      <rect x="40" y="40" width="320" height="200" rx="12" fill="#1a281a" />
      <g stroke="#5d8440" strokeWidth="0.5" opacity="0.3">
        <line x1="60" y1="80" x2="340" y2="80" />
        <line x1="60" y1="130" x2="340" y2="130" />
        <line x1="60" y1="180" x2="340" y2="180" />
      </g>
      <rect
        x="60"
        y="100"
        width="280"
        height="60"
        fill="#5d8440"
        opacity="0.2"
      />
      <path
        d="M60 140 Q 110 130,160 135 T 260 120 T 340 100"
        fill="none"
        stroke="#7fa45a"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="340" cy="100" r="4" fill="#7fa45a" />
      <text
        x="60"
        y="220"
        fontFamily="var(--sf-font-data)"
        fontSize="28"
        fontWeight="600"
        fill="#fff"
      >
        68%
      </text>
      <text
        x="160"
        y="220"
        fontFamily="var(--sf-font-display)"
        fontSize="11"
        fill="#a3c084"
      >
        Umidade · ideal
      </text>
    </svg>
  );
}
