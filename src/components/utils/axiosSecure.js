// src/components/utils/axiosSecure.js
import axios from "axios";
import { API_BASE_URL } from "../../config/api";
import { navigateTo } from "./navigation";
import { getAccessToken, setAccessToken } from "../../redux/store/tokenManager";

const axiosSecure = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // ✅ sends httpOnly refresh cookie on every request
});

/* -------------------------------------------------------
    GLOBAL REFRESH STATE
------------------------------------------------------- */
let isRefreshing = false;
let queue = [];

const addToQueue = () =>
  new Promise((resolve, reject) => queue.push({ resolve, reject }));

const runQueue = (error, token) => {
  queue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  queue = [];
};

/* -------------------------------------------------------
    REQUEST INTERCEPTOR
------------------------------------------------------- */
axiosSecure.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token && !config._noAuth) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (err) => Promise.reject(err)
);

/* -------------------------------------------------------
    RESPONSE INTERCEPTOR + REFRESH LOGIC
------------------------------------------------------- */
axiosSecure.interceptors.response.use(
  (res) => res,
  async (error) => {
    // ✅ No response at all = network error, server down, or CORS block
    if (!error.response) {
      navigateTo("/server-down");
      return Promise.reject(error);
    }

    const original = error.config;

    // ✅ 502 Bad Gateway / 503 Service Unavailable / 504 Gateway Timeout
    if ([502, 503, 504].includes(error.response.status)) {
      navigateTo("/server-down");
      return Promise.reject(error);
    }

    if (error.response.status !== 401) return Promise.reject(error);

    // ✅ Skip refresh only if this was already a retry — prevents infinite loops.
    // Do NOT skip based on token absence: the token may be missing because
    // the tab just opened fresh. Let the refresh attempt proceed; if the
    // cookie is also invalid, the catch block below will logout cleanly.
    if (original._retry) return Promise.reject(error);
    original._retry = true;

    if (isRefreshing) {
      try {
        const newToken = await addToQueue();
        if (!original.headers) original.headers = {};
        original.headers.Authorization = `Bearer ${newToken}`;
        return axiosSecure(original);
      } catch (e) {
        return Promise.reject(e);
      }
    }

    isRefreshing = true;

    try {
      // ✅ CRITICAL FIX: Use the FULL backend URL for the refresh call, not the
      // relative path through Vite proxy. In production (Vercel) there is no proxy,
      // so a relative URL would hit the Vercel edge and the httpOnly cookie
      // (set by the backend domain) would never be sent.
      //
      // By using the absolute backend URL with withCredentials:true the browser
      // sends the httpOnly cookie directly to the backend domain — which is the
      // same origin that SET the cookie — so the backend accepts it.
      const BACKEND_URL = import.meta.env.VITE_API_URL;

      const refreshResponse = await axios.post(
        `${BACKEND_URL}/api/v1/auth/token/refresh/`,
        {},
        { withCredentials: true } // sends httpOnly refresh cookie
      );

      const newToken = refreshResponse?.data?.access;
      if (!newToken) throw new Error("No access token in refresh response");

      setAccessToken(newToken);
      runQueue(null, newToken);

      if (!original.headers) original.headers = {};
      original.headers.Authorization = `Bearer ${newToken}`;

      return axiosSecure(original);
    } catch (refreshErr) {
      setAccessToken(null);
      runQueue(refreshErr, null);
      navigateTo("/login");
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);

/* -------------------------------------------------------
    SILENT REFRESH ON APP BOOT
    Call this once in main.jsx / App.jsx on mount.
    Since the access token lives in memory, it's gone on
    every page refresh — this restores it silently using
    the httpOnly cookie before the app renders.
------------------------------------------------------- */
export const silentRefresh = async () => {
  // ✅ If a token is already in sessionStorage (same tab, page refresh),
  // skip the network round-trip — we can trust it until it 401s naturally.
  const existing = getAccessToken();
  if (existing) return true;

  try {
    const BACKEND_URL = import.meta.env.VITE_API_URL;
    const res = await axios.post(
      `${BACKEND_URL}/api/v1/auth/token/refresh/`,
      {},
      { withCredentials: true }
    );
    const token = res?.data?.access;
    if (token) {
      setAccessToken(token);
      return true; // ✅ valid session — App.jsx can now call fetchUserProfile
    }
    return false;
  } catch {
    // No valid refresh cookie — user is genuinely logged out
    setAccessToken(null);
    return false;
  }
};

export default axiosSecure;