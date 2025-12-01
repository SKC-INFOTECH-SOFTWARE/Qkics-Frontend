// src/components/auth/Login.jsx
import { useState } from "react";
import axiosSecure from "../utils/axiosSecure";
import { API_BASE_URL } from "../../config/api";

import { useAlert } from "../../context/AlertContext";

function LoginModal({ onClose, onLogin, openSignup, isDark }) {
  const { showAlert } = useAlert();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const bg = isDark ? "bg-neutral-800 text-white" : "bg-white text-black";

  const handleUsernameChange = (value) => {
    value = value.toLowerCase();
    if (!/^[a-z0-9]*$/.test(value)) return;
    setUsername(value);
  };

  const handleLogin = async () => {
    try {
      const payload = { username, password };

      const res = await axiosSecure.post(
        `v1/auth/login/`,
        payload,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true // backend sets refresh HttpOnly cookie
        }
      );


      // store ONLY access + user
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      onLogin(username);
      onClose();
      window.location.reload();
    } catch (error) {
      console.log("Login error:", error.response?.data);
      showAlert("Invalid username or password", "error");
    }
  };

  return (
    <div className={`p-6 rounded-2xl shadow-xl w-96 ${bg}`}>
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-semibold">Login</h2>
        <button onClick={onClose}>✕</button>
      </div>

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => handleUsernameChange(e.target.value)}
        className={`w-full px-3 py-2 rounded border mb-3 ${isDark ? "bg-neutral-700 border-neutral-600" : "bg-neutral-50"
          }`}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className={`w-full px-3 py-2 rounded border ${isDark ? "bg-neutral-700 border-neutral-600" : "bg-neutral-50"
          }`}
      />

      <button
        onClick={handleLogin}
        className="w-full mt-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
      >
        Login
      </button>

      <button onClick={openSignup} className="w-full mt-2 text-sm underline">
        Create an account
      </button>
    </div>
  );
}

export default LoginModal;
