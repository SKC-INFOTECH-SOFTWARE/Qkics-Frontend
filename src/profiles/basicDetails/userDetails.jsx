// src/shared/userDetails.jsx

import { useSelector } from "react-redux";

export default function UserDetails({
  editMode,
  setEditMode,
  editData,
  setEditData,
  handleSave,
}) {
  const { theme, data: loggedUser } = useSelector((state) => state.user);
  const activeProfile = useSelector((state) => state.user.activeProfileData);

  const isDark = theme === "dark";
  const user = activeProfile?.profile?.user || activeProfile?.profile || {};

  const isOwnProfile = loggedUser?.username === (user.username || activeProfile?.profile?.username);
  const readOnly = !isOwnProfile;

  const reduxUser = loggedUser;

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
          <span className="hidden md:inline">Personal <span className="text-red-600">Info</span></span>
          <span className="md:hidden">Basic <span className="text-red-600">Information</span></span>
        </h2>

        {!readOnly && (
          <div className="flex gap-3">
            {!editMode ? (
              <button
                onClick={() => {
                  setEditData({
                    first_name: user.first_name || "",
                    last_name: user.last_name || "",
                    phone: reduxUser?.phone || user.phone || "",
                  });
                  setEditMode(true);
                }}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors ${isDark
                  ? "bg-neutral-800 text-white hover:bg-neutral-700"
                  : "bg-neutral-100 text-black hover:bg-neutral-200"}`}
              >
                Edit Details
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditData({
                      first_name: user.first_name || "",
                      last_name: user.last_name || "",
                      phone: reduxUser?.phone || user.phone || "",
                    });
                    setEditMode(false);
                  }}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors ${isDark
                    ? "text-white hover:bg-neutral-800"
                    : "text-black hover:bg-neutral-100"}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2 rounded-xl bg-red-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-700 shadow-lg shadow-red-600/20"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FORM GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* First Name */}
        <div>
          <label className={labelClass}>First Name</label>
          <input
            value={editMode ? editData.first_name : user.first_name || ""}
            disabled={readOnly || !editMode}
            onChange={(e) => setEditData({ ...editData, first_name: e.target.value })}
            className={inputClass(!readOnly && editMode)}
          />
        </div>

        {/* Last Name */}
        <div>
          <label className={labelClass}>Last Name</label>
          <input
            value={editMode ? editData.last_name : user.last_name || ""}
            disabled={readOnly || !editMode}
            onChange={(e) => setEditData({ ...editData, last_name: e.target.value })}
            className={inputClass(!readOnly && editMode)}
          />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>Email Address</label>
          <input
            value={user.email || reduxUser?.email || ""}
            disabled
            className={`${inputClass(false)} cursor-not-allowed opacity-50`}
          />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>Phone Number</label>
          <input
            value={
              editMode
                ? editData.phone || reduxUser?.phone || user.phone || ""
                : user.phone || reduxUser?.phone || ""
            }
            disabled={!editMode}
            onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
            className={inputClass(editMode)}
          />
        </div>

      </div>
    </div>
  );
}
