import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../../services/api';
import { Sale, PaginatedResponse } from '../../types';

interface SalesState {
  sales: Sale[];
  currentSale: Sale | null;
  pagination: PaginatedResponse<Sale>['pagination'] | null;
  analytics: {
    period: { startDate: Date; endDate: Date };
    summary: any;
    platformBreakdown: any[];
    topProducts: any[];
    dailyTrend: any[];
  } | null;
  filters: {
    platform?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    product?: string;
  };
  isLoading: boolean;
  isLoadingSale: boolean;
  isLoadingAnalytics: boolean;
  error: string | null;
}

const initialState: SalesState = {
  sales: [],
  currentSale: null,
  pagination: null,
  analytics: null,
  filters: {},
  isLoading: false,
  isLoadingSale: false,
  isLoadingAnalytics: false,
  error: null,
};

export const fetchSales = createAsyncThunk(
  'sales/fetchSales',
  async (params: {
    page?: number;
    limit?: number;
    platform?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    product?: string;
  } = {}, { rejectWithValue }) => {
    try {
      const response = await apiService.getSales(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sales');
    }
  }
);

export const fetchSale = createAsyncThunk(
  'sales/fetchSale',
  async (saleId: string, { rejectWithValue }) => {
    try {
      const sale = await apiService.getSale(saleId);
      return sale;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sale');
    }
  }
);

export const createSale = createAsyncThunk(
  'sales/createSale',
  async (saleData: Partial<Sale>, { rejectWithValue }) => {
    try {
      const sale = await apiService.createSale(saleData);
      return sale;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create sale');
    }
  }
);

export const updateSale = createAsyncThunk(
  'sales/updateSale',
  async ({ id, data }: { id: string; data: Partial<Sale> }, { rejectWithValue }) => {
    try {
      const sale = await apiService.updateSale(id, data);
      return sale;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update sale');
    }
  }
);

export const deleteSale = createAsyncThunk(
  'sales/deleteSale',
  async (saleId: string, { rejectWithValue }) => {
    try {
      await apiService.deleteSale(saleId);
      return saleId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete sale');
    }
  }
);

export const fetchSalesAnalytics = createAsyncThunk(
  'sales/fetchAnalytics',
  async (params: {
    startDate?: string;
    endDate?: string;
    period?: string;
  } = {}, { rejectWithValue }) => {
    try {
      const analytics = await apiService.getSalesAnalytics(params);
      return analytics;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch analytics');
    }
  }
);

const salesSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    clearCurrentSale: (state) => {
      state.currentSale = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch sales
    builder
      .addCase(fetchSales.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSales.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sales = action.payload.sales;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchSales.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch sale
    builder
      .addCase(fetchSale.pending, (state) => {
        state.isLoadingSale = true;
        state.error = null;
      })
      .addCase(fetchSale.fulfilled, (state, action) => {
        state.isLoadingSale = false;
        state.currentSale = action.payload;
        state.error = null;
      })
      .addCase(fetchSale.rejected, (state, action) => {
        state.isLoadingSale = false;
        state.error = action.payload as string;
      });

    // Create sale
    builder
      .addCase(createSale.fulfilled, (state, action) => {
        state.sales.unshift(action.payload);
      })
      .addCase(createSale.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Update sale
    builder
      .addCase(updateSale.fulfilled, (state, action) => {
        const index = state.sales.findIndex(s => s._id === action.payload._id);
        if (index !== -1) {
          state.sales[index] = action.payload;
        }
        if (state.currentSale?._id === action.payload._id) {
          state.currentSale = action.payload;
        }
      })
      .addCase(updateSale.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Delete sale
    builder
      .addCase(deleteSale.fulfilled, (state, action) => {
        state.sales = state.sales.filter(s => s._id !== action.payload);
        if (state.currentSale?._id === action.payload) {
          state.currentSale = null;
        }
      })
      .addCase(deleteSale.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Fetch analytics
    builder
      .addCase(fetchSalesAnalytics.pending, (state) => {
        state.isLoadingAnalytics = true;
      })
      .addCase(fetchSalesAnalytics.fulfilled, (state, action) => {
        state.isLoadingAnalytics = false;
        state.analytics = action.payload;
      })
      .addCase(fetchSalesAnalytics.rejected, (state, action) => {
        state.isLoadingAnalytics = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setFilters, clearFilters, clearCurrentSale } = salesSlice.actions;
export default salesSlice;
