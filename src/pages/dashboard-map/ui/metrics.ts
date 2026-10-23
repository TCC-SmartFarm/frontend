import { Droplets, Sun, Battery, Wind, CloudRain } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { SensorParam } from '@/entities/reading/model/types'

export interface MetricDef {
  key: SensorParam
  label: string
  unit: string
  icon: LucideIcon
  format?: (v: number) => string
}

/**
 * Rótulos curtos, para caber nos quadradinhos do painel lateral e do card de
 * hover — os nomes por extenso vivem em shared/constants/parameters.ts.
 */
export const METRICS: MetricDef[] = [
  { key: 'soil_moisture', label: 'Umidade solo', unit: '%', icon: Droplets },
  { key: 'air_humidity', label: 'Umidade ar', unit: '%', icon: CloudRain },
  // O sensor manda luminosidade em porcentagem (0–100), não em lux.
  { key: 'luminosity', label: 'Luz', unit: '%', icon: Sun },
  { key: 'air_temperature', label: 'Temp. ar', unit: '°C', icon: Wind },
  { key: 'battery', label: 'Bateria', unit: '%', icon: Battery },
]

export const formatMetric = (m: MetricDef, value: number | null | undefined): string => {
  if (value === null || value === undefined) return '—'
  return m.format ? m.format(value) : String(Math.round(value))
}
