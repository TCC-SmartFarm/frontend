import { useState } from 'react'
import { Card } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Switch } from '@/shared/ui/switch'
import { Label } from '@/shared/ui/label'
import { Badge } from '@/shared/ui/badge'
import { cn } from '@/shared/lib/utils'
import { SENSORS } from '@/shared/constants/sensor-mock'

type Tab = 'perfil' | 'alertas' | 'sensores'

export const SettingsPage = () => {
  const [tab, setTab] = useState<Tab>('perfil')

  return (
    <div className="p-8" style={{ maxWidth: 860 }}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight text-fg">Configurações</h1>
        <p className="mt-1.5 text-base text-fg-muted">Gerencie seu perfil, alertas e sensores.</p>
      </div>

      {/* Tab bar */}
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
            onClick={() => setTab(id)}
            className={cn(
              'flex-1 rounded-lg px-4 py-2 font-display text-sm font-semibold transition-all',
              tab === id
                ? 'bg-white text-fg shadow-xs'
                : 'text-fg-muted hover:text-fg',
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
  return (
    <div className="flex flex-col gap-4">
      <Card tone="white" padding="lg">
        <Card.Header>
          <Card.Title as="h2">Dados pessoais</Card.Title>
        </Card.Header>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Nome completo', placeholder: 'João da Silva' },
            { label: 'E-mail', placeholder: 'joao@fazendaverdevale.com.br', type: 'email' },
            { label: 'Propriedade', placeholder: 'Fazenda Serra Verde' },
            { label: 'Telefone', placeholder: '+55 35 9 9999-9999' },
          ].map((f) => (
            <div key={f.label} className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold uppercase tracking-caps text-fg-subtle">{f.label}</Label>
              <Input placeholder={f.placeholder} type={f.type ?? 'text'} />
            </div>
          ))}
        </div>
        <Card.Footer className="justify-end">
          <Button variant="secondary" size="sm">Cancelar</Button>
          <Button variant="primary" size="sm">Salvar</Button>
        </Card.Footer>
      </Card>

      <Card tone="white" padding="lg">
        <Card.Header>
          <Card.Title as="h2">Segurança</Card.Title>
        </Card.Header>
        <p className="text-sm text-fg-muted">
          A alteração de senha é feita pelo portal de autenticação Auth0. Clique abaixo para ser redirecionado.
        </p>
        <div className="mt-4">
          <Button variant="secondary" size="md">Alterar senha</Button>
        </div>
      </Card>
    </div>
  )
}

const alertSettings = [
  { id: 'soilMoist', label: 'Umidade do Solo', unit: '%',  low: 30,  high: 80 },
  { id: 'soilTemp',  label: 'Temp. do Solo',   unit: '°C', low: null, high: 35 },
  { id: 'airHumid',  label: 'Umidade do Ar',   unit: '%',  low: 20,  high: 90 },
  { id: 'airTemp',   label: 'Temp. do Ar',      unit: '°C', low: 5,   high: 38 },
  { id: 'battery',   label: 'Bateria',          unit: '%',  low: 20,  high: null },
]

function AlertasTab() {
  return (
    <div className="flex flex-col gap-4">
      <Card tone="white" padding="lg">
        <Card.Header>
          <Card.Title as="h2">Canais de notificação</Card.Title>
        </Card.Header>
        <div className="flex flex-col gap-4">
          {[
            { id: 'email', label: 'E-mail', sub: 'joao@fazendaverdevale.com.br' },
            { id: 'sms',   label: 'SMS',    sub: '+55 35 9 9999-9999' },
            { id: 'whats', label: 'WhatsApp', sub: '+55 35 9 9999-9999' },
          ].map((ch) => (
            <div key={ch.id} className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-semibold text-fg">{ch.label}</Label>
                <p className="text-xs text-fg-subtle">{ch.sub}</p>
              </div>
              <Switch defaultChecked={ch.id === 'email'} />
            </div>
          ))}
        </div>
      </Card>

      <Card tone="white" padding="lg">
        <Card.Header>
          <Card.Title as="h2">Thresholds padrão</Card.Title>
          <span className="text-xs text-fg-subtle">Aplicado a todos os sensores</span>
        </Card.Header>
        <div className="flex flex-col divide-y divide-border">
          {alertSettings.map((s) => (
            <div key={s.id} className="flex items-center justify-between py-3">
              <span className="font-display text-sm font-semibold text-fg">{s.label}</span>
              <div className="flex items-center gap-3 text-sm">
                {s.low !== null && (
                  <span className="text-fg-subtle">
                    Mín: <strong className="text-alert-dot">{s.low}{s.unit}</strong>
                  </span>
                )}
                {s.high !== null && (
                  <span className="text-fg-subtle">
                    Máx: <strong className="text-alert-dot">{s.high}{s.unit}</strong>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function SensoresTab() {
  return (
    <Card tone="white" padding="none">
      <div className="divide-y divide-border">
        {SENSORS.map((s) => (
          <div key={s.id} className="flex items-center gap-4 px-6 py-4">
            <div className="min-w-0 flex-1">
              <div className="font-display text-sm font-semibold text-fg">{s.name}</div>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-fg-subtle">
                <Badge tone="leaf" size="sm">{s.crop}</Badge>
                <span>·</span>
                <span>{s.depth}</span>
                <span>·</span>
                <span className="font-mono">{s.serial}</span>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <div className="text-right text-xs text-fg-subtle">
                <div>Bateria: {s.battery}%</div>
                <div>Sinal: {s.signal}</div>
              </div>
              <Button variant="ghost" size="sm">Renomear</Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
