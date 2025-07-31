import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../../services/api';
import { Expense, PaginatedResponse } from '../../types';

interface ExpensesState {
  expenses: Expense[];
  currentExpense: Expense | null;
  pagination: PaginatedResponse<Expense>['pagination'] | null;
  analytics: {
    period: { startDate: Date; endDate: Date };
    summary: any;
    categoryBreakdown: any[];
    monthlyTrend: any[];
  } | null;
  filters: {
    category?: string;
    startDate?: string;
    endDate?: string;
    product?: string;
  };
  isLoading: boolean;
  isLoadingExpense: boolean;
  isLoadingAnalytics: boolean;
  error: string | null;
}

const initialState: ExpensesState = {
  expenses: [],
  currentExpense: null,
  pagination: null,
  analytics: null,
  filters: {},
  isLoading: false,
  isLoadingExpense: false,
  isLoadingAnalytics: false,
  error: null,
};

export const fetchExpenses = createAsyncThunk(
  'expenses/fetchExpenses',
  async (params: {
    page?: number;
    limit?: number;
    category?: string;
    startDate?: string;
    endDate?: string;
    product?: string;
  } = {}, { rejectWithValue }) => {
    try {
      const response = await apiService.getExpenses(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch expenses');
    }
  }
);

export const fetchExpense = createAsyncThunk(
  'expenses/fetchExpense',
  async (expenseId: string, { rejectWithValue }) => {
    try {
      const expense = await apiService.getExpense(expenseId);
      return expense;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch expense');
    }
  }
);

export const createExpense = createAsyncThunk(
  'expenses/createExpense',
  async (expenseData: Partial<Expense>, { rejectWithValue }) => {
    try {
      const expense = await apiService.createExpense(expenseData);
      return expense;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create expense');
    }
  }
);

export const updateExpense = createAsyncThunk(
  'expenses/updateExpense',
  async ({ id, data }: { id: string; data: Partial<Expense> }, { rejectWithValue }) => {
    try {
      const expense = await apiService.updateExpense(id, data);
      return expense;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update expense');
    }
  }
);

export const deleteExpense = createAsyncThunk(
  'expenses/deleteExpense',
  async (expenseId: string, { rejectWithValue }) => {
    try {
      await apiService.deleteExpense(expenseId);
      return expenseId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete expense');
    }
  }
);

export const fetchExpensesAnalytics = createAsyncThunk(
  'expenses/fetchAnalytics',
  async (params: {
    startDate?: string;
    endDate?: string;
    period?: string;
  } = {}, { rejectWithValue }) => {
    try {
      const analytics = await apiService.getExpensesAnalytics(params);
      return analytics;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch analytics');
    }
  }
);

const expensesSlice = createSlice({
  name: 'expenses',
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
    clearCurrentExpense: (state) => {
      state.currentExpense = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch expenses
    builder
      .addCase(fetchExpenses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.expenses = action.payload.expenses;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch expense
    builder
      .addCase(fetchExpense.pending, (state) => {
        state.isLoadingExpense = true;
        state.error = null;
      })
      .addCase(fetchExpense.fulfilled, (state, action) => {
        state.isLoadingExpense = false;
        state.currentExpense = action.payload;
        state.error = null;
      })
      .addCase(fetchExpense.rejected, (state, action) => {
        state.isLoadingExpense = false;
        state.error = action.payload as string;
      });

    // Create expense
    builder
      .addCase(createExpense.fulfilled, (state, action) => {
        state.expenses.unshift(action.payload);
      })
      .addCase(createExpense.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Update expense
    builder
      .addCase(updateExpense.fulfilled, (state, action) => {
        const index = state.expenses.findIndex(e => e._id === action.payload._id);
        if (index !== -1) {
          state.expenses[index] = action.payload;
        }
        if (state.currentExpense?._id === action.payload._id) {
          state.currentExpense = action.payload;
        }
      })
      .addCase(updateExpense.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Delete expense
    builder
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.expenses = state.expenses.filter(e => e._id !== action.payload);
        if (state.currentExpense?._id === action.payload) {
          state.currentExpense = null;
        }
      })
      .addCase(deleteExpense.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Fetch analytics
    builder
      .addCase(fetchExpensesAnalytics.pending, (state) => {
        state.isLoadingAnalytics = true;
      })
      .addCase(fetchExpensesAnalytics.fulfilled, (state, action) => {
        state.isLoadingAnalytics = false;
        state.analytics = action.payload;
      })
      .addCase(fetchExpensesAnalytics.rejected, (state, action) => {
        state.isLoadingAnalytics = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setFilters, clearFilters, clearCurrentExpense } = expensesSlice.actions;
export default expensesSlice;
