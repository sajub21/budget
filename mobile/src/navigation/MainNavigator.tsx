import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { BottomTabParamList, RootStackParamList } from '../types';
import { COLORS, TYPOGRAPHY } from '../utils/constants';

// Screen imports
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import InventoryScreen from '../screens/inventory/InventoryScreen';
import SalesScreen from '../screens/sales/SalesScreen';
import ExpensesScreen from '../screens/expenses/ExpensesScreen';
import MoreScreen from '../screens/more/MoreScreen';

// Modal/Detail screens
import ProductDetailsScreen from '../screens/inventory/ProductDetailsScreen';
import AddProductScreen from '../screens/inventory/AddProductScreen';
import SaleDetailsScreen from '../screens/sales/SaleDetailsScreen';
import AddSaleScreen from '../screens/sales/AddSaleScreen';
import ExpenseDetailsScreen from '../screens/expenses/ExpenseDetailsScreen';
import AddExpenseScreen from '../screens/expenses/AddExpenseScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import SubscriptionScreen from '../screens/subscription/SubscriptionScreen';

const Tab = createBottomTabNavigator<BottomTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Dashboard':
              iconName = 'dashboard';
              break;
            case 'Inventory':
              iconName = 'inventory';
              break;
            case 'Sales':
              iconName = 'trending-up';
              break;
            case 'Expenses':
              iconName = 'receipt';
              break;
            case 'More':
              iconName = 'more-horiz';
              break;
            default:
              iconName = 'help';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: TYPOGRAPHY.bodyFont,
          fontWeight: TYPOGRAPHY.medium,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Inventory"
        component={InventoryScreen}
        options={{
          tabBarLabel: 'Inventory',
        }}
      />
      <Tab.Screen
        name="Sales"
        component={SalesScreen}
        options={{
          tabBarLabel: 'Sales',
        }}
      />
      <Tab.Screen
        name="Expenses"
        component={ExpensesScreen}
        options={{
          tabBarLabel: 'Expenses',
        }}
      />
      <Tab.Screen
        name="More"
        component={MoreScreen}
        options={{
          tabBarLabel: 'More',
        }}
      />
    </Tab.Navigator>
  );
};

const MainNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen name="Dashboard" component={TabNavigator} />
      
      {/* Modal screens */}
      <Stack.Group screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen 
          name="ProductDetails" 
          component={ProductDetailsScreen}
          options={{ headerShown: true, title: 'Product Details' }}
        />
        <Stack.Screen 
          name="AddProduct" 
          component={AddProductScreen}
          options={{ headerShown: true, title: 'Add Product' }}
        />
        <Stack.Screen 
          name="SaleDetails" 
          component={SaleDetailsScreen}
          options={{ headerShown: true, title: 'Sale Details' }}
        />
        <Stack.Screen 
          name="AddSale" 
          component={AddSaleScreen}
          options={{ headerShown: true, title: 'Record Sale' }}
        />
        <Stack.Screen 
          name="ExpenseDetails" 
          component={ExpenseDetailsScreen}
          options={{ headerShown: true, title: 'Expense Details' }}
        />
        <Stack.Screen 
          name="AddExpense" 
          component={AddExpenseScreen}
          options={{ headerShown: true, title: 'Add Expense' }}
        />
        <Stack.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{ headerShown: true, title: 'Profile' }}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{ headerShown: true, title: 'Settings' }}
        />
        <Stack.Screen 
          name="Subscription" 
          component={SubscriptionScreen}
          options={{ headerShown: true, title: 'Subscription' }}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
};

export default MainNavigator;
