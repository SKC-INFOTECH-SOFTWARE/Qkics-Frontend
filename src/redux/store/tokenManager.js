// src/redux/store/tokenManager.js
//
// ✅ Access token is stored in sessionStorage.
//
// Why sessionStorage (not localStorage):
//   - localStorage persists forever and is readable by any XSS script.
//   - Pure memory (variable) is safest but is wiped on every page refresh,
//     requiring a round-trip to /token/refresh/ before every load.
//   - sessionStorage is scoped to the browser TAB. It survives F5 / page
//     refreshes within the same tab but is cleared when the tab closes.
//     This means the access token is restored instantly on refresh without
//     a network call, while still being isolated per-tab.
//
// The refresh token remains an httpOnly cookie — the long-lived credential
// that sessionStorage cannot hold anyway.

const SESSION_KEY = "access_token";

export const setAccessToken = (token) => {
  if (token) {
    sessionStorage.setItem(SESSION_KEY, token);
  } else {
    sessionStorage.removeItem(SESSION_KEY);
  }
};

export const getAccessToken = () => {
  return sessionStorage.getItem(SESSION_KEY) || null;
};