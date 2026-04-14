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

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

/**
 * ServerDown Page
 * Inspired by Dribbble Loading Design: https://dribbble.com/shots/18701721-Loading
 * Features:
 * - Mint green central loader with equalizer bars.
 * - Rotating dark green arc indicator.
 * - Soft cream/white background with radial focus.
 */
export default function ServerDown() {
  const { theme } = useSelector((state) => state.user || { theme: "dark" });
  const isDark = theme === "dark";
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const checkServer = async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        await fetch(`${import.meta.env.VITE_API_URL}/api/v1/health/`, {
          method: "GET",
          signal: controller.signal,
        });
        clearTimeout(timeout);
        navigate("/");
      } catch (err) {
        // Still down
      }
    };

    const interval = setInterval(checkServer, 10000);
    return () => clearInterval(interval);
  }, [navigate]);

  const handleManualCheck = async () => {
    setIsChecking(true);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      await fetch(`${import.meta.env.VITE_API_URL}/api/v1/health/`, {
        method: "GET",
        signal: controller.signal,
      });
      clearTimeout(timeout);
      navigate("/");
    } catch (err) {
      setTimeout(() => setIsChecking(false), 1500);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center transition-all duration-700 font-sans px-6
        ${isDark ? "bg-[#0A0A0A]" : "bg-[#F9F9F7]"}`}
    >
      <style>{`
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes pulsate {
          0%, 100% { height: 12px; transform: translateY(0); }
          50% { height: 28px; transform: translateY(-4px); }
        }

        .canvas {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 60px;
          z-index: 10;
        }

        /* The background radial focus */
        .focus-light {
          position: absolute;
          width: 600px;
          height: 600px;
          background: ${isDark 
            ? "radial-gradient(circle, rgba(239, 68, 68, 0.05) 0%, transparent 70%)" 
            : "radial-gradient(circle, rgba(239, 68, 68, 0.1) 0%, transparent 70%)"};
          pointer-events: none;
          z-index: 1;
        }

        .loader-container {
          position: relative;
          width: 140px;
          height: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Red Central Circle */
        .central-circle {
          width: 80px;
          height: 80px;
          background: #EF4444; /* Vibrant Red */
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          box-shadow: 0 10px 25px rgba(239, 68, 68, 0.3);
          z-index: 10;
        }

        .equalizer-bar {
          width: 4px;
          background: white;
          border-radius: 2px;
          animation: pulsate 0.8s ease-in-out infinite;
        }

        .bar-1 { animation-delay: 0s; }
        .bar-2 { animation-delay: 0.2s; }
        .bar-3 { animation-delay: 0.4s; }

        /* Outer Trace Ring */
        .outer-ring {
          position: absolute;
          width: 120px;
          height: 120px;
          border: 4px solid ${isDark ? "rgba(239, 68, 68, 0.1)" : "rgba(239, 68, 68, 0.15)"};
          border-radius: 50%;
          z-index: 5;
        }

        /* Rotating Dark Red Arc */
        .rotating-arc {
          position: absolute;
          width: 120px;
          height: 120px;
          border: 4px solid transparent;
          border-top-color: #991B1B; /* Dark Red */
          border-radius: 50%;
          animation: rotate 1.5s cubic-bezier(0.5, 0.1, 0.4, 0.9) infinite;
          z-index: 6;
        }

        .logo-footer {
          width: 180px;
          opacity: 0.8;
          filter: ${isDark ? "brightness(1.2)" : "none"};
          transition: all 0.5s ease;
        }

        .text-status {
          margin-top: -20px;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .status-pill {
          background: ${isDark ? "rgba(239, 68, 68, 0.1)" : "#FEE2E2"};
          color: #B91C1C;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          padding: 6px 16px;
          border-radius: 99px;
          align-self: center;
        }

        @keyframes blink-dots {
          0%, 20% { opacity: 0; }
          40% { opacity: 1; }
          100% { opacity: 0; }
        }

        .dots span {
          animation: blink-dots 1.5s infinite;
          opacity: 0;
        }

        .dots span:nth-child(2) { animation-delay: 0.3s; }
        .dots span:nth-child(3) { animation-delay: 0.6s; }

        .preparing-text {
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: ${isDark ? "#FFFFFF" : "#000000"};
          opacity: 0.8;
          display: flex;
          align-items: center;
          gap: 4px;
        }
      `}</style>

      <div className="focus-light"></div>

      <div className="canvas">
        <div className="loader-container">
          <div className="central-circle">
            <div className="equalizer-bar bar-1"></div>
            <div className="equalizer-bar bar-2"></div>
            <div className="equalizer-bar bar-3"></div>
          </div>
          <div className="outer-ring"></div>
          <div className="rotating-arc"></div>
        </div>

        <div className="text-status">
          <h1 className="preparing-text">
            Preparing
            <span className="dots">
              <span>.</span><span>.</span><span>.</span>
            </span>
          </h1>
        </div>

        {/* <img src="/logo1.png" alt="QKICS" className="logo-footer" /> */}
      </div>
    </div>
  );
}

