import { CloudRain } from 'lucide-react'
import { ParameterPageLayout } from '@/shared/ui/parameter-page-layout'
import type { ParamConfig } from '@/shared/ui/parameter-page-layout'

const config: ParamConfig = {
  paramKey: 'airHumid',
  label: 'Umidade do Ar',
  unit: '%',
  icon: CloudRain,
  color: '#5d87a0',
  idealMin: 40,
  idealMax: 80,
  formatValue: (v) => Math.round(v).toString(),
}

export const AirHumidityPage = () => <ParameterPageLayout config={config} />
