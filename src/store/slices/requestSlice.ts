import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/lib/api';
import type { InsuranceRequest, CreateInsuranceRequestPayload } from '@/types';

const mapCreateRequestError = (message?: string) => {
  if (!message) return 'Gagal membuat request. Silakan cek kembali data Anda.';

  if (message.toLowerCase().includes('tipe okupasi')) {
    return 'Tipe okupasi tidak valid. Silakan pilih tipe okupasi yang tersedia.';
  }

  if (message.toLowerCase().includes('request asuransi')) {
    return 'Request gagal diproses. Silakan refresh halaman lalu coba lagi.';
  }

  return message;
};

interface RequestState {
  requests: InsuranceRequest[];
  selectedRequest: InsuranceRequest | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: RequestState = {
  requests: [],
  selectedRequest: null,
  isLoading: false,
  error: null,
};

/* ─── Customer: Create Request ─── */
export const createInsuranceRequest = createAsyncThunk<
  InsuranceRequest,
  CreateInsuranceRequestPayload
>('requests/create', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post<InsuranceRequest>(
      '/insurance-requests',
      payload,
    );
    return data;
  } catch (err) {
    const error = err as { response?: { data?: { message?: string } } };
    return rejectWithValue(
      mapCreateRequestError(error.response?.data?.message),
    );
  }
});

/* ─── Customer: My Requests ─── */
export const fetchMyRequests = createAsyncThunk<InsuranceRequest[]>(
  'requests/fetchMy',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get<InsuranceRequest[]>(
        '/insurance-requests/my-requests',
      );
      return data;
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Gagal memuat request');
    }
  },
);

/* ─── Fetch by Invoice Number ─── */
export const fetchRequestByInvoice = createAsyncThunk<InsuranceRequest, string>(
  'requests/fetchByInvoice',
  async (invoiceNumber, { rejectWithValue }) => {
    try {
      const { data } = await api.get<InsuranceRequest>(
        `/insurance-requests/invoice/${encodeURIComponent(invoiceNumber)}`,
      );
      return data;
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message || 'Gagal memuat invoice',
      );
    }
  },
);

/* ─── Admin: All Requests ─── */
export const fetchAllRequests = createAsyncThunk<InsuranceRequest[]>(
  'requests/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get<InsuranceRequest[]>('/insurance-requests');
      return data;
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Gagal memuat request');
    }
  },
);

/* ─── Admin: Approve ─── */
export const approveRequest = createAsyncThunk<InsuranceRequest, string>(
  'requests/approve',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.patch<InsuranceRequest>(
        `/insurance-requests/${id}/approve`,
      );
      return data;
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Gagal approve request');
    }
  },
);

/* ─── Admin: Reject ─── */
export const rejectRequest = createAsyncThunk<InsuranceRequest, string>(
  'requests/reject',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.patch<InsuranceRequest>(
        `/insurance-requests/${id}/reject`,
      );
      return data;
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Gagal reject request');
    }
  },
);

const requestSlice = createSlice({
  name: 'requests',
  initialState,
  reducers: {
    clearRequestError: (state) => {
      state.error = null;
    },
    setSelectedRequest: (state, action: PayloadAction<InsuranceRequest | null>) => {
      state.selectedRequest = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create
      .addCase(createInsuranceRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createInsuranceRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.requests.unshift(action.payload);
        state.selectedRequest = action.payload;
      })
      .addCase(createInsuranceRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch My
      .addCase(fetchMyRequests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.requests = action.payload;
      })
      .addCase(fetchMyRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch by Invoice
      .addCase(fetchRequestByInvoice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRequestByInvoice.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedRequest = action.payload;
      })
      .addCase(fetchRequestByInvoice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch All
      .addCase(fetchAllRequests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.requests = action.payload;
      })
      .addCase(fetchAllRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Approve
      .addCase(approveRequest.fulfilled, (state, action) => {
        const index = state.requests.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) state.requests[index] = action.payload;
      })
      // Reject
      .addCase(rejectRequest.fulfilled, (state, action) => {
        const index = state.requests.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) state.requests[index] = action.payload;
      });
  },
});

export const { clearRequestError, setSelectedRequest } = requestSlice.actions;
export default requestSlice.reducer;

