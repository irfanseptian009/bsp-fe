import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/api';
import type { Policy, CreatePolicyPayload } from '@/types';

interface PolicyState {
  policies: Policy[];
  isLoading: boolean;
  error: string | null;
}

const initialState: PolicyState = {
  policies: [],
  isLoading: false,
  error: null,
};

export const fetchPolicies = createAsyncThunk<
  Policy[],
  { name?: string; branchId?: string; occupationTypeId?: string } | undefined
>('policies/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const { data } = await api.get<Policy[]>('/policies', { params });
    return data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Gagal memuat data');
  }
});

export const createPolicy = createAsyncThunk<Policy, CreatePolicyPayload>(
  'policies/create',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post<Policy>('/policies', payload);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Gagal membuat polis');
    }
  },
);

export const deletePolicy = createAsyncThunk<string, string>(
  'policies/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/policies/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Gagal menghapus polis');
    }
  },
);

const policySlice = createSlice({
  name: 'policies',
  initialState,
  reducers: {
    clearPolicyError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPolicies.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPolicies.fulfilled, (state, action) => {
        state.isLoading = false;
        state.policies = action.payload;
      })
      .addCase(fetchPolicies.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createPolicy.fulfilled, (state, action) => {
        state.policies.unshift(action.payload);
      })
      .addCase(deletePolicy.fulfilled, (state, action) => {
        state.policies = state.policies.filter((p) => p.id !== action.payload);
      });
  },
});

export const { clearPolicyError } = policySlice.actions;
export default policySlice.reducer;
