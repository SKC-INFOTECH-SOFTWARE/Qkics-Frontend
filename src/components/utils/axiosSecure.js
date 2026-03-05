// src/components/utils/axiosSecure.js
import axios from "axios";
import { API_BASE_URL } from "../../config/api";
import { navigateTo } from "./navigation";
import {
  getAccessToken,
  setAccessToken,
  getRefreshToken,
  setRefreshToken,
  clearAllTokens,
} from "../../redux/store/tokenManager";

const axiosSecure = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
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

// Call on logout to drain the queue immediately
export const resetRefreshState = () => {
  isRefreshing = false;
  runQueue(new Error("Session ended"), null);
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
    if (!error.response) {
      navigateTo("/server-down");
      return Promise.reject(error);
    }

    const original = error.config;

    if ([502, 503, 504].includes(error.response.status)) {
      navigateTo("/server-down");
      return Promise.reject(error);
    }

    // If the refresh endpoint itself failed — clear session and redirect
    if (original.url?.includes("/auth/token/refresh/")) {
      clearAllTokens();
      runQueue(error, null);
      isRefreshing = false;
      navigateTo("/");
      return Promise.reject(error);
    }

    if (error.response.status !== 401) return Promise.reject(error);

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
      const refreshToken = getRefreshToken();

      // No refresh token stored — go straight to login
      if (!refreshToken) {
        clearAllTokens();
        runQueue(new Error("No refresh token"), null);
        navigateTo("/");
        return Promise.reject(new Error("No refresh token"));
      }

      // ✅ Backend expects refresh token in the request body
      const refreshResponse = await axios.post(
        `${API_BASE_URL}/v1/auth/token/refresh/`,
        { refresh: refreshToken }
      );

      const newAccessToken = refreshResponse?.data?.tokens?.access;
      // Backend may rotate the refresh token on each use — save it if provided
      const newRefreshToken = refreshResponse?.data?.tokens?.refresh;

      if (!newAccessToken) throw new Error("No access token in refresh response");

      setAccessToken(newAccessToken);
      if (newRefreshToken) setRefreshToken(newRefreshToken);

      runQueue(null, newAccessToken);

      if (!original.headers) original.headers = {};
      original.headers.Authorization = `Bearer ${newAccessToken}`;

      return axiosSecure(original);
    } catch (refreshErr) {
      clearAllTokens();
      runQueue(refreshErr, null);
      navigateTo("/");
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);

/* -------------------------------------------------------
    SILENT REFRESH ON APP BOOT
    Restores the access token on every page load using
    the refresh token stored in the cookie.
------------------------------------------------------- */
export const silentRefresh = async () => {
  const refreshToken = getRefreshToken();

  // No cookie = user never logged in or already logged out
  if (!refreshToken) return false;

  try {
    const res = await axios.post(
      `${API_BASE_URL}/v1/auth/token/refresh/`,
      { refresh: refreshToken }
    );

    const newAccessToken = res?.data?.tokens?.access;
    const newRefreshToken = res?.data?.tokens?.refresh;

    if (newAccessToken) {
      setAccessToken(newAccessToken);
      if (newRefreshToken) setRefreshToken(newRefreshToken);
      return true;
    }

    clearAllTokens();
    return false;
  } catch {
    clearAllTokens();
    return false;
  }
};

export default axiosSecure;