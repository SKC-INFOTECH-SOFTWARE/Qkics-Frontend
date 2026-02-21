// src/components/ServerDown.jsx
//
// Drop-in server-status page. Show it when axiosSecure fails with a network
// error (no response at all), 502/503/504, or CORS block.
//
// Usage in axiosSecure.js:
//   import { navigateTo } from "./navigation";
//   if (!error.response) navigateTo("/server-down");
//
// Or wrap App routes:
//   <Route path="/server-down" element={<ServerDown />} />

import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const RETRY_INTERVAL = 10; // seconds between auto-retries
const PING_URL = `${import.meta.env.VITE_API_URL}/api/v1/health/`; // adjust to any lightweight endpoint

export default function ServerDown({ reason = "unreachable" }) {
  const { theme } = useSelector((state) => state.user);
  const isDark = theme === "dark";
  const navigate = useNavigate();

  const [countdown, setCountdown] = useState(RETRY_INTERVAL);
  const [retryCount, setRetryCount] = useState(0);
  const [status, setStatus] = useState("waiting"); // waiting | checking | back | failed
  const intervalRef = useRef(null);
  const countdownRef = useRef(null);

  /* ---------- AUTO PING ---------- */
  const checkServer = async () => {
    setStatus("checking");
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      await fetch(PING_URL, {
        method: "GET",
        signal: controller.signal,
        credentials: "include",
      });
      clearTimeout(timeout);
      setStatus("back");
      clearInterval(intervalRef.current);
      clearInterval(countdownRef.current);
      // Give user 1.5s to see "back online" then redirect
      setTimeout(() => navigate("/"), 1500);
    } catch {
      setRetryCount((c) => c + 1);
      setCountdown(RETRY_INTERVAL);
      setStatus("waiting");
    }
  };

  useEffect(() => {
    // Countdown tick
    countdownRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) return RETRY_INTERVAL;
        return c - 1;
      });
    }, 1000);

    // Auto-retry every RETRY_INTERVAL seconds
    intervalRef.current = setInterval(checkServer, RETRY_INTERVAL * 1000);

    return () => {
      clearInterval(intervalRef.current);
      clearInterval(countdownRef.current);
    };
  }, []);

  /* ---------- REASON LABEL ---------- */
  const reasons = {
    unreachable: { label: "Server Unreachable", code: "ERR_NETWORK" },
    timeout: { label: "Connection Timed Out", code: "ERR_TIMEOUT" },
    blocked: { label: "Request Blocked", code: "ERR_BLOCKED" },
    maintenance: { label: "Under Maintenance", code: "503" },
    gateway: { label: "Bad Gateway", code: "502" },
  };
  const { label: reasonLabel, code: reasonCode } = reasons[reason] || reasons.unreachable;

  /* ---------- PULSE BARS ---------- */
  const bars = [3, 5, 7, 4, 6, 8, 5, 3, 6, 7, 4, 5];

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4
        ${isDark ? "bg-[#0a0a0a] text-white" : "bg-[#f8f9fa] text-black"}`}
    >
      {/* ── Background grid ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: isDark
            ? "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)"
            : "linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* ── Red vignette glow ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(239,68,68,0.06) 0%, transparent 70%)",
        }}
      />

      {/* ── Main card ── */}
      <div
        className={`relative z-10 w-full max-w-lg rounded-3xl border p-10 text-center shadow-2xl
          ${isDark
            ? "bg-neutral-900/80 border-white/5 backdrop-blur-xl"
            : "bg-white/90 border-black/5 backdrop-blur-xl shadow-black/10"
          }`}
      >
        {/* Signal bars icon */}
        <div className="flex items-end justify-center gap-1 mb-8 h-12">
          {bars.map((h, i) => (
            <div
              key={i}
              className="w-2 rounded-sm"
              style={{
                height: `${h * 5}px`,
                background: status === "back"
                  ? "#22c55e"
                  : status === "checking"
                  ? `rgba(239,68,68,${0.3 + (i % 3) * 0.25})`
                  : i < 4
                  ? "#ef4444"
                  : isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
                animation: status === "checking"
                  ? `pulse 1s ease-in-out ${i * 0.07}s infinite alternate`
                  : status === "back"
                  ? `pulse 0.4s ease-out ${i * 0.04}s both`
                  : "none",
                transition: "background 0.4s ease, height 0.3s ease",
              }}
            />
          ))}
        </div>

        {/* Status badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border mb-6
          bg-red-500/10 border-red-500/20 text-red-500">
          <span
            className="h-1.5 w-1.5 rounded-full bg-red-500"
            style={{ animation: status === "checking" ? "none" : "blink 1.2s ease-in-out infinite" }}
          />
          <span className="text-[10px] font-black uppercase tracking-widest">
            {status === "checking" ? "Checking..." : status === "back" ? "Back Online" : reasonCode}
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl font-black tracking-tighter mb-3">
          {status === "back" ? "We're back!" : status === "checking" ? "Checking server..." : "Server is down"}
        </h1>

        {/* Sub-copy */}
        <p className={`text-sm leading-relaxed mb-8 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
          {status === "back"
            ? "Connection restored. Redirecting you now..."
            : status === "checking"
            ? "Attempting to reach the server..."
            : `Unable to connect — ${reasonLabel.toLowerCase()}. The server may be temporarily offline, under maintenance, or your network may be blocking the request.`}
        </p>

        {/* Retry countdown ring */}
        {status === "waiting" && (
          <div className="flex flex-col items-center gap-2 mb-8">
            <div className="relative h-16 w-16">
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="none"
                  stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}
                  strokeWidth="4" />
                <circle cx="32" cy="32" r="28" fill="none"
                  stroke="#ef4444" strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - countdown / RETRY_INTERVAL)}`}
                  style={{ transition: "stroke-dashoffset 1s linear" }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-black">
                {countdown}
              </span>
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? "text-neutral-500" : "text-neutral-400"}`}>
              Auto-retry in {countdown}s
            </span>
          </div>
        )}

        {/* Manual retry + go home */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={checkServer}
            disabled={status === "checking" || status === "back"}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-red-600 text-white
              text-[11px] font-black uppercase tracking-widest hover:bg-red-700
              disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {status === "checking" ? (
              <>
                <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Checking
              </>
            ) : "Retry Now"}
          </button>

          <button
            onClick={() => window.location.reload()}
            className={`px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border
              ${isDark
                ? "border-white/10 text-neutral-400 hover:bg-white/5 hover:text-white"
                : "border-black/10 text-neutral-500 hover:bg-black/5 hover:text-black"
              }`}
          >
            Reload Page
          </button>
        </div>

        {/* Retry count */}
        {retryCount > 0 && (
          <p className={`mt-6 text-[10px] font-bold uppercase tracking-widest ${isDark ? "text-neutral-600" : "text-neutral-400"}`}>
            {retryCount} automatic {retryCount === 1 ? "retry" : "retries"} attempted
          </p>
        )}
      </div>

      {/* ── Footer branding ── */}
      <p className={`mt-8 text-[10px] font-black uppercase tracking-[0.3em] opacity-20 z-10`}>
        QKICS Global · Status Monitor
      </p>

      {/* ── Keyframe styles ── */}
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }
        @keyframes pulse {
          from { opacity: 0.4; transform: scaleY(0.7); }
          to   { opacity: 1;   transform: scaleY(1.1); }
        }
      `}</style>
    </div>
  );
}