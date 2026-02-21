import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { FaUsers, FaRegFileAlt, FaCheckCircle, FaUserTie, FaUserShield, FaArrowUp, FaChartLine } from "react-icons/fa";

export default function AdminDashboard({ theme }) {
  const user = useSelector((state) => state.user.data);

  if (!user || (user.user_type !== "admin" && user.user_type !== "superadmin")) {
    return <Navigate to="/" />;
  }

  const role = user.user_type;
  const isDark = theme === "dark";

  const stats = [
    {
      title: "Total Users",
      value: "1,800",
      trend: "+12.5%",
      icon: <FaUsers className="text-xl" />,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: "Total Posts",
      value: "4,200",
      trend: "+8.2%",
      icon: <FaRegFileAlt className="text-xl" />,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      title: "Normal Users",
      value: "1,300",
      trend: "+5.1%",
      icon: <FaCheckCircle className="text-xl" />,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      title: "Expert Users",
      value: "300",
      trend: "+18.4%",
      icon: <FaUserTie className="text-xl" />,
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-50 dark:bg-orange-900/20",
    },
    {
      title: "Entrepreneurs",
      value: "200",
      trend: "+2.4%",
      icon: <FaUserShield className="text-xl" />,
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-50 dark:bg-rose-900/20",
    },
  ];

  return (
    <div className="space-y-6">

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
        <div>
          <h1 className={`text-2xl font-semibold tracking-tight ${isDark ? "text-gray-100" : "text-gray-900"}`}>
            {role === "superadmin" ? "Super Admin Overview" : "Dashboard Overview"}
          </h1>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {stats.map((card, idx) => (
          <div
            key={idx}
            className={`
              p-5 rounded-xl border shadow-sm
              ${isDark ? "bg-[#111111] border-gray-800" : "bg-white border-gray-200"}
            `}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.bg} ${card.color}`}>
                {card.icon}
              </div>
              <div className={`flex items-center gap-1 text-[0.7rem] font-medium px-2 py-1 rounded bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300`}>
                <FaArrowUp className="text-[0.6rem]" /> {card.trend}
              </div>
            </div>

            <div>
              <h3 className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>{card.title}</h3>
              <h2 className={`text-2xl font-bold mt-1 tracking-tight ${isDark ? "text-gray-100" : "text-gray-900"}`}>{card.value}</h2>
            </div>
          </div>
        ))}
      </div>

      {/* BOTTOM SECTIONS (MOCK) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* CHART AREA */}
        <div className={`lg:col-span-2 p-6 rounded-xl border shadow-sm ${isDark ? "bg-[#111111] border-gray-800" : "bg-white border-gray-200"}`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className={`text-base font-semibold ${isDark ? "text-gray-100" : "text-gray-900"}`}>Revenue Overview</h3>
            </div>
            <button className={`p-2 rounded-md ${isDark ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}>
              <FaChartLine />
            </button>
          </div>
          {/* Mock Chart Body */}
          <div className={`h-[20rem] rounded-lg flex items-center justify-center border  ${isDark ? "border-gray-800 bg-[#0a0a0a]" : "border-gray-100 bg-gray-50"}`}>
            <span className={`text-sm font-medium ${isDark ? "text-gray-500" : "text-gray-400"}`}>Chart Data Unavailable</span>
          </div>
        </div>

        {/* RECENT ACTIVITY */}
        <div className={`p-6 rounded-xl border shadow-sm ${isDark ? "bg-[#111111] border-gray-800" : "bg-white border-gray-200"}`}>
          <h3 className={`text-base font-semibold mb-6 ${isDark ? "text-gray-100" : "text-gray-900"}`}>Recent Activity</h3>
          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex relative">
                {i !== 5 && <div className={`absolute left-[7px] top-6 bottom-[-24px] w-px ${isDark ? "bg-gray-800" : "bg-gray-200"}`}></div>}
                <div className={`relative z-10 w-4 h-4 rounded-full flex shrink-0 items-center justify-center mt-1 border-[3px] ${isDark ? "border-[#111111] bg-blue-500" : "border-white bg-blue-500"}`}></div>
                <div className="ml-4 flex-1">
                  <p className={`text-sm font-medium ${isDark ? "text-gray-200" : "text-gray-700"}`}>New user signed up</p>
                  <p className={`text-[0.7rem] mt-0.5 ${isDark ? "text-gray-500" : "text-gray-400"}`}>john.doe@example.com • 2 mins ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
