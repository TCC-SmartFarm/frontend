import { Sun } from 'lucide-react'
import { ParameterPageLayout } from '@/shared/ui/parameter-page-layout'
import type { ParamConfig } from '@/shared/ui/parameter-page-layout'

const config: ParamConfig = {
  paramKey: 'light',
  label: 'Luminosidade',
  unit: 'lux',
  icon: Sun,
  color: '#c89a1f',
  idealMin: 500,
  idealMax: 5000,
  formatValue: (v) => Math.round(v).toLocaleString('pt-BR'),
}

export const LuminosityPage = () => <ParameterPageLayout config={config} />
