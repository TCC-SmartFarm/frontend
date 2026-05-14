import { useState } from 'react'
import { Card } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Switch } from '@/shared/ui/switch'
import { Label } from '@/shared/ui/label'
import { Badge } from '@/shared/ui/badge'
import { EmptyState } from '@/shared/ui/empty-state'
import { ErrorState } from '@/shared/ui/error-state'
import { resolveErrorVariant } from '@/shared/ui/error-state.helpers'
import { SensorListSkeleton } from '@/shared/ui/sensor-list-skeleton'
import { ProfileEditForm } from '@/features/profile-edit/ui/ProfileEditForm'
import { useAuth } from '@/features/auth/model/use-auth'
import { useSensorsList } from '@/entities/sensor/api/use-sensors-list'
import { DEFAULT_PARAM_THRESHOLDS } from '@/shared/constants/thresholds'
import { cn } from '@/shared/lib/utils'

type Tab = 'perfil' | 'alertas' | 'sensores'

export const SettingsPage = () => {
  const [tab, setTab] = useState<Tab>('perfil')

  return (
    <div className="p-8" style={{ maxWidth: 860 }}>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight text-fg">Configurações</h1>
        <p className="mt-1.5 text-base text-fg-muted">Gerencie seu perfil, alertas e sensores.</p>
      </div>

      <div className="mb-6 flex gap-1 rounded-xl border border-border bg-bg-raised p-1">
        {(
          [
            ['perfil', 'Perfil'],
            ['alertas', 'Alertas'],
            ['sensores', 'Sensores'],
          ] as [Tab, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              'flex-1 rounded-lg px-4 py-2 font-display text-sm font-semibold transition-all',
              tab === id ? 'bg-white text-fg shadow-xs' : 'text-fg-muted hover:text-fg',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'perfil' && <PerfilTab />}
      {tab === 'alertas' && <AlertasTab />}
      {tab === 'sensores' && <SensoresTab />}
    </div>
  )
}

function PerfilTab() {
  const { user, logout } = useAuth()

  return (
    <div className="flex flex-col gap-4">
      <ProfileEditForm
        initialName={user?.name ?? ''}
        initialNickname={user?.nickname ?? ''}
        email={user?.email ?? ''}
      />

      <Card tone="white" padding="lg">
        <Card.Header>
          <Card.Title as="h2">Segurança</Card.Title>
        </Card.Header>
        <p className="text-sm text-fg-muted">
          A alteração de senha é feita pelo portal de autenticação Auth0. Para encerrar a sessão neste
          dispositivo, use o botão abaixo.
        </p>
        <Card.Footer className="justify-end">
          <Button
            variant="secondary"
            size="md"
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
          >
            Sair da conta
          </Button>
        </Card.Footer>
      </Card>
    </div>
  )
}

const ALERT_PARAMS = [
  { id: 'soil_moisture', label: 'Umidade do Solo', unit: '%' },
  { id: 'soil_temperature', label: 'Temp. do Solo', unit: '°C' },
  { id: 'air_humidity', label: 'Umidade do Ar', unit: '%' },
  { id: 'air_temperature', label: 'Temp. do Ar', unit: '°C' },
  { id: 'battery', label: 'Bateria', unit: '%' },
] as const

function AlertasTab() {
  const { user } = useAuth()

  return (
    <div className="flex flex-col gap-4">
      <Card tone="white" padding="lg">
        <Card.Header>
          <Card.Title as="h2">Canais de notificação</Card.Title>
          <span className="text-xs text-fg-subtle">Em breve</span>
        </Card.Header>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-semibold text-fg">E-mail</Label>
              <p className="text-xs text-fg-subtle">{user?.email ?? '—'}</p>
            </div>
            <Switch defaultChecked disabled />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-semibold text-fg">SMS</Label>
              <p className="text-xs text-fg-subtle">Disponível em breve</p>
            </div>
            <Switch disabled />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-semibold text-fg">WhatsApp</Label>
              <p className="text-xs text-fg-subtle">Disponível em breve</p>
            </div>
            <Switch disabled />
          </div>
        </div>
      </Card>

      <Card tone="white" padding="lg">
        <Card.Header>
          <Card.Title as="h2">Thresholds padrão</Card.Title>
          <span className="text-xs text-fg-subtle">Aplicado a todos os sensores</span>
        </Card.Header>
        <div className="flex flex-col divide-y divide-border">
          {ALERT_PARAMS.map((s) => {
            const t = DEFAULT_PARAM_THRESHOLDS[s.id]
            return (
              <div key={s.id} className="flex items-center justify-between py-3">
                <span className="font-display text-sm font-semibold text-fg">{s.label}</span>
                <div className="flex items-center gap-3 text-sm">
                  {t.alertLow !== undefined && (
                    <span className="text-fg-subtle">
                      Mín: <strong className="text-alert-dot">{t.alertLow}{s.unit}</strong>
                    </span>
                  )}
                  {t.alertHigh !== undefined && (
                    <span className="text-fg-subtle">
                      Máx: <strong className="text-alert-dot">{t.alertHigh}{s.unit}</strong>
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

function SensoresTab() {
  const sensorsQuery = useSensorsList()

  if (sensorsQuery.error) {
    return (
      <ErrorState
        variant={resolveErrorVariant(sensorsQuery.error)}
        onRetry={() => sensorsQuery.refetch()}
      />
    )
  }

  if (sensorsQuery.isPending) {
    return (
      <Card tone="white" padding="none">
        <SensorListSkeleton rows={5} />
      </Card>
    )
  }

  const sensors = sensorsQuery.data ?? []
  if (sensors.length === 0) {
    return <EmptyState variant="no-sensors" />
  }

  return (
    <Card tone="white" padding="none">
      <div className="divide-y divide-border">
        {sensors.map((s) => {
          const batteryLevel =
            typeof s.lastReading?.battery === 'number' ? Math.round(s.lastReading.battery) : null
          const hasLocation = s.latitude !== null && s.longitude !== null
          return (
            <div key={s.deviceId} className="flex items-center gap-4 px-6 py-4">
              <div className="min-w-0 flex-1">
                <div className="font-display text-sm font-semibold text-fg">{s.name}</div>
                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-fg-subtle">
                  {s.deviceType && (
                    <Badge tone="leaf" size="sm">
                      {s.deviceType}
                    </Badge>
                  )}
                  <span className="font-mono">{s.deviceId}</span>
                  {!hasLocation && (
                    <Badge tone="neutral" size="sm">
                      sem localização
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <div className="text-right text-xs text-fg-subtle">
                  <div>Bateria: {batteryLevel !== null ? `${batteryLevel}%` : '—'}</div>
                  <div>
                    Última leitura:{' '}
                    {s.lastReadingAt
                      ? new Date(s.lastReadingAt * 1000).toLocaleDateString('pt-BR')
                      : '—'}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
