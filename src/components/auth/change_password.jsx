import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axiosSecure from "../utils/axiosSecure";
import { getAccessToken } from "../../redux/store/tokenManager";
import { useAlert } from "../../context/AlertContext";

function ChangePasswordModal({ onClose, isDark }) {
  const { showAlert } = useAlert();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showNewPassword2, setShowNewPassword2] = useState(false);

  const bg = isDark ? "bg-neutral-800 text-white" : "bg-white text-black";

  const handleChangePassword = async () => {
    try {
      const token = getAccessToken();

      const payload = {
        old_password: oldPassword,
        new_password: newPassword,
        new_password2: newPassword2,
      };

      const res = await axiosSecure.post(
        `/v1/auth/me/change-password/`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      showAlert(res.data.message || "Password changed successfully.", "success");
      onClose();
    } catch (error) {
      console.log("Password change error:", error.response?.data);
      showAlert(error.response?.data?.detail || "Failed to change password", "error");
    }
  };

  return (
    <div className={`p-6 rounded-2xl shadow-xl w-[90%] max-w-sm ${bg}`}>
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-semibold">Change Password</h2>
        <button onClick={onClose}>✕</button>
      </div>

      <div className="relative mb-3">
        <input
          type={showOldPassword ? "text" : "password"}
          placeholder="Old Password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          className={`w-full px-3 py-2 pr-10 rounded border ${isDark ? "bg-neutral-700 border-neutral-600" : "bg-neutral-50"
            }`}
        />
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); setShowOldPassword(!showOldPassword); }}
          className="absolute inset-y-0 right-3 flex items-center text-neutral-500 hover:text-neutral-400 transition-colors"
        >
          {showOldPassword ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>

      <div className="relative mb-3">
        <input
          type={showNewPassword ? "text" : "password"}
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className={`w-full px-3 py-2 pr-10 rounded border ${isDark ? "bg-neutral-700 border-neutral-600" : "bg-neutral-50"
            }`}
        />
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); setShowNewPassword(!showNewPassword); }}
          className="absolute inset-y-0 right-3 flex items-center text-neutral-500 hover:text-neutral-400 transition-colors"
        >
          {showNewPassword ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>

      <div className="relative">
        <input
          type={showNewPassword2 ? "text" : "password"}
          placeholder="Confirm New Password"
          value={newPassword2}
          onChange={(e) => setNewPassword2(e.target.value)}
          className={`w-full px-3 py-2 pr-10 rounded border ${isDark ? "bg-neutral-700 border-neutral-600" : "bg-neutral-50"
            }`}
        />
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); setShowNewPassword2(!showNewPassword2); }}
          className="absolute inset-y-0 right-3 flex items-center text-neutral-500 hover:text-neutral-400 transition-colors"
        >
          {showNewPassword2 ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>

      <button
        onClick={handleChangePassword}
        className="w-full mt-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
      >
        Update Password
      </button>
    </div>
  );
}

export default ChangePasswordModal;