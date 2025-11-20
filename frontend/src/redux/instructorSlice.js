import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";
import toast from "react-hot-toast";

//
// -------------------------------------
// ASYNC THUNKS
// -------------------------------------
//

// ⬇ Fetch all instructors
export const fetchInstructors = createAsyncThunk(
  "instructors/fetchInstructors",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/api/admin/users/instructors");
      return data;                               // array of instructors
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// ⬇ Add new instructor
export const addInstructor = createAsyncThunk(
  "instructors/addInstructor",
  async (instructorData, { rejectWithValue }) => {
    try {
      const { data } = await api.post(
        "/api/admin/users/instructors",
        instructorData
      );
      toast.success(data.message);
      return data.instructor;                     // new instructor object
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// ⬇ Toggle active/inactive status
export const toggleInstructorStatus = createAsyncThunk(
  "instructors/toggleInstructorStatus",
  async (instructorId, { rejectWithValue }) => {
    try {
      const { data } = await api.put(
        `/api/admin/users/instructors/${instructorId}/toggle-status`
      );

      toast.success(data.message);
      return data.instructor;                     // updated instructor
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

//
// -------------------------------------
// SLICE
// -------------------------------------
//

const initialState = {
  instructors: [],
  status: "idle",
  error: null,
};

const instructorSlice = createSlice({
  name: "instructors",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      // FETCH
      .addCase(fetchInstructors.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchInstructors.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.instructors = action.payload;       // array
      })
      .addCase(fetchInstructors.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // ADD
      .addCase(addInstructor.fulfilled, (state, action) => {
        state.instructors.unshift(action.payload);
      })

      // TOGGLE STATUS
      .addCase(toggleInstructorStatus.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.instructors.findIndex(
          (inst) => inst._id === updated._id
        );
        if (index !== -1) {
          state.instructors[index] = updated;
        }
      });
  },
});

export default instructorSlice.reducer;
