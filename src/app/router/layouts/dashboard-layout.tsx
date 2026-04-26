import { Outlet } from 'react-router-dom'
import { Bell, Search } from 'lucide-react'
import { Sidebar } from '@/widgets/sidebar/ui/Sidebar'
import { Badge } from '@/shared/ui/badge'

export const DashboardLayout = () => (
  <div className="flex h-screen bg-bg">
    <Sidebar />

    <div className="flex min-w-0 flex-1 flex-col">
      {/* Top header */}
      <header className="sticky top-0 z-10 flex h-[60px] shrink-0 items-center gap-3.5 border-b border-border px-7 backdrop-blur-md" style={{ background: 'rgba(250,247,241,0.88)' }}>
        <div className="flex max-w-[380px] flex-1 items-center gap-2 rounded-[10px] border border-border bg-white px-3.5 py-2 text-fg-subtle">
          <Search size={16} strokeWidth={1.75} aria-hidden className="shrink-0" />
          <span className="text-[14px]">Buscar sensor, talhão…</span>
        </div>
        <div className="flex-1" />
        <Badge tone="leaf" dot>9 sensores online</Badge>
        <button
          className="relative flex size-10 items-center justify-center rounded-[10px] border border-border bg-white text-fg-muted transition-colors hover:text-fg"
          aria-label="Notificações"
        >
          <Bell size={18} strokeWidth={1.75} aria-hidden />
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full border-2 border-white bg-alert-dot" />
        </button>
      </header>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  </div>
)
