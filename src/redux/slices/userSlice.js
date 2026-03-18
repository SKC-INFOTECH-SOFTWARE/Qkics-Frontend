// src/redux/slices/userSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosSecure from "../../components/utils/axiosSecure";
import { setAccessToken, setRefreshToken, clearAllTokens } from "../store/tokenManager";

/* =====================================
   INIT: Restore UUID from localStorage
   NOTE: We intentionally do NOT pre-populate state.data with the stored UUID.
   Doing so caused the navbar to show a logged-in avatar even when the refresh
   token cookie was already gone — the user appeared logged in but no API calls
   worked. Instead, App.jsx runs silentRefresh() on boot and fetchUserProfile()
   populates state.data only when we actually have a valid token.
===================================== */

/* =====================================
   THUNKS
===================================== */

// 1️⃣ Fetch logged-in user profile
export const fetchUserProfile = createAsyncThunk(
  "user/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      // Fetch profile and subscription status in parallel
      const [profileRes, subRes] = await Promise.allSettled([
        axiosSecure.get("/v1/auth/me/"),
        axiosSecure.get("/v1/subscriptions/me/")
      ]);

      if (profileRes.status === "rejected") {
        if (profileRes.reason.response?.status === 401) {
          clearAllTokens();
        }
        throw profileRes.reason;
      }

      const userData = profileRes.value.data;
      let is_subscribed = false;

      if (subRes.status === "fulfilled") {
        const subData = subRes.value.data;
        const now = new Date();
        const start = new Date(subData.start_date);
        const end = new Date(subData.end_date);

        if (subData.is_active && now >= start && now <= end) {
          is_subscribed = true;
        }
      }

      return { ...userData, is_subscribed };
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch profile");
    }
  }
);

// 2️⃣ Login — saves both tokens from the response body
export const loginUser = createAsyncThunk(
  "user/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await axiosSecure.post("/v1/auth/login/", credentials);
      const data = res?.data ?? res;

      const accessToken = data?.tokens.access;
      const refreshToken = data?.tokens.refresh;
      const user = data?.user;

      if (!accessToken || !user) {
        throw new Error("Invalid login response");
      }

      // ✅ Store both tokens — access in sessionStorage, refresh in cookie
      setAccessToken(accessToken);
      if (refreshToken) setRefreshToken(refreshToken);

      return user;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data || err.message || "Login failed"
      );
    }
  }
);

// 3️⃣ Update profile (partial update)
export const updateUserProfile = createAsyncThunk(
  "user/updateProfile",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await axiosSecure.patch("/v1/auth/me/update/", payload);
      return res.data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Profile update failed");
    }
  }
);

/* =====================================
   SLICE
===================================== */

const userSlice = createSlice({
  name: "user",

  initialState: {
    data: null,  // Always null on boot — App.jsx will populate via silentRefresh + fetchUserProfile
    role: null,
    status: "idle",
    error: null,
    theme:
      localStorage.getItem("theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"),
    activeProfileData: null,
    picVersion: Date.now(),
  },

  reducers: {
    logoutUser: (state) => {
      state.data = null;
      state.role = null;
      state.status = "idle";
      state.error = null;
      // ✅ Clear all tokens + persisted uuid in one call
      clearAllTokens();
    },

    setUserRole: (state, action) => {
      state.role = action.payload;
    },

    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem("theme", action.payload);
    },

    setActiveProfileData: (state, action) => {
      state.activeProfileData = action.payload;
    },

    clearActiveProfileData: (state) => {
      state.activeProfileData = null;
    },

    updateProfilePicture: (state, action) => {
      if (state.data) {
        state.data.profile_picture = action.payload;
      }
      state.picVersion = Date.now();
    },
  },

  extraReducers: (builder) => {
    builder
      /* -------- FETCH PROFILE -------- */
      .addCase(fetchUserProfile.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.status = "success";
        state.data = { ...state.data, ...action.payload };
        state.role = action.payload.role || state.role;
        state.error = null;
        state.picVersion = Date.now(); // Cache-bust on every fresh fetch
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.status = "idle";
        state.data = null; // Explicitly drop local user data on dead fetches
        state.role = null;
        state.error =
          action.payload || action.error?.message || "Failed to fetch profile";
      })

      /* -------- LOGIN -------- */
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "success";
        state.data = action.payload;
        state.role = action.payload.role || null;
        state.error = null;
        if (action.payload?.uuid) {
          localStorage.setItem("user_uuid", action.payload.uuid);
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "error";
        state.error =
          action.payload || action.error?.message || "Login failed";
      })

      /* -------- PROFILE UPDATE -------- */
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.data = { ...state.data, ...action.payload };
      });
  },
});

export const {
  logoutUser,
  setUserRole,
  setTheme,
  setActiveProfileData,
  clearActiveProfileData,
  updateProfilePicture,
} = userSlice.actions;

export default userSlice.reducer;