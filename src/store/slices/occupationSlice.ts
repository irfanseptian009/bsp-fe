import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/api';
import type {
  OccupationType,
  CreateOccupationTypePayload,
  UpdateOccupationTypePayload,
} from '@/types';

interface OccupationState {
  occupationTypes: OccupationType[];
  isLoading: boolean;
  error: string | null;
}

const mapOccupationError = (message?: string) => {
  if (!message) return 'Gagal memproses data tipe okupasi.';

  const normalized = message.toLowerCase();
  if (normalized.includes('sudah digunakan')) {
    return 'Kode okupasi sudah digunakan. Gunakan kode lain.';
  }

  if (normalized.includes('wajib diisi') || normalized.includes('tidak boleh kosong')) {
    return message;
  }

  return message;
};

const initialState: OccupationState = {
  occupationTypes: [],
  isLoading: false,
  error: null,
};

export const fetchOccupationTypes = createAsyncThunk<OccupationType[]>(
  'occupations/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get<OccupationType[]>('/occupation-types');
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Gagal memuat data');
    }
  },
);

export const createOccupationType = createAsyncThunk<
  OccupationType,
  CreateOccupationTypePayload
>('occupations/create', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post<OccupationType>(
      '/occupation-types',
      payload,
    );
    return data;
  } catch (error: any) {
    return rejectWithValue(
      mapOccupationError(error.response?.data?.message || 'Gagal menambah data'),
    );
  }
});

export const updateOccupationType = createAsyncThunk<
  OccupationType,
  { id: string; payload: UpdateOccupationTypePayload }
>('occupations/update', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const { data } = await api.patch<OccupationType>(
      `/occupation-types/${id}`,
      payload,
    );
    return data;
  } catch (error: any) {
    return rejectWithValue(
      mapOccupationError(error.response?.data?.message || 'Gagal update data'),
    );
  }
});

export const deleteOccupationType = createAsyncThunk<string, string>(
  'occupations/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/occupation-types/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Gagal menghapus data');
    }
  },
);

const occupationSlice = createSlice({
  name: 'occupations',
  initialState,
  reducers: {
    clearOccupationError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOccupationTypes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOccupationTypes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.occupationTypes = action.payload;
      })
      .addCase(fetchOccupationTypes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createOccupationType.fulfilled, (state, action) => {
        state.occupationTypes.push(action.payload);
      })
      .addCase(updateOccupationType.fulfilled, (state, action) => {
        const index = state.occupationTypes.findIndex(
          (o) => o.id === action.payload.id,
        );
        if (index !== -1) state.occupationTypes[index] = action.payload;
      })
      .addCase(deleteOccupationType.fulfilled, (state, action) => {
        state.occupationTypes = state.occupationTypes.filter(
          (o) => o.id !== action.payload,
        );
      });
  },
});

export const { clearOccupationError } = occupationSlice.actions;
export default occupationSlice.reducer;
