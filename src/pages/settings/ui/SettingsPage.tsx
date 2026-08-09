import { useState } from 'react'
import { Card } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { EmptyState } from '@/shared/ui/empty-state'
import { ErrorState } from '@/shared/ui/error-state'
import { resolveErrorVariant } from '@/shared/ui/error-state.helpers'
import { SensorListSkeleton } from '@/shared/ui/sensor-list-skeleton'
import { Skeleton } from '@/shared/ui/skeleton'
import { ProfileEditForm } from '@/features/profile-edit/ui/ProfileEditForm'
import { ThresholdsForm } from '@/features/thresholds-edit/ui/ThresholdsForm'
import { SensorNameEditor } from '@/features/sensor-rename/ui/SensorNameEditor'
import { useAuth } from '@/features/auth/model/use-auth'
import { useSensorsList } from '@/entities/sensor/api/use-sensors-list'
import { useUserProfile } from '@/entities/user/api/use-user-profile'
import { cn } from '@/shared/lib/utils'

type Tab = 'perfil' | 'limites' | 'sensores'

export const SettingsPage = () => {
  const [tab, setTab] = useState<Tab>('perfil')

  return (
    <div className="p-8" style={{ maxWidth: 860 }}>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight text-fg">Configurações</h1>
        <p className="mt-1.5 text-base text-fg-muted">Gerencie seu perfil, limites e sensores.</p>
      </div>

      <div className="mb-6 flex gap-1 rounded-xl border border-border bg-bg-raised p-1">
        {(
          [
            ['perfil', 'Perfil'],
            ['limites', 'Limites'],
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
      {tab === 'limites' && <ThresholdsForm />}
      {tab === 'sensores' && <SensoresTab />}
    </div>
  )
}

function PerfilTab() {
  const { logout } = useAuth()
  const { profile, sub, isPending } = useUserProfile()

  return (
    <div className="flex flex-col gap-4">
      {isPending ? (
        <Card tone="white" padding="lg">
          <Skeleton className="mb-4 h-6 w-40" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16 md:col-span-2" />
          </div>
        </Card>
      ) : (
        // `key` no sub: o form inicializa o estado a partir das props, então
        // precisa remontar quando o perfil finalmente chega (ou troca de conta).
        <ProfileEditForm
          key={sub}
          initialName={profile.name}
          initialNickname={profile.nickname}
          email={profile.email}
        />
      )}

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
            <div key={s.devEUI} className="flex items-center gap-4 px-6 py-4">
              <div className="min-w-0 flex-1">
                <SensorNameEditor devEUI={s.devEUI} name={s.name} />
                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-fg-subtle">
                  <span className="font-mono">{s.devEUI}</span>
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
