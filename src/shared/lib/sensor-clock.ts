/**
 *
 * O relógio do sensor é acertado com a hora LOCAL do celular, mas o firmware a
 * trata como UTC. Uma leitura feita às 09:00 de Brasília (12:00 UTC) chega com
 * o timestamp de 09:00 UTC — 3 horas antes do real. Sem correção, o navegador
 * converte para Brasília de novo e mostra 06:00, e o pin cai para offline
 * porque a "última leitura" parece ter 3 horas.
 *
 * A correção é somar as 3 horas uma vez, na entrada dos dados (fetchers), e
 * deixar o resto do front tratar o timestamp como UTC verdadeiro. Assim a hora
 * exibida é a do relógio do sensor, e o cálculo de offline e os recortes de
 * período do gráfico continuam certos.
 *
 * REMOVER quando o app/firmware passar a mandar a hora em UTC — senão as
 * leituras passam a aparecer 3 horas no futuro.
 */
export const SENSOR_CLOCK_OFFSET_SEC = 3 * 60 * 60;

// Abaixo disso o timestamp não é hora nenhuma: é o sensor contando segundos
// desde o boot depois de perder o relógio (vem como 747, 2450...). Somar 3 h
// ali não conserta nada, então esses valores passam intactos.
const PLAUSIBLE_EPOCH_SEC = 1_000_000_000;

export const correctSensorTimestamp = (ts: number): number =>
  ts >= PLAUSIBLE_EPOCH_SEC ? ts + SENSOR_CLOCK_OFFSET_SEC : ts;
