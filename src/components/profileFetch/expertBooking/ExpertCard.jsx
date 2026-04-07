import { FaMapMarkerAlt, FaChevronRight } from "react-icons/fa";

export default function ExpertCard({ expert, onClick, resolveProfileImage, isDark }) {
  const text = isDark ? "text-white" : "text-black";
  
  const displayName = `${expert.first_name} ${expert.last_name}`;
  const subline = expert.primary_expertise || "Certified Expert";
  const location = expert.location || "Remote";
  const hourlyRate = expert.hourly_rate;

  return (
    <div
      onClick={() => onClick(expert)}
      className={`group relative cursor-pointer premium-card p-4 ${isDark ? "bg-neutral-900 shadow-xl shadow-black/20" : "bg-white shadow-lg shadow-black/5"} hover:shadow-2xl transition-all duration-500 animate-fadeIn border ${isDark ? "border-white/5 hover:border-red-500/20" : "border-black/5 hover:border-red-500/10"}`}
    >
      <div className="flex flex-col items-center text-center">
        {/* Profile Image - Round like InvestorCard */}
        <div className="relative mb-2">
          <div className="h-24 w-24 rounded-full overflow-hidden ring-4 ring-black/5 dark:ring-white/5 group-hover:ring-red-500/20 transition-all duration-700 shadow-xl mx-auto">
            <img
              loading="lazy"
              src={resolveProfileImage(expert)}
              alt={displayName}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          </div>
        </div>

        <h2 className={`font-black text-xl tracking-tight mb-1 group-hover:text-red-500 transition-colors ${text}`}>
          {displayName}
        </h2>
        
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 mb-2">
          {subline}
        </p>

        {/* Professional Headline like InvestorCard's one_liner */}
        <div className={`w-full rounded-2xl p-2 mb-2 transition-colors group-hover:bg-red-500/5 ${isDark ? "bg-white/5" : "bg-neutral-100"}`}>
          <p className={`text-[10px] font-black uppercase tracking-widest opacity-20 mb-1 ${text}`}>Professional Summary</p>
          <p className={`text-xs font-bold leading-relaxed opacity-60 italic ${text}`}>
            "{expert.headline || `Expert consultant specializing in ${subline.toLowerCase()} and strategic development.`}"
          </p>
        </div>

        <div className={`w-full h-px mb-2 ${isDark ? "bg-white/5" : "bg-black/5"}`} />

        {/* Bottom Section like InvestorCard */}
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-neutral-400">
             <FaMapMarkerAlt size={10} className="text-red-600" />
             <span className="text-[9px] font-black uppercase tracking-widest">{location}</span>
          </div>
          
          <button className={`h-10 w-10 flex items-center justify-center rounded-xl group-hover:bg-red-600 group-hover:text-white transition-all duration-500 shadow-lg ${isDark ? "bg-white/5 text-neutral-400" : "bg-black/5 text-neutral-500"} group-hover:shadow-red-600/30`}>
             <FaChevronRight size={14} className="transform group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}