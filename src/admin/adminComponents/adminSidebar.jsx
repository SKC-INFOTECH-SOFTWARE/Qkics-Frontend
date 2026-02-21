import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  FaThLarge,
  FaTags,
  FaUsers,
  FaFileAlt,
  FaCreditCard,
  FaTerminal,
  FaChevronDown,
  FaUserTie,
  FaUserShield,
  FaAppStoreIos
} from "react-icons/fa";
import { MdFeed } from "react-icons/md";

export default function AdminSidebar({ role, isOpen, setIsOpen, theme }) {
  const isDark = theme === "dark";

  return (
    <aside
      onMouseEnter={() => !isOpen && setIsOpen(true)}
      onMouseLeave={() => isOpen && setIsOpen(false)}
      className={`
        relative h-screen flex flex-col transition-all duration-200 ease-in-out z-30 shrink-0
        border-r
        ${isOpen ? "w-64" : "w-[4.5rem]"}
        ${isDark
          ? "bg-[#111111] border-gray-800 text-gray-300"
          : "bg-white border-gray-200 text-gray-600"}
      `}
    >
      {/* BRAND SECTION */}
      <div className={`flex items-center gap-3 px-5 py-5 border-b h-16 transition-colors duration-200 ${isDark ? "border-gray-800" : "border-gray-100"}`}>
        <div className="relative flex items-center justify-center min-w-[2rem] w-8 h-8 rounded-lg bg-blue-600 shadow-sm text-white font-bold text-sm">
          <img src="/logo.png" className="absolute h-5 w-5 object-contain" alt="logo" />
        </div>
        {isOpen && (
          <span className={`text-[1.05rem] font-bold tracking-tight truncate whitespace-nowrap ${isDark ? "text-gray-100" : "text-gray-900"}`}>
            QKICS Admin
          </span>
        )}
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto custom-scrollbar">
        <div className={`px-2 mb-3 text-[0.65rem] font-semibold uppercase tracking-wider ${!isOpen && "text-center"} ${isDark ? "text-gray-500" : "text-gray-400"}`}>
          {isOpen ? "Main Menu" : "•••"}
        </div>

        <SidebarLink to="/admin" label="Dashboard" icon={<FaThLarge />} isOpen={isOpen} theme={theme} />

        <SidebarDropdown
          label="Application"
          icon={<FaAppStoreIos />}
          isOpen={isOpen}
          theme={theme}
          basePath="/admin-application"
        >
          <SidebarLink to="/admin-application/expert" label="Expert" icon={<FaUserTie />} isOpen={isOpen} theme={theme} isSubitem />
          <SidebarLink to="/admin-application/entrepreneur" label="Entrepreneur" icon={<FaUserShield />} isOpen={isOpen} theme={theme} isSubitem />
        </SidebarDropdown>

        <SidebarLink to="/admin-tags" label="Tags" icon={<FaTags />} isOpen={isOpen} theme={theme} />
        <SidebarLink to="/admin-users" label="Users" icon={<FaUsers />} isOpen={isOpen} theme={theme} />
        <SidebarLink to="/admin-posts" label="Posts" icon={<MdFeed />} isOpen={isOpen} theme={theme} />
        <SidebarLink to="/subscriptions" label="Subscriptions" icon={<FaCreditCard />} isOpen={isOpen} theme={theme} />
        <SidebarLink to="/admin-documents" label="Documents" icon={<FaFileAlt />} isOpen={isOpen} theme={theme} />

        {role === "superadmin" && (
          <div className={`pt-5 mt-5 border-t ${isDark ? "border-gray-800" : "border-gray-100"}`}>
            <div className={`px-2 mb-3 text-[0.65rem] font-semibold uppercase tracking-wider ${!isOpen && "text-center"} ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              {isOpen ? "System" : "•••"}
            </div>
            <SidebarLink to="/system-logs" label="Logs" icon={<FaTerminal />} isOpen={isOpen} theme={theme} />
          </div>
        )}
      </nav>

      {/* FOOTER SECTION */}
      <div className={`p-4 border-t transition-colors duration-200 ${isDark ? "border-gray-800" : "border-gray-100"}`}>
        <div className={`flex items-center transition-all ${isOpen ? "gap-3" : "justify-center"}`}>
          <div className={`min-w-[2rem] w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs ring-2 ${isDark ? "bg-blue-600 ring-gray-800" : "bg-blue-600 ring-gray-100"}`}>
            {role?.[0].toUpperCase()}
          </div>
          {isOpen && (
            <div className="truncate flex-1">
              <p className={`text-sm font-semibold truncate ${isDark ? "text-gray-200" : "text-gray-900"}`}>{role}</p>
              <p className="text-[0.7rem] text-gray-500 truncate">Administrator</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

function SidebarDropdown({ label, icon, isOpen, theme, basePath, children }) {
  const isDark = theme === "dark";
  const location = useLocation();
  const isActiveGroup = location.pathname.startsWith(basePath);
  const [isExpanded, setIsExpanded] = useState(isActiveGroup);

  const toggleDropdown = () => {
    if (!isOpen) return; // Don't toggle if sidebar is collapsed
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="space-y-1">
      <button
        onClick={toggleDropdown}
        className={`
          w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group
          ${isActiveGroup && !isExpanded
            ? isDark
              ? "bg-gray-800/50 text-blue-400 font-medium"
              : "bg-gray-100 text-blue-600 font-medium"
            : isDark
              ? "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          }
          ${!isOpen ? "justify-center" : ""}
        `}
        title={!isOpen ? label : ""}
      >
        <span className={`text-[1.1rem] ${!isOpen ? "mx-auto" : ""} ${isActiveGroup && !isOpen ? (isDark ? "text-blue-400" : "text-blue-600") : ""}`}>
          {icon}
        </span>
        {isOpen && (
          <>
            <span className={`truncate text-[0.9rem] whitespace-nowrap flex-1 text-left ${isActiveGroup && !isExpanded ? "" : ""}`}>{label}</span>
            <FaChevronDown className={`text-[0.6rem] transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
          </>
        )}
      </button>

      {/* Expanded items */}
      {isOpen && isExpanded && (
        <div className="pt-1 pb-1 space-y-1 relative before:content-[''] before:absolute before:left-[1.35rem] before:top-0 before:bottom-2 before:w-px before:bg-gray-200 dark:before:bg-gray-800">
          {children}
        </div>
      )}
    </div>
  );
}

function SidebarLink({ to, label, icon, isOpen, theme, isSubitem = false }) {
  const isDark = theme === "dark";
  return (
    <NavLink
      to={to}
      end={to === '/admin'}
      className={({ isActive }) =>
        `
        flex items-center gap-3 py-2 rounded-lg transition-all duration-200 group
        ${isSubitem ? "pl-11 pr-3" : "px-3"}
        ${isActive
          ? isDark
            ? "bg-gray-800 text-blue-400 font-medium"
            : "bg-gray-100 text-blue-600 font-medium"
          : isDark
            ? "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        }
        ${!isOpen ? "justify-center" : ""}
        `
      }
      title={!isOpen ? label : ""}
    >
      <span className={`text-[1.1rem] ${!isOpen ? "mx-auto" : ""} ${isSubitem ? "text-[0.9rem]" : ""}`}>
        {icon}
      </span>
      {isOpen && <span className="truncate text-[0.9rem] whitespace-nowrap">{label}</span>}
    </NavLink>
  );
}
