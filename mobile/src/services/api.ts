import axios, { AxiosInstance, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_ENDPOINTS, STORAGE_KEYS } from '../utils/constants';
import { 
  ApiResponse, 
  PaginatedResponse, 
  User, 
  Product, 
  Sale, 
  Expense, 
  DashboardMetrics,
  DashboardCharts,
  DashboardInsights,
  Alert,
  LoginRequest,
  RegisterRequest
} from '../types';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem(STORAGE_KEYS.authToken);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          await AsyncStorage.multiRemove([STORAGE_KEYS.authToken, STORAGE_KEYS.user]);
          // Navigate to login screen - this should be handled by the app
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth API
  async login(credentials: LoginRequest): Promise<{ user: User; token: string }> {
    const response = await this.client.post<ApiResponse<{ user: User; token: string }>>(
      API_ENDPOINTS.login,
      credentials
    );
    return response.data.data!;
  }

  async register(userData: RegisterRequest): Promise<{ user: User; token: string }> {
    const response = await this.client.post<ApiResponse<{ user: User; token: string }>>(
      API_ENDPOINTS.register,
      userData
    );
    return response.data.data!;
  }

  async getMe(): Promise<User> {
    const response = await this.client.get<ApiResponse<{ user: User }>>(API_ENDPOINTS.me);
    return response.data.data!.user;
  }

  async logout(): Promise<void> {
    await this.client.post(API_ENDPOINTS.logout);
  }

  // Dashboard API
  async getDashboard(params?: { period?: string; currency?: string }): Promise<{
    period: { type: string; startDate: Date; endDate: Date };
    metrics: DashboardMetrics;
    charts: DashboardCharts;
    insights: DashboardInsights;
  }> {
    const response = await this.client.get(API_ENDPOINTS.dashboard, { params });
    return response.data.data;
  }

  async getDashboardAlerts(): Promise<{ alerts: Alert[]; count: number }> {
    const response = await this.client.get(API_ENDPOINTS.dashboardAlerts);
    return response.data.data;
  }

  // Inventory API
  async getInventory(params?: {
    page?: number;
    limit?: number;
    category?: string;
    status?: string;
    brand?: string;
    search?: string;
  }): Promise<{
    products: Product[];
    pagination: PaginatedResponse<Product>['pagination'];
    summary: any;
  }> {
    const response = await this.client.get(API_ENDPOINTS.inventory, { params });
    return response.data.data;
  }

  async getProduct(id: string): Promise<Product> {
    const response = await this.client.get<ApiResponse<Product>>(`${API_ENDPOINTS.inventory}/${id}`);
    return response.data.data!;
  }

  async createProduct(productData: Partial<Product>): Promise<Product> {
    const response = await this.client.post<ApiResponse<Product>>(
      API_ENDPOINTS.inventory,
      productData
    );
    return response.data.data!;
  }

  async updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
    const response = await this.client.put<ApiResponse<Product>>(
      `${API_ENDPOINTS.inventory}/${id}`,
      productData
    );
    return response.data.data!;
  }

  async deleteProduct(id: string): Promise<void> {
    await this.client.delete(`${API_ENDPOINTS.inventory}/${id}`);
  }

  async bulkImportProducts(products: Partial<Product>[]): Promise<{
    imported: number;
    failed: number;
  }> {
    const response = await this.client.post(API_ENDPOINTS.inventoryBulk, { products });
    return response.data.data;
  }

  async getInventoryAnalytics(): Promise<{
    overview: any;
    categoryBreakdown: any[];
    lowStockItems: Product[];
  }> {
    const response = await this.client.get(API_ENDPOINTS.inventoryAnalytics);
    return response.data.data;
  }

  // Sales API
  async getSales(params?: {
    page?: number;
    limit?: number;
    platform?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    product?: string;
  }): Promise<{
    sales: Sale[];
    pagination: PaginatedResponse<Sale>['pagination'];
  }> {
    const response = await this.client.get(API_ENDPOINTS.sales, { params });
    return response.data.data;
  }

  async getSale(id: string): Promise<Sale> {
    const response = await this.client.get<ApiResponse<Sale>>(`${API_ENDPOINTS.sales}/${id}`);
    return response.data.data!;
  }

  async createSale(saleData: Partial<Sale>): Promise<Sale> {
    const response = await this.client.post<ApiResponse<Sale>>(API_ENDPOINTS.sales, saleData);
    return response.data.data!;
  }

  async updateSale(id: string, saleData: Partial<Sale>): Promise<Sale> {
    const response = await this.client.put<ApiResponse<Sale>>(
      `${API_ENDPOINTS.sales}/${id}`,
      saleData
    );
    return response.data.data!;
  }

  async deleteSale(id: string): Promise<void> {
    await this.client.delete(`${API_ENDPOINTS.sales}/${id}`);
  }

  async getSalesAnalytics(params?: {
    startDate?: string;
    endDate?: string;
    period?: string;
  }): Promise<{
    period: { startDate: Date; endDate: Date };
    summary: any;
    platformBreakdown: any[];
    topProducts: any[];
    dailyTrend: any[];
  }> {
    const response = await this.client.get(API_ENDPOINTS.salesAnalytics, { params });
    return response.data.data;
  }

  // Expenses API
  async getExpenses(params?: {
    page?: number;
    limit?: number;
    category?: string;
    startDate?: string;
    endDate?: string;
    product?: string;
  }): Promise<{
    expenses: Expense[];
    pagination: PaginatedResponse<Expense>['pagination'];
  }> {
    const response = await this.client.get(API_ENDPOINTS.expenses, { params });
    return response.data.data;
  }

  async getExpense(id: string): Promise<Expense> {
    const response = await this.client.get<ApiResponse<Expense>>(`${API_ENDPOINTS.expenses}/${id}`);
    return response.data.data!;
  }

  async createExpense(expenseData: Partial<Expense>): Promise<Expense> {
    const response = await this.client.post<ApiResponse<Expense>>(
      API_ENDPOINTS.expenses,
      expenseData
    );
    return response.data.data!;
  }

  async updateExpense(id: string, expenseData: Partial<Expense>): Promise<Expense> {
    const response = await this.client.put<ApiResponse<Expense>>(
      `${API_ENDPOINTS.expenses}/${id}`,
      expenseData
    );
    return response.data.data!;
  }

  async deleteExpense(id: string): Promise<void> {
    await this.client.delete(`${API_ENDPOINTS.expenses}/${id}`);
  }

  async getExpensesAnalytics(params?: {
    startDate?: string;
    endDate?: string;
    period?: string;
  }): Promise<{
    period: { startDate: Date; endDate: Date };
    summary: any;
    categoryBreakdown: any[];
    monthlyTrend: any[];
  }> {
    const response = await this.client.get(API_ENDPOINTS.expensesAnalytics, { params });
    return response.data.data;
  }

  // User API
  async updateProfile(profileData: Partial<User>): Promise<User> {
    const response = await this.client.put<ApiResponse<User>>(
      API_ENDPOINTS.profile,
      profileData
    );
    return response.data.data!;
  }

  async updatePreferences(preferences: any): Promise<User> {
    const response = await this.client.put<ApiResponse<User>>(
      API_ENDPOINTS.preferences,
      preferences
    );
    return response.data.data!;
  }

  // Subscription API
  async getSubscriptionPlans(): Promise<any[]> {
    const response = await this.client.get(API_ENDPOINTS.subscriptionPlans);
    return response.data.data;
  }

  async getSubscriptionStatus(): Promise<any> {
    const response = await this.client.get(API_ENDPOINTS.subscriptionStatus);
    return response.data.data;
  }

  async createCheckoutSession(plan: string): Promise<{ sessionId: string; url: string }> {
    const response = await this.client.post(API_ENDPOINTS.subscriptionCheckout, { plan });
    return response.data.data;
  }

  async cancelSubscription(): Promise<any> {
    const response = await this.client.post(API_ENDPOINTS.subscriptionCancel);
    return response.data.data;
  }

  async reactivateSubscription(): Promise<any> {
    const response = await this.client.post(API_ENDPOINTS.subscriptionReactivate);
    return response.data.data;
  }

  // File Upload API
  async uploadImage(imageUri: string, folder: string = 'products'): Promise<{ url: string; publicId: string }> {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'image.jpg',
    } as any);
    formData.append('folder', folder);

    const response = await this.client.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data;
  }
}

export const apiService = new ApiService();
export default apiService;
