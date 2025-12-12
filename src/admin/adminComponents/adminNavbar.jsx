import { FaSignOutAlt } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun, faMoon } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

export default function AdminNavbar({ theme, role, onToggleTheme }) {
  const isDark = theme === "dark";
  const navigate = useNavigate();

  return (
    <header
      className={`
        px-6 py-4 flex items-center justify-between
        shadow-md rounded-xl mx-4 mt-4
        border backdrop-blur-md
        ${isDark
          ? "bg-neutral-900/60 border-neutral-700 text-white"
          : "bg-white/70 border-neutral-200 text-neutral-900"
        }
      `}
    >
      {/* LEFT — BRAND */}
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => navigate("/admin")}
      >
        <img src="/logo.png" className="rounded h-10 w-10 shadow" alt="logo" />

        <div className="text-xl font-bold tracking-wide">
          Q-KICS Admin Panel
        </div>

        {/* Role Badge */}
        {/* <span className="
          inline-flex items-center px-2 py-1 rounded-xl text-xs font-medium
          border transition-all
          border-orange-400 bg-orange-400/10 text-orange-500
          dark:border-orange-500 dark:bg-orange-500/20 dark:text-orange-300
        ">
          {role}
        </span> */}
      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-4">

        {/* THEME TOGGLE BUTTON */}
        <button
          onClick={onToggleTheme}
          className={`
            h-9 w-9 rounded-full border flex items-center justify-center
            transition-all
            ${isDark
              ? "border-neutral-600 bg-neutral-900 text-neutral-200 hover:bg-neutral-800"
              : "border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-100"
            }
          `}
        >
          <FontAwesomeIcon icon={isDark ? faSun : faMoon} />
        </button>

        {/* LOGOUT BUTTON */}
        <button
          onClick={() => navigate("/logout")}
          className="
            flex items-center gap-2 px-4 py-2 rounded-lg border transition
            border-red-400 bg-red-400/10 text-red-600
            hover:bg-red-400/20 dark:border-red-500 dark:bg-red-500/20 dark:text-red-300
          "
        >
          <FaSignOutAlt />
          Logout
        </button>
      </div>
    </header>
  );
}
