import { Routes, Route, Navigate } from "react-router-dom";
import { ROUTES } from "@/shared/constants/routes";
import { ProtectedRoute } from "./protected-route";
import { DashboardLayout } from "./layouts/dashboard-layout";
import { LandingPage } from "@/pages/landing/ui/LandingPage";
import { DashboardMapPage } from "@/pages/dashboard-map/ui/DashboardMapPage";
import { SoilTempPage } from "@/pages/soil-temp/ui/SoilTempPage";
import { SoilMoisturePage } from "@/pages/soil-moisture/ui/SoilMoisturePage";
import { AirHumidityPage } from "@/pages/air-humidity/ui/AirHumidityPage";
import { LuminosityPage } from "@/pages/luminosity/ui/LuminosityPage";
import { AirTempPage } from "@/pages/air-temp/ui/AirTempPage";
import { BatteryPage } from "@/pages/battery/ui/BatteryPage";
import { SettingsPage } from "@/pages/settings/ui/SettingsPage";
import { NotFoundPage } from "@/pages/not-found/ui/NotFoundPage";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path={ROUTES.LANDING} element={<LandingPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path={ROUTES.DASHBOARD} element={<Navigate to={ROUTES.DASHBOARD_MAP} replace />} />
          <Route path={ROUTES.DASHBOARD_MAP} element={<DashboardMapPage />} />
          <Route path={ROUTES.DASHBOARD_SOIL_TEMP} element={<SoilTempPage />} />
          <Route path={ROUTES.DASHBOARD_SOIL_MOISTURE} element={<SoilMoisturePage />} />
          <Route path={ROUTES.DASHBOARD_AIR_HUMIDITY} element={<AirHumidityPage />} />
          <Route path={ROUTES.DASHBOARD_LUMINOSITY} element={<LuminosityPage />} />
          <Route path={ROUTES.DASHBOARD_AIR_TEMP} element={<AirTempPage />} />
          <Route path={ROUTES.DASHBOARD_BATTERY} element={<BatteryPage />} />
          <Route path={ROUTES.DASHBOARD_SETTINGS} element={<SettingsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
