import { Battery } from 'lucide-react'
import { ParameterPageLayout } from '@/shared/ui/parameter-page-layout'
import type { ParamConfig } from '@/shared/ui/parameter-page-layout'

const config: ParamConfig = {
  paramKey: 'battery',
  label: 'Bateria',
  unit: '%',
  icon: Battery,
  color: '#456830',
  idealMin: 20,
  idealMax: 100,
  formatValue: (v) => Math.round(v).toString(),
}

export const BatteryPage = () => <ParameterPageLayout config={config} />
