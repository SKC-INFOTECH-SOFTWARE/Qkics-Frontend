import AdminNavbar from "./adminComponents/AdminNavbar";
import AdminSidebar from "./adminComponents/AdminSidebar";
import { Outlet } from "react-router-dom";

export default function AdminLayout({ theme, role , onToggleTheme }) {
  return (
    <div className="h-screen flex flex-col">

      {/* TOP NAVBAR (full width) */}
      <AdminNavbar theme={theme} role={role} onToggleTheme={onToggleTheme} />

      {/* BODY AREA */}
      <div className="flex flex-1">

        {/* LEFT SIDEBAR */}
        <AdminSidebar role={role} />

        {/* MAIN CONTENT */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>

      </div>
      
    </div>
  );
}
