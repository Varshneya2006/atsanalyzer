import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "../../api/axiosClient";
import { Analysis } from "../../types";

interface AnalysisState {
  current: Analysis | null;
  items: Analysis[];
  loading: boolean;
  error: string | null;
}

const initialState: AnalysisState = { current: null, items: [], loading: false, error: null };

function extractError(err: unknown): string {
  const anyErr = err as { response?: { data?: { message?: string } } };
  return anyErr?.response?.data?.message || "Analysis failed";
}

export const createAnalysis = createAsyncThunk(
  "analysis/create",
  async (payload: { resumeId: string; jobDescription: string }, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/analyses", payload);
      return res.data.analysis as Analysis;
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

export const fetchAnalyses = createAsyncThunk("analysis/list", async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.get("/analyses");
    return res.data.analyses as Analysis[];
  } catch (err) {
    return rejectWithValue(extractError(err));
  }
});

export const fetchAnalysisById = createAsyncThunk(
  "analysis/getOne",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/analyses/${id}`);
      return res.data.analysis as Analysis;
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

const analysisSlice = createSlice({
  name: "analysis",
  initialState,
  reducers: {
    clearCurrentAnalysis(state) {
      state.current = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createAnalysis.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAnalysis.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(createAnalysis.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchAnalysisById.fulfilled, (state, action) => {
        state.current = action.payload;
      })
      .addCase(fetchAnalyses.fulfilled, (state, action) => {
        state.items = action.payload;
      });
  },
});

export const { clearCurrentAnalysis } = analysisSlice.actions;
export default analysisSlice.reducer;
