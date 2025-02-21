import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  token: null,
  listings: [],
  wishList: [], // Wishlist item IDs
  bookingList: [], // Added for booking list
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setLogin: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    setLogout: (state) => {
      state.user = null;
      state.token = null;
    },
    setListings: (state, action) => {
      state.listings = action.payload.listings || [];
    },
    setTripList: (state, action) => {
      if (state.user) {
        state.user.tripList = action.payload || [];
      }
    },
    setWishList: (state, action) => {
      console.log("Dispatching setWishList with payload:", action.payload);
      state.wishList = [...new Set(action.payload)] || [];
      console.log("Updated Redux wishList:", state.wishList);
    },
    setBookingList: (state, action) => {
      console.log("Dispatching setBookingList with payload:", action.payload);
      state.bookingList = [...new Set(action.payload)] || [];
      console.log("Updated Redux bookingList:", state.bookingList);
    },
  },
});

export const {
  setLogin,
  setLogout,
  setListings,
  setWishList,
  setBookingList, // Export the new action
} = userSlice.actions;

export default userSlice.reducer;
