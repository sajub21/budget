import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { AppDispatch, RootState } from '../../store';
import { fetchDashboardData, fetchDashboardAlerts } from '../../store/slices/dashboardSlice';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, CURRENCIES } from '../../utils/constants';

const DashboardScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { metrics, alerts, isLoading, period, lastUpdated } = useSelector(
    (state: RootState) => state.dashboard
  );

  const refreshDashboard = useCallback(() => {
    dispatch(fetchDashboardData({ period: period.type, currency: user?.currency }));
    dispatch(fetchDashboardAlerts());
  }, [dispatch, period.type, user?.currency]);

  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  const formatCurrency = (amount: number) => {
    const symbol = CURRENCIES[user?.currency || 'GBP'].symbol;
    return `${symbol}${amount.toFixed(2)}`;
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const getGrowthColor = (value: number) => {
    return value >= 0 ? COLORS.success : COLORS.error;
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refreshDashboard} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning,</Text>
          <Text style={styles.userName}>{user?.firstName}</Text>
        </View>
        <TouchableOpacity style={styles.notificationBell}>
          <Icon name="notifications" size={24} color={COLORS.textSecondary} />
          {alerts.length > 0 && <View style={styles.notificationBadge} />}
        </TouchableOpacity>
      </View>

      {/* Alerts */}
      {alerts.length > 0 && (
        <View style={styles.alertsContainer}>
          <Text style={styles.alertsTitle}>Alerts</Text>
          {alerts.slice(0, 2).map((alert, index) => (
            <View key={index} style={[styles.alert, styles[`alert${alert.severity}`]]}>
              <Icon 
                name={alert.severity === 'error' ? 'error' : alert.severity === 'warning' ? 'warning' : 'info'} 
                size={20} 
                color={alert.severity === 'error' ? COLORS.error : alert.severity === 'warning' ? COLORS.warning : COLORS.info} 
              />
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>{alert.title}</Text>
                <Text style={styles.alertMessage}>{alert.message}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Key Metrics */}
      <View style={styles.metricsContainer}>
        <Text style={styles.sectionTitle}>Overview</Text>
        
        <View style={styles.metricsGrid}>
          {/* Revenue Card */}
          <View style={[styles.metricCard, styles.primaryCard]}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricLabel}>Revenue</Text>
              <Icon name="trending-up" size={20} color={COLORS.white} />
            </View>
            <Text style={styles.metricValue}>
              {formatCurrency(metrics?.sales?.totalRevenue || 0)}
            </Text>
            <View style={styles.metricGrowth}>
              <Text style={styles.metricGrowthText}>
                {formatPercentage(metrics?.profit?.revenueGrowth || 0)} this month
              </Text>
            </View>
          </View>

          {/* Profit Card */}
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricLabel}>Net Profit</Text>
              <Icon name="account-balance-wallet" size={20} color={COLORS.accent} />
            </View>
            <Text style={[styles.metricValue, styles.metricValueDark]}>
              {formatCurrency(metrics?.profit?.netProfit || 0)}
            </Text>
            <Text style={[styles.metricSubtext, { color: getGrowthColor(metrics?.profit?.profitMargin || 0) }]}>
              {formatPercentage(metrics?.profit?.profitMargin || 0)} margin
            </Text>
          </View>

          {/* Sales Card */}
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricLabel}>Sales</Text>
              <Icon name="shopping-cart" size={20} color={COLORS.accentSecondary} />
            </View>
            <Text style={[styles.metricValue, styles.metricValueDark]}>
              {metrics?.sales?.totalSales || 0}
            </Text>
            <Text style={styles.metricSubtext}>
              {formatCurrency(metrics?.sales?.averageOrderValue || 0)} avg
            </Text>
          </View>

          {/* Inventory Card */}
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricLabel}>Inventory</Text>
              <Icon name="inventory" size={20} color={COLORS.warning} />
            </View>
            <Text style={[styles.metricValue, styles.metricValueDark]}>
              {metrics?.inventory?.totalProducts || 0}
            </Text>
            <Text style={styles.metricSubtext}>
              {formatCurrency(metrics?.inventory?.totalValue || 0)} value
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity style={styles.quickAction}>
            <Icon name="add-box" size={32} color={COLORS.accent} />
            <Text style={styles.quickActionText}>Add Product</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <Icon name="receipt" size={32} color={COLORS.accentSecondary} />
            <Text style={styles.quickActionText}>Record Sale</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <Icon name="payment" size={32} color={COLORS.warning} />
            <Text style={styles.quickActionText}>Add Expense</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <Icon name="analytics" size={32} color={COLORS.success} />
            <Text style={styles.quickActionText}>View Reports</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.recentActivityContainer}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityList}>
          <Text style={styles.emptyText}>No recent activity</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingBottom: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  greeting: {
    fontSize: TYPOGRAPHY.body,
    fontFamily: TYPOGRAPHY.bodyFont,
    color: COLORS.textSecondary,
  },
  userName: {
    fontSize: TYPOGRAPHY.h4,
    fontFamily: TYPOGRAPHY.headerFont,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
  },
  notificationBell: {
    position: 'relative',
    padding: SPACING.sm,
  },
  notificationBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
  },
  alertsContainer: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  alertsTitle: {
    fontSize: TYPOGRAPHY.h6,
    fontFamily: TYPOGRAPHY.headerFont,
    fontWeight: TYPOGRAPHY.semiBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.info,
  },
  alerterror: {
    borderLeftColor: COLORS.error,
  },
  alertwarning: {
    borderLeftColor: COLORS.warning,
  },
  alertinfo: {
    borderLeftColor: COLORS.info,
  },
  alertContent: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  alertTitle: {
    fontSize: TYPOGRAPHY.bodySmall,
    fontFamily: TYPOGRAPHY.headerFont,
    fontWeight: TYPOGRAPHY.semiBold,
    color: COLORS.textPrimary,
  },
  alertMessage: {
    fontSize: TYPOGRAPHY.caption,
    fontFamily: TYPOGRAPHY.bodyFont,
    color: COLORS.textSecondary,
  },
  metricsContainer: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.h5,
    fontFamily: TYPOGRAPHY.headerFont,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.sm,
  },
  metricCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginHorizontal: SPACING.sm,
    marginBottom: SPACING.md,
    width: '47%',
    ...{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
  },
  primaryCard: {
    backgroundColor: COLORS.primary,
    width: '97%',
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  metricLabel: {
    fontSize: TYPOGRAPHY.bodySmall,
    fontFamily: TYPOGRAPHY.bodyFont,
    color: COLORS.textSecondary,
  },
  metricValue: {
    fontSize: TYPOGRAPHY.h4,
    fontFamily: TYPOGRAPHY.headerFont,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  metricValueDark: {
    color: COLORS.textPrimary,
  },
  metricSubtext: {
    fontSize: TYPOGRAPHY.caption,
    fontFamily: TYPOGRAPHY.bodyFont,
    color: COLORS.textSecondary,
  },
  metricGrowth: {
    marginTop: SPACING.xs,
  },
  metricGrowthText: {
    fontSize: TYPOGRAPHY.caption,
    fontFamily: TYPOGRAPHY.bodyFont,
    color: COLORS.white,
    opacity: 0.8,
  },
  quickActionsContainer: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAction: {
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    width: '48%',
    marginBottom: SPACING.sm,
    ...{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
  },
  quickActionText: {
    fontSize: TYPOGRAPHY.bodySmall,
    fontFamily: TYPOGRAPHY.bodyFont,
    color: COLORS.textPrimary,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  recentActivityContainer: {
    marginHorizontal: SPACING.lg,
  },
  activityList: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.body,
    fontFamily: TYPOGRAPHY.bodyFont,
    color: COLORS.textSecondary,
  },
});

export default DashboardScreen;
