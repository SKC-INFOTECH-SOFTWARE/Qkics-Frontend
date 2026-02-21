import useThemeClasses from "../../utils/useThemeClasses";

export default function EntrepreneurCard({
  entrepreneur,
  onClick,
  isDark,
}) {
  const {
    startup_name,
    one_liner,
    industry,
    funding_stage,
    verified_by_admin,
    logo,
    user,
  } = entrepreneur;

  const text = isDark ? "text-white" : "text-black";

  const resolveProfileImage = () => {
    const url = user?.profile_picture || logo;
    const name = startup_name || user?.first_name || user?.username || "Startup";
    if (!url) return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&length=1`;
    return `${url}?t=${Date.now()}`;
  };

  return (
    <div
      onClick={() => onClick(entrepreneur)}
      className={`group relative cursor-pointer premium-card p-6 ${isDark ? "bg-neutral-900" : "bg-white"} hover:shadow-2xl transition-all duration-500 animate-fadeIn`}
    >
      {/* VERIFIED BADGE */}
      {/* {verified_by_admin && (
        <div className="absolute top-6 right-6 z-10">
          <span className="p-1 px-3 bg-red-600/10 border border-red-600/20 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-full">
            Verified
          </span>
        </div>
      )} */}

      {/* STARTUP INFO */}
      <div className="flex flex-col">
        <div className="flex items-center gap-5 mb-6">
          <div className={`h-20 w-20 rounded-2xl overflow-hidden shadow-lg border transition-transform duration-700 group-hover:scale-105 ${isDark ? "border-white/5" : "border-black/5"}`}>
            <img
                loading="lazy"
              src={resolveProfileImage()}
              alt="logo"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h2 className={`font-black text-xl tracking-tighter mb-1 group-hover:text-red-500 transition-colors ${text}`}>
              {startup_name}
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">
              {industry || "Technology"}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <p className={`text-sm font-medium leading-relaxed opacity-70 line-clamp-2 ${text}`}>
            {one_liner || "Building the next generation of digital infrastructure for global scale."}
          </p>
        </div>

        <div className={`w-full h-px mb-6 ${isDark ? "bg-white/5" : "bg-black/5"}`} />

        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-0.5">Founder</p>
            <p className={`text-xs font-bold ${text}`}>{user?.first_name} {user?.last_name}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-0.5">Stage</p>
            <span className="text-xs font-black text-red-600">{funding_stage || "Seed"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}