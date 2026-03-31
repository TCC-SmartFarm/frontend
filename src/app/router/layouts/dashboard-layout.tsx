import { Outlet } from "react-router-dom";
import { Sidebar } from "@/widgets/sidebar/ui/Sidebar";

export const DashboardLayout = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};
