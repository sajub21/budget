import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AppState {
  isOnboardingCompleted: boolean;
  isDarkMode: boolean;
  currentCurrency: 'GBP' | 'USD' | 'EUR';
  notificationSettings: {
    lowStock: boolean;
    profitGoals: boolean;
    weeklyReports: boolean;
    pushNotifications: boolean;
  };
  appVersion: string;
  lastSyncTime: string | null;
}

const initialState: AppState = {
  isOnboardingCompleted: false,
  isDarkMode: false,
  currentCurrency: 'GBP',
  notificationSettings: {
    lowStock: true,
    profitGoals: true,
    weeklyReports: true,
    pushNotifications: true,
  },
  appVersion: '1.0.0',
  lastSyncTime: null,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    completeOnboarding: (state) => {
      state.isOnboardingCompleted = true;
    },
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode;
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
    },
    setCurrency: (state, action: PayloadAction<'GBP' | 'USD' | 'EUR'>) => {
      state.currentCurrency = action.payload;
    },
    updateNotificationSettings: (state, action: PayloadAction<Partial<AppState['notificationSettings']>>) => {
      state.notificationSettings = { ...state.notificationSettings, ...action.payload };
    },
    setLastSyncTime: (state, action: PayloadAction<string>) => {
      state.lastSyncTime = action.payload;
    },
  },
});

export const {
  completeOnboarding,
  toggleDarkMode,
  setDarkMode,
  setCurrency,
  updateNotificationSettings,
  setLastSyncTime,
} = appSlice.actions;

export default appSlice;
