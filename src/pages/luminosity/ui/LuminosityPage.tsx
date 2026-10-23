import { Sun } from 'lucide-react'
import { ParameterPageLayout } from '@/shared/ui/parameter-page-layout'
import type { ParamConfig } from '@/shared/ui/parameter-page-layout'

const config: ParamConfig = {
  paramKey: 'luminosity',
  label: 'Luminosidade',
  // O sensor manda luminosidade em porcentagem (0–100), não em lux.
  unit: '%',
  icon: Sun,
  color: '#c89a1f',
  idealMin: 60,
  idealMax: 80,
  formatValue: (v) => Math.round(v).toString(),
}

export const LuminosityPage = () => <ParameterPageLayout config={config} />
