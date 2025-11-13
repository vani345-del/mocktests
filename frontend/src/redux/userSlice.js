import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const serverUrl = import.meta.env.VITE_SERVER_URL;

// ... (fetchUserData async thunk - no changes needed) ...
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

// --- ⭐ FIX IS HERE ---

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

  // Load safely using the helper function (This is the old line 29)
  initialState: {
    userData: getInitialUser(),
    loading: false,
    error: null,
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

    logoutUser: (state) => {
      state.userData = null;
      state.error = null;
      localStorage.removeItem("userData");
    },
  },

  extraReducers: (builder) => {
    builder
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
      });
  },
});

export const { setUserData, logoutUser } = userSlice.actions;
export default userSlice.reducer;