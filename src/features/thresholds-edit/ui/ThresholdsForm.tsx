import { useState } from 'react'
import { Card } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { FieldError } from '@/shared/ui/field-helper'
import { showToast } from '@/shared/lib/toast'
import { SENSOR_PARAMETERS } from '@/shared/constants/parameters'
import {
  DEFAULT_PARAM_THRESHOLDS,
  PARAM_THRESHOLD_FIELDS,
  type ParamThreshold,
  type ParamThresholdField,
  type ParamThresholdMap,
} from '@/shared/constants/thresholds'
import { useThresholdsStore } from '@/shared/stores/thresholds-store'
import type { SensorParam } from '@/entities/reading/model/types'

// Mesma ordem da sidebar, para o usuário achar o parâmetro onde espera.
const PARAM_ORDER: SensorParam[] = [
  'soil_moisture',
  'soil_temperature',
  'air_humidity',
  'luminosity',
  'air_temperature',
  'battery',
]

const FIELD_LABELS: Record<ParamThresholdField, string> = {
  alertLow: 'Crítico mín',
  warnLow: 'Atenção mín',
  warnHigh: 'Atenção máx',
  alertHigh: 'Crítico máx',
}

// O rascunho guarda string, não number: com number o input controlado brigaria
// com o usuário no momento em que ele apaga o último dígito do campo.
type Draft = Record<SensorParam, Record<ParamThresholdField, string>>

const toDraft = (map: ParamThresholdMap): Draft =>
  Object.fromEntries(
    PARAM_ORDER.map((param) => [
      param,
      Object.fromEntries(
        PARAM_THRESHOLD_FIELDS.map((field) => {
          const value = map[param]?.[field]
          return [field, value === undefined ? '' : String(value)]
        }),
      ),
    ]),
  ) as Draft

const ORDER_ERROR =
  'Os limites devem estar em ordem crescente: crítico mín ≤ atenção mín ≤ atenção máx ≤ crítico máx.'

const rowError = (row: Record<ParamThresholdField, string>): string | null => {
  const parsed: number[] = []
  for (const field of PARAM_THRESHOLD_FIELDS) {
    const raw = row[field].trim()
    if (raw === '') continue
    const n = Number(raw)
    if (!Number.isFinite(n)) return 'Use apenas números (o campo vazio significa "sem limite").'
    parsed.push(n)
  }
  for (let i = 1; i < parsed.length; i++) {
    if (parsed[i] < parsed[i - 1]) return ORDER_ERROR
  }
  return null
}

const fromDraft = (draft: Draft): ParamThresholdMap =>
  Object.fromEntries(
    PARAM_ORDER.map((param) => {
      const next: ParamThreshold = {}
      for (const field of PARAM_THRESHOLD_FIELDS) {
        const raw = draft[param][field].trim()
        if (raw === '') continue
        next[field] = Number(raw)
      }
      return [param, next]
    }),
  ) as ParamThresholdMap

export const ThresholdsForm = () => {
  const thresholds = useThresholdsStore((s) => s.thresholds)
  const replaceAll = useThresholdsStore((s) => s.replaceAll)
  const resetAll = useThresholdsStore((s) => s.resetAll)

  const [draft, setDraft] = useState<Draft>(() => toDraft(thresholds))

  const errors = PARAM_ORDER.reduce<Partial<Record<SensorParam, string>>>((acc, param) => {
    const error = rowError(draft[param])
    if (error) acc[param] = error
    return acc
  }, {})
  const hasError = Object.keys(errors).length > 0
  const dirty = JSON.stringify(draft) !== JSON.stringify(toDraft(thresholds))

  const setField = (param: SensorParam, field: ParamThresholdField, value: string) => {
    setDraft((prev) => ({ ...prev, [param]: { ...prev[param], [field]: value } }))
  }

  const handleSave = () => {
    replaceAll(fromDraft(draft))
    showToast.success('Limites atualizados.')
  }

  const handleRestore = () => {
    resetAll()
    setDraft(toDraft(DEFAULT_PARAM_THRESHOLDS))
    showToast.success('Limites restaurados para os valores padrão.')
  }

  return (
    <Card tone="white" padding="lg">
      <Card.Header>
        <Card.Title as="h2">Limites de referência</Card.Title>
        <span className="text-xs text-fg-subtle">Aplicados a todos os sensores</span>
      </Card.Header>

      <p className="mb-4 text-sm text-fg-muted">
        Definem quando uma leitura aparece como <strong>Monitorar</strong> ou{' '}
        <strong>Atenção</strong> no mapa e nas páginas de parâmetro. Deixe um campo vazio
        para não usar aquele limite.
      </p>

      <div className="overflow-x-auto">
        <div className="min-w-[560px]">
          <div className="grid grid-cols-[minmax(140px,1fr)_repeat(4,88px)] items-end gap-3 border-b border-border pb-2">
            <span className="text-xs font-semibold uppercase tracking-caps text-fg-subtle">
              Parâmetro
            </span>
            {PARAM_THRESHOLD_FIELDS.map((field) => (
              <span
                key={field}
                className="text-[11px] font-semibold uppercase tracking-caps text-fg-subtle"
              >
                {FIELD_LABELS[field]}
              </span>
            ))}
          </div>

          <div className="flex flex-col divide-y divide-border">
            {PARAM_ORDER.map((param) => {
              const meta = SENSOR_PARAMETERS[param]
              const error = errors[param]
              return (
                <div key={param} className="py-3">
                  <div className="grid grid-cols-[minmax(140px,1fr)_repeat(4,88px)] items-center gap-3">
                    <div className="min-w-0">
                      <div className="truncate font-display text-sm font-semibold text-fg">
                        {meta.label}
                      </div>
                      <div className="text-xs text-fg-subtle">{meta.unit}</div>
                    </div>
                    {PARAM_THRESHOLD_FIELDS.map((field) => (
                      <Input
                        key={field}
                        type="number"
                        inputMode="decimal"
                        step="0.1"
                        aria-label={`${meta.label} — ${FIELD_LABELS[field]}`}
                        placeholder="—"
                        error={!!error}
                        value={draft[param][field]}
                        onChange={(e) => setField(param, field, e.target.value)}
                        className="px-2.5 py-1.5 text-center text-sm"
                      />
                    ))}
                  </div>
                  {error && <FieldError>{error}</FieldError>}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <Card.Footer className="justify-between">
        <Button variant="secondary" size="sm" onClick={handleRestore}>
          Restaurar padrões
        </Button>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setDraft(toDraft(thresholds))}
            disabled={!dirty}
          >
            Cancelar
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={!dirty || hasError}>
            Salvar
          </Button>
        </div>
      </Card.Footer>
    </Card>
  )
}
