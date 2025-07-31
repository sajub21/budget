import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../../services/api';
import { DashboardMetrics, DashboardCharts, DashboardInsights, Alert } from '../../types';

interface DashboardState {
  metrics: DashboardMetrics | null;
  charts: DashboardCharts | null;
  insights: DashboardInsights | null;
  alerts: Alert[];
  period: {
    type: string;
    startDate: Date | null;
    endDate: Date | null;
  };
  isLoading: boolean;
  isLoadingAlerts: boolean;
  lastUpdated: string | null;
  error: string | null;
}

const initialState: DashboardState = {
  metrics: null,
  charts: null,
  insights: null,
  alerts: [],
  period: {
    type: 'month',
    startDate: null,
    endDate: null,
  },
  isLoading: false,
  isLoadingAlerts: false,
  lastUpdated: null,
  error: null,
};

export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchData',
  async (params: { period?: string; currency?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await apiService.getDashboard(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard data');
    }
  }
);

export const fetchDashboardAlerts = createAsyncThunk(
  'dashboard/fetchAlerts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getDashboardAlerts();
      return response.alerts;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch alerts');
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setPeriod: (state, action) => {
      state.period.type = action.payload;
    },
    dismissAlert: (state, action) => {
      state.alerts = state.alerts.filter((alert, index) => index !== action.payload);
    },
  },
  extraReducers: (builder) => {
    // Fetch dashboard data
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.metrics = action.payload.metrics;
        state.charts = action.payload.charts;
        state.insights = action.payload.insights;
        state.period = action.payload.period;
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch alerts
    builder
      .addCase(fetchDashboardAlerts.pending, (state) => {
        state.isLoadingAlerts = true;
      })
      .addCase(fetchDashboardAlerts.fulfilled, (state, action) => {
        state.isLoadingAlerts = false;
        state.alerts = action.payload;
      })
      .addCase(fetchDashboardAlerts.rejected, (state, action) => {
        state.isLoadingAlerts = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setPeriod, dismissAlert } = dashboardSlice.actions;
export default dashboardSlice;
