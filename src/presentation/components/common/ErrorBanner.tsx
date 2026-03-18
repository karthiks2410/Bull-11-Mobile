/**
 * Error Banner Component
 * Inline error banner for displaying errors without replacing content
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
  type?: 'error' | 'warning' | 'info';
  style?: ViewStyle;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  message,
  onDismiss,
  type = 'error',
  style,
}) => {
  const getStyles = () => {
    switch (type) {
      case 'warning':
        return {
          container: styles.warningContainer,
          text: styles.warningText,
          icon: '⚠️',
        };
      case 'info':
        return {
          container: styles.infoContainer,
          text: styles.infoText,
          icon: 'ℹ️',
        };
      case 'error':
      default:
        return {
          container: styles.errorContainer,
          text: styles.errorText,
          icon: '❌',
        };
    }
  };

  const { container, text, icon } = getStyles();

  if (!message) return null;

  return (
    <View style={[styles.banner, container, style]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.message, text]}>{message}</Text>
      {onDismiss && (
        <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
          <Text style={styles.dismissText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
    borderLeftWidth: 4,
  },
  errorContainer: {
    backgroundColor: '#f8d7da',
    borderLeftColor: '#dc3545',
  },
  warningContainer: {
    backgroundColor: '#fff3cd',
    borderLeftColor: '#ffc107',
  },
  infoContainer: {
    backgroundColor: '#d1ecf1',
    borderLeftColor: '#17a2b8',
  },
  icon: {
    fontSize: 20,
    marginRight: 12,
  },
  message: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  errorText: {
    color: '#721c24',
  },
  warningText: {
    color: '#856404',
  },
  infoText: {
    color: '#0c5460',
  },
  dismissButton: {
    padding: 4,
    marginLeft: 8,
  },
  dismissText: {
    fontSize: 18,
    color: '#6c757d',
    fontWeight: '600',
  },
});
