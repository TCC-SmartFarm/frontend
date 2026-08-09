import { createElement, type ComponentType } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import L from 'leaflet'
import { MdOutlineSensors } from 'react-icons/md'
import { SENSOR_PARAMETERS } from '@/shared/constants/parameters'
import {
  statusForParam,
  type ParamThresholdMap,
  type Status,
} from '@/shared/constants/thresholds'
import type { SensorParam } from '@/entities/reading/model/types'
import type { Sensor } from '@/entities/sensor/model/types'

/**
 * Sensores transmitem a cada ~15 min; três janelas perdidas caracterizam
 * um sensor que parou de enviar, e não apenas um atraso de rede.
 */
export const OFFLINE_AFTER_MS = 45 * 60 * 1000

export type PinTone = Status | 'offline'

export const PIN_COLORS: Record<PinTone, string> = {
  ok: '#2d6814',
  warn: '#c78020',
  alert: '#c74020',
  offline: '#8a7a63',
}

/**
 * Tom claro do halo, um degrau acima da cor do pin: precisa ler como "a mesma
 * cor, mais suave" sobre o mapa claro, sem competir com o círculo.
 */
const PIN_PULSE_COLORS: Record<Status, string> = {
  ok: '#a3c084',
  warn: '#e0b64e',
  alert: '#dd7a55',
}

/**
 * Sensor ativo é sensor transmitindo — o halo sinaliza que há dado chegando,
 * não que está tudo bem. Quem parou de enviar fica parado.
 */
export const isPulsing = (tone: PinTone): boolean => tone !== 'offline'

const pulseColor = (tone: PinTone): string =>
  tone === 'offline' ? 'transparent' : PIN_PULSE_COLORS[tone]

/**
 * Ordem de desempate quando mais de um parâmetro sai do ideal: o ícone do pin
 * mostra o primeiro da lista. Bateria vem primeiro porque, sem ela, as demais
 * leituras deixam de chegar — é o problema que o produtor precisa resolver antes.
 */
export const PIN_PARAM_PRIORITY: SensorParam[] = [
  'battery',
  'soil_moisture',
  'soil_temperature',
  'air_temperature',
  'air_humidity',
  'luminosity',
]

export interface PinState {
  tone: PinTone
  /** Parâmetro que puxou o status para warn/alert — define o ícone do pin. */
  param: SensorParam | null
}

export const pinStateFor = (
  sensor: Sensor,
  thresholds: ParamThresholdMap,
  now: number,
): PinState => {
  const reading = sensor.lastReading
  const lastAt = sensor.lastReadingAt
  if (!reading || lastAt === undefined || now - lastAt * 1000 > OFFLINE_AFTER_MS) {
    return { tone: 'offline', param: null }
  }

  let state: PinState = { tone: 'ok', param: null }
  for (const param of PIN_PARAM_PRIORITY) {
    const status = statusForParam(thresholds, param, reading[param] ?? null)
    if (status === 'alert') return { tone: 'alert', param }
    if (status === 'warn' && state.tone === 'ok') {
      state = { tone: 'warn', param }
    }
  }
  return state
}

/**
 * Identidade visual do pin. O `setIcon` do Leaflet recria o nó DOM e reinicia
 * a animação do halo, então só trocamos o ícone quando esta chave muda.
 */
export const pinKey = (state: PinState, selected: boolean): string =>
  `${state.tone}|${state.param ?? '-'}|${selected ? 'sel' : 'idle'}`

const BASE_SIZE = 34
const SELECTED_SIZE = 42

// `strokeWidth` fica de fora de propósito: o lucide desenha com traço (default 2),
// o react-icons com preenchimento e stroke-width 0 — forçar um valor comum
// engrossaria o glifo do Material por cima do próprio fill.
type PinIcon = ComponentType<{ size?: number; color?: string }>

// renderToStaticMarkup por marcador a cada refetch seria desperdício: o glifo só
// depende do parâmetro e do tamanho, então o markup é reaproveitado.
const glyphCache = new Map<string, string>()

const glyphFor = (param: SensorParam | null, size: number): string => {
  const key = `${param ?? 'sensors'}|${size}`
  const cached = glyphCache.get(key)
  if (cached !== undefined) return cached

  const Icon: PinIcon = param ? SENSOR_PARAMETERS[param].icon : MdOutlineSensors
  const markup = renderToStaticMarkup(createElement(Icon, { size, color: '#ffffff' }))
  glyphCache.set(key, markup)
  return markup
}

export const createSensorIcon = (state: PinState, selected: boolean): L.DivIcon => {
  const size = selected ? SELECTED_SIZE : BASE_SIZE
  const glyph = glyphFor(state.param, Math.round(size * 0.55))

  const style = `--sf-pin-color: ${PIN_COLORS[state.tone]}; --sf-pin-pulse: ${pulseColor(state.tone)}`
  const html = `
    <div class="sf-pin" style="${style}">
      ${isPulsing(state.tone) ? '<span class="sf-pin__pulse"></span>' : ''}
      <span class="sf-pin__dot">${glyph}</span>
    </div>
  `

  return L.divIcon({
    html,
    className: 'sf-pin-wrap',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    tooltipAnchor: [0, -size / 2 - 4],
    popupAnchor: [0, -size / 2 - 2],
  })
}
