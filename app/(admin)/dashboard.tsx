/**
 * Admin Dashboard Screen
 * Main admin panel with overview and quick actions
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { AdminGuard } from '@/src/presentation/components/AdminGuard';
import { SessionTimeoutBanner } from '@/src/presentation/components/common/SessionTimeoutBanner';
import { KiteStatusBadge } from '@/src/presentation/components/admin/KiteStatusBadge';
import { container } from '@/src/core/di/container';
import { useAuth } from '@/src/presentation/hooks/useAuth';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, updateActivity } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userCount, setUserCount] = useState(0);
  const [kiteConnected, setKiteConnected] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Update activity
      await updateActivity();

      // Load users count
      const users = await container.getAllUsersUseCase.execute();
      setUserCount(users.length);

      // TODO: Add a use case to check Kite connection status
      // For now, we'll assume it's not connected
      setKiteConnected(false);
    } catch (error) {
      // Error loading dashboard data
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminGuard>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <SessionTimeoutBanner />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome, {user?.name}!</Text>
          <Text style={styles.subtitle}>Admin Dashboard</Text>
        </View>

      <View style={styles.statusCard}>
        <Text style={styles.cardTitle}>System Status</Text>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Kite Integration:</Text>
          <KiteStatusBadge isConnected={kiteConnected} size="medium" />
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{userCount}</Text>
          <Text style={styles.statLabel}>Total Users</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>-</Text>
          <Text style={styles.statLabel}>Active Games</Text>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <TouchableOpacity
          style={[styles.actionButton, !kiteConnected && styles.actionButtonHighlight]}
          onPress={() => router.push('/(admin)/kite-setup')}
        >
          <View style={styles.actionContent}>
            <Text style={styles.actionIcon}>🔌</Text>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Setup Kite Integration</Text>
              <Text style={styles.actionDescription}>
                {kiteConnected
                  ? 'Manage Zerodha Kite connection'
                  : 'Connect to Zerodha Kite for live market data'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/(admin)/users')}
        >
          <View style={styles.actionContent}>
            <Text style={styles.actionIcon}>👥</Text>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>User Management</Text>
              <Text style={styles.actionDescription}>
                View and manage all registered users
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            // TODO: Navigate to game management screen
          }}
        >
          <View style={styles.actionContent}>
            <Text style={styles.actionIcon}>🎮</Text>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Game Management</Text>
              <Text style={styles.actionDescription}>
                Monitor and manage active games
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </AdminGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6c757d',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
  },
  statusCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#007bff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
  },
  actionsContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 12,
  },
  actionButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonHighlight: {
    borderWidth: 2,
    borderColor: '#ffc107',
    backgroundColor: '#fff9e6',
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 13,
    color: '#6c757d',
    lineHeight: 18,
  },
});
