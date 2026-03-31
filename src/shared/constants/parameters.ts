import {
  Thermometer,
  Droplets,
  CloudRain,
  Sun,
  Wind,
  Battery,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface ParameterMeta {
  label: string;
  unit: string;
  icon: LucideIcon;
  color: string;
  route: string;
}

export const SENSOR_PARAMETERS: Record<string, ParameterMeta> = {
  soil_temperature: {
    label: "Temperatura do Solo",
    unit: "°C",
    icon: Thermometer,
    color: "#e74c3c",
    route: "/dashboard/soil-temp",
  },
  soil_moisture: {
    label: "Umidade do Solo",
    unit: "%",
    icon: Droplets,
    color: "#3498db",
    route: "/dashboard/soil-moisture",
  },
  air_humidity: {
    label: "Umidade do Ar",
    unit: "%",
    icon: CloudRain,
    color: "#1abc9c",
    route: "/dashboard/air-humidity",
  },
  luminosity: {
    label: "Luminosidade",
    unit: "lux",
    icon: Sun,
    color: "#f39c12",
    route: "/dashboard/luminosity",
  },
  air_temperature: {
    label: "Temperatura do Ar",
    unit: "°C",
    icon: Wind,
    color: "#9b59b6",
    route: "/dashboard/air-temp",
  },
  battery: {
    label: "Bateria",
    unit: "%",
    icon: Battery,
    color: "#2ecc71",
    route: "/dashboard/battery",
  },
} as const;
