import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiClient, setAccessToken } from "../../api/axiosClient";
import { User } from "../../types";

interface AuthState {
  user: User | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  status: "idle",
  error: null,
};

function extractError(err: unknown): string {
  const anyErr = err as { response?: { data?: { message?: string } } };
  return anyErr?.response?.data?.message || "Something went wrong";
}

export const registerUser = createAsyncThunk(
  "auth/register",
  async (payload: { name: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/auth/register", payload);
      setAccessToken(res.data.accessToken);
      return res.data.user as User;
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (payload: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/auth/login", payload);
      setAccessToken(res.data.accessToken);
      return res.data.user as User;
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

export const fetchProfile = createAsyncThunk("auth/profile", async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.get("/auth/profile");
    return res.data.user as User;
  } catch (err) {
    return rejectWithValue(extractError(err));
  }
});

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  await apiClient.post("/auth/logout");
  setAccessToken(null);
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.status = "idle";
      })
      .addMatcher(
        (action) => action.type.endsWith("/pending") && action.type.startsWith("auth/"),
        (state) => {
          state.status = "loading";
          state.error = null;
        }
      )
      .addMatcher(
        (action): action is PayloadAction<User> =>
          ["auth/register/fulfilled", "auth/login/fulfilled", "auth/profile/fulfilled"].includes(action.type),
        (state, action) => {
          state.status = "succeeded";
          state.user = action.payload;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith("/rejected") && action.type.startsWith("auth/"),
        (state, action) => {
          state.status = "failed";
          state.error = (action as { payload?: string }).payload || "Request failed";
        }
      );
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
