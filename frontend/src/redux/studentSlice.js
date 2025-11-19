import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";
import toast from "react-hot-toast";

// ------------------------------------------------------
// 1️⃣ Fetch All Students
// ------------------------------------------------------
export const fetchStudents = createAsyncThunk(
  "students/fetchStudents",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/api/admin/students");
      return data;
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// ------------------------------------------------------
// 2️⃣ Block / Unblock Student
// ------------------------------------------------------
export const blockStudent = createAsyncThunk(
  "students/blockStudent",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/api/admin/students/${id}/toggle-block`, {
        isBlocked: status,
      });

      toast.success(data.message);
      return data.student; // updated student
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// ------------------------------------------------------
// 3️⃣ Delete Student
// ------------------------------------------------------
export const deleteStudent = createAsyncThunk(
  "students/deleteStudent",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/api/admin/students/${id}`);
      toast.success("Student deleted.");
      return id; // only returning ID to remove from state
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// ------------------------------------------------------
// Slice
// ------------------------------------------------------
const initialState = {
  students: [],
  status: "idle",
  error: null,
};

const studentSlice = createSlice({
  name: "students",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // FETCH
      .addCase(fetchStudents.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.students = action.payload;
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // BLOCK / UNBLOCK
      .addCase(blockStudent.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.students.findIndex((s) => s._id === updated._id);
        if (index !== -1) {
          state.students[index] = updated;
        }
      })

      // DELETE
      .addCase(deleteStudent.fulfilled, (state, action) => {
        const id = action.payload;
        state.students = state.students.filter((s) => s._id !== id);
      });
  },
});

export default studentSlice.reducer;
