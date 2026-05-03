export interface Sensor {
  id: string
  name: string
  nickname: string
  crop: string
  planted: string
  depth: string
  battery: number
  signal: 'Forte' | 'Médio' | 'Fraco'
  serial: string
  latitude: number
  longitude: number
}

export type ParamKey = 'soilTemp' | 'soilMoist' | 'airHumid' | 'airTemp' | 'light' | 'battery'

export type Readings = Record<ParamKey, number>

export const SENSORS: Sensor[] = [
  { id: 'MN-01', name: 'Milho Norte',  nickname: 'Sector Norte A', crop: 'Milho',      planted: 'Mar 2026', depth: '15 cm', battery: 87, signal: 'Forte', serial: 'SF-MN01', latitude: -22.895, longitude: -47.055 },
  { id: 'MS-01', name: 'Milho Sul',    nickname: 'Sector Sul B',   crop: 'Milho',      planted: 'Mar 2026', depth: '15 cm', battery: 72, signal: 'Forte', serial: 'SF-MS01', latitude: -22.905, longitude: -47.060 },
  { id: 'SJ-01', name: 'Soja Leste',   nickname: 'Parcela Leste',  crop: 'Soja',       planted: 'Fev 2026', depth: '20 cm', battery: 55, signal: 'Médio', serial: 'SF-SJ01', latitude: -22.892, longitude: -47.043 },
  { id: 'SJ-02', name: 'Soja Oeste',   nickname: 'Parcela Oeste',  crop: 'Soja',       planted: 'Fev 2026', depth: '20 cm', battery: 31, signal: 'Fraco', serial: 'SF-SJ02', latitude: -22.890, longitude: -47.048 },
  { id: 'CF-01', name: 'Café Alto',    nickname: 'Encosta Alta',   crop: 'Café',       planted: 'Jan 2025', depth: '25 cm', battery: 93, signal: 'Forte', serial: 'SF-CF01', latitude: -22.898, longitude: -47.040 },
  { id: 'CF-02', name: 'Café Baixo',   nickname: 'Vale do Café',   crop: 'Café',       planted: 'Jan 2025', depth: '25 cm', battery: 18, signal: 'Médio', serial: 'SF-CF02', latitude: -22.902, longitude: -47.058 },
  { id: 'HT-01', name: 'Horta A',      nickname: 'Canteiro 1',     crop: 'Hortaliças', planted: 'Abr 2026', depth: '10 cm', battery: 65, signal: 'Forte', serial: 'SF-HT01', latitude: -22.908, longitude: -47.052 },
  { id: 'HT-02', name: 'Horta B',      nickname: 'Canteiro 2',     crop: 'Hortaliças', planted: 'Abr 2026', depth: '10 cm', battery: 78, signal: 'Forte', serial: 'SF-HT02', latitude: -22.910, longitude: -47.045 },
  { id: 'PS-01', name: 'Pasto Fundo',  nickname: 'Pasto Fundo',    crop: 'Pasto',      planted: '—',        depth: '15 cm', battery: 44, signal: 'Médio', serial: 'SF-PS01', latitude: -22.893, longitude: -47.065 },
  { id: 'FJ-01', name: 'Feijão',       nickname: 'Talhão Feijão',  crop: 'Feijão',     planted: 'Mar 2026', depth: '15 cm', battery: 61, signal: 'Forte', serial: 'SF-FJ01', latitude: -22.915, longitude: -47.050 },
]

export const READINGS: Record<string, Readings> = {
  'MN-01': { soilTemp: 24, soilMoist: 68, airHumid: 62, airTemp: 28, light: 1240, battery: 87 },
  'MS-01': { soilTemp: 26, soilMoist: 52, airHumid: 59, airTemp: 30, light: 1380, battery: 72 },
  'SJ-01': { soilTemp: 22, soilMoist: 74, airHumid: 71, airTemp: 25, light: 980,  battery: 55 },
  'SJ-02': { soilTemp: 25, soilMoist: 41, airHumid: 55, airTemp: 29, light: 1560, battery: 31 },
  'CF-01': { soilTemp: 19, soilMoist: 82, airHumid: 78, airTemp: 22, light: 620,  battery: 93 },
  'CF-02': { soilTemp: 21, soilMoist: 29, airHumid: 66, airTemp: 24, light: 720,  battery: 18 },
  'HT-01': { soilTemp: 20, soilMoist: 77, airHumid: 83, airTemp: 21, light: 840,  battery: 65 },
  'HT-02': { soilTemp: 23, soilMoist: 61, airHumid: 72, airTemp: 26, light: 1100, battery: 78 },
  'PS-01': { soilTemp: 28, soilMoist: 35, airHumid: 48, airTemp: 32, light: 1890, battery: 44 },
  'FJ-01': { soilTemp: 24, soilMoist: 58, airHumid: 64, airTemp: 27, light: 1150, battery: 61 },
}

interface Thresholds {
  warnLow?: number
  alertLow?: number
  warnHigh?: number
  alertHigh?: number
}

const THRESHOLDS: Record<ParamKey, Thresholds> = {
  soilTemp:  { warnHigh: 30, alertHigh: 35 },
  soilMoist: { alertLow: 20, warnLow: 30, warnHigh: 80, alertHigh: 90 },
  airHumid:  { alertLow: 15, warnLow: 20, warnHigh: 90, alertHigh: 95 },
  airTemp:   { alertLow: 0,  warnLow: 5,  warnHigh: 35, alertHigh: 40 },
  light:     {},
  battery:   { alertLow: 15, warnLow: 20 },
}

export function statusFor(param: ParamKey, value: number): 'ok' | 'warn' | 'alert' {
  const t = THRESHOLDS[param]
  if (t.alertLow  !== undefined && value <= t.alertLow)  return 'alert'
  if (t.alertHigh !== undefined && value >= t.alertHigh) return 'alert'
  if (t.warnLow   !== undefined && value <= t.warnLow)   return 'warn'
  if (t.warnHigh  !== undefined && value >= t.warnHigh)  return 'warn'
  return 'ok'
}

export function statusLabel(status: 'ok' | 'warn' | 'alert'): string {
  if (status === 'alert') return 'Atenção'
  if (status === 'warn')  return 'Monitorar'
  return 'Ideal'
}

function seededRandom(seed: number) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

export function seriesFor(
  param: ParamKey,
  sensorId: string,
  range: string,
): { time: string; value: number }[] {
  const base   = READINGS[sensorId]?.[param] ?? 50
  const points = range === '24h' ? 24 : range === '7 dias' ? 28 : 30
  const seed   = sensorId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) * (param.length + 7)
  const rand   = seededRandom(seed)

  return Array.from({ length: points }, (_, i) => {
    const noise = (rand() - 0.5) * (base * 0.3)
    const value = Math.max(0, parseFloat((base + noise).toFixed(1)))
    let time: string
    if (range === '24h') {
      time = `${String(i).padStart(2, '0')}:00`
    } else if (range === '7 dias') {
      time = `D-${7 - Math.floor(i / 4)}`
    } else {
      time = `D${30 - i}`
    }
    return { time, value }
  })
}
