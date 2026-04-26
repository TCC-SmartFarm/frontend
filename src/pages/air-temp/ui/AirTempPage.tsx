import { Wind } from 'lucide-react'
import { ParameterPageLayout } from '@/shared/ui/parameter-page-layout'
import type { ParamConfig } from '@/shared/ui/parameter-page-layout'

const config: ParamConfig = {
  paramKey: 'airTemp',
  label: 'Temperatura do Ar',
  unit: '°C',
  icon: Wind,
  color: '#a14a2e',
  idealMin: 15,
  idealMax: 35,
  formatValue: (v) => v.toFixed(1),
}

export const AirTempPage = () => <ParameterPageLayout config={config} />
