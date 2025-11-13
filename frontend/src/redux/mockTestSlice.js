// src/redux/mockTestSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

/* -----------------------------
   ✅ ADMIN SIDE LOGIC
----------------------------- */

// create mocktest
export const createMockTest = createAsyncThunk(
  "mocktest/create",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post("api/admin/mocktests", payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// add question
export const addQuestion = createAsyncThunk(
  "mocktest/addQuestion",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.post(`api/admin/mocktests/${id}/questions`, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// bulk upload
export const bulkUpload = createAsyncThunk(
  "mocktest/bulkUpload",
  async ({ id, file }, { rejectWithValue }) => {
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await api.post(`api/admin/mocktests/${id}/questions/bulk`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// toggle publish
export const togglePublish = createAsyncThunk(
  "mocktest/togglePublish",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.put(`api/admin/mocktests/${id}/publish`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// delete mocktest
export const deleteMockTest = createAsyncThunk(
  "mocktest/deleteMockTest",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.delete(`api/admin/mocktests/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

/* -----------------------------
   ✅ PUBLIC (STUDENT) SIDE LOGIC
----------------------------- */

export const fetchPublicMockTests = createAsyncThunk(
  "mocktest/fetchPublic",
  async (query = "", { rejectWithValue }) => {
    try {
      const res = await api.get(`api/public/mocktests${query}`);
      console.log("API /public/mocktests response:", res.data); // TEMP LOG - remove later
      // res.data expected shape: { mocktests: [...], total: N }
      return res.data;
    } catch (err) {
      console.error("fetchPublicMockTests error:", err.response?.data || err.message);
      return rejectWithValue(err.response?.data?.message || "Failed to fetch mock tests");
    }
  }
);

/* -----------------------------
// fetch single mocktest details by id
export const fetchMockTestById = createAsyncThunk(
  "mocktest/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/mocktests/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);
----------------------------- */

/* -----------------------------
   🧠 SLICE DEFINITION
----------------------------- */

const slice = createSlice({
  name: "mocktest",
  initialState: {
    current: null, // current selected mocktest (admin)
    loading: false,
    error: null,

    // ✅ public (student side)
    publicMocktests: [],
    publicTest: null,
    total: 0,
    publicStatus: "idle", // idle | loading | succeeded | failed
    publicError: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    /* ---------- ADMIN ---------- */
    builder
      // create mocktest
      .addCase(createMockTest.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(createMockTest.fulfilled, (s, a) => {
        s.loading = false;
        s.current = a.payload;
      })
      .addCase(createMockTest.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      // add question
      .addCase(addQuestion.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(addQuestion.fulfilled, (s) => {
        s.loading = false;
      })
      .addCase(addQuestion.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      // bulk upload
      .addCase(bulkUpload.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(bulkUpload.fulfilled, (s) => {
        s.loading = false;
      })
      .addCase(bulkUpload.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      // toggle publish
      .addCase(togglePublish.pending, (s) => {
        s.loading = true;
      })
      .addCase(togglePublish.fulfilled, (s) => {
        s.loading = false;
      })
      .addCase(togglePublish.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      // delete
      .addCase(deleteMockTest.pending, (s) => {
        s.loading = true;
      })
      .addCase(deleteMockTest.fulfilled, (s) => {
        s.loading = false;
      })
      .addCase(deleteMockTest.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      });

    /* ---------- PUBLIC (STUDENT SIDE) ---------- */
    builder
      .addCase(fetchPublicMockTests.pending, (state) => {
        state.publicStatus = "loading";
        state.publicError = null;
      })
      .addCase(fetchPublicMockTests.fulfilled, (state, action) => {
        state.publicStatus = "succeeded";

        // Support both shapes:
        // 1) { mocktests: [...], total: N }  (preferred)
        // 2) [...array...] (older shape) - defensive fallback
        if (action.payload && Array.isArray(action.payload.mocktests)) {
          state.publicMocktests = action.payload.mocktests;
          state.total = action.payload.total || 0;
        } else if (Array.isArray(action.payload)) {
          state.publicMocktests = action.payload;
          state.total = action.payload.length;
        } else {
          // unexpected shape - attempt to salvage
          state.publicMocktests = action.payload?.mocktests || [];
          state.total = action.payload?.total || 0;
        }
      })
      .addCase(fetchPublicMockTests.rejected, (state, action) => {
        state.publicStatus = "failed";
        state.publicError = action.payload;
        // keep existing publicMocktests array as-is (do not clear) so UI can degrade gracefully
      });
  },
});

export default slice.reducer;
