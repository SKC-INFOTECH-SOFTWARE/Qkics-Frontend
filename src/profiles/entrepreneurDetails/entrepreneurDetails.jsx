// src/profiles/entrepreneur/entrepreneurDetails.jsx

import { useState, useEffect } from "react";
import axiosSecure from "../../components/utils/axiosSecure";
import { useAlert } from "../../context/AlertContext";

import { useSelector } from "react-redux";

export default function EntrepreneurDetails({
  entreData,
  setEntreData,
}) {
  const { theme, data: loggedUser } = useSelector((state) => state.user);
  const activeProfile = useSelector((state) => state.user.activeProfileData);
  const isDark = theme === "dark";

  const isOwnProfile = loggedUser?.username === (activeProfile?.profile?.user?.username || activeProfile?.profile?.username);
  const readOnly = !isOwnProfile;

  const { showAlert } = useAlert();

  const [editMode, setEditMode] = useState(false);
  const [local, setLocal] = useState({ ...entreData });

  useEffect(() => {
    if (entreData) {
      setLocal({ ...entreData });
    }
  }, [entreData]);

  const fundingOptions = [
    ["pre_seed", "Pre-Seed"],
    ["seed", "Seed"],
    ["series_a", "Series A"],
    ["series_b", "Series B+"],
    ["bootstrapped", "Bootstrapped"],
  ];

  // Premium Styles
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

  const handleSave = async () => {
    try {
      const payload = {
        startup_name: local.startup_name,
        one_liner: local.one_liner,
        website: local.website,
        description: local.description,
        industry: local.industry,
        location: local.location,
        funding_stage: local.funding_stage,
      };

      const res = await axiosSecure.patch(
        "/v1/entrepreneurs/me/profile/",
        payload
      );

      setEntreData(res.data);
      setLocal(res.data);
      setEditMode(false);

      showAlert("Entrepreneur profile updated!", "success");
    } catch (err) {
      console.error(err?.response?.data || err);
      showAlert("Failed to update!", "error");
    }
  };


  return (
    <div className={`premium-card p-8 md:p-12 ${isDark ? "bg-neutral-900" : "bg-white"}`}>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/5">
        <h2 className="text-xl font-black uppercase tracking-tight">
          <span className="hidden md:inline">Startup <span className="text-red-600">Details</span></span>
          <span className="md:hidden">Professional <span className="text-red-600">Profile</span></span>
        </h2>

        {!readOnly && (
          <div className="flex gap-3">
            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors ${isDark
                  ? "bg-neutral-800 text-white hover:bg-neutral-700"
                  : "bg-neutral-100 text-black hover:bg-neutral-200"}`}
              >
                Edit Details
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setEditMode(false);
                    setLocal({ ...entreData }); // ✅ reset on cancel
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
              </>
            )}
          </div>
        )}
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        <div className="md:col-span-2">
          <label className={labelClass}>Startup Name</label>
          <input
            value={local.startup_name}
            onChange={(v) => setLocal({ ...local, startup_name: v.target.value })}
            disabled={!editMode}
            className={`${inputClass(editMode)} text-2xl font-bold`}
            placeholder="Startup Name"
          />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>One Liner</label>
          <input
            value={local.one_liner}
            onChange={(v) => setLocal({ ...local, one_liner: v.target.value })}
            disabled={!editMode}
            className={inputClass(editMode)}
            placeholder="What do you do?"
          />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>Description</label>
          <textarea
            rows={4}
            value={local.description}
            onChange={(v) => setLocal({ ...local, description: v.target.value })}
            disabled={!editMode}
            className={`${inputClass(editMode)} resize-none`}
          />
        </div>

        <div>
          <label className={labelClass}>Industry</label>
          <input
            value={local.industry}
            onChange={(v) => setLocal({ ...local, industry: v.target.value })}
            disabled={!editMode}
            className={inputClass(editMode)}
          />
        </div>

        <div>
          <label className={labelClass}>Location</label>
          <input
            value={local.location}
            onChange={(v) => setLocal({ ...local, location: v.target.value })}
            disabled={!editMode}
            className={inputClass(editMode)}
          />
        </div>

        <div>
          <label className={labelClass}>Funding Stage</label>
          <select
            disabled={!editMode}
            value={local.funding_stage}
            onChange={(e) =>
              setLocal({ ...local, funding_stage: e.target.value })
            }
            className={`${inputClass(editMode)} bg-transparent`}
          >
            {fundingOptions.map(([value, label]) => (
              <option key={value} value={value} className="text-black">
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Website</label>
          <input
            value={local.website}
            onChange={(v) => setLocal({ ...local, website: v.target.value })}
            disabled={!editMode}
            className={inputClass(editMode)}
          />
        </div>

      </div>
    </div>
  );
}
