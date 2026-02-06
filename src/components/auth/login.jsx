// src/components/auth/Login.jsx
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { loginUser, fetchUserProfile } from "../../redux/slices/userSlice";
import { useAlert } from "../../context/AlertContext";

function LoginModal({ onClose, openSignup, isDark }) {
  const dispatch = useDispatch();
  const { showAlert } = useAlert();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const bg = isDark ? "bg-neutral-800 text-white" : "bg-white text-black";



  const handleLogin = async () => {
    if (!username || !password) {
      showAlert("Enter username and password", "warning");
      return;
    }

    if (password.length < 4) {
      showAlert("Password must be at least 4 characters", "warning");
      return;
    }

    setLoading(true);

    try {
      const result = await dispatch(loginUser({ username, password }));

      if (loginUser.rejected.match(result)) {
        showAlert("Invalid username or password", "error");
        setLoading(false);
        return;
      }

      await dispatch(fetchUserProfile());
      showAlert("Login successful!", "success");
      onClose();
    } catch (err) {
      console.log(err);
      showAlert("Login failed", "error");
    }

    setLoading(false);
  };

  // ENTER KEY TRIGGER LOGIN
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Enter") handleLogin();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  return (
    <div className={`p-6 rounded-2xl shadow-xl w-[90%] max-w-sm ${bg}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black uppercase tracking-tighter">Login</h2>
        <button
          onClick={onClose}
          className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${isDark ? "hover:bg-white/10 text-neutral-400" : "hover:bg-black/5 text-neutral-500"
            }`}
        >✕</button>
      </div>

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value.trim())}
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
        disabled={loading}
        className={`w-full mt-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 ${loading
            ? "bg-neutral-500/20 text-neutral-500 cursor-not-allowed"
            : "bg-red-600 text-white hover:bg-red-700 shadow-red-600/20 hover:shadow-red-600/40"
          }`}
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      <div className="mt-6 text-center">
        <button onClick={() => {
          console.log("🔥 LOGIN → SIGNUP CLICKED");
          openSignup();
        }} className={`text-[10px] font-black uppercase tracking-widest hover:underline ${isDark ? "text-neutral-400 hover:text-white" : "text-neutral-500 hover:text-black"
          }`}>
          Don't have an account? <span className="text-red-600">Join QKICS</span>
        </button>
      </div>
    </div>
  );
}

export default LoginModal;
