// frontend/src/redux/adminStudentSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";
import toast from "react-hot-toast";

/* ============================================================
   1️⃣ FETCH ALL STUDENTS (ADMIN)
============================================================ */
export const fetchStudents = createAsyncThunk(
  "adminStudents/fetchStudents",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/api/admin/users/students");
      return data;
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

/* ============================================================
   2️⃣ BLOCK / UNBLOCK STUDENT (ADMIN)
============================================================ */
export const blockStudent = createAsyncThunk(
  "adminStudents/blockStudent",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(
        `/api/admin/users/students/${id}/toggle-block`,
        { isBlocked: status }
      );

      toast.success(data.message);
      return data.student;
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

/* ============================================================
   3️⃣ DELETE STUDENT (ADMIN)
============================================================ */
export const deleteStudent = createAsyncThunk(
  "adminStudents/deleteStudent",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/admin/users/students/${id}`);
      toast.success("Student deleted.");
      return id;
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

/* ============================================================
   SLICE
============================================================ */
const adminStudentSlice = createSlice({
  name: "adminStudents",
  initialState: {
    students: [],
    status: "idle",
    error: null,
  },

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

export default adminStudentSlice.reducer;
