import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';

const serverUrl = import.meta.env.VITE_SERVER_URL;

// ---------------- FETCH CART ----------------
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(`${serverUrl}/api/cart`, { withCredentials: true });
      return response.data;  // should return array of items
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to fetch cart'
      );
    }
  }
);

// ---------------- ADD TO CART ----------------
export const addItemToCart = createAsyncThunk(
  'cart/addItemToCart',
  async (mocktestId, thunkAPI) => {
    try {
      const response = await axios.post(
        `${serverUrl}/api/cart/add`,
        { mocktestId },
        { withCredentials: true }
      );
      toast.success('Added to cart!');
      return response.data;  // full updated cart array
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add item');
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

// ---------------- REMOVE FROM CART ----------------
export const removeItemFromCart = createAsyncThunk(
  'cart/removeItemFromCart',
  async (mocktestId, thunkAPI) => {
    try {
      const response = await axios.delete(
        `${serverUrl}/api/cart/remove/${mocktestId}`,
        { withCredentials: true }
      );
      toast.info('Removed from cart');
      return response.data; // full updated cart array
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove item');
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

// ---------------- INITIAL STATE ----------------
const initialState = {
  cartItems: [],      // 🔥 ALWAYS an array → fixes warnings
  totalAmount: 0,
  totalItems: 0,
  status: 'idle',
  error: null,
};

// ---------------- SLICE ----------------
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCart: (state) => {
      state.cartItems = [];
      state.totalAmount = 0;
      state.totalItems = 0;

      // optional localStorage sync
      localStorage.setItem("cartItems", "[]");
      localStorage.setItem("totalAmount", "0");
      localStorage.setItem("totalItems", "0");
    },
  },

  extraReducers: (builder) => {
    builder
      // ----- FETCH CART -----
      .addCase(fetchCart.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.cartItems = action.payload;

        // Compute totals
        state.totalItems = action.payload.length;
        state.totalAmount = action.payload.reduce((sum, item) => sum + item.price, 0);
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // ----- ADD ITEM -----
      .addCase(addItemToCart.fulfilled, (state, action) => {
        state.cartItems = action.payload;
        state.totalItems = action.payload.length;
        state.totalAmount = action.payload.reduce((sum, item) => sum + item.price, 0);
      })

      // ----- REMOVE ITEM -----
      .addCase(removeItemFromCart.fulfilled, (state, action) => {
        state.cartItems = action.payload;
        state.totalItems = action.payload.length;
        state.totalAmount = action.payload.reduce((sum, item) => sum + item.price, 0);
      });
  },
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;
