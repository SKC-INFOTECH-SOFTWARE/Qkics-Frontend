import useThemeClasses from "../../utils/useThemeClasses";

export default function ExpertCard({ expert, onClick, resolveProfileImage, isDark }) {
  const text = isDark ? "text-white" : "text-black";

  return (
    <div
      onClick={() => onClick(expert)}
      className={`group relative cursor-pointer premium-card p-6 ${isDark ? "bg-neutral-900" : "bg-white"} hover:shadow-2xl transition-all duration-500 animate-fadeIn`}
    >
      {/* STATUS BADGE */}
      {/* <div className="absolute top-6 right-6 z-10">
        <span
          className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border shadow-sm transition-colors ${expert.is_available
              ? "bg-green-500/10 border-green-500/20 text-green-500"
              : "bg-red-500/10 border-red-500/20 text-red-500"
            }`}
        >
          {expert.is_available ? "Active" : "Away"}
        </span>
      </div> */}

      {/* PROFILE SECTION */}
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-4">
          <div className="h-28 w-28 rounded-2xl overflow-hidden ring-4 ring-transparent group-hover:ring-red-500/20 transition-all duration-700 shadow-xl">
            <img
              src={resolveProfileImage(expert)}
              alt="profile"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          </div>
          <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-red-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-red-600/40 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
          </div>
        </div>

        <h2 className={`font-black text-lg tracking-tight mb-1 group-hover:text-red-500 transition-colors ${text}`}>
          {expert.first_name} {expert.last_name}
        </h2>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-40 mb-6">
          {expert.primary_expertise}
        </p>

        <div className="w-full h-px bg-black/5 dark:bg-white/5 mb-6" />

        <div className="w-full flex items-center justify-between gap-4">
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-0.5">Rate</p>
            <p className={`text-sm font-black ${text}`}>₹{expert.hourly_rate}<span className="text-[10px] opacity-40">/hr</span></p>
          </div>
          <div className="text-right">
            <button className="px-4 py-2 rounded-xl bg-red-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-500/30 hover:scale-105 transition-all">
              Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
