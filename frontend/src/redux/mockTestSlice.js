// frontend/src/redux/mockTestSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

/* -----------------------------
   ✅ ADMIN SIDE LOGIC
----------------------------- */
export const fetchPublicTestById = createAsyncThunk(
  "mocktest/fetchPublicTestById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`api/public/mocktests/${id}`);
      return response.data; // Expects a single test object
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);
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

// --- 👇 NEW LEADERBOARD THUNK ---
export const fetchGrandTestLeaderboard = createAsyncThunk(
  'mocktest/fetchGrandTestLeaderboard',
  async (mockTestId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/student/grandtest-leaderboard/${mockTestId}`);
      return { mockTestId, data: response.data }; // Pass both ID and data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch leaderboard');
    }
  }
);
// --- 👆 END OF NEW THUNK ---


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
    
    // --- 👇 NEW LEADERBOARD STATE ---
    // We will store leaderboards in a map, keyed by mockTestId
    leaderboards: {}, // { "testId1": [...], "testId2": [...] }
    leaderboardStatus: "idle",
    leaderboardError: null,
    // --- 👆 END OF NEW STATE ---
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
      })
       // --- New Handlers for Single Public Test ---
      .addCase(fetchPublicTestById.pending, (state) => {
        state.currentTestStatus = "loading";
        state.currentTest = null; // Clear old test
      })
      .addCase(fetchPublicTestById.fulfilled, (state, action) => {
        state.currentTestStatus = "succeeded";
        state.currentTest = action.payload; // Payload is the single test
      })
      .addCase(fetchPublicTestById.rejected, (state, action) => {
        state.currentTestStatus = "failed";
        state.currentTestError = action.payload;
      });

    /* ---------- PUBLIC (STUDENT SIDE) ---------- */
    builder
      .addCase(fetchPublicMockTests.pending, (state) => {
        state.publicStatus = "loading";
        state.publicError = null;
      })
      .addCase(fetchPublicMockTests.fulfilled, (state, action) => {
        state.publicStatus = "succeeded";
        if (action.payload && Array.isArray(action.payload.mocktests)) {
          state.publicMocktests = action.payload.mocktests;
          state.total = action.payload.total || 0;
        } else if (Array.isArray(action.payload)) {
          state.publicMocktests = action.payload;
          state.total = action.payload.length;
        } else {
          state.publicMocktests = action.payload?.mocktests || [];
          state.total = action.payload?.total || 0;
        }
      })
      .addCase(fetchPublicMockTests.rejected, (state, action) => {
        state.publicStatus = "failed";
        state.publicError = action.payload;
      });
      
    // --- 👇 NEW LEADERBOARD REDUCERS ---
    builder
      .addCase(fetchGrandTestLeaderboard.pending, (state) => {
        state.leaderboardStatus = 'loading';
        state.leaderboardError = null;
      })
      .addCase(fetchGrandTestLeaderboard.fulfilled, (state, action) => {
        state.leaderboardStatus = 'succeeded';
        // Save the leaderboard data against its test ID
        state.leaderboards[action.payload.mockTestId] = action.payload.data;
        state.leaderboardError = null;
      })
      .addCase(fetchGrandTestLeaderboard.rejected, (state, action) => {
        state.leaderboardStatus = 'failed';
        state.leaderboardError = action.payload;
      });
    // --- 👆 END OF NEW REDUCERS ---
  },
});

export default slice.reducer;