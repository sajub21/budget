import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../../services/api';
import { Product, PaginatedResponse } from '../../types';

interface InventoryState {
  products: Product[];
  currentProduct: Product | null;
  pagination: PaginatedResponse<Product>['pagination'] | null;
  summary: {
    total: number;
    active: number;
    lowStock: number;
    outOfStock: number;
    totalValue: number;
  } | null;
  analytics: {
    overview: any;
    categoryBreakdown: any[];
    lowStockItems: Product[];
  } | null;
  filters: {
    category?: string;
    status?: string;
    brand?: string;
    search?: string;
  };
  isLoading: boolean;
  isLoadingProduct: boolean;
  isLoadingAnalytics: boolean;
  error: string | null;
}

const initialState: InventoryState = {
  products: [],
  currentProduct: null,
  pagination: null,
  summary: null,
  analytics: null,
  filters: {},
  isLoading: false,
  isLoadingProduct: false,
  isLoadingAnalytics: false,
  error: null,
};

export const fetchInventory = createAsyncThunk(
  'inventory/fetchInventory',
  async (params: {
    page?: number;
    limit?: number;
    category?: string;
    status?: string;
    brand?: string;
    search?: string;
  } = {}, { rejectWithValue }) => {
    try {
      const response = await apiService.getInventory(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch inventory');
    }
  }
);

export const fetchProduct = createAsyncThunk(
  'inventory/fetchProduct',
  async (productId: string, { rejectWithValue }) => {
    try {
      const product = await apiService.getProduct(productId);
      return product;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch product');
    }
  }
);

export const createProduct = createAsyncThunk(
  'inventory/createProduct',
  async (productData: Partial<Product>, { rejectWithValue }) => {
    try {
      const product = await apiService.createProduct(productData);
      return product;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create product');
    }
  }
);

export const updateProduct = createAsyncThunk(
  'inventory/updateProduct',
  async ({ id, data }: { id: string; data: Partial<Product> }, { rejectWithValue }) => {
    try {
      const product = await apiService.updateProduct(id, data);
      return product;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update product');
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'inventory/deleteProduct',
  async (productId: string, { rejectWithValue }) => {
    try {
      await apiService.deleteProduct(productId);
      return productId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete product');
    }
  }
);

export const fetchInventoryAnalytics = createAsyncThunk(
  'inventory/fetchAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const analytics = await apiService.getInventoryAnalytics();
      return analytics;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch analytics');
    }
  }
);

const inventorySlice = createSlice({
  name: 'inventory',
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
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch inventory
    builder
      .addCase(fetchInventory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload.products;
        state.pagination = action.payload.pagination;
        state.summary = action.payload.summary;
        state.error = null;
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch product
    builder
      .addCase(fetchProduct.pending, (state) => {
        state.isLoadingProduct = true;
        state.error = null;
      })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.isLoadingProduct = false;
        state.currentProduct = action.payload;
        state.error = null;
      })
      .addCase(fetchProduct.rejected, (state, action) => {
        state.isLoadingProduct = false;
        state.error = action.payload as string;
      });

    // Create product
    builder
      .addCase(createProduct.fulfilled, (state, action) => {
        state.products.unshift(action.payload);
        if (state.summary) {
          state.summary.total += 1;
        }
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Update product
    builder
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.products.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
        if (state.currentProduct?._id === action.payload._id) {
          state.currentProduct = action.payload;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Delete product
    builder
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter(p => p._id !== action.payload);
        if (state.currentProduct?._id === action.payload) {
          state.currentProduct = null;
        }
        if (state.summary) {
          state.summary.total -= 1;
        }
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Fetch analytics
    builder
      .addCase(fetchInventoryAnalytics.pending, (state) => {
        state.isLoadingAnalytics = true;
      })
      .addCase(fetchInventoryAnalytics.fulfilled, (state, action) => {
        state.isLoadingAnalytics = false;
        state.analytics = action.payload;
      })
      .addCase(fetchInventoryAnalytics.rejected, (state, action) => {
        state.isLoadingAnalytics = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setFilters, clearFilters, clearCurrentProduct } = inventorySlice.actions;
export default inventorySlice;
