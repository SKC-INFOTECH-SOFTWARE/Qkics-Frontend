import { useState } from "react";
import axios from "axios";
import axiosSecure from "../utils/axiosSecure";

import { API_BASE_URL } from "../../config/api";

import { useAlert } from "../../context/AlertContext";

function SignupModal({ onRegister, onClose, openLogin, isDark }) {
  const { showAlert } = useAlert();
  const [username, setUsername] = useState("");
  const [usernameErr, setUsernameErr] = useState("");

  const [email, setEmail] = useState("");
  const [emailErr, setEmailErr] = useState("");

  const [phone, setPhone] = useState("");
  const [phoneErr, setPhoneErr] = useState("");

  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  // NEW: account type
  const [userType, setUserType] = useState("normal");

  const bg = isDark ? "bg-neutral-800 text-white" : "bg-white text-black";

  // validate username
  const handleUsernameChange = async (value) => {
    value = value.toLowerCase();
    if (!/^[a-z0-9]*$/.test(value)) {
      setUsernameErr("Only letters and numbers allowed");
      return;
    }

    setUsername(value);
    setUsernameErr("");

    if (value.length < 3) {
      setUsernameErr("Username must be at least 3 characters");
      return;
    }

    try {
      const res = await axios.post(`${API_BASE_URL}v1/auth/check-username/`, {
        username: value,
      });

      if (!res.data.available) {
        setUsernameErr("Username already taken");
      }
    } catch (e) {
      console.log(e);
    }
  };

  // validate email
  const handleEmailChange = async (value) => {
    value = value.toLowerCase();
    setEmail(value);
    setEmailErr("");

    if (!value) return;

    try {
      const res = await axios.post(`${API_BASE_URL}v1/auth/check-email/`, {
        email: value,
      });

      if (!res.data.available) {
        setEmailErr("Email already exists");
      }
    } catch (e) {
      console.log(e);
    }
  };

  // validate phone
  const handlePhoneChange = async (value) => {
    if (!/^[0-9]*$/.test(value)) return;

    setPhone(value);
    setPhoneErr("");

    if (value.length > 0 && value.length < 10) {
      setPhoneErr("Phone number must be at least 10 digits");
      return;
    }

    if (value.length > 15) {
      setPhoneErr("Phone number cannot exceed 15 digits");
      return;
    }

    try {
      const res = await axios.post(`${API_BASE_URL}v1/auth/check-phone/`, {
        phone: value,
      });

      if (!res.data.available) {
        setPhoneErr("Phone already exists");
      }
    } catch (e) {
      console.log(e);
    }
  };

  // handle register
  const handleSignup = async () => {
    if (!username || !password || !password2) {
      showAlert("Enter required fields", "warning");
      return;
    }

    if (password !== password2) {
      showAlert("Passwords do not match", "error");
      return;
    }

    if (usernameErr || emailErr || phoneErr) {
      showAlert("Fix validation errors first", "warning");
      return;
    }

    try {
      const registerPayload = {
        username,
        password,
        password2,
        email,
        phone,
        user_type: userType, // CHANGED
      };

      await axios.post(`${API_BASE_URL}v1/auth/register/`, registerPayload);

      // Auto login
      const loginRes = await axiosSecure.post(
        `v1/auth/login/`,
        { username, password },
        { withCredentials: true }
      );

      localStorage.setItem("access", loginRes.data.access);
      localStorage.setItem("user", JSON.stringify(loginRes.data.user));

      onRegister(username);

      onRegister(username);

      showAlert("Signup successful!", "success");
      onClose();
    } catch (error) {
      console.log("Signup error:", error.response?.data);
      showAlert("Signup failed. Try again.", "error");
    }
  };

  return (
    <div className={`p-6 rounded-2xl shadow-xl w-96 space-y-3 ${bg}`}>
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-semibold">Sign Up</h2>
        <button onClick={onClose}>✕</button>
      </div>

      {/* USERNAME */}
      <div>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => handleUsernameChange(e.target.value)}
          className={`w-full px-3 py-2 rounded border ${isDark
              ? "bg-neutral-700 border-neutral-600 text-white"
              : "bg-neutral-50 text-black"
            }`}
        />
        {usernameErr && (
          <p className="text-red-500 text-xs mt-1">{usernameErr}</p>
        )}
      </div>

      {/* PASSWORD */}
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className={`w-full px-3 py-2 rounded border ${isDark
            ? "bg-neutral-700 border-neutral-600 text-white"
            : "bg-neutral-50 text-black"
          }`}
      />

      {/* CONFIRM PASSWORD */}
      <input
        type="password"
        placeholder="Confirm Password"
        value={password2}
        onChange={(e) => setPassword2(e.target.value)}
        className={`w-full px-3 py-2 rounded border ${isDark
            ? "bg-neutral-700 border-neutral-600 text-white"
            : "bg-neutral-50 text-black"
          }`}
      />

      {/* EMAIL */}
      <div>
        <input
          type="email"
          placeholder="Email (optional)"
          value={email}
          onChange={(e) => handleEmailChange(e.target.value)}
          className={`w-full px-3 py-2 rounded border ${isDark
              ? "bg-neutral-700 border-neutral-600 text-white"
              : "bg-neutral-50 text-black"
            }`}
        />
        {emailErr && <p className="text-red-500 text-xs mt-1">{emailErr}</p>}
      </div>

      {/* PHONE */}
      <div>
        <input
          type="number"
          placeholder="Phone (optional)"
          value={phone}
          onChange={(e) => handlePhoneChange(e.target.value)}
          className={`w-full px-3 py-2 rounded border ${isDark
              ? "bg-neutral-700 border-neutral-600 text-white"
              : "bg-neutral-50 text-black"
            }`}
        />
        {phoneErr && <p className="text-red-500 text-xs mt-1">{phoneErr}</p>}
      </div>

      {/* USER TYPE RADIO BUTTONS */}
      <div className="mt-3">
        <p className="text-sm mb-1">Select Account Type</p>

        <div className="grid grid-cols-2 gap-2">
          {[
            { value: "normal", label: "Normal" },
            { value: "expert", label: "Expert" },
          ].map((item) => (
            <label key={item.value} className="flex items-center space-x-2">
              <input
                type="radio"
                name="userType"
                value={item.value}
                checked={userType === item.value}
                onChange={() => setUserType(item.value)}
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* SUBMIT BUTTON */}
      <button
        onClick={handleSignup}
        className="w-full py-2 rounded bg-red-600 text-white hover:bg-red-700"
      >
        Create Account
      </button>

      <button onClick={openLogin} className="w-full text-sm underline">
        Already have an account? Login
      </button>
    </div>
  );
}

export default SignupModal;
