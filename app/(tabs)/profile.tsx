/**
 * Profile Screen
 * Shows user information and logout functionality
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '@/src/presentation/components/common/Card';
import { container } from '@/src/core/di/container';
import { useAuth } from '@/src/presentation/hooks/useAuth';
import type { User } from '@/src/domain/entities/User';
import { theme } from '@/src/core/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout, updateActivity } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<User | null>(null);
  const [totalGames, setTotalGames] = useState<number>(0);
  const [loggingOut, setLoggingOut] = useState(false);

  const loadProfileData = useCallback(async () => {
    try {
      setLoading(true);
      await updateActivity();

      // Get fresh user data
      const currentUser = await container.getCurrentUserUseCase.execute();
      setUserData(currentUser);

      // Get total games count (active + history)
      const [activeGames, historyGames] = await Promise.all([
        container.getActiveGamesUseCase.execute(),
        container.getGameHistoryUseCase.execute(),
      ]);
      setTotalGames(activeGames.length + historyGames.length);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load profile';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Note: AuthGuard handles authentication redirects at the root level
  // No need to check isAuthenticated here - if we reached this component, we're authenticated


  useEffect(() => {
    if (isAuthenticated) {
      loadProfileData();
    }
  }, [isAuthenticated]);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);

      // Clear all auth state
      await logout();

      // Direct navigation to login screen
      router.replace('/auth/login');
    } catch (error) {
      Alert.alert('Logout Failed', 'Could not logout. Please try again.');
      setLoggingOut(false);
    }
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Manage your account</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* User Info Card */}
        <Card>
          <View style={styles.section}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatar}>
                {userData?.name?.charAt(0).toUpperCase() || '?'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name</Text>
              <Text style={styles.infoValue}>{userData?.name || 'N/A'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{userData?.email || 'N/A'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Role</Text>
              <View style={[
                styles.roleBadge,
                userData?.role === 'ADMIN' ? styles.adminBadge : styles.userBadge
              ]}>
                <Text style={styles.roleText}>{userData?.role || 'USER'}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Member Since</Text>
              <Text style={styles.infoValue}>
                {userData?.createdAt ? formatDate(userData.createdAt) : 'N/A'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Statistics Card */}
        <Card>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Statistics</Text>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{totalGames}</Text>
                <Text style={styles.statLabel}>Total Games</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {userData?.createdAt
                    ? Math.floor((Date.now() - new Date(userData.createdAt).getTime()) / (1000 * 60 * 60 * 24))
                    : 0}
                </Text>
                <Text style={styles.statLabel}>Days Active</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.logoutButtonText}>Logout</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Bull-11 v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.default,
  },
  loadingText: {
    marginTop: theme.spacing.spacing.md,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
  },
  header: {
    paddingTop: theme.spacing.padding.screen + 44, // Extra space for status bar
    paddingHorizontal: theme.spacing.padding.screen,
    paddingBottom: theme.spacing.padding.screen,
    backgroundColor: theme.colors.secondary.main,
  },
  title: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: '#FFFFFF',
    marginBottom: theme.spacing.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.secondary.light,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: theme.spacing.padding.screen,
  },
  section: {
    padding: theme.spacing.spacing.xs,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.margin.betweenSections,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.secondary.main,
    color: '#FFFFFF',
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: theme.typography.fontWeight.bold,
    textAlign: 'center',
    lineHeight: 80,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.padding.cardSmall,
    borderBottomWidth: theme.spacing.borderWidth.thin,
    borderBottomColor: theme.colors.border.light,
  },
  infoLabel: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  infoValue: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.semibold,
    flex: 1,
    textAlign: 'right',
  },
  roleBadge: {
    paddingHorizontal: theme.spacing.padding.cardSmall,
    paddingVertical: theme.spacing.spacing.xs,
    borderRadius: theme.spacing.borderRadius.full,
  },
  adminBadge: {
    backgroundColor: theme.colors.error.main,
  },
  userBadge: {
    backgroundColor: theme.colors.primary.main,
  },
  roleText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.margin.betweenElements,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: theme.spacing.padding.cardSmall,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: theme.spacing.borderWidth.thin,
    height: 50,
    backgroundColor: theme.colors.border.light,
  },
  statValue: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.secondary.main,
    marginBottom: theme.spacing.spacing.xs,
  },
  statLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  logoutButton: {
    backgroundColor: theme.colors.error.main,
    borderRadius: theme.spacing.borderRadius.base,
    paddingVertical: theme.spacing.padding.screen,
    marginHorizontal: theme.spacing.margin.betweenElements,
    marginTop: theme.spacing.margin.betweenSections,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.padding.cardLarge,
  },
  footerText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
  },
});
