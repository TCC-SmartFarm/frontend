import { Smartphone, Sprout, BadgeDollarSign } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/shared/ui/card";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => (
  <Card tone="white" padding="lg" hoverable>
    <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-leaf-50 text-leaf-600">
      <Icon size={22} strokeWidth={1.75} aria-hidden />
    </div>
    <Card.Title as="h3" className="mb-2">
      {title}
    </Card.Title>
    <Card.Body className="text-fg-muted">{description}</Card.Body>
  </Card>
);

const features: FeatureCardProps[] = [
  {
    icon: Smartphone,
    title: "Simples de usar",
    description:
      "Interface projetada para quem não tem tempo a perder. Do campo à tela em segundos, sem manuais complicados.",
  },
  {
    icon: Sprout,
    title: "Feito para o campo",
    description:
      "Linguagem clara, sem jargões técnicos. A plataforma fala a língua do agricultor e respeita o jeito tradicional de trabalhar.",
  },
  {
    icon: BadgeDollarSign,
    title: "Que cabe no bolso",
    description:
      "Comece com o plano básico por menos de um café por dia. Invista no que realmente importa e escale conforme crescer.",
  },
];

export const FeaturesSection = () => (
  <section id="features" className="bg-bg-sunken py-20">
    <div className="mx-auto max-w-6xl px-6">
      <div className="mb-12 text-center">
        <span className="mb-3 block text-xs font-semibold uppercase tracking-caps text-fg-subtle">
          Por que SmartFarm?
        </span>
        <h2 className="font-display text-3xl font-bold tracking-tight text-fg md:text-4xl">
          Tecnologia acessível para a agricultura real
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-fg-muted">
          Criamos a SmartFarm para que qualquer produtor possa dar o primeiro passo
          na agricultura de precisão — sem precisar de uma equipe de TI.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {features.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </div>
    </div>
  </section>
);
