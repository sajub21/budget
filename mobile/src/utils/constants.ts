// Design System Constants
export const COLORS = {
  // Brand Colors (from specification)
  background: '#F7F9FA',
  primary: '#24292F',
  accent: '#63D2FF',
  accentSecondary: '#4ECDC4',
  
  // Semantic Colors
  success: '#4ECDC4',
  warning: '#FFB347',
  error: '#FF6B6B',
  info: '#63D2FF',
  
  // Text Colors
  textPrimary: '#24292F',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textOnPrimary: '#FFFFFF',
  
  // UI Colors
  white: '#FFFFFF',
  border: '#E5E7EB',
  inputBackground: '#F9FAFB',
  cardBackground: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.5)',
  
  // Status Colors
  active: '#10B981',
  inactive: '#6B7280',
  lowStock: '#F59E0B',
  outOfStock: '#EF4444',
  
  // Platform Colors
  vinted: '#09B1BA',
  depop: '#FF6B6B',
  ebay: '#E53238',
  facebook: '#1877F2',
  instagram: '#E4405F',
};

export const TYPOGRAPHY = {
  // Font Families (from specification)
  headerFont: 'Inter-SemiBold',
  bodyFont: 'Manrope-Regular',
  
  // Font Sizes
  h1: 32,
  h2: 28,
  h3: 24,
  h4: 20,
  h5: 18,
  h6: 16,
  body: 16,
  bodySmall: 14,
  caption: 12,
  
  // Font Weights
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

// Business Constants
export const CURRENCIES = {
  GBP: { symbol: '£', name: 'British Pound' },
  USD: { symbol: '$', name: 'US Dollar' },
  EUR: { symbol: '€', name: 'Euro' },
};

export const PRODUCT_CATEGORIES = [
  'Clothing',
  'Shoes',
  'Bags',
  'Accessories',
  'Electronics',
  'Books',
  'Home & Garden',
  'Sports',
  'Beauty',
  'Other',
] as const;

export const PRODUCT_CONDITIONS = [
  'New with tags',
  'New without tags',
  'Excellent',
  'Good',
  'Fair',
  'Poor',
] as const;

export const PRODUCT_SOURCES = [
  'Retail Store',
  'Online',
  'Thrift Store',
  'Wholesale',
  'Donation',
  'Other',
] as const;

export const PLATFORMS = [
  { id: 'vinted', name: 'Vinted', color: COLORS.vinted },
  { id: 'depop', name: 'Depop', color: COLORS.depop },
  { id: 'ebay', name: 'eBay', color: COLORS.ebay },
  { id: 'facebook', name: 'Facebook', color: COLORS.facebook },
  { id: 'instagram', name: 'Instagram', color: COLORS.instagram },
  { id: 'in_person', name: 'In Person', color: COLORS.primary },
  { id: 'other', name: 'Other', color: COLORS.textSecondary },
] as const;

export const EXPENSE_CATEGORIES = [
  'Product Cost',
  'Packaging',
  'Shipping',
  'Platform Fees',
  'Marketing & Ads',
  'Equipment',
  'Office Supplies',
  'Travel',
  'Storage',
  'Professional Services',
  'Other',
] as const;

export const SALE_STATUSES = [
  { id: 'pending', name: 'Pending', color: COLORS.warning },
  { id: 'paid', name: 'Paid', color: COLORS.info },
  { id: 'shipped', name: 'Shipped', color: COLORS.accent },
  { id: 'delivered', name: 'Delivered', color: COLORS.accentSecondary },
  { id: 'completed', name: 'Completed', color: COLORS.success },
  { id: 'cancelled', name: 'Cancelled', color: COLORS.textSecondary },
  { id: 'refunded', name: 'Refunded', color: COLORS.error },
] as const;

// API Constants
export const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api' 
  : 'https://api.loft-reseller.com/api';

export const API_ENDPOINTS = {
  // Auth
  login: '/auth/login',
  register: '/auth/register',
  me: '/auth/me',
  logout: '/auth/logout',
  
  // Inventory
  inventory: '/inventory',
  inventoryAnalytics: '/inventory/analytics/overview',
  inventoryBulk: '/inventory/bulk',
  
  // Sales
  sales: '/sales',
  salesAnalytics: '/sales/analytics/summary',
  
  // Expenses
  expenses: '/expenses',
  expensesAnalytics: '/expenses/analytics/summary',
  
  // Dashboard
  dashboard: '/dashboard',
  dashboardAlerts: '/dashboard/alerts',
  
  // User
  profile: '/users/profile',
  preferences: '/users/preferences',
  
  // Subscriptions
  subscriptionPlans: '/subscriptions/plans',
  subscriptionStatus: '/subscriptions/status',
  subscriptionCheckout: '/subscriptions/create-checkout',
  subscriptionCancel: '/subscriptions/cancel',
  subscriptionReactivate: '/subscriptions/reactivate',
};

// Storage Keys
export const STORAGE_KEYS = {
  authToken: '@loft_auth_token',
  user: '@loft_user',
  preferences: '@loft_preferences',
  onboardingCompleted: '@loft_onboarding_completed',
};

// Animation Constants
export const ANIMATION_DURATION = {
  fast: 200,
  normal: 300,
  slow: 500,
};

// App Constants
export const APP_CONFIG = {
  name: 'LOFT',
  version: '1.0.0',
  buildNumber: 1,
  supportEmail: 'support@loft-reseller.com',
  privacyPolicyUrl: 'https://loft-reseller.com/privacy',
  termsOfServiceUrl: 'https://loft-reseller.com/terms',
};

// Free Tier Limits
export const FREE_TIER_LIMITS = {
  maxProducts: 100,
  features: {
    apiIntegrations: false,
    advancedAnalytics: false,
    bulkImport: false,
    multiUser: false,
  },
};

// Chart Colors
export const CHART_COLORS = [
  COLORS.accent,
  COLORS.accentSecondary,
  COLORS.success,
  COLORS.warning,
  COLORS.error,
  COLORS.info,
  COLORS.primary,
  COLORS.textSecondary,
];
