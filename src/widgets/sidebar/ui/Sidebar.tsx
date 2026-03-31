import { NavLink } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
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
} from "lucide-react";
import { ROUTES } from "@/shared/constants/routes";
import { cn } from "@/shared/lib/utils";

const navItems = [
  { to: ROUTES.DASHBOARD_MAP, label: "Mapa", icon: Map },
  { to: ROUTES.DASHBOARD_SOIL_TEMP, label: "Temp. Solo", icon: Thermometer },
  { to: ROUTES.DASHBOARD_SOIL_MOISTURE, label: "Umidade Solo", icon: Droplets },
  { to: ROUTES.DASHBOARD_AIR_HUMIDITY, label: "Umidade Ar", icon: CloudRain },
  { to: ROUTES.DASHBOARD_LUMINOSITY, label: "Luminosidade", icon: Sun },
  { to: ROUTES.DASHBOARD_AIR_TEMP, label: "Temp. Ar", icon: Wind },
  { to: ROUTES.DASHBOARD_BATTERY, label: "Bateria", icon: Battery },
  { to: ROUTES.DASHBOARD_SETTINGS, label: "Configurações", icon: Settings },
];

export const Sidebar = () => {
  const { logout } = useAuth0();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-sidebar">
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <span className="text-lg font-bold text-sidebar-foreground">
          SmartFarm
        </span>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
              )
            }
          >
            <Icon className="size-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <button
          onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
        >
          <LogOut className="size-4" />
          Sair
        </button>
      </div>
    </aside>
  );
};
