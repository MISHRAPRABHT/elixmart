import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/api';
import { setAccessToken, clearAccessToken } from '../../utils/authToken';

export const login = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try { const res = await API.post('/auth/login', data); return res.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Login failed'); }
});

export const signup = createAsyncThunk('auth/signup', async (data, { rejectWithValue }) => {
  try { const res = await API.post('/auth/signup', data); return res.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Signup failed'); }
});

export const refreshSession = createAsyncThunk('auth/refresh', async (_, { rejectWithValue }) => {
  try {
    const res = await API.post('/auth/refresh');
    return res.data;
  } catch (err) {
    // Always silently fail — refresh errors should never show toasts
    // (no cookie, invalid cookie after re-seed, inactivity expiry, etc.)
    return rejectWithValue(null);
  }
});

export const logoutServer = createAsyncThunk('auth/logoutServer', async (_, { rejectWithValue }) => {
  try { const res = await API.post('/auth/logout'); return res.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Logout failed'); }
});

export const getProfile = createAsyncThunk('auth/profile', async (_, { rejectWithValue }) => {
  try { const res = await API.get('/auth/me'); return res.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (data, { rejectWithValue }) => {
  try { const res = await API.put('/auth/profile', data); return res.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, loading: false, error: null },
  reducers: {
    logout: (state) => { state.user = null; clearAccessToken(); },
    clearError: (state) => { state.error = null; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(login.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload;
        setAccessToken(a.payload?.token);
      })
      .addCase(login.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(signup.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(signup.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload;
        setAccessToken(a.payload?.token);
      })
      .addCase(signup.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(refreshSession.fulfilled, (s, a) => {
        s.user = a.payload;
        setAccessToken(a.payload?.token);
      })
      .addCase(refreshSession.rejected, (s) => {
        s.user = null;
        // Never set error — refresh failures are silent
        clearAccessToken();
      })
      .addCase(logoutServer.fulfilled, (s) => {
        s.user = null;
        clearAccessToken();
      })
      .addCase(logoutServer.rejected, (s) => {
        // Even if server fails, clear local state to be safe
        s.user = null;
        clearAccessToken();
      })
      .addCase(getProfile.fulfilled, (s, a) => { s.user = { ...s.user, ...a.payload }; })
      .addCase(updateProfile.fulfilled, (s, a) => { s.user = { ...s.user, ...a.payload }; });
  }
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
