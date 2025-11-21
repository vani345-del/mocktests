import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

/* ============================================================
   FETCH PUBLIC MOCKTEST LIST (with ?q=&category=)
============================================================ */
export const fetchPublicMockTests = createAsyncThunk(
  "students/fetchPublicMockTests",
  async (queryString = "", { rejectWithValue }) => {
    try {
      const res = await api.get(`/api/public/mocktests${queryString}`);

      // Backend may return [] or { mocktests: [] }
      if (Array.isArray(res.data)) return res.data;
      return res.data.mocktests || [];

    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to load mock tests"
      );
    }
  }
);

/* ============================================================
   FETCH PUBLIC TEST BY ID
============================================================ */
export const fetchPublicTestById = createAsyncThunk(
  "students/fetchPublicTestById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/api/public/mocktests/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to load mock test"
      );
    }
  }
);

/* ============================================================
   PUBLIC LEADERBOARD
============================================================ */
export const fetchGrandTestLeaderboard = createAsyncThunk(
  "students/leaderboard",
  async (mockTestId, { rejectWithValue }) => {
    try {
      const res = await api.get(
        `/api/public/mocktests/${mockTestId}/leaderboard`
      );

      return { mockTestId, leaderboard: res.data };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Leaderboard not available"
      );
    }
  }
);

export const fetchPerformanceHistory = createAsyncThunk(
  "user/fetchPerformanceHistory",
  async (_, { rejectWithValue }) => {
    try {
      // Calls the new backend endpoint
      const response = await api.get(`/api/student/attempts/finished`); 
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);
//

/* ============================================================
   INITIAL STATE
============================================================ */
const initialState = {
  publicMocktests: [],
  publicStatus: "idle",
  publicError: null,

  selectedMocktest: null,
  selectedStatus: "idle",
  selectedError: null,

    attemptsHistory: [], 
    attemptsHistoryStatus: "idle",
    attemptsHistoryError: null,

  leaderboards: {},

  filters: {
    q: "",
    category: "",
    limit: 0, // (future use)
  },
};

/* ============================================================
   SLICE
============================================================ */
const studentSlice = createSlice({
  name: "students",
  initialState,

  reducers: {
    // SEARCH filter
    setPublicSearch(state, action) {
      state.filters.q = action.payload;
    },

    // CATEGORY filter
    setPublicCategoryFilter(state, action) {
      state.filters.category = action.payload;
    },

    // RESET filters (helpful for AllMockTests reset)
    resetPublicFilters(state) {
      state.filters = { q: "", category: "", limit: 0 };
      state.publicMocktests = [];
    }
  },

  extraReducers: (builder) => {
    /* PUBLIC LIST */
    builder
      .addCase(fetchPublicMockTests.pending, (state) => {
        state.publicStatus = "loading";
        state.publicError = null;
      })
      .addCase(fetchPublicMockTests.fulfilled, (state, action) => {
        state.publicStatus = "succeeded";
        state.publicMocktests = action.payload;
      })
      .addCase(fetchPublicMockTests.rejected, (state, action) => {
        state.publicStatus = "failed";
        state.publicError = action.payload;
        state.publicMocktests = [];
      });

    /* SINGLE TEST */
    builder
      .addCase(fetchPublicTestById.pending, (state) => {
        state.selectedStatus = "loading";
        state.selectedMocktest = null;
      })
      .addCase(fetchPublicTestById.fulfilled, (state, action) => {
        state.selectedStatus = "succeeded";
        state.selectedMocktest = action.payload;
      })
      .addCase(fetchPublicTestById.rejected, (state, action) => {
        state.selectedStatus = "failed";
        state.selectedError = action.payload;
      })
        // --- ADDED: Handlers for fetchPerformanceHistory ---
      .addCase(fetchPerformanceHistory.pending, (state) => {
        state.attemptsHistoryStatus = "loading";
        state.attemptsHistoryError = null;
      })
      .addCase(fetchPerformanceHistory.fulfilled, (state, action) => {
        state.attemptsHistoryStatus = "succeeded";
        state.attemptsHistory = action.payload; // Store the list of finished attempts
      })
      .addCase(fetchPerformanceHistory.rejected, (state, action) => {
        state.attemptsHistoryStatus = "failed";
        state.attemptsHistoryError = action.payload;
        state.attemptsHistory = [];
      })

    /* LEADERBOARD */
    builder.addCase(fetchGrandTestLeaderboard.fulfilled, (state, action) => {
      state.leaderboards[action.payload.mockTestId] =
        action.payload.leaderboard;
    });
    
  },
});

export const {
  setPublicCategoryFilter,
  setPublicSearch,
  resetPublicFilters,
} = studentSlice.actions;

export default studentSlice.reducer;
