import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';   // IMPORTANT: use instance
import toast from "react-hot-toast";

// ---------------- FETCH CART ----------------
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, thunkAPI) => {
    try {
      const res = await api.get(`/api/cart`);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch cart"
      );
    }
  }
);

// ---------------- ADD TO CART ----------------
export const addItemToCart = createAsyncThunk(
  'cart/addItemToCart',
  async (mocktestId, thunkAPI) => {
    try {
      const res = await api.post(`/api/cart/add`, { mocktestId });
      toast.success("Added to cart!");
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add item");
      return thunkAPI.rejectWithValue(err.response?.data?.message);
    }
  }
);

// ---------------- REMOVE ITEM ----------------
export const removeItemFromCart = createAsyncThunk(
  'cart/removeItemFromCart',
  async (mocktestId, thunkAPI) => {
    try {
      const res = await api.delete(`/api/cart/remove/${mocktestId}`);
      toast.success("Removed from cart");
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove item");
      return thunkAPI.rejectWithValue(err.response?.data?.message);
    }
  }
);

const initialState = {
  cartItems: [],
  totalAmount: 0,
  totalItems: 0,
  status: "idle",
  error: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCart: (state) => {
      state.cartItems = [];
      state.totalAmount = 0;
      state.totalItems = 0;
      localStorage.removeItem("cartItems");
    }
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.cartItems = action.payload;
        state.totalItems = action.payload.length;
        state.totalAmount = action.payload.reduce((sum, i) => sum + i.price, 0);
      })
      .addCase(addItemToCart.fulfilled, (state, action) => {
        state.cartItems = action.payload;
        state.totalItems = action.payload.length;
        state.totalAmount = action.payload.reduce((sum, i) => sum + i.price, 0);
      })
      .addCase(removeItemFromCart.fulfilled, (state, action) => {
        state.cartItems = action.payload;
        state.totalItems = action.payload.length;
        state.totalAmount = action.payload.reduce((sum, i) => sum + i.price, 0);
      });
  },
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;
