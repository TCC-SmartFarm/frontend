import { NavLink } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import {
  Map,
  Thermometer,
  Droplets,
  CloudRain,
  Sun,
  Wind,
  Battery,
  Settings,
  LogOut,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { ROUTES } from '@/shared/constants/routes'
import { cn } from '@/shared/lib/utils'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

const topItems: NavItem[] = [
  { to: ROUTES.DASHBOARD_MAP, label: 'Mapa', icon: Map, end: true },
]

const paramItems: NavItem[] = [
  { to: ROUTES.DASHBOARD_SOIL_MOISTURE, label: 'Umidade do solo', icon: Droplets },
  { to: ROUTES.DASHBOARD_SOIL_TEMP,     label: 'Temp. do solo',   icon: Thermometer },
  { to: ROUTES.DASHBOARD_AIR_HUMIDITY,  label: 'Umidade do ar',   icon: CloudRain },
  { to: ROUTES.DASHBOARD_LUMINOSITY,    label: 'Luminosidade',    icon: Sun },
  { to: ROUTES.DASHBOARD_AIR_TEMP,      label: 'Temp. do ar',     icon: Wind },
  { to: ROUTES.DASHBOARD_BATTERY,       label: 'Bateria',         icon: Battery },
]

const bottomItems: NavItem[] = [
  { to: ROUTES.DASHBOARD_SETTINGS, label: 'Configurações', icon: Settings },
]

const itemBase =
  'flex items-center gap-3 w-full h-11 px-3 rounded-[10px] text-[13.5px] font-semibold font-display transition-all outline-none'
const itemInactive = 'text-leaf-200 hover:bg-white/5 hover:text-white'
const itemActive   = 'bg-leaf-700 text-white'

function NavButton({ item }: { item: NavItem }) {
  const { icon: Icon } = item
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) => cn(itemBase, isActive ? itemActive : itemInactive)}
    >
      <Icon size={17} strokeWidth={1.75} aria-hidden className="shrink-0" />
      <span className="flex-1 truncate">{item.label}</span>
    </NavLink>
  )
}

export const Sidebar = () => {
  const { logout, user } = useAuth0()

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'JS'
  const displayName = user?.name ?? 'João da Silva'

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col bg-leaf-900 px-3.5 pb-4 pt-[18px] text-sand-50">
      {/* Logo */}
      <div className="mb-4 flex items-center gap-2.5 px-2 pb-1">
        <span className="flex size-[30px] items-center justify-center rounded-full bg-leaf-500">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="M14 20a7 7 0 0 1-7-7c0-4 3-6 9-11-4 4-3 9 1 9a5 5 0 0 1-3 9z" />
          </svg>
        </span>
        <span className="font-display text-[18px] font-bold tracking-tight text-white">SmartFarm</span>
      </div>

      {/* Top items */}
      <div className="flex flex-col gap-0.5">
        {topItems.map((item) => <NavButton key={item.to} item={item} />)}
      </div>

      {/* Parameters section */}
      <div className="mt-5 px-3 pb-2 pt-0 text-[10px] font-bold uppercase tracking-[0.1em] text-leaf-300 opacity-80">
        Parâmetros
      </div>
      <div className="flex flex-col gap-0.5">
        {paramItems.map((item) => <NavButton key={item.to} item={item} />)}
      </div>

      <div className="flex-1" />

      {/* Bottom items */}
      <div className="flex flex-col gap-0.5">
        {bottomItems.map((item) => <NavButton key={item.to} item={item} />)}
      </div>

      {/* Logout */}
      <button
        onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
        className={cn(itemBase, 'mt-0.5', itemInactive)}
      >
        <LogOut size={17} strokeWidth={1.75} aria-hidden className="shrink-0" />
        <span>Sair</span>
      </button>

      {/* User info */}
      <div className="mt-3 flex items-center gap-2.5 border-t border-leaf-800 pt-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sand-400 font-display text-[13px] font-bold text-sand-900">
          {initials}
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-[13px] font-semibold text-white">{displayName}</span>
          <span className="text-[11px] text-leaf-200 opacity-80">Fazenda Serra Verde</span>
        </div>
      </div>
    </aside>
  )
}
