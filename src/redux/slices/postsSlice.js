// src/redux/slices/postsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosSecure from "../../components/utils/axiosSecure";

/* --------------------------------------------------------
   LOAD POSTS BY USERNAME
-------------------------------------------------------- */
export const loadUserPosts = createAsyncThunk(
  "posts/loadUserPosts",
  async (username, thunkAPI) => {
    try {
      const res = await axiosSecure.get(`/v1/community/posts/user/${username}/`);
      const data = res.data;

      // Normalize response
      return Array.isArray(data)
        ? data
        : Array.isArray(data.results)
          ? data.results
          : Array.isArray(data.posts)
            ? data.posts
            : [];
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || "Failed loading posts");
    }
  }
);

const postsSlice = createSlice({
  name: "posts",
  initialState: {
    items: [],
    loading: false,
    error: null,
    // ✅ UI state for post management
    editingPost: null,
    isCreateModalOpen: false,
  },

  reducers: {
    updatePost(state, action) {
      const updated = action.payload;
      state.items = state.items.map((p) => (p.id === updated.id ? updated : p));
    },
    addPost(state, action) {
      state.items.unshift(action.payload);
    },
    removePost(state, action) {
      state.items = state.items.filter((p) => p.id !== action.payload);
    },
    setEditingPost(state, action) {
      state.editingPost = action.payload;
    },
    setCreateModalOpen(state, action) {
      state.isCreateModalOpen = action.payload;
    },
    // ✅ Called on logout to wipe stale post/author data (including old profile pics)
    clearPosts(state) {
      state.items = [];
      state.loading = false;
      state.error = null;
      state.editingPost = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(loadUserPosts.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadUserPosts.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(loadUserPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { updatePost, addPost, removePost, setEditingPost, setCreateModalOpen, clearPosts } = postsSlice.actions;
export default postsSlice.reducer;