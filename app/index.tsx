/**
 * Index - App Entry Point
 * Handles root route redirects based on authentication status
 */

import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/presentation/hooks/useAuth';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function Index() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth check to complete
    if (loading) return;

    // Redirect based on authentication status
    if (isAuthenticated) {
      router.replace('/(tabs)/games' as any);
    } else {
      router.replace('/auth/login' as any);
    }
  }, [loading, isAuthenticated, router]);

  // Show loading spinner while checking auth or redirecting
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007AFF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
});
