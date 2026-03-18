/**
 * Admin Guard Component
 * Ensures authenticated user has ADMIN role
 * Shows "Access Denied" message if user is not an admin
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { AuthGuard } from './AuthGuard';

interface AdminGuardProps {
  children: React.ReactNode;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { isAdmin, user } = useAuth();

  return (
    <AuthGuard>
      {isAdmin ? (
        <>{children}</>
      ) : (
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.icon}>🚫</Text>
            <Text style={styles.title}>Access Denied</Text>
            <Text style={styles.message}>
              You do not have administrator privileges to access this area.
            </Text>
            {user && (
              <Text style={styles.userInfo}>
                Logged in as: {user.email} ({user.role})
              </Text>
            )}
          </View>
        </View>
      )}
    </AuthGuard>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  icon: {
    fontSize: 64,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#dc3545',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  userInfo: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    marginTop: 8,
  },
});
