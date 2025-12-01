// src/pages/EntrepreneurProfile.jsx
import { useEffect, useState } from "react";
import axiosSecure from "../components/utils/axiosSecure";
import { useAlert } from "../context/AlertContext";

function EntrepreneurProfile({ theme }) {
  const { showAlert } = useAlert();
  const isDark = theme === "dark";

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  // USER FIELDS
  const [userData, setUserData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });

  // ENTREPRENEUR FIELDS
  const [formData, setFormData] = useState({
    company_name: "",
    tagline: "",
    website: "",
    problem_statement: "",
    solution: "",
    market_size: "",
    traction: "",
    funding_ask: "",
  });

  const fillEntreForm = (data) => {
    setFormData({
      company_name: data.company_name || "",
      tagline: data.tagline || "",
      website: data.website || "",
      problem_statement: data.problem_statement || "",
      solution: data.solution || "",
      market_size: data.market_size || "",
      traction: data.traction || "",
      funding_ask: data.funding_ask || "",
    });
  };

  const fillUserForm = (data) => {
    setUserData({
      first_name: data.first_name || "",
      last_name: data.last_name || "",
      email: data.email || "",
      phone: data.phone || "",
    });
  };

  // Fetch both user + entrepreneur profile
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const userRes = await axiosSecure.get("/v1/auth/me/");
        setUser(userRes.data);
        fillUserForm(userRes.data);

        try {
          const entRes = await axiosSecure.get("/v1/entrepreneur/profile/");
          setProfile(entRes.data);
          fillEntreForm(entRes.data);
        } catch (err) {
          if (err.response?.status === 404) setProfile(null);
        }
      } catch (err) {
        console.log("Error loading profiles:", err.response?.data);
      }

      setLoading(false);
    };

    fetchAll();
  }, []);

  // SAVE (updates BOTH APIs)
  const handleSave = async () => {
    try {
      // UPDATE USER API
      const userPayload = {
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone: userData.phone,
      };

      const userRes = await axiosSecure.patch("/v1/auth/me/update/", userPayload);
      setUser(userRes.data.user);

      // UPDATE ENTREPRENEUR API
      const entPayload = {
        company_name: formData.company_name,
        website: formData.website,
        problem_statement: formData.problem_statement,
        solution: formData.solution,
        market_size: formData.market_size,
        tagline: formData.tagline,
        traction: formData.traction,
        funding_ask: formData.funding_ask,
      };

      const entRes = await axiosSecure.patch("/v1/entrepreneur/profile/", entPayload);
      setProfile(entRes.data);

      setEditMode(false);
      showAlert("Profile updated successfully!", "success");
    } catch (err) {
      console.log(err.response?.data);
      showAlert("Update failed", "error");
    }
  };

  // CREATE ENTREPRENEUR PROFILE
  const handleCreate = async () => {
    try {
      const res = await axiosSecure.post("/v1/entrepreneur/profile/", formData);
      setProfile(res.data);
      setCreating(false);
      showAlert("Entrepreneur profile created!", "success");
    } catch (err) {
      console.log(err.response?.data);
      showAlert("Create failed!", "error");
    }
  };

  if (loading) {
    return (
      <div className={`mt-20 text-center ${isDark ? "text-white" : "text-black"}`}>
        Loading...
      </div>
    );
  }

  // INPUT STYLE - EXACT MATCH TO Profile.jsx
  const inputClass = (enabled) =>
    `w-full mt-1 px-3 py-2 rounded border ${isDark
      ? enabled
        ? "bg-neutral-700 border-green-400 text-white"
        : "bg-neutral-800 border-neutral-700 text-white opacity-60 cursor-not-allowed"
      : enabled
        ? "bg-white border-green-400 text-black"
        : "bg-neutral-100 border-neutral-300 text-black opacity-60 cursor-not-allowed"
    }`;

  const isEntreEditable = () => true;

  return (
    <div
      className={`max-w-2xl mx-auto mt-20 p-6 rounded-xl shadow ${isDark ? "bg-neutral-900 text-white" : "bg-white text-black"
        }`}
    >
      {/* HEADER SECTION (same as Profile.jsx) */}
      <div className="flex gap-5 items-center">
        <div className="w-20 h-20 rounded-full bg-red-500 text-white flex items-center justify-center text-2xl font-bold">
          {profile?.company_name?.charAt(0) ||
            profile?.username?.charAt(0)?.toUpperCase() ||
            "E"}
        </div>

        <div>
          <h2 className="text-2xl font-bold">
            {profile?.company_name || "Entrepreneur Profile"}
          </h2>
          <p className="text-neutral-400 text-sm mt-1">
            @{profile?.username || user?.username} • entrepreneur
          </p>
        </div>

        {/* EDIT / SAVE / CANCEL */}
        <div className="ml-auto flex gap-3">
          {editMode ? (
            <>
              <button
                onClick={handleSave}
                className="px-4 py-1.5 rounded-md bg-green-500 text-white font-semibold hover:bg-green-600"
              >
                Save
              </button>

              <button
                onClick={() => setEditMode(false)}
                className="px-4 py-1.5 rounded-md bg-neutral-500 text-white hover:bg-neutral-600"
              >
                Cancel
              </button>
            </>
          ) : profile ? (
            <button
              onClick={() => setEditMode(true)}
              className="px-4 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-700"
            >
              Edit Profile
            </button>
          ) : null}
        </div>
      </div>

      {/* Divider */}
      <div className="border-b my-5 border-neutral-600/30"></div>

      {/* ================= USER PROFILE SECTION ================= */}
      <h3 className="text-xl font-semibold mb-3">Your Information</h3>

      <div className="space-y-4">
        {/* first_name */}
        <div>
          <label className="text-sm opacity-80">First Name</label>
          <input
            type="text"
            value={userData.first_name}
            disabled={!editMode}
            onChange={(e) =>
              setUserData({ ...userData, first_name: e.target.value })
            }
            className={inputClass(editMode)}
          />
        </div>

        {/* last_name */}
        <div>
          <label className="text-sm opacity-80">Last Name</label>
          <input
            type="text"
            value={userData.last_name}
            disabled={!editMode}
            onChange={(e) =>
              setUserData({ ...userData, last_name: e.target.value })
            }
            className={inputClass(editMode)}
          />
        </div>

        {/* email (always disabled) */}
        <div>
          <label className="text-sm opacity-80">Email</label>
          <input
            type="email"
            value={userData.email}
            disabled
            className={inputClass(false)}
          />
        </div>

        {/* phone */}
        <div>
          <label className="text-sm opacity-80">Phone</label>
          <input
            type="text"
            value={userData.phone}
            disabled={!editMode}
            onChange={(e) =>
              setUserData({ ...userData, phone: e.target.value })
            }
            className={inputClass(editMode)}
          />
        </div>
      </div>

      {/* Divider */}
      <div className="border-b my-5 border-neutral-600/30"></div>

      {/* ================= ENTREPRENEUR PROFILE SECTION ================= */}
      {!profile && !creating && (
        <div className="text-center mt-10">
          <p className="mb-4 text-lg">No entrepreneur profile found.</p>

          <button
            onClick={() => setCreating(true)}
            className="px-5 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Create Profile
          </button>
        </div>
      )}

      {creating && (
        <div className="space-y-4 mt-6">
          {Object.keys(formData).map((key) => (
            <div key={key}>
              <label className="text-sm opacity-80 capitalize">
                {key.replace("_", " ")}
              </label>
              <input
                type={key === "funding_ask" ? "number" : "text"}
                value={formData[key]}
                onChange={(e) =>
                  setFormData({ ...formData, [key]: e.target.value })
                }
                className={inputClass(true)}
              />
            </div>
          ))}

          <div className="flex gap-3 pt-3">
            <button
              onClick={handleCreate}
              className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600"
            >
              Create
            </button>

            <button
              onClick={() => setCreating(false)}
              className="px-4 py-2 rounded bg-neutral-500 text-white hover:bg-neutral-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {profile && !creating && (
        <div className="space-y-4 mt-6">
          <h3 className="text-xl font-semibold mb-3">Entrepreneur Details</h3>

          {Object.keys(formData).map((key) => (
            <div key={key}>
              <label className="text-sm opacity-80 capitalize">
                {key.replace("_", " ")}
              </label>

              <input
                type={key === "funding_ask" ? "number" : "text"}
                value={formData[key]}
                disabled={!editMode}
                onChange={(e) =>
                  setFormData({ ...formData, [key]: e.target.value })
                }
                className={inputClass(editMode && isEntreEditable(key))}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default EntrepreneurProfile;
