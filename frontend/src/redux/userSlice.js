import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const serverUrl = import.meta.env.VITE_SERVER_URL;

// ... (existing fetchUserData async thunk) ...
export const fetchUserData = createAsyncThunk(
  "user/fetchUserData",
  async (userId, thunkAPI) => {
    try {
      const response = await axios.get(
        `${serverUrl}/api/user/${userId}`,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Failed to fetch user data"
      );
    }
  }
);

// --- ADDED: New asyncThunk to fetch student's paid tests ---
// This 'export' here is correct
export const fetchMyMockTests = createAsyncThunk(
  "user/fetchMyMockTests",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${serverUrl}/api/student/my-mocktests`,
        { withCredentials: true } // Ensures the auth cookie is sent
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);
// -------------------------------------------------------------

// Helper function to safely parse user data from localStorage
const getInitialUser = () => {
  try {
    const storedUser = localStorage.getItem("userData");

    // Check if the item exists and is not the string "undefined" or "null"
    if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
      return JSON.parse(storedUser);
    }
    // If it doesn't exist or is invalid, remove it and return null
    localStorage.removeItem("userData"); // Clean up bad data
    return null;

  } catch (error) {
    console.error("Failed to parse user data from localStorage:", error);
    localStorage.removeItem("userData"); // Clean up corrupted JSON
    return null;
  }
};

const userSlice = createSlice({
  name: "user",

  // --- MODIFIED: Added new state properties for myMockTests ---
  initialState: {
    userData: getInitialUser(),
    loading: false,
    error: null,
    // --- New properties start here ---
    myMockTests: [],
    myMockTestsStatus: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    myMockTestsError: null,
    // --- New properties end here ---
  },

  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload;

      // Also add a check here to prevent saving 'undefined'
      if (action.payload) {
        localStorage.setItem("userData", JSON.stringify(action.payload));
      } else {
        // If payload is null or undefined, just remove the item
        localStorage.removeItem("userData");
      }
    },

    // --- MODIFIED: Clear new test state on logout ---
    logoutUser: (state) => {
      state.userData = null;
      state.error = null;
      localStorage.removeItem("userData");
      // --- Clear new properties ---
      state.myMockTests = [];
      state.myMockTestsStatus = "idle";
      state.myMockTestsError = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // Existing fetchUserData cases
      .addCase(fetchUserData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.loading = false;
        state.userData = action.payload;

        // Add the same safety check here
        if(action.payload) {
          localStorage.setItem("userData", JSON.stringify(action.payload));
        } else {
          localStorage.removeItem("userData");
        }
      })
      .addCase(fetchUserData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // --- ADDED: Handlers for fetchMyMockTests ---
      .addCase(fetchMyMockTests.pending, (state) => {
        state.myMockTestsStatus = "loading";
        state.myMockTestsError = null;
      })
      .addCase(fetchMyMockTests.fulfilled, (state, action) => {
        state.myMockTestsStatus = "succeeded";
        state.myMockTests = action.payload;
      })
      .addCase(fetchMyMockTests.rejected, (state, action) => {
        state.myMockTestsStatus = "failed";
        state.myMockTestsError = action.payload;
      });
      // ----------------------------------------------
  },
});

export const { setUserData, logoutUser } = userSlice.actions;

// --- 🛑 FIX: The line below was the error and has been removed. ---
// export { fetchUserData, fetchMyMockTests }; // <-- This line was removed

export default userSlice.reducer;