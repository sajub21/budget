import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

import { AppDispatch, RootState } from '../../store';
import { logoutUser } from '../../store/slices/authSlice';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../utils/constants';

const MoreScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<any>();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const menuItems = [
    { id: 'profile', title: 'Profile', icon: 'person', onPress: () => navigation.navigate('Profile') },
    { id: 'settings', title: 'Settings', icon: 'settings', onPress: () => navigation.navigate('Settings') },
    { id: 'subscription', title: 'Subscription', icon: 'star', onPress: () => navigation.navigate('Subscription') },
    { id: 'support', title: 'Support', icon: 'help', onPress: () => {} },
    { id: 'logout', title: 'Logout', icon: 'logout', onPress: handleLogout, danger: true },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.firstName.charAt(0)}{user?.lastName.charAt(0)}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user?.firstName} {user?.lastName}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <View style={styles.subscriptionBadge}>
              <Text style={styles.subscriptionText}>
                {user?.subscription.type.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.menu}>
        {menuItems.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.menuItem} 
            onPress={item.onPress}
          >
            <View style={styles.menuItemLeft}>
              <Icon 
                name={item.icon} 
                size={24} 
                color={item.danger ? COLORS.error : COLORS.textSecondary} 
              />
              <Text style={[
                styles.menuItemText,
                item.danger && styles.menuItemTextDanger
              ]}>
                {item.title}
              </Text>
            </View>
            <Icon 
              name="chevron-right" 
              size={24} 
              color={COLORS.textTertiary} 
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    fontSize: TYPOGRAPHY.h6,
    fontFamily: TYPOGRAPHY.headerFont,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.white,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: TYPOGRAPHY.h6,
    fontFamily: TYPOGRAPHY.headerFont,
    fontWeight: TYPOGRAPHY.semiBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  userEmail: {
    fontSize: TYPOGRAPHY.bodySmall,
    fontFamily: TYPOGRAPHY.bodyFont,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  subscriptionBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  subscriptionText: {
    fontSize: TYPOGRAPHY.caption,
    fontFamily: TYPOGRAPHY.headerFont,
    fontWeight: TYPOGRAPHY.semiBold,
    color: COLORS.white,
  },
  menu: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: TYPOGRAPHY.body,
    fontFamily: TYPOGRAPHY.bodyFont,
    color: COLORS.textPrimary,
    marginLeft: SPACING.md,
  },
  menuItemTextDanger: {
    color: COLORS.error,
  },
});

export default MoreScreen;
