import { Droplets } from 'lucide-react'
import { ParameterPageLayout } from '@/shared/ui/parameter-page-layout'
import type { ParamConfig } from '@/shared/ui/parameter-page-layout'

const config: ParamConfig = {
  paramKey: 'soilMoist',
  label: 'Umidade do Solo',
  unit: '%',
  icon: Droplets,
  color: '#2e6b7a',
  idealMin: 30,
  idealMax: 70,
  formatValue: (v) => Math.round(v).toString(),
}

export const SoilMoisturePage = () => <ParameterPageLayout config={config} />
