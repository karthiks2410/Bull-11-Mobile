import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '@/src/presentation/components/common/Card';
import { container } from '@/src/core/di/container';
import { User } from '@/src/domain/entities/User';

export const AdminDashboardScreen: React.FC = () => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const user = await container.getCurrentUserUseCase.execute();
      setCurrentUser(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user');
      Alert.alert('Error', 'Failed to load user information');
    } finally {
      setLoading(false);
    }
  };

  const navigateToKiteSetup = () => {
    // Navigate to Kite Integration Setup screen
    router.push('/(admin)/kite-setup' as any);
  };

  const navigateToUserManagement = () => {
    router.push('/(admin)/users' as any);
  };

  const navigateToSystemStats = () => {
    Alert.alert('Coming Soon', 'System statistics feature is under development');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        {currentUser && (
          <View style={styles.userInfo}>
            <Text style={styles.welcomeText}>Welcome, {currentUser.name}</Text>
            <Text style={styles.roleText}>Role: {currentUser.role}</Text>
          </View>
        )}
      </View>

      <View style={styles.cardsContainer}>
        <Card onPress={navigateToKiteSetup}>
          <View style={styles.cardContent}>
            <Text style={styles.cardIcon}>🔗</Text>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Kite Integration</Text>
              <Text style={styles.cardDescription}>
                Configure Zerodha Kite API connection
              </Text>
            </View>
          </View>
        </Card>

        <Card onPress={navigateToUserManagement}>
          <View style={styles.cardContent}>
            <Text style={styles.cardIcon}>👥</Text>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>User Management</Text>
              <Text style={styles.cardDescription}>
                View and manage all users
              </Text>
            </View>
          </View>
        </Card>

        <Card onPress={navigateToSystemStats}>
          <View style={styles.cardContent}>
            <Text style={styles.cardIcon}>📊</Text>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>System Statistics</Text>
              <Text style={styles.cardDescription}>
                View system performance and metrics
              </Text>
            </View>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 24,
    backgroundColor: '#007AFF',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  userInfo: {
    marginTop: 8,
  },
  welcomeText: {
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 4,
  },
  roleText: {
    fontSize: 14,
    color: '#e3f2fd',
  },
  cardsContainer: {
    paddingVertical: 16,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    fontSize: 40,
    marginRight: 16,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
  },
});
