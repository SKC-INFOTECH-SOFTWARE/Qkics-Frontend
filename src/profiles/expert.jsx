// src/pages/ExpertProfile.jsx
import { useEffect, useState } from "react";
import axiosSecure from "../components/utils/axiosSecure";
import { useAlert } from "../context/AlertContext";

function ExpertProfile({ theme }) {
  const { showAlert } = useAlert();
  const isDark = theme === "dark";

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const [editMode, setEditMode] = useState(false);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  // USER DATA
  const [userData, setUserData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });

  // EXPERT DATA
  const [formData, setFormData] = useState({
    bio: "",
    expertise: "Technical",
    hourly_rate: "",
    linkedin: "",
    is_available: false,
  });

  const capitalize = (text) =>
    text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();

  const fillUserForm = (data) => {
    setUserData({
      first_name: data.first_name || "",
      last_name: data.last_name || "",
      email: data.email || "",
      phone: data.phone || "",
    });
  };

  const fillExpertForm = (data) => {
    setFormData({
      bio: data.bio || "",
      expertise: capitalize(data.expertise || "Technical"),
      hourly_rate: data.hourly_rate || "",
      linkedin: data.linkedin || "",
      is_available: data.is_available || false,
    });
  };

  // LOAD DATA
  useEffect(() => {
    const loadData = async () => {
      try {
        const userRes = await axiosSecure.get("/v1/auth/me/");
        setUser(userRes.data);
        fillUserForm(userRes.data);

        try {
          const expRes = await axiosSecure.get("/v1/expert/profile/");
          setProfile(expRes.data);
          fillExpertForm(expRes.data);
        } catch (err) {
          if (err.response?.status === 404) setProfile(null);
        }
      } catch (err) {
        console.log("Load error:", err.response?.data);
      }

      setLoading(false);
    };

    loadData();
  }, []);

  // SAVE PROFILE
  const handleSave = async () => {
    try {
      const userPayload = {
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone: userData.phone,
      };

      const userRes = await axiosSecure.patch("/v1/auth/me/update/", userPayload);
      setUser(userRes.data.user);

      const expertPayload = {
        bio: formData.bio,
        expertise: formData.expertise,
        linkedin: formData.linkedin,
        hourly_rate: formData.hourly_rate,
        is_available: formData.is_available,
      };

      const expRes = await axiosSecure.patch("/v1/expert/profile/", expertPayload);
      setProfile(expRes.data);

      setEditMode(false);
      showAlert("Profile updated successfully!", "success");
    } catch (err) {
      console.log("Save failed:", err.response?.data);
      showAlert("Update failed!", "error");
    }
  };

  // CREATE PROFILE
  const handleCreate = async () => {
    try {
      const res = await axiosSecure.post("/v1/expert/profile/", formData);
      setProfile(res.data);
      setCreating(false);
      showAlert("Expert profile created!", "success");
    } catch (err) {
      console.log("Create error:", err.response?.data);
      showAlert("Failed to create profile!", "error");
    }
  };

  if (loading) {
    return (
      <div className={`mt-20 text-center ${isDark ? "text-white" : "text-black"}`}>
        Loading...
      </div>
    );
  }

  // INPUT STYLE
  const inputClass = (enabled) =>
    `w-full mt-1 px-3 py-2 rounded border ${isDark
      ? enabled
        ? "bg-neutral-700 border-green-400 text-white"
        : "bg-neutral-800 border-neutral-700 text-white opacity-60 cursor-not-allowed"
      : enabled
        ? "bg-white border-green-400 text-black"
        : "bg-neutral-100 border-neutral-300 text-black opacity-60 cursor-not-allowed"
    }`;

  const expertiseOptions = [
    "Technical",
    "Business",
    "Funding",
    "Legal",
    "Marketing",
    "Product",
    "Other",
  ];

  return (
    <div
      className={`max-w-2xl mx-auto mt-20 p-6 rounded-xl shadow ${isDark ? "bg-neutral-900 text-white" : "bg-white text-black"
        }`}
    >
      {/* HEADER */}
      <div className="flex gap-5 items-center">
        <div className="w-20 h-20 rounded-full bg-red-500 text-white flex items-center justify-center text-2xl font-bold">
          {user?.first_name?.charAt(0)?.toUpperCase() ||
            user?.username?.charAt(0)?.toUpperCase() ||
            "E"}
        </div>

        <div>
          <h2 className="text-2xl font-bold">
            {user?.first_name || user?.last_name
              ? `${user.first_name} ${user.last_name}`
              : user?.username}
          </h2>
          <p className="text-neutral-400 text-sm mt-1">@{user?.username} • expert</p>
        </div>

        <div className="ml-auto flex gap-3">
          {editMode ? (
            <>
              <button
                onClick={handleSave}
                className="px-4 py-1.5 bg-green-500 text-white rounded-md hover:bg-green-600 font-semibold"
              >
                Save
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="px-4 py-1.5 bg-neutral-500 text-white rounded-md hover:bg-neutral-600"
              >
                Cancel
              </button>
            </>
          ) : profile ? (
            <button
              onClick={() => setEditMode(true)}
              className="px-4 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Edit Profile
            </button>
          ) : null}
        </div>
      </div>

      <div className="border-b my-5 border-neutral-600/30"></div>

      {/* USER INFO */}
      <h3 className="text-xl font-semibold mb-3">Your Information</h3>

      <div className="space-y-4">
        {/* First Name */}
        <div>
          <label className="text-sm opacity-80">First Name</label>
          <input
            value={userData.first_name}
            disabled={!editMode}
            onChange={(e) =>
              setUserData({ ...userData, first_name: e.target.value })
            }
            className={inputClass(editMode)}
          />
        </div>

        {/* Last Name */}
        <div>
          <label className="text-sm opacity-80">Last Name</label>
          <input
            value={userData.last_name}
            disabled={!editMode}
            onChange={(e) =>
              setUserData({ ...userData, last_name: e.target.value })
            }
            className={inputClass(editMode)}
          />
        </div>

        {/* Email */}
        <div>
          <label className="text-sm opacity-80">Email</label>
          <input value={userData.email} disabled className={inputClass(false)} />
        </div>

        {/* Phone */}
        <div>
          <label className="text-sm opacity-80">Phone</label>
          <input
            value={userData.phone}
            disabled={!editMode}
            onChange={(e) =>
              setUserData({ ...userData, phone: e.target.value })
            }
            className={inputClass(editMode)}
          />
        </div>
      </div>

      <div className="border-b my-5 border-neutral-600/30"></div>

      {/* EXPERT SECTION */}
      {/* No expert profile */}
      {!profile && !creating && (
        <div className="text-center mt-10">
          <p className="mb-4 text-lg">No expert profile found.</p>

          <button
            onClick={() => setCreating(true)}
            className="px-5 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Create Expert Profile
          </button>
        </div>
      )}

      {/* Create Profile */}
      {creating && (
        <div className="space-y-4 mt-6">
          {/* ALL FIELDS */}
          {Object.keys(formData).map((key) => (
            <div key={key}>
              <label className="text-sm opacity-80 capitalize">
                {key.replace("_", " ")}
              </label>

              {key === "expertise" ? (
                <select
                  value={formData.expertise}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      expertise: capitalize(e.target.value),
                    })
                  }
                  className={inputClass(true)}
                >
                  {expertiseOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : key === "is_available" ? (
                <select
                  value={formData.is_available}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      is_available: e.target.value === "true",
                    })
                  }
                  className={inputClass(true)}
                >
                  <option value="true">Available</option>
                  <option value="false">Not Available</option>
                </select>
              ) : (
                <input
                  type={key === "hourly_rate" ? "number" : "text"}
                  value={formData[key]}
                  onChange={(e) =>
                    setFormData({ ...formData, [key]: e.target.value })
                  }
                  className={inputClass(true)}
                />
              )}
            </div>
          ))}

          <div className="flex gap-3 pt-3">
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Create
            </button>
            <button
              onClick={() => setCreating(false)}
              className="px-4 py-2 bg-neutral-500 text-white rounded hover:bg-neutral-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* View/Edit Mode */}
      {profile && !creating && (
        <div className="space-y-4 mt-6">
          <h3 className="text-xl font-semibold mb-3">Expert Details</h3>

          {Object.keys(formData).map((key) => (
            <div key={key}>
              <label className="text-sm opacity-80 capitalize">
                {key.replace("_", " ")}
              </label>

              {key === "expertise" ? (
                <select
                  disabled={!editMode}
                  value={formData.expertise}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      expertise: capitalize(e.target.value),
                    })
                  }
                  className={inputClass(editMode)}
                >
                  {expertiseOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : key === "is_available" ? (
                <select
                  disabled={!editMode}
                  value={formData.is_available}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      is_available: e.target.value === "true",
                    })
                  }
                  className={inputClass(editMode)}
                >
                  <option value="true">Available</option>
                  <option value="false">Not Available</option>
                </select>
              ) : (
                <input
                  type={key === "hourly_rate" ? "number" : "text"}
                  value={formData[key]}
                  disabled={!editMode}
                  onChange={(e) =>
                    setFormData({ ...formData, [key]: e.target.value })
                  }
                  className={inputClass(editMode)}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ExpertProfile;
