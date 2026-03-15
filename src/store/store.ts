import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import requestReducer from './slices/requestSlice';
import occupationReducer from './slices/occupationSlice';
import policyReducer from './slices/policySlice';
import branchReducer from './slices/branchSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    requests: requestReducer,
    occupations: occupationReducer,
    policies: policyReducer,
    branches: branchReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
