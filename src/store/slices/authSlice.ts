import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/lib/api';
import type { User, AuthResponse, LoginPayload, RegisterPayload } from '@/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('user') || 'null')
    : null,
  accessToken: typeof window !== 'undefined'
    ? localStorage.getItem('accessToken')
    : null,
  isLoading: false,
  error: null,
};

export const login = createAsyncThunk<AuthResponse, LoginPayload>(
  'auth/login',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post<AuthResponse>('/auth/login', payload);
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data;
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message || 'Login gagal',
      );
    }
  },
);

export const register = createAsyncThunk<AuthResponse, RegisterPayload>(
  'auth/register',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post<AuthResponse>('/auth/register', payload);
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data;
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message || 'Registrasi gagal',
      );
    }
  },
);

export const updateProfile = createAsyncThunk<User, { name: string; email: string }>(
  'auth/updateProfile',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.patch<User>('/users/me', payload);
      localStorage.setItem('user', JSON.stringify(data));
      return data;
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message || 'Update gagal',
      );
    }
  },
);

export const uploadProfilePhoto = createAsyncThunk<User, File>(
  'auth/uploadProfilePhoto',
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const { data } = await api.post<User>('/users/me/photo', formData);

      localStorage.setItem('user', JSON.stringify(data));
      return data;
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message || 'Upload foto profil gagal',
      );
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.error = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Upload Profile Photo
      .addCase(uploadProfilePhoto.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadProfilePhoto.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(uploadProfilePhoto.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
