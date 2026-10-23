import type { ReactNode } from 'react'
import { RotateCw } from 'lucide-react'
import { irrigationErrorMessage } from '@/entities/irrigation/api/use-irrigation'

interface IrrigationErrorPanelProps {
  error: unknown
  onRetry: () => void
  /** Com vários sensores, diz de qual deles é o problema. */
  sensorName?: string
  /** Seletor de sensores, quando há vários pedindo atenção. */
  header?: ReactNode
}

export const IrrigationErrorPanel = ({ error, onRetry, sensorName, header }: IrrigationErrorPanelProps) => (
  <div className="flex flex-col items-start gap-3 bg-white p-6">
    {header && <div className="flex w-full justify-end">{header}</div>}
    <h3 className="font-display text-lg font-bold text-fg">
      {sensorName
        ? `Não conseguimos montar a recomendação do ${sensorName}`
        : 'Não conseguimos montar a recomendação agora'}
    </h3>
    <p className="text-sm text-fg-muted">{irrigationErrorMessage(error)}</p>
    <button
      type="button"
      onClick={onRetry}
      className="inline-flex items-center gap-1.5 rounded-md border border-border-strong px-3 py-1.5 font-display text-[13px] font-semibold text-fg hover:bg-sand-50"
    >
      <RotateCw size={13} strokeWidth={2} aria-hidden />
      Tentar novamente
    </button>
  </div>
)
