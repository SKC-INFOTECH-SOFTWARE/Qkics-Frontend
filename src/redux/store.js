// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import postsReducer from "./slices/postsSlice";
import expertReducer from "./slices/expertSlice";
import postViewReducer from "./slices/postViewSlice";
import expertSlotsReducer from "./slices/expertSlotsSlice";
import investorSlotsReducer from "./slices/investorSlotsSlice";
import bookingReducer from "./slices/bookingSlice";
import tagsReducer from "./slices/tagsSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    posts: postsReducer,
    expert: expertReducer,
    postView: postViewReducer,
    expertSlots: expertSlotsReducer,
    investorSlots: investorSlotsReducer,
    booking: bookingReducer,
    tags: tagsReducer,
  },
});

export default store;