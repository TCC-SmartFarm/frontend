import { Thermometer } from 'lucide-react'
import { ParameterPageLayout } from '@/shared/ui/parameter-page-layout'
import type { ParamConfig } from '@/shared/ui/parameter-page-layout'

const config: ParamConfig = {
  paramKey: 'soilTemp',
  label: 'Temperatura do Solo',
  unit: '°C',
  icon: Thermometer,
  color: '#b97239',
  idealMin: 18,
  idealMax: 30,
  formatValue: (v) => v.toFixed(1),
}

export const SoilTempPage = () => <ParameterPageLayout config={config} />
