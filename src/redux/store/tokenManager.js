// src/redux/store/tokenManager.js
//
// TOKEN STORAGE STRATEGY
// ──────────────────────
// Access token  → sessionStorage
//   Short-lived (minutes). Scoped to the tab. Gone when tab closes.
//   Fast to read with no network round-trip.
//
// Refresh token → cookie (js-set, NOT httpOnly since the backend sends it
//   in the response body rather than setting it server-side)
//   Long-lived (days). Persists across page refreshes and tab closes.
//   SameSite=Strict prevents CSRF. We clear it explicitly on logout.

const ACCESS_KEY = "access_token";
const REFRESH_COOKIE = "refresh_token";

/* ─── Access Token (sessionStorage) ─── */

export const setAccessToken = (token) => {
  if (token) {
    sessionStorage.setItem(ACCESS_KEY, token);
  } else {
    sessionStorage.removeItem(ACCESS_KEY);
  }
};

export const getAccessToken = () => {
  return sessionStorage.getItem(ACCESS_KEY) || null;
};

/* ─── Refresh Token (cookie) ─── */

export const setRefreshToken = (token) => {
  if (token) {
    // Read the expiry directly from the JWT's `exp` claim so the cookie
    // lifetime always matches whatever the backend has configured —
    // no hardcoded values needed on the frontend.
    let expires = "";
    try {
      // JWT payload is base64url encoded — replace chars before decoding
      const base64Payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      const payload = JSON.parse(atob(base64Payload));
      if (payload?.exp) {
        expires = `; expires=${new Date(payload.exp * 1000).toUTCString()}`;
      }
    } catch {
      // Malformed token — let the cookie be session-scoped (no expires)
    }
    // Use encodeURIComponent so JWT's base64 '=' chars don't break cookie parsing.
    // SameSite=Lax (not Strict) so the cookie is still sent when the user copies
    // a URL and pastes it into a new tab — Strict would drop it on that navigation.
    document.cookie = `${REFRESH_COOKIE}=${encodeURIComponent(token)}${expires}; path=/; SameSite=Lax`;
  } else {
    // Remove by setting expiry in the past
    document.cookie = `${REFRESH_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
  }
};

export const getRefreshToken = () => {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${REFRESH_COOKIE}=`));
  if (!match) return null;
  try {
    return decodeURIComponent(match.split("=").slice(1).join("="));
  } catch {
    return null;
  }
};

/* ─── Clear everything ─── */

export const clearAllTokens = () => {
  setAccessToken(null);
  setRefreshToken(null);
  // Also clear any legacy keys that may have been set before
  sessionStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem("user_uuid");
};  