import type { ReactNode } from 'react'
import type { IrrigationResponse } from '@/entities/irrigation/model/types'
import { weekdayName } from './irrigation-theme'

/**
 * Texto do card, escrito aqui e não lido do `message` do MSS: a frase de lá é
 * técnica ("A leitura está entre os limiares; calibre o sensor..."), e o
 * painel é para quem não tem intimidade com esses termos. O MSS continua
 * decidindo a ação; o front só escolhe as palavras.
 *
 * Só descreve o que os dados dizem, sem conselho por cima ("confira o céu
 * antes"): o título já diz o que fazer, e instrução repetida vira ruído.
 *
 * O nome do sensor vai sempre em destaque ("O solo do **Talhão Sul**..."). O
 * "do" é fixo: o nome é livre e não dá para saber o gênero dele.
 */
export const irrigationDescription = ({ irrigation }: IrrigationResponse, sensorName: string): ReactNode => {
  const name = <strong>{sensorName}</strong>
  const day = irrigation.recommended_day
  switch (irrigation.action) {
    case 'irrigate_on_recommended_day':
      if (irrigation.should_irrigate_today || !day) {
        return <>O solo do {name} está ficando seco, e hoje é o dia com menos chance de chuva pela frente.</>
      }
      return (
        <>
          O solo do {name} está ficando seco, e {weekdayName(day)} é o dia com menos chance de chuva pela frente.
        </>
      )
    case 'irrigate_with_caution':
      return <>O solo do {name} está seco, mas há previsão de chuva até no dia mais tranquilo da semana.</>
    case 'not_needed_now':
      return <>O sensor do {name} indica solo úmido, não há necessidade de irrigar no momento!</>
    case 'manual_check':
      return <>A umidade do solo do {name} está numa faixa intermediária, nem seca nem encharcada.</>
    case 'manual_check_sensor':
      return (
        <>
          As últimas leituras do {name} ficaram paradas no limite do sensor, o que costuma indicar algum problema na
          instalação ou na calibração.
        </>
      )
  }
}
