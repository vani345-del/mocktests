// frontend/src/redux/mockTestSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

/* ============================================================
   0️⃣ CREATE MOCKTEST (ADMIN)
============================================================= */
export const createMockTest = createAsyncThunk(
  "mocktests/create",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post("/api/admin/mocktests", payload);
      return res.data.mocktest;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to create mocktest"
      );
    }
  }
);

/* ============================================================
   1️⃣ FETCH MOCKTEST LIST (ADMIN)
============================================================= */
export const fetchPublicMockTests = createAsyncThunk(
  "mocktests/fetchPublic",
  async (_, { getState, rejectWithValue }) => {
    try {
      const category = getState().mocktest.filters.category; // This is the slug string (e.g., 'ssc' or '')

      let url = "/api/admin/mocktests/filter";
      
      // Only append the category filter if the value is not an empty string
      if (category) {
          // Use encodeURIComponent for safety, although category slugs are usually safe
          url += `?category=${encodeURIComponent(category)}`;
      }

      const res = await api.get(url);
      return res.data;
    } catch (err) {
      return rejectWithValue("Failed to load mock tests");
    }
  }
);

/* ============================================================
   2️⃣ FETCH PUBLIC TEST (STUDENT)
============================================================= */
export const fetchPublicTestById = createAsyncThunk(
  "mocktests/fetchPublicById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/api/mocktests/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue("Failed to load mocktest");
    }
  }
);

/* ============================================================
   3️⃣ FETCH MOCKTEST FOR EDIT (ADMIN)
============================================================= */
export const fetchMockTestByIdForEdit = createAsyncThunk(
  "mocktests/fetchByIdForEdit",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/api/admin/mocktests/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue("Failed to load mocktest for editing");
    }
  }
);

/* ============================================================
   4️⃣ UPDATE MOCKTEST (ADMIN)
============================================================= */
export const updateMockTest = createAsyncThunk(
  "mocktests/update",
  async ({ id, ...payload }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/api/admin/mocktests/${id}`, payload);
      return res.data.mocktest;
    } catch (err) {
      return rejectWithValue("Failed to update mocktest");
    }
  }
);

/* ============================================================
   5️⃣ DELETE MOCKTEST
============================================================= */
export const deleteMockTest = createAsyncThunk(
  "mocktests/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/admin/mocktests/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue("Failed to delete mocktest");
    }
  }
);

/* ============================================================
   6️⃣ PUBLISH / UNPUBLISH
============================================================= */
export const togglePublish = createAsyncThunk(
  "mocktests/togglePublish",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.put(`/api/admin/mocktests/${id}/publish`);
      return res.data.mocktest;
    } catch (err) {
      return rejectWithValue("Failed to toggle publish");
    }
  }
);

/* ============================================================
   7️⃣ GRAND TEST LEADERBOARD
============================================================= */
export const fetchGrandTestLeaderboard = createAsyncThunk(
  "mocktests/leaderboard",
  async (mockTestId, { rejectWithValue }) => {
    try {
      // NOTE: Assuming this route is correct for students/public view
      const res = await api.get(`/api/mocktests/${mockTestId}/leaderboard`);
      return { mockTestId, leaderboard: res.data };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Leaderboard not available"
      );
    }
  }
);

/* ============================================================
   SLICE
============================================================= */
const mockTestSlice = createSlice({
  name: "mocktest",

  initialState: {
    publicMocktests: [],
    publicStatus: "idle",
    publicError: null,

    selectedMocktest: null,
    selectedStatus: "idle",
    selectedError: null,

    leaderboards: {},
    leaderboardStatus: "idle",
    leaderboardError: null,

    filters: {
      category: "", // Stores the category slug string
    },
  },

  reducers: {
    setCategoryFilter(state, action) {
      state.filters.category = action.payload;
    },
  },

  extraReducers: (builder) => {
    /* ----------------------------------
       CREATE
    ---------------------------------- */
    builder.addCase(createMockTest.fulfilled, (state, action) => {
      state.publicMocktests.push(action.payload);
    });

    /* ----------------------------------
       FETCH LIST
    ---------------------------------- */
    builder
      .addCase(fetchPublicMockTests.pending, (state) => {
        state.publicStatus = "loading";
      })
      .addCase(fetchPublicMockTests.fulfilled, (state, action) => {
        state.publicStatus = "succeeded";
        // Assuming action.payload is the array of mock tests
        state.publicMocktests = action.payload.mocktests || action.payload; 
      })
      .addCase(fetchPublicMockTests.rejected, (state, action) => {
        state.publicStatus = "failed";
        state.publicError = action.payload;
      });

    /* ----------------------------------
       FETCH PUBLIC TEST BY ID
    ---------------------------------- */
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
      });

    /* ----------------------------------
       FETCH TEST FOR EDIT
    ---------------------------------- */
    builder
      .addCase(fetchMockTestByIdForEdit.pending, (state) => {
        state.selectedStatus = "loading";
      })
      .addCase(fetchMockTestByIdForEdit.fulfilled, (state, action) => {
        state.selectedStatus = "succeeded";
        state.selectedMocktest = action.payload;
      })
      .addCase(fetchMockTestByIdForEdit.rejected, (state, action) => {
        state.selectedStatus = "failed";
        state.selectedError = action.payload;
      });

    /* ----------------------------------
       UPDATE
    ---------------------------------- */
    builder.addCase(updateMockTest.fulfilled, (state, action) => {
      const updated = action.payload;
      const index = state.publicMocktests.findIndex((t) => t._id === updated._id);
      if (index !== -1) state.publicMocktests[index] = updated;
    });

    /* ----------------------------------
       DELETE
    ---------------------------------- */
    builder.addCase(deleteMockTest.fulfilled, (state, action) => {
      state.publicMocktests = state.publicMocktests.filter(
        (t) => t._id !== action.payload
      );
    });

    /* ----------------------------------
       TOGGLE PUBLISH
    ---------------------------------- */
    builder.addCase(togglePublish.fulfilled, (state, action) => {
      const updated = action.payload;
      const index = state.publicMocktests.findIndex((t) => t._id === updated._id);
      if (index !== -1) state.publicMocktests[index] = updated;
    });

    /* ----------------------------------
       LEADERBOARD
    ---------------------------------- */
    builder
      .addCase(fetchGrandTestLeaderboard.pending, (state) => {
        state.leaderboardStatus = "loading";
      })
      .addCase(fetchGrandTestLeaderboard.fulfilled, (state, action) => {
        state.leaderboardStatus = "succeeded";
        state.leaderboards[action.payload.mockTestId] =
          action.payload.leaderboard;
      })
      .addCase(fetchGrandTestLeaderboard.rejected, (state, action) => {
        state.leaderboardStatus = "failed";
        state.leaderboardError = action.payload;
      });
  },
});

export const { setCategoryFilter } = mockTestSlice.actions;
export default mockTestSlice.reducer;