import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";
import toast from "react-hot-toast";

// --- Async Thunks ---

export const fetchInstructors = createAsyncThunk(
  "instructors/fetchInstructors",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/api/admin/instructors");
      return data;
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const addInstructor = createAsyncThunk(
  "instructors/addInstructor",
  async (instructorData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/admin/instructors", instructorData);
      toast.success(data.message);
      return data.instructor; // Return the new instructor object
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// --- Slice ---

const initialState = {
  instructors: [],
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const instructorSlice = createSlice({
  name: "instructors",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Instructors
      .addCase(fetchInstructors.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchInstructors.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.instructors = action.payload;
      })
      .addCase(fetchInstructors.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Add Instructor
      .addCase(addInstructor.pending, (state) => {
        // You could set a specific 'adding' status if needed
        // For now, we'll just let the modal handle its own loading state
      })
      .addCase(addInstructor.fulfilled, (state, action) => {
        // Add the new instructor to the beginning of the list
        state.instructors.unshift(action.payload);
      })
      .addCase(addInstructor.rejected, (state, action) => {
        // Error is already handled by toast in the thunk
        // You could log action.payload here if needed
      });
  },
});

export default instructorSlice.reducer;