import useThemeClasses from "../../utils/useThemeClasses";

export default function InvestorCard({
  investor,
  onClick,
  isDark,
}) {
  const {
    display_name,
    one_liner,
    investor_type_display,
    location,
    verified_by_admin,
    profile_picture,
    user,
  } = investor;

  const text = isDark ? "text-white" : "text-black";

  const resolveProfileImage = () => {
    const url = profile_picture || user?.profile_picture;
    const name = display_name || user?.first_name || user?.username || "Investor";
    if (!url) return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&length=1`;
    return `${url}?t=${Date.now()}`;
  };

  return (
    <div
      onClick={() => onClick(investor)}
      className={`group relative cursor-pointer premium-card p-6 ${isDark ? "bg-neutral-900" : "bg-white"} hover:shadow-2xl transition-all duration-500 animate-fadeIn`}
    >
      {/* VERIFIED BADGE */}
      {/* {verified_by_admin && (
        <div className="absolute top-6 right-6 z-10">
          <div className="h-6 w-6 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-red-600/20">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
        </div>
      )} */}

      {/* INVESTOR INFO */}
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-6">
          <div className="h-24 w-24 rounded-full overflow-hidden ring-4 ring-black/5 dark:ring-white/5 group-hover:ring-red-500/20 transition-all duration-700 shadow-xl mx-auto">
            <img
                loading="lazy"
              src={resolveProfileImage()}
              alt="profile"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          </div>
        </div>

        <h2 className={`font-black text-xl tracking-tight mb-1 group-hover:text-red-500 transition-colors ${text}`}>
          {display_name}
        </h2>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 mb-6">
          {investor_type_display || "Private Investor"}
        </p>

        <div className={`w-full rounded-2xl p-4 mb-6 transition-colors group-hover:bg-red-500/5 ${isDark ? "bg-white/5" : "bg-neutral-100"}`}>
          <p className={`text-xs font-medium leading-relaxed opacity-60 italic ${text}`}>
            "{one_liner || "Strategic capital focused on high-growth technology and innovative digital economies."}"
          </p>
        </div>

        <div className={`w-full h-px mb-6 ${isDark ? "bg-white/5" : "bg-black/5"}`} />

        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2 text-neutral-400">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
            <span className="text-[10px] font-bold uppercase tracking-wider">{location || "Remote"}</span>
          </div>
          <button className={`h-8 w-8 flex items-center justify-center rounded-lg group-hover:bg-red-500 group-hover:text-white transition-all duration-500 ${isDark ? "bg-white/5" : "bg-black/5"}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}