export const ProblemSolution = () => (
  <section className="mx-auto max-w-[1280px] px-10 pb-[100px]">
    <div className="grid grid-cols-[1fr_1.3fr] gap-20 items-start">
      <div>
        <div className="mb-3.5 text-[11px] font-semibold uppercase tracking-caps text-fg-subtle">
          O problema
        </div>
        <div className="flex flex-col gap-1 text-[13px] text-fg-subtle">
          <span>
            <strong className="text-fg">Custo da incerteza</strong> — decisões no escuro sobre rega.
          </span>
          <span>
            <strong className="text-fg">Tempo perdido</strong> — horas de carro só pra ver o sensor.
          </span>
        </div>
      </div>
      <h2 className="m-0 text-[38px] font-semibold leading-[1.2] tracking-tight text-leaf-900">
        Mesmo com tantas inovações, o produtor ainda toma decisões importantes
        olhando pro céu e enfiando o dedo na terra. A gente acha que dá pra ajudar.
      </h2>
    </div>
  </section>
)
