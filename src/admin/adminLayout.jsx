import { useState } from "react";
import AdminNavbar from "./adminComponents/adminNavbar";
import AdminSidebar from "./adminComponents/adminSidebar";
import { Outlet, Navigate } from "react-router-dom";

export default function AdminLayout({ user, status, theme, role, onToggleTheme }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // 1. WHILE LOADING or IDLE
  if (status === "loading" || status === "idle") {
    return (
      <div className={`h-screen w-screen flex items-center justify-center transition-colors duration-200 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 2. AFTER LOADING - REDIRECT IF NOT ADMIN
  if (!user || (user.user_type !== "admin" && user.user_type !== "superadmin")) {
    return <Navigate to="/" />;
  }

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const isDark = theme === "dark";

  return (
    <div className={isDark ? "dark" : ""}>
      <div className={`
        h-screen flex overflow-hidden font-sans transition-colors duration-200
        ${isDark ? "bg-[#0a0a0a] text-gray-200" : "bg-[#f8fafc] text-gray-800"}
      `}>

        {/* LEFT SIDEBAR */}
        <AdminSidebar role={role} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} theme={theme} />

        {/* RIGHT SIDE AREA */}
        <div className="flex flex-col flex-1 min-w-0 transition-all duration-200 relative z-10 w-full">
          {/* TOP NAVBAR */}
          <AdminNavbar
            theme={theme}
            role={role}
            onToggleTheme={onToggleTheme}
            toggleSidebar={toggleSidebar}
            isSidebarOpen={isSidebarOpen}
          />

          {/* MAIN CONTENT AREA */}
          <main className="flex-1 overflow-y-auto w-full p-6 md:p-8 custom-scrollbar">
            <div className="max-w-[85rem] mx-auto w-full h-full animate-fadeIn">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
