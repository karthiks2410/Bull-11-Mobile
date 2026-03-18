/**
 * Kite Status Badge Component
 * Shows connection status for Zerodha Kite integration
 * Can be used on admin dashboard or other admin screens
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface KiteStatusBadgeProps {
  isConnected: boolean;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

export const KiteStatusBadge: React.FC<KiteStatusBadgeProps> = ({
  isConnected,
  size = 'medium',
  showLabel = true,
}) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: styles.containerSmall,
          dot: styles.dotSmall,
          text: styles.textSmall,
        };
      case 'large':
        return {
          container: styles.containerLarge,
          dot: styles.dotLarge,
          text: styles.textLarge,
        };
      case 'medium':
      default:
        return {
          container: styles.containerMedium,
          dot: styles.dotMedium,
          text: styles.textMedium,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <View style={[styles.container, sizeStyles.container]}>
      <View
        style={[
          styles.dot,
          sizeStyles.dot,
          isConnected ? styles.dotConnected : styles.dotDisconnected,
        ]}
      />
      {showLabel && (
        <Text
          style={[
            styles.text,
            sizeStyles.text,
            isConnected ? styles.textConnected : styles.textDisconnected,
          ]}
        >
          {isConnected ? 'Kite Connected' : 'Kite Not Setup'}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
  },
  containerSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  containerMedium: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  containerLarge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  dot: {
    borderRadius: 999,
    marginRight: 6,
  },
  dotSmall: {
    width: 6,
    height: 6,
    marginRight: 4,
  },
  dotMedium: {
    width: 8,
    height: 8,
    marginRight: 6,
  },
  dotLarge: {
    width: 10,
    height: 10,
    marginRight: 8,
  },
  dotConnected: {
    backgroundColor: '#28a745',
  },
  dotDisconnected: {
    backgroundColor: '#dc3545',
  },
  text: {
    fontWeight: '600',
  },
  textSmall: {
    fontSize: 11,
  },
  textMedium: {
    fontSize: 12,
  },
  textLarge: {
    fontSize: 14,
  },
  textConnected: {
    color: '#28a745',
  },
  textDisconnected: {
    color: '#dc3545',
  },
});
