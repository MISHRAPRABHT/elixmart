import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/api';

export const createOrder = createAsyncThunk('orders/create', async (data, { rejectWithValue }) => {
  try { const res = await API.post('/orders/create', data); return res.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const fetchOrders = createAsyncThunk('orders/fetch', async (_, { rejectWithValue }) => {
  try { const res = await API.get('/orders'); return res.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const fetchOrder = createAsyncThunk('orders/fetchOne', async (id, { rejectWithValue }) => {
  try { const res = await API.get(`/orders/${id}`); return res.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

const orderSlice = createSlice({
  name: 'orders',
  initialState: { orders: [], order: null, loading: false, error: null },
  reducers: { clearOrder: (s) => { s.order = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (s) => { s.loading = true; })
      .addCase(createOrder.fulfilled, (s, a) => { s.loading = false; s.order = a.payload; })
      .addCase(createOrder.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchOrders.pending, (s) => { s.loading = true; })
      .addCase(fetchOrders.fulfilled, (s, a) => { s.loading = false; s.orders = a.payload; })
      .addCase(fetchOrders.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchOrder.pending, (s) => { s.loading = true; })
      .addCase(fetchOrder.fulfilled, (s, a) => { s.loading = false; s.order = a.payload; })
      .addCase(fetchOrder.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
  }
});

export const { clearOrder } = orderSlice.actions;
export default orderSlice.reducer;
