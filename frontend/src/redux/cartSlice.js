import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';

const serverUrl = import.meta.env.VITE_SERVER_URL;

// Thunk to fetch cart from backend
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(`${serverUrl}/api/cart`, { withCredentials: true });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message || 'Failed to fetch cart');
    }
  }
);

// Thunk to add an item to the cart
export const addItemToCart = createAsyncThunk(
  'cart/addItemToCart',
  async (mocktestId, thunkAPI) => {
    try {
      const response = await axios.post(`${serverUrl}/api/cart/add`, { mocktestId }, { withCredentials: true });
      toast.success('Added to cart!');
      return response.data;
    } catch (error) {
      toast.error(error.response.data.message || 'Failed to add item');
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

// Thunk to remove an item from the cart
export const removeItemFromCart = createAsyncThunk(
  'cart/removeItemFromCart',
  async (mocktestId, thunkAPI) => {
    try {
      const response = await axios.delete(`${serverUrl}/api/cart/remove/${mocktestId}`, { withCredentials: true });
      toast.info('Removed from cart');
      return response.data;
    } catch (error) {
      toast.error(error.response.data.message || 'Failed to remove item');
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

const initialState = {
  items: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCart: (state) => {
      state.items = [];
      state.status = 'idle';
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Add Item
      .addCase(addItemToCart.fulfilled, (state, action) => {
        state.items = action.payload; // Backend returns the full updated cart
      })
      // Remove Item
      .addCase(removeItemFromCart.fulfilled, (state, action) => {
        state.items = action.payload; // Backend returns the full updated cart
      });
  },
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;