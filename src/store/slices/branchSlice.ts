import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/api';
import type { Branch } from '@/types';

interface BranchState {
  branches: Branch[];
  isLoading: boolean;
  error: string | null;
}

const initialState: BranchState = {
  branches: [],
  isLoading: false,
  error: null,
};

export const fetchBranches = createAsyncThunk<Branch[]>(
  'branches/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get<Branch[]>('/branches');
      return data;
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message || 'Gagal memuat data cabang',
      );
    }
  },
);

const branchSlice = createSlice({
  name: 'branches',
  initialState,
  reducers: {
    clearBranchError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBranches.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBranches.fulfilled, (state, action) => {
        state.isLoading = false;
        state.branches = action.payload;
      })
      .addCase(fetchBranches.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearBranchError } = branchSlice.actions;
export default branchSlice.reducer;
