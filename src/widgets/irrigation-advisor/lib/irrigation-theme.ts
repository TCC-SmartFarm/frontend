import { CalendarCheck, Eye, Sprout, TriangleAlert, Umbrella } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { IrrigationAction, IrrigationResponse, TrendStatus } from "@/entities/irrigation/model/types";

interface IrrigationTheme {
  icon: LucideIcon;
  /** Cor sólida do card aberto e da faixa do cabeçalho. */
  color: string;
}

// Uma cor por ação, tiradas dos tokens: o card aberto é um bloco sólido, e o
// agricultor precisa reconhecer a situação pela cor antes de ler o texto.
//
// Os ícones evitam de propósito as gotas (Droplets), que no painel inteiro
// significam "umidade do solo", e a nuvem de chuva (CloudRain), que aqui
// marca a previsão do tempo. Se a ação usasse um desses, o mesmo desenho
// diria duas coisas diferentes no mesmo card.
const THEMES: Record<IrrigationAction, IrrigationTheme> = {
  irrigate_on_recommended_day: { icon: CalendarCheck, color: "var(--sf-ch-soil-moist)" },
  irrigate_with_caution: { icon: Umbrella, color: "var(--sf-warn-dot)" },
  not_needed_now: { icon: Sprout, color: "var(--sf-leaf-600)" },
  manual_check: { icon: Eye, color: "var(--sf-info-dot)" },
  manual_check_sensor: { icon: TriangleAlert, color: "var(--sf-clay-400)" },
};

export const irrigationTheme = (action: IrrigationAction): IrrigationTheme => THEMES[action];

/**
 * As datas da previsão vêm como `YYYY-MM-DD`, no fuso do sensor. `new Date("2026-10-24")`
 * interpretaria como meia-noite UTC — 21h do dia anterior em Brasília —, então
 * a data é montada pelas partes, no fuso local.
 */
export const parseLocalDate = (date: string): Date => {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const weekdayShort = (date: string): string =>
  parseLocalDate(date).toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");

/** "sábado", "quarta" — sem o "-feira", que estoura a largura da faixa. */
const weekdayName = (date: string): string =>
  parseLocalDate(date).toLocaleDateString("pt-BR", { weekday: "long" }).replace("-feira", "");

/** Sábado e domingo pedem "no"; os dias "-feira" pedem "na". */
const onWeekday = (date: string): string => {
  const dow = parseLocalDate(date).getDay();
  return `${dow === 0 || dow === 6 ? "no" : "na"} ${weekdayName(date)}`;
};

const dayAndMonth = (date: string): string =>
  parseLocalDate(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

/** Frase curta: cabe na faixa do cabeçalho e serve de título no card aberto. */
export const irrigationHeadline = ({ irrigation }: IrrigationResponse): string => {
  switch (irrigation.action) {
    case "irrigate_on_recommended_day":
      if (irrigation.should_irrigate_today || !irrigation.recommended_day) return "Hora de irrigar!";
      return `Que tal irrigar ${onWeekday(irrigation.recommended_day)}?`;
    case "irrigate_with_caution":
      return "Pode irrigar, mas com atenção";
    case "not_needed_now":
      return "Tudo normal!";
    case "manual_check":
      return "Vale dar uma olhada no campo";
    case "manual_check_sensor":
      return "Confira o sensor";
  }
};

/**
 * Texto do card, escrito aqui e não lido do `message` do MSS: a frase de lá é
 * técnica ("A leitura está entre os limiares; calibre o sensor..."), e o
 * painel é para quem não tem intimidade com esses termos. O MSS continua
 * decidindo a ação; o front só escolhe as palavras.
 */
export const irrigationDescription = ({ irrigation }: IrrigationResponse): string => {
  const day = irrigation.recommended_day;
  switch (irrigation.action) {
    case "irrigate_on_recommended_day":
      if (irrigation.should_irrigate_today || !day) {
        return "O solo está ficando seco, e hoje é o dia com menos chance de chuva pela frente. Se puder, aproveite para irrigar ainda hoje, só vale dar uma olhada no céu antes de começar.";
      }
      return `O solo está ficando seco. Olhando a previsão dos próximos dias, ${onWeekday(day)} é quando há menos chance de chuva, então é uma ótima data para irrigar. Até lá, vale acompanhar se a previsão continua a mesma.`;
    case "irrigate_with_caution":
      return "O solo está seco, mas a previsão mostra chuva até no dia mais tranquilo da semana. Você pode irrigar, porém é possível que a própria chuva resolva. Que tal conferir o solo e o céu antes de ligar a irrigação?";
    case "not_needed_now":
      return "O sensor indica solo úmido, não há necessidade de irrigar no momento!";
    case "manual_check":
      return "A umidade do solo está numa faixa intermediária, nem seca nem encharcada. Nesse caso preferimos não arriscar uma recomendação automática, então vale dar uma passada no campo e pensar no que a sua plantação costuma precisar.";
    case "manual_check_sensor":
      return "As últimas leituras ficaram paradas no limite do sensor, o que costuma indicar algum problema na instalação ou na calibração. Antes de decidir sobre a irrigação, confira se o sensor está bem posicionado no solo.";
  }
};

/** "sábado, 24/10" — usado na linha do melhor dia, dentro do card. */
export const recommendedDayLabel = (date: string): string => `${weekdayName(date)}, ${dayAndMonth(date)}`;

export const TREND_SENTENCE: Record<TrendStatus, string> = {
  increasing: "A umidade do solo está subindo",
  decreasing: "A umidade do solo está caindo",
  stable: "A umidade do solo está estável",
};
