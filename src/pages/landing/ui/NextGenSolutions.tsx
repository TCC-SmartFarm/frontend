import PlantImage from "@/assets/plant.jpg";
import AutomaticImage from "@/assets/automatic.jpg";

const cards = [
  {
    title: "Acompanhe a lavoura",
    body: "Solo, ar, luz e bateria — tudo em um só painel.",
    illust: "monitor" as const,
  },
  {
    title: "Plante com ciência",
    body: "Histórico que mostra padrões antes invisíveis.",
    illust: "science" as const,
  },
  {
    title: "Decisões automáticas",
    body: "Avisos certeiros.",
    illust: "auto" as const,
  },
];

export const NextGenSolutions = () => (
  <section id="por-que" className="bg-white px-10 py-[100px]">
    <div className="mx-auto max-w-[1280px]">
      <h2
        className="m-0 mb-14 max-w-[720px] font-display font-bold leading-[1.02] tracking-[-0.03em] text-leaf-900"
        style={{ fontSize: 56 }}
      >
        Soluções que respeitam quem já{" "}
        <em className="font-semibold italic text-leaf-600">entende</em> de
        terra.
      </h2>
      <div className="grid grid-cols-3 gap-[18px]">
        {cards.map((c) => (
          <div key={c.title} className="flex flex-col gap-4">
            <div className="relative h-[220px] overflow-hidden rounded-[18px] bg-sand-100">
              <SolutionIllust kind={c.illust} />
            </div>
            <h3 className="m-0 text-[22px] font-semibold tracking-tight">
              {c.title}
            </h3>
            <p className="m-0 text-[14.5px] leading-[1.5] text-fg-muted">
              {c.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

function SolutionIllust({ kind }: { kind: "monitor" | "science" | "auto" }) {
  if (kind === "monitor") {
    return (
      <svg
        viewBox="0 0 400 220"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <rect width="400" height="220" fill="#1a281a" />
        <rect x="40" y="30" width="320" height="160" rx="10" fill="#262625" />
        <rect x="60" y="50" width="120" height="60" rx="6" fill="#35502a" />
        <text
          x="120"
          y="88"
          textAnchor="middle"
          fontFamily="var(--sf-font-data)"
          fontSize="22"
          fontWeight="600"
          fill="#a3c084"
        >
          68%
        </text>
        <rect x="200" y="50" width="80" height="60" rx="6" fill="#456830" />
        <text
          x="240"
          y="88"
          textAnchor="middle"
          fontFamily="var(--sf-font-data)"
          fontSize="18"
          fontWeight="600"
          fill="#e2ecd9"
        >
          24°
        </text>
        <rect x="290" y="50" width="50" height="60" rx="6" fill="#5d8440" />
        <rect x="60" y="120" width="280" height="60" rx="6" fill="#1a281a" />
        <path
          d="M70 160 Q 120 150,170 155 T 270 140 T 330 130"
          fill="none"
          stroke="#7fa45a"
          strokeWidth="2"
        />
      </svg>
    );
  }
  if (kind === "science") {
    return <img src={PlantImage} className="w-full h-full object-cover" />;
  }
  return <img src={AutomaticImage} className="w-full h-full object-cover" />;
}
