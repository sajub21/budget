// User Types
export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  businessName?: string;
  currency: 'GBP' | 'USD' | 'EUR';
  subscription: {
    type: 'free' | 'pro';
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    currentPeriodEnd?: Date;
    cancelAtPeriodEnd?: boolean;
  };
  integrations: {
    vinted: {
      connected: boolean;
      lastSync?: Date;
    };
    depop: {
      connected: boolean;
      lastSync?: Date;
    };
  };
  preferences: {
    notifications: {
      lowStock: boolean;
      profitGoals: boolean;
      weeklyReports: boolean;
    };
    restockThreshold: number;
    darkMode: boolean;
  };
  createdAt: Date;
  lastLogin?: Date;
}

// Product Types
export interface Product {
  _id: string;
  user: string;
  name: string;
  brand?: string;
  category: ProductCategory;
  condition: ProductCondition;
  size?: string;
  color?: string;
  description?: string;
  sku: string;
  barcode?: string;
  images: ProductImage[];
  pricing: {
    purchasePrice: number;
    listingPrice?: number;
    recommendedPrice?: number;
  };
  inventory: {
    quantity: number;
    restockThreshold: number;
    location?: string;
  };
  source: ProductSource;
  purchaseDate: Date;
  tags: string[];
  status: ProductStatus;
  platforms: ProductPlatform[];
  analytics: {
    views: number;
    likes: number;
    inquiries: number;
    totalSales: number;
    lastViewed?: Date;
  };
  notes?: string;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ProductCategory = 
  | 'Clothing' 
  | 'Shoes' 
  | 'Bags' 
  | 'Accessories' 
  | 'Electronics' 
  | 'Books' 
  | 'Home & Garden' 
  | 'Sports' 
  | 'Beauty' 
  | 'Other';

export type ProductCondition = 
  | 'New with tags' 
  | 'New without tags' 
  | 'Excellent' 
  | 'Good' 
  | 'Fair' 
  | 'Poor';

export type ProductSource = 
  | 'Retail Store' 
  | 'Online' 
  | 'Thrift Store' 
  | 'Wholesale' 
  | 'Donation' 
  | 'Other';

export type ProductStatus = 'active' | 'low_stock' | 'out_of_stock' | 'archived';

export interface ProductImage {
  url: string;
  publicId?: string;
  isMain: boolean;
}

export interface ProductPlatform {
  platform: Platform;
  listingId?: string;
  url?: string;
  isActive: boolean;
  listedAt?: Date;
}

// Sale Types
export interface Sale {
  _id: string;
  user: string;
  product: Product | string;
  quantity: number;
  salePrice: number;
  currency: 'GBP' | 'USD' | 'EUR';
  platform: Platform;
  platformOrderId?: string;
  buyer: {
    username?: string;
    name?: string;
    email?: string;
    rating?: number;
  };
  fees: {
    platformFee: number;
    paymentFee: number;
    shippingFee: number;
    promotionDiscount: number;
    other: number;
  };
  shipping: {
    method?: string;
    cost: number;
    paidByBuyer: boolean;
    trackingNumber?: string;
    carrier?: string;
    weight?: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
    };
  };
  saleDate: Date;
  shippedDate?: Date;
  deliveredDate?: Date;
  status: SaleStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  customerNote?: string;
  internalNotes?: string;
  tags: string[];
  returns: {
    isReturned: boolean;
    returnDate?: Date;
    returnReason?: string;
    refundAmount?: number;
    restocked: boolean;
  };
  rating: {
    received?: number;
    given?: number;
    review?: string;
  };
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Computed fields
  netAmount?: number;
  profit?: number;
  profitMargin?: number;
}

export type SaleStatus = 
  | 'pending' 
  | 'paid' 
  | 'shipped' 
  | 'delivered' 
  | 'completed' 
  | 'cancelled' 
  | 'refunded';

export type PaymentMethod = 
  | 'Platform Wallet' 
  | 'PayPal' 
  | 'Stripe' 
  | 'Bank Transfer' 
  | 'Cash' 
  | 'Other';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export type Platform = 
  | 'vinted' 
  | 'depop' 
  | 'ebay' 
  | 'facebook' 
  | 'instagram' 
  | 'in_person' 
  | 'other';

// Expense Types
export interface Expense {
  _id: string;
  user: string;
  amount: number;
  currency: 'GBP' | 'USD' | 'EUR';
  category: ExpenseCategory;
  subcategory?: string;
  description: string;
  vendor?: string;
  receipt?: {
    url: string;
    publicId?: string;
  };
  date: Date;
  product?: Product | string;
  sale?: Sale | string;
  platform?: Platform;
  isRecurring: boolean;
  recurringDetails?: {
    frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    nextDate: Date;
    endDate?: Date;
  };
  tags: string[];
  paymentMethod: ExpensePaymentMethod;
  taxDeductible: boolean;
  notes?: string;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ExpenseCategory = 
  | 'Product Cost'
  | 'Packaging'
  | 'Shipping'
  | 'Platform Fees'
  | 'Marketing & Ads'
  | 'Equipment'
  | 'Office Supplies'
  | 'Travel'
  | 'Storage'
  | 'Professional Services'
  | 'Other';

export type ExpensePaymentMethod = 'Cash' | 'Card' | 'Bank Transfer' | 'PayPal' | 'Other';

// Dashboard Types
export interface DashboardMetrics {
  inventory: {
    totalProducts: number;
    totalValue: number;
    lowStockItems: number;
    outOfStockItems: number;
  };
  sales: {
    totalSales: number;
    totalRevenue: number;
    totalFees: number;
    netRevenue: number;
    averageOrderValue: number;
    growth: number;
  };
  expenses: {
    totalExpenses: number;
    expenseCount: number;
  };
  profit: {
    netProfit: number;
    profitMargin: number;
    revenueGrowth: number;
  };
}

export interface DashboardCharts {
  salesTrend: Array<{
    _id: { year: number; month: number; day: number };
    sales: number;
    revenue: number;
  }>;
  platformPerformance: Array<{
    _id: Platform;
    sales: number;
    revenue: number;
  }>;
  expenseBreakdown: Array<{
    _id: ExpenseCategory;
    amount: number;
    count: number;
  }>;
}

export interface DashboardInsights {
  topProducts: Array<{
    _id: string;
    product: Product;
    totalSold: number;
    totalRevenue: number;
  }>;
  recentSales: Sale[];
}

export interface Alert {
  type: 'low_stock' | 'out_of_stock' | 'subscription_limit' | 'pending_sales';
  severity: 'info' | 'warning' | 'error';
  title: string;
  message: string;
  data?: any;
  actionRequired: boolean;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  businessName?: string;
  currency?: 'GBP' | 'USD' | 'EUR';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Login: undefined;
  Register: undefined;
  Dashboard: undefined;
  Inventory: undefined;
  Sales: undefined;
  Expenses: undefined;
  Profile: undefined;
  ProductDetails: { productId: string };
  AddProduct: { productId?: string };
  SaleDetails: { saleId: string };
  AddSale: { saleId?: string };
  ExpenseDetails: { expenseId: string };
  AddExpense: { expenseId?: string };
  Settings: undefined;
  Subscription: undefined;
};

export type BottomTabParamList = {
  Dashboard: undefined;
  Inventory: undefined;
  Sales: undefined;
  Expenses: undefined;
  More: undefined;
};
