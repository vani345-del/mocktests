// frontend/src/redux/mockTestSlice.js - FULL UPDATED CODE
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
            return response.data;
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
            // Payload contains subjects array, which the backend uses to generate questionIds.
            const res = await api.post("api/admin/mocktests", payload);
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// --- UPDATED THUNK for updating a test ---
export const updateMockTest = createAsyncThunk(
    "mocktest/update",
    async (payload, { rejectWithValue }) => {
        try {
            // Payload contains subjects array, which the backend uses to RE-GENERATE questionIds.
            const { id, ...data } = payload;
            const res = await api.put(`api/admin/mocktests/${id}`, data);
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// add question - (This thunk should now add a question to the global pool, 
// and optionally add its ID to the mocktest, but we leave it simple for now)
export const addQuestion = createAsyncThunk(
    "mocktest/addQuestion",
    async ({ id, data }, { rejectWithValue }) => {
        try {
            // This now likely calls the global createGlobalQuestion endpoint
            const res = await api.post(`api/admin/questions/global`, data); 
            // The response would contain the new question ID.
            // You would need a subsequent call to link this ID to the mocktest.
            return res.data; 
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// bulk upload (to global question pool)
export const bulkUpload = createAsyncThunk(
    "mocktest/bulkUpload",
    async ({ id, file }, { rejectWithValue }) => {
        try {
            const form = new FormData();
            form.append("file", file);
            const res = await api.post(
                `api/admin/mocktests/questions/bulk-upload`,
                form,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );
            return res.data;
        } catch (err) {
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

export const fetchGrandTestLeaderboard = createAsyncThunk(
    "mocktest/fetchGrandTestLeaderboard",
    async (mockTestId, { rejectWithValue }) => {
        try {
            const response = await api.get(
                `/api/student/grandtest-leaderboard/${mockTestId}`
            );
            return { mockTestId, data: response.data }; 
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch leaderboard"
            );
        }
    }
);

/* -----------------------------
    🧠 SLICE DEFINITION
----------------------------- */

const slice = createSlice({
    name: "mocktest",
    initialState: {
        current: null,
        loading: false,
        error: null,

        publicMocktests: [],
        publicTest: null,
        total: 0,
        publicStatus: "idle",
        publicError: null,

        leaderboards: {},
        leaderboardStatus: "idle",
        leaderboardError: null,

        currentTest: null,
        currentTestStatus: "idle",
        currentTestError: null,
    },

    reducers: {},

    extraReducers: (builder) => {
        /* ---------- ADMIN ---------- */
        builder
            // --- Fetch by ID for Edit ---
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
                s.error = a.payload;
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
                s.error = a.payload;
            })

            // --- Update Mocktest ---
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
            .addCase(togglePublish.fulfilled, (s, a) => {
                s.loading = false;
                if (s.current && s.current._id === a.payload.mocktest?._id) {
                    s.current.isPublished = a.payload.mocktest.isPublished;
                }
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
            // --- Handlers for Single Public Test ---
            .addCase(fetchPublicTestById.pending, (state) => {
                state.currentTestStatus = "loading";
                state.currentTest = null;
            })
            .addCase(fetchPublicTestById.fulfilled, (state, action) => {
                state.currentTestStatus = "succeeded";
                state.currentTest = action.payload;
            })
            .addCase(fetchPublicTestById.rejected, (state, action) => {
                state.currentTestStatus = "failed";
                state.currentTestError = action.payload;
            })

            /* ---------- PUBLIC (STUDENT SIDE) ---------- */
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
            })

            // --- LEADERBOARD REDUCERS ---
            .addCase(fetchGrandTestLeaderboard.pending, (state) => {
                state.leaderboardStatus = "loading";
                state.leaderboardError = null;
            })
            .addCase(fetchGrandTestLeaderboard.fulfilled, (state, action) => {
                state.leaderboardStatus = "succeeded";
                state.leaderboards[action.payload.mockTestId] = action.payload.data;
                state.leaderboardError = null;
            })
            .addCase(fetchGrandTestLeaderboard.rejected, (state, action) => {
                state.leaderboardStatus = "failed";
                state.leaderboardError = action.payload;
            });
    },
});

export default slice.reducer;