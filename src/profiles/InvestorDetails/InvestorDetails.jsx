import { useState, useEffect } from "react";
import axiosSecure from "../../components/utils/axiosSecure";
import { useAlert } from "../../context/AlertContext";

import { useSelector } from "react-redux";

export default function InvestorDetails({
  investorData,
  setInvestorData,
}) {
  const { theme, data: loggedUser } = useSelector((state) => state.user);
  const activeProfile = useSelector((state) => state.user.activeProfileData);
  const isDark = theme === "dark";

  const isOwnProfile = loggedUser?.username === (activeProfile?.profile?.user?.username || activeProfile?.profile?.username);
  const readOnly = !isOwnProfile;

  const { showAlert } = useAlert();

  const normalize = (data) => ({
    ...data,
    focus_industries: data?.focus_industries || [],
    preferred_stages: data?.preferred_stages || [],
  });

  const [editMode, setEditMode] = useState(false);
  const [local, setLocal] = useState(normalize(investorData));

  const [allIndustries, setAllIndustries] = useState([]);
  const [allStages, setAllStages] = useState([]);

  useEffect(() => {
    axiosSecure.get("/v1/investors/meta/").then((res) => {
      setAllIndustries(res.data?.industries || []);
      setAllStages(res.data?.stages || []);
    });
  }, []);

  useEffect(() => {
    if (investorData) {
      setLocal(normalize(investorData));
    }
  }, [investorData]);

  const toggleItem = (list, item) =>
    list.find((i) => i.id === item.id)
      ? list.filter((i) => i.id !== item.id)
      : [...list, item];

  const investorTypes = [
    ["angel", "Angel Investor"],
    ["vc", "VC Firm"],
    ["family_office", "Family Office"],
    ["corporate", "Corporate VC"],
  ];

  // Premium Input Styles
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
        display_name: local.display_name,
        one_liner: local.one_liner,
        investment_thesis: local.investment_thesis,
        check_size_min: local.check_size_min,
        check_size_max: local.check_size_max,
        location: local.location,
        website_url: local.website_url,
        linkedin_url: local.linkedin_url,
        twitter_url: local.twitter_url,
        investor_type: local.investor_type,
        focus_industries: local.focus_industries.map((i) => i.id),
        preferred_stages: local.preferred_stages.map((s) => s.id),
      };

      const res = await axiosSecure.patch(
        "/v1/investors/me/profile/",
        payload
      );

      setInvestorData(res.data);
      setLocal(normalize(res.data));
      setEditMode(false);

      showAlert("Investor profile updated!", "success");
    } catch (err) {
      console.error(err?.response?.data || err);
      showAlert("Failed to update investor profile", "error");
    }
  };

  return (
    <div className={`premium-card p-8 md:p-12 ${isDark ? "bg-neutral-900" : "bg-white"}`}>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/5">
        <h2 className="text-xl font-black uppercase tracking-tight">
          <span className="hidden md:inline">Investor <span className="text-red-600">Profile</span></span>
          <span className="md:hidden">Professional <span className="text-red-600">Profile</span></span>
        </h2>

        {!readOnly &&
          (!editMode ? (
            <button
              onClick={() => setEditMode(true)}
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
                  setEditMode(false);
                  setLocal(normalize(investorData));
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
          ))}
      </div>

      {/* CONTENT GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        <div className="md:col-span-2">
          <label className={labelClass}>Display Name</label>
          <input
            value={local.display_name}
            disabled={!editMode}
            onChange={(e) => setLocal({ ...local, display_name: e.target.value })}
            className={`${inputClass(editMode)} text-2xl font-bold`}
            placeholder="e.g. Acme Ventures"
          />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>One Liner</label>
          <input
            value={local.one_liner}
            disabled={!editMode}
            onChange={(e) => setLocal({ ...local, one_liner: e.target.value })}
            className={inputClass(editMode)}
            placeholder="Brief description..."
          />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>Investment Thesis</label>
          <textarea
            rows={3}
            value={local.investment_thesis}
            disabled={!editMode}
            onChange={(e) => setLocal({ ...local, investment_thesis: e.target.value })}
            className={`${inputClass(editMode)} resize-none`}
            placeholder="Detailed thesis..."
          />
        </div>

        {/* INDUSTRIES & STAGES */}
        <div className="md:col-span-2 space-y-6">
          <MultiSelect
            label="Focus Industries"
            items={allIndustries}
            selected={local.focus_industries}
            editMode={editMode}
            labelClass={labelClass}
            onToggle={(item) =>
              setLocal({
                ...local,
                focus_industries: toggleItem(local.focus_industries, item),
              })
            }
          />

          <MultiSelect
            label="Preferred Stages"
            items={allStages}
            selected={local.preferred_stages}
            editMode={editMode}
            labelClass={labelClass}
            onToggle={(item) =>
              setLocal({
                ...local,
                preferred_stages: toggleItem(local.preferred_stages, item),
              })
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-4 md:col-span-2">
          <div>
            <label className={labelClass}>Min Check ($)</label>
            <input
              type="number"
              value={local.check_size_min}
              onChange={(e) => setLocal({ ...local, check_size_min: e.target.value })}
              disabled={!editMode}
              className={inputClass(editMode)}
            />
          </div>
          <div>
            <label className={labelClass}>Max Check ($)</label>
            <input
              type="number"
              value={local.check_size_max}
              onChange={(e) => setLocal({ ...local, check_size_max: e.target.value })}
              disabled={!editMode}
              className={inputClass(editMode)}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Location</label>
          <input
            value={local.location}
            onChange={(e) => setLocal({ ...local, location: e.target.value })}
            disabled={!editMode}
            className={inputClass(editMode)}
          />
        </div>

        <div>
          <label className={labelClass}>Investor Type</label>
          <select
            disabled={!editMode}
            value={local.investor_type}
            onChange={(e) => setLocal({ ...local, investor_type: e.target.value })}
            className={`${inputClass(editMode)} bg-transparent`}
          >
            {investorTypes.map(([value, label]) => (
              <option key={value} value={value} className="text-black">
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Website</label>
            <input value={local.website_url} onChange={(e) => setLocal({ ...local, website_url: e.target.value })} disabled={!editMode} className={inputClass(editMode)} />
          </div>
          <div>
            <label className={labelClass}>LinkedIn</label>
            <input value={local.linkedin_url} onChange={(e) => setLocal({ ...local, linkedin_url: e.target.value })} disabled={!editMode} className={inputClass(editMode)} />
          </div>
          <div>
            <label className={labelClass}>Twitter</label>
            <input value={local.twitter_url} onChange={(e) => setLocal({ ...local, twitter_url: e.target.value })} disabled={!editMode} className={inputClass(editMode)} />
          </div>
        </div>

      </div>
    </div>
  );
}

function MultiSelect({ label, items, selected, editMode, onToggle, labelClass }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>

      {!editMode ? (
        <div className="flex flex-wrap gap-2 mt-2">
          {selected.length ? (
            selected.map((i) => (
              <span
                key={i.id}
                className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-blue-500/10 border border-blue-400/20 text-blue-500"
              >
                {i.name}
              </span>
            ))
          ) : (
            <span className="opacity-30 text-xs italic">Not specified</span>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => onToggle(item)}
              className={`flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-lg border transition-all text-left ${selected.find((s) => s.id === item.id)
                ? "bg-red-600 text-white border-red-600"
                : "border-white/10 hover:bg-white/5 opacity-60 hover:opacity-100"
                }`}
            >
              {item.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
