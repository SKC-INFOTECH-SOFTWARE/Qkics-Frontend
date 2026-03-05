import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosSecure from "../../components/utils/axiosSecure";

/* --------------------------------
   THUNKS
--------------------------------- */

// FETCH ALL SLOTS
export const fetchInvestorSlots = createAsyncThunk(
  "investorSlots/fetch",
  async (_, { getState, rejectWithValue }) => {
    try {
      // user_uuid is saved to localStorage on login (userSlice loginUser.fulfilled).
      // On page refresh, fetchUserProfile may not return a uuid field from
      // /v1/auth/me/, so state.user.data.uuid can be undefined after refresh.
      // We fall back to localStorage which always has it if the user has logged in.
      const userUuid =
        getState().user.data?.uuid ||
        localStorage.getItem("user_uuid");

      if (!userUuid) {
        console.warn("⚠️ No user UUID found in Redux state or localStorage");
        return [];
      }

      const res = await axiosSecure.get(
        `/v1/bookings/investors/${userUuid}/slots/`
      );

      // API returns paginated: { next, previous, results: [...] }
      const data = res.data;
      return Array.isArray(data) ? data : (data?.results ?? []);

    } catch (err) {
      console.error("fetchInvestorSlots error:", err);
      return rejectWithValue("Failed to fetch slots");
    }
  }
);

// CREATE SLOT
export const createInvestorSlot = createAsyncThunk(
  "investorSlots/create",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await axiosSecure.post(
        "/v1/bookings/investors/slots/",
        payload
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || "Failed to create slot"
      );
    }
  }
);

/* --------------------------------
   SLICE
--------------------------------- */

const investorSlotsSlice = createSlice({
  name: "investorSlots",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearSlots: (state) => {
      state.items = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      /* ---------- FETCH ---------- */
      .addCase(fetchInvestorSlots.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvestorSlots.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchInvestorSlots.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---------- CREATE ---------- */
      .addCase(createInvestorSlot.pending, (state) => {
        state.error = null;
      })
      .addCase(createInvestorSlot.fulfilled, (state, action) => {
        const payload = action.payload || {};
        const newSlot = {
          is_available: true,
          status: "ACTIVE",
          ...payload,
          uuid: payload.uuid ?? payload.id,
        };
        state.items.unshift(newSlot);
      })
      .addCase(createInvestorSlot.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearSlots } = investorSlotsSlice.actions;
export default investorSlotsSlice.reducer;