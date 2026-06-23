import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "../../api/axiosClient";
import { Resume } from "../../types";

interface ResumeState {
  items: Resume[];
  uploading: boolean;
  error: string | null;
}

const initialState: ResumeState = { items: [], uploading: false, error: null };

function extractError(err: unknown): string {
  const anyErr = err as { response?: { data?: { message?: string } } };
  return anyErr?.response?.data?.message || "Upload failed";
}

export const uploadResume = createAsyncThunk(
  "resume/upload",
  async (file: File, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("resume", file);
      const res = await apiClient.post("/resumes/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.resume as Resume;
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

export const fetchResumes = createAsyncThunk("resume/list", async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.get("/resumes");
    return res.data.resumes as Resume[];
  } catch (err) {
    return rejectWithValue(extractError(err));
  }
});

const resumeSlice = createSlice({
  name: "resume",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(uploadResume.pending, (state) => {
        state.uploading = true;
        state.error = null;
      })
      .addCase(uploadResume.fulfilled, (state, action) => {
        state.uploading = false;
        state.items.unshift(action.payload);
      })
      .addCase(uploadResume.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchResumes.fulfilled, (state, action) => {
        state.items = action.payload;
      });
  },
});

export default resumeSlice.reducer;
