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
export const getMockTestById = createAsyncThunk(
  "mockTests/getMockTestById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/mocktests/${id}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Error fetching test");
    }
  }
);

// --- 燥 NEW THUNK to update a test ---
export const updateMockTest = createAsyncThunk(
  "mockTests/updateMockTest",
  async (testData, { rejectWithValue }) => {
    try {
      const { id, ...payload } = testData;
      // Note: Your backend route for updating might be PUT /mocktests/:id
      // Please ensure this matches your backend API routes
      const { data } = await api.put(`/mocktests/${id}`, payload); 
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Error updating test");
    }
  }
);
export const getMocktestsByCategory = createAsyncThunk(
  "mockTests/getMocktestsByCategory",
  async (category, { rejectWithValue }) => {
    try {
      // Make sure your backend route matches this.
      // Based on your backend controller, the route is '/mocktests?category=...'
      // Or if you have a specific route '/mocktests/category/:category'
      
      // Let's use the /mocktests/category/:category route you might have
      // If not, change this to: `/mocktests?category=${category}`
      const { data } = await api.get(`/mocktests/category/${category}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Error fetching tests");
    }
  }
);

/* -----------------------------
   🧠 SLICE DEFINITION
----------------------------- */

const slice = createSlice({
  name: "mocktest",
  initialState: {
    current: null, // current selected mocktest (admin)
    loading: false,
    error: null,
    currentMockTest: null,
    

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

  reducers: {
    clearCurrentMockTest: (state) => {
      state.currentMockTest = null;
    },
  },

  extraReducers: (builder) => {
    /* ---------- ADMIN ---------- */
    builder


      .addCase(getMocktestsByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMocktestsByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.mocktests = action.payload;
      })
      .addCase(getMocktestsByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // create mocktest
      .addCase(createMockTest.pending, (state) => {
        state.loading = true;
      })
      .addCase(createMockTest.fulfilled, (state, action) => {
        state.loading = false;
        state.mocktests.unshift(action.payload); // Add to list
      })
      .addCase(createMockTest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getMockTestById.pending, (state) => {
        state.loading = true;
        state.currentMockTest = null;
        state.error = null;
      })
      .addCase(getMockTestById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMockTest = action.payload;
      })
      .addCase(getMockTestById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      }).addCase(updateMockTest.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateMockTest.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMockTest = action.payload;
        // Also update the test in the main list
        const index = state.mocktests.findIndex(
          (t) => t._id === action.payload._id
        );
        if (index !== -1) {
          state.mocktests[index] = action.payload;
        }
      })
      .addCase(updateMockTest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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