import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Bell, Search } from 'lucide-react'
import { Sidebar } from '@/widgets/sidebar/ui/Sidebar'
import { Badge } from '@/shared/ui/badge'
import { LoadingOverlay } from '@/shared/ui/loading-overlay'
import { useSensorsList } from '@/entities/sensor/api/use-sensors-list'
import { useSelectedSensorStore } from '@/shared/stores/selected-sensor-store'

export const DashboardLayout = () => {
  const { data: sensors, isLoading, isFetching } = useSensorsList()
  const selectedSensorId = useSelectedSensorStore((s) => s.selectedSensorId)
  const setSelectedSensorId = useSelectedSensorStore((s) => s.setSelectedSensorId)

  useEffect(() => {
    if (!sensors || sensors.length === 0) return
    const exists = selectedSensorId && sensors.some((s) => s.deviceId === selectedSensorId)
    if (!exists) {
      setSelectedSensorId(sensors[0].deviceId)
    }
  }, [sensors, selectedSensorId, setSelectedSensorId])

  const sensorCount = sensors?.length ?? 0
  const showOverlay = isLoading && !sensors

  return (
    <div className="flex h-screen bg-bg">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className="sticky top-0 z-10 flex h-[60px] shrink-0 items-center gap-3.5 border-b border-border px-7 backdrop-blur-md"
          style={{ background: 'rgba(250,247,241,0.88)' }}
        >
          <div className="flex max-w-[380px] flex-1 items-center gap-2 rounded-[10px] border border-border bg-white px-3.5 py-2 text-fg-subtle">
            <Search size={16} strokeWidth={1.75} aria-hidden className="shrink-0" />
            <span className="text-[14px]">Buscar sensor, talhão…</span>
          </div>
          <div className="flex-1" />
          {sensorCount > 0 && (
            <Badge tone="leaf" dot>
              {sensorCount} {sensorCount === 1 ? 'sensor online' : 'sensores online'}
            </Badge>
          )}
          {isFetching && !isLoading && (
            <span className="text-xs text-fg-subtle">Atualizando…</span>
          )}
          <button
            className="relative flex size-10 items-center justify-center rounded-[10px] border border-border bg-white text-fg-muted transition-colors hover:text-fg"
            aria-label="Notificações"
          >
            <Bell size={18} strokeWidth={1.75} aria-hidden />
          </button>
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>

      <LoadingOverlay show={showOverlay} />
    </div>
  )
}
