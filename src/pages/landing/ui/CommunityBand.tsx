import QuemSabeImg from "@/assets/quemsabe.jpg";

export const CommunityBand = () => (
  <section className="px-10 py-5">
    <div className="relative mx-auto h-[320px] max-w-[1280px] overflow-hidden rounded-3xl shadow-lg">
      <img
        src={QuemSabeImg}
        alt="Comunidade de produtores"
        className="absolute inset-0 h-full w-full object-cover brightness-50"
      />
      <div className="absolute inset-0 flex flex-col justify-between p-10 px-12">
        <div className="m-0 max-w-[580px] text-white text-[44px] font-bold leading-[1.05] tracking-[-0.025em] ">
          Aprenda com quem
          <br />
          já está na terra.
        </div>
        <div className="flex items-center justify-between">
          <div className="max-w-[380px] text-[14px] text-white/85">
            Comunidade de produtores trocando o que funciona — irrigação,
            manejo, época de plantio.
          </div>
          <button
            className="flex size-14 items-center justify-center rounded-full border-0 text-white shadow-lg transition-all hover:scale-105"
            style={{
              background: "#b97239",
              boxShadow: "0 10px 30px rgba(185,114,57,0.45)",
            }}
            aria-label="Ver comunidade"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </section>
);

function RollingHills() {
  return (
    <svg
      viewBox="0 0 1280 320"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden
    >
      <defs>
        <linearGradient id="rh-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a3c084" />
          <stop offset="100%" stopColor="#7fa45a" />
        </linearGradient>
      </defs>
      <rect width="1280" height="320" fill="url(#rh-sky)" />
      <path
        d="M0 130 Q 200 100,400 115 T 800 110 Q 1000 105,1280 130 L1280 200 L0 200 Z"
        fill="#5d8440"
        opacity="0.6"
      />
      <path
        d="M0 180 Q 250 160,500 175 T 950 170 Q 1150 165,1280 180 L1280 260 L0 260 Z"
        fill="#456830"
        opacity="0.7"
      />
      <path
        d="M0 240 Q 200 220,400 235 T 800 225 Q 1000 220,1280 240 L1280 320 L0 320 Z"
        fill="#35502a"
      />
      {[180, 220, 260, 300].map((y, i) => (
        <path
          key={i}
          d={`M0 ${y} Q 320 ${y - 4},640 ${y - 2} T 1280 ${y}`}
          fill="none"
          stroke="#fff"
          strokeWidth="0.4"
          opacity="0.15"
        />
      ))}
    </svg>
  );
}
