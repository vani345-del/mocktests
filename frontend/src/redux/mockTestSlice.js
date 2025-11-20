import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

/* ============================================================
   1️⃣ PUBLIC — FETCH ALL MOCKTESTS
============================================================= */
export const fetchPublicMockTests = createAsyncThunk(
  "mocktests/fetchPublic",
  async (query = "", { rejectWithValue }) => {
    try {
      const res = await api.get(`/api/public/mocktests${query}`);
      return res.data;  // BACKEND RETURNS ARRAY
    } catch (err) {
      return rejectWithValue("Failed to load public mock tests");
    }
  }
);

/* ============================================================
   2️⃣ PUBLIC — FETCH TEST BY ID
============================================================== */
export const fetchPublicTestById = createAsyncThunk(
  "mocktests/fetchPublicById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/api/public/mocktests/${id}`);
      return res.data;  // BACKEND RETURNS OBJECT
    } catch (err) {
      return rejectWithValue("Failed to load mocktest");
    }
  }
);
/* ============================================================
   3️⃣ ADMIN — FETCH ALL MOCKTESTS
============================================================= */
export const fetchAdminMockTests = createAsyncThunk(
  "mocktests/fetchAdmin",
  async (_, { getState, rejectWithValue }) => {
    try {
      const category = getState().mocktest.filters.category;
      let url = "/api/admin/mocktests/filter";

      if (category) url += `?category=${encodeURIComponent(category)}`;

      const res = await api.get(url);
      return res.data.mocktests || res.data;
    } catch (err) {
      return rejectWithValue("Failed to load mock tests");
    }
  }
);

/* ============================================================
   4️⃣ ADMIN — CREATE MOCKTEST
============================================================= */
export const createMockTest = createAsyncThunk(
  "mocktests/create",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post("/api/admin/mocktests", payload);
      return res.data.mocktest;
    } catch (err) {
      return rejectWithValue("Failed to create mocktest");
    }
  }
);

/* ============================================================
   5️⃣ ADMIN — FETCH MOCKTEST FOR EDIT
============================================================= */
export const fetchMockTestByIdForEdit = createAsyncThunk(
  "mocktests/fetchByIdForEdit",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/api/admin/mocktests/${id}`);
      return res.data.mocktest || res.data;
    } catch (err) {
      return rejectWithValue("Failed to load mocktest for editing");
    }
  }
);

/* ============================================================
   6️⃣ ADMIN — UPDATE MOCKTEST
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
   7️⃣ ADMIN — DELETE MOCKTEST
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
   8️⃣ ADMIN — TOGGLE PUBLISH
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
   9️⃣ PUBLIC — GRAND TEST LEADERBOARD
============================================================= */
export const fetchGrandTestLeaderboard = createAsyncThunk(
  "mocktests/leaderboard",
  async (mockTestId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/api/mocktests/${mockTestId}/leaderboard`);
      return { mockTestId, leaderboard: res.data };
    } catch (err) {
      return rejectWithValue("Leaderboard not available");
    }
  }
);

/* ============================================================
   SLICE
============================================================= */
const mockTestSlice = createSlice({
  name: "mocktest",
  initialState: {
    /* PUBLIC */
    publicMocktests: [],
    publicStatus: "idle",
    publicError: null,

    /* PUBLIC — SINGLE */
    selectedMocktest: null,
    selectedStatus: "idle",
    selectedError: null,

    /* ADMIN */
    adminMocktests: [],
    adminStatus: "idle",
    adminError: null,

    /* LEADERBOARD */
    leaderboards: {},
    leaderboardStatus: "idle",
    leaderboardError: null,

    filters: { category: "" },
  },

  reducers: {
    setCategoryFilter(state, action) {
      state.filters.category = action.payload;
    },
  },

  extraReducers: (builder) => {
    /* PUBLIC LIST */
    builder
      .addCase(fetchPublicMockTests.pending, (state) => {
        state.publicStatus = "loading";
      })
      .addCase(fetchPublicMockTests.fulfilled, (state, action) => {
        state.publicStatus = "succeeded";
        state.publicMocktests = action.payload;
      })
      .addCase(fetchPublicMockTests.rejected, (state, action) => {
        state.publicStatus = "failed";
        state.publicError = action.payload;
      });

    /* PUBLIC SINGLE TEST */
    builder
      .addCase(fetchPublicTestById.pending, (state) => {
        state.selectedStatus = "loading";
      })
      .addCase(fetchPublicTestById.fulfilled, (state, action) => {
        state.selectedStatus = "succeeded";
        state.selectedMocktest = action.payload;
      })
      .addCase(fetchPublicTestById.rejected, (state, action) => {
        state.selectedStatus = "failed";
        state.selectedError = action.payload;
      });

    /* ADMIN LIST */
    builder
      .addCase(fetchAdminMockTests.pending, (state) => {
        state.adminStatus = "loading";
      })
      .addCase(fetchAdminMockTests.fulfilled, (state, action) => {
        state.adminStatus = "succeeded";
        state.adminMocktests = action.payload;
      })
      .addCase(fetchAdminMockTests.rejected, (state, action) => {
        state.adminStatus = "failed";
        state.adminError = action.payload;
      });

    /* CREATE */
    builder.addCase(createMockTest.fulfilled, (state, action) => {
      state.adminMocktests.push(action.payload);
    });

    /* UPDATE */
    builder.addCase(updateMockTest.fulfilled, (state, action) => {
      const updated = action.payload;
      const index = state.adminMocktests.findIndex(
        (t) => t._id === updated._id
      );
      if (index !== -1) state.adminMocktests[index] = updated;
    });

    /* DELETE */
    builder.addCase(deleteMockTest.fulfilled, (state, action) => {
      state.adminMocktests = state.adminMocktests.filter(
        (t) => t._id !== action.payload
      );
    });

    /* PUBLISH */
    builder.addCase(togglePublish.fulfilled, (state, action) => {
      const updated = action.payload;
      const index = state.adminMocktests.findIndex(
        (t) => t._id === updated._id
      );
      if (index !== -1) state.adminMocktests[index] = updated;
    });

    /* LEADERBOARD */
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
