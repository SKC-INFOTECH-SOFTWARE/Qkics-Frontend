import { useState } from "react";
import axiosSecure from "../utils/axiosSecure";
import { getAccessToken } from "../../redux/store/tokenManager";
import { useAlert } from "../../context/AlertContext";

function ChangePasswordModal({ onClose, isDark }) {
  const { showAlert } = useAlert();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");

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

      <input
        type="password"
        placeholder="Old Password"
        value={oldPassword}
        onChange={(e) => setOldPassword(e.target.value)}
        className={`w-full px-3 py-2 rounded border mb-3 ${isDark ? "bg-neutral-700 border-neutral-600" : "bg-neutral-50"
          }`}
      />

      <input
        type="password"
        placeholder="New Password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className={`w-full px-3 py-2 rounded border mb-3 ${isDark ? "bg-neutral-700 border-neutral-600" : "bg-neutral-50"
          }`}
      />

      <input
        type="password"
        placeholder="Confirm New Password"
        value={newPassword2}
        onChange={(e) => setNewPassword2(e.target.value)}
        className={`w-full px-3 py-2 rounded border ${isDark ? "bg-neutral-700 border-neutral-600" : "bg-neutral-50"
          }`}
      />

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