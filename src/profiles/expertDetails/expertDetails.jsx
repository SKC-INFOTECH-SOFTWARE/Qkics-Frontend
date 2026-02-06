import { useSelector } from "react-redux";

export default function ExpertDetails({
  expertData,
  setExpertData,
  editExp,
  setEditExp,
  handleSaveExpert,
}) {
  const { theme, data: loggedUser } = useSelector((state) => state.user);
  const activeProfile = useSelector((state) => state.user.activeProfileData);
  const isDark = theme === "dark";

  const isOwnProfile = loggedUser?.username === (activeProfile?.profile?.user?.username || activeProfile?.profile?.username);
  const readOnly = !isOwnProfile;

  const inputClass = (enabled) =>
    `w-full bg-transparent border-b-2 py-2 px-1 outline-none transition-all font-medium ${isDark
      ? enabled
        ? "border-red-600 text-white placeholder-white/30"
        : "border-white/10 text-white/50"
      : enabled
        ? "border-red-600 text-black placeholder-black/30"
        : "border-black/10 text-black/50"
    }`;

  const labelClass = "text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-1 block";

  return (
    <div className={`premium-card p-8 md:p-12 ${isDark ? "bg-neutral-900" : "bg-white"}`}>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/5">
        <h2 className="text-xl font-black uppercase tracking-tight">
          <span className="hidden md:inline">Expert <span className="text-red-600">Profile</span></span>
          <span className="md:hidden">Professional <span className="text-red-600">Profile</span></span>
        </h2>

        {!readOnly && (
          <div className="flex gap-3">
            {!editExp ? (
              <button
                onClick={() => setEditExp(true)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors ${isDark
                  ? "bg-neutral-800 text-white hover:bg-neutral-700"
                  : "bg-neutral-100 text-black hover:bg-neutral-200"}`}
              >
                Edit Details
              </button>
            ) : (
              <>
                <button
                  onClick={() => setEditExp(false)}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors ${isDark
                    ? "text-white hover:bg-neutral-800"
                    : "text-black hover:bg-neutral-100"}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveExpert}
                  className="px-6 py-2 rounded-xl bg-red-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-700 shadow-lg shadow-red-600/20"
                >
                  Save Changes
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* FORM GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        <div className="md:col-span-2">
          <label className={labelClass}>Professional Headline</label>
          <input
            value={expertData.headline}
            disabled={!editExp}
            placeholder="e.g. Senior Investment Consultant"
            onChange={(e) => setExpertData({ ...expertData, headline: e.target.value })}
            className={`${inputClass(editExp)} text-2xl font-bold`}
          />
        </div>

        <div>
          <label className={labelClass}>Primary Expertise</label>
          <input
            value={expertData.primary_expertise}
            disabled={!editExp}
            placeholder="e.g. Finance"
            onChange={(e) => setExpertData({ ...expertData, primary_expertise: e.target.value })}
            className={inputClass(editExp)}
          />
        </div>

        <div>
          <label className={labelClass}>Hourly Rate ($)</label>
          <input
            type="number"
            value={expertData.hourly_rate}
            disabled={!editExp}
            placeholder="0.00"
            onChange={(e) => setExpertData({ ...expertData, hourly_rate: e.target.value })}
            className={inputClass(editExp)}
          />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>Other Expertise</label>
          <input
            value={expertData.other_expertise}
            disabled={!editExp}
            placeholder="e.g. Marketing, Strategy"
            onChange={(e) => setExpertData({ ...expertData, other_expertise: e.target.value })}
            className={inputClass(editExp)}
          />
        </div>

      </div>
    </div>
  );
}
