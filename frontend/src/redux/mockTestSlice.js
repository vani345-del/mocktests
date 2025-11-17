// frontend/src/redux/mockTestSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

/* -----------------------------
   ✅ ADMIN SIDE LOGIC
----------------------------- */

// --- Thunk for fetching a single test for editing ---
export const fetchMockTestByIdForEdit = createAsyncThunk(
  "mocktest/fetchByIdAdmin",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`api/admin/mocktests/${id}`);
      return response.data; // API returns the mocktest object directly
    } catch (err) {
      // ✅ FIX: Always return a string message
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
      // ✅ FIX: Always return a string message
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// --- 👇 UPDATED THUNK for updating a test ---
export const updateMockTest = createAsyncThunk(
  "mocktest/update",
  async (payload, { rejectWithValue }) => {
    try {
      // ✅ FIX: Remove all name transformations.
      // The backend (as per createMockTest) expects durationMinutes and negativeMarking.
      // We just pass the payload directly.
      const { id, ...data } = payload;
      const res = await api.put(`api/admin/mocktests/${id}`, data); // Send data as-is
      return res.data;
    } catch (err) {
      // ✅ FIX: Always return a string message
      return rejectWithValue(err.response?.data?.message || err.message);
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
      // ✅ FIX: Always return a string message
      return rejectWithValue(err.response?.data?.message || err.message);
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
      // ✅ Corrected route to match backend router
      const res = await api.post(
        `api/admin/mocktests/questions/bulk-upload`,
        form,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return res.data;
    } catch (err) {
      // ✅ FIX: Always return a string message
      return rejectWithValue(err.response?.data?.message || err.message);
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
      // ✅ FIX: Always return a string message
      return rejectWithValue(err.response?.data?.message || err.message);
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
      // ✅ FIX: Always return a string message
      return rejectWithValue(err.response?.data?.message || err.message);
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
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch mock tests"
      );
    }
  }
);

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

// --- 👇 NEW LEADERBOARD THUNK ---
export const fetchGrandTestLeaderboard = createAsyncThunk(
  "mocktest/fetchGrandTestLeaderboard",
  async (mockTestId, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/api/student/grandtest-leaderboard/${mockTestId}`
      );
      return { mockTestId, data: response.data }; // Pass both ID and data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch leaderboard"
      );
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
    leaderboards: {}, // { "testId1": [...], "testId2": [...] }
    leaderboardStatus: "idle",
    leaderboardError: null,
    // --- 👆 END OF NEW STATE ---

    // --- State for single public test (details page) ---
    currentTest: null,
    currentTestStatus: "idle",
    currentTestError: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    /* ---------- ADMIN ---------- */
    builder
      // --- ✅ Fetch by ID for Edit ---
      .addCase(fetchMockTestByIdForEdit.pending, (s) => {
        s.loading = true;
        s.current = null;
        s.error = null;
      })
      .addCase(fetchMockTestByIdForEdit.fulfilled, (s, a) => {
        s.loading = false;
        s.current = a.payload;
      })
      .addCase(fetchMockTestByIdForEdit.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload; // a.payload is now a string
      })

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
        s.error = a.payload; // a.payload is now a string
      })

      // --- ✅ Update Mocktest ---
      .addCase(updateMockTest.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(updateMockTest.fulfilled, (s, a) => {
        s.loading = false;
        s.current = a.payload;
      })
      .addCase(updateMockTest.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload; // a.payload is now a string
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
        s.error = a.payload; // a.payload is now a string
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
        s.error = a.payload; // a.payload is now a string
      })

      // toggle publish
      .addCase(togglePublish.pending, (s) => {
        s.loading = true;
      })
      .addCase(togglePublish.fulfilled, (s, a) => {
        s.loading = false;
        if (s.current && s.current._id === a.payload.mocktest?._id) {
          s.current.isPublished = a.payload.mocktest.isPublished;
        }
      })
      .addCase(togglePublish.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload; // a.payload is now a string
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
        s.error = a.payload; // a.payload is now a string
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
        state.leaderboardStatus = "loading";
        state.leaderboardError = null;
      })
      .addCase(fetchGrandTestLeaderboard.fulfilled, (state, action) => {
        state.leaderboardStatus = "succeeded";
        // Save the leaderboard data against its test ID
        state.leaderboards[action.payload.mockTestId] = action.payload.data;
        state.leaderboardError = null;
      })
      .addCase(fetchGrandTestLeaderboard.rejected, (state, action) => {
        state.leaderboardStatus = "failed";
        state.leaderboardError = action.payload;
      });
    // --- 👆 END OF NEW REDUCERS ---
  },
});

export default slice.reducer;