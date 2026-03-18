/**
 * StockLogo Component
 * Displays company logo for stock symbols with fallback to initials
 *
 * Features:
 * - Circular avatar style
 * - Automatic fallback to initials when image fails
 * - Caching via LogoService
 * - Loading and error states
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { LogoService } from '@/src/data/services/LogoService';

interface StockLogoProps {
  /** Stock symbol (e.g., 'INFY', 'TCS', 'RELIANCE') */
  symbol: string;
  /** Size of the logo in pixels (default: 32) */
  size?: number;
  /** Show loading indicator while loading (default: false) */
  showLoading?: boolean;
}

/**
 * Get initials from stock symbol for fallback display
 */
const getInitials = (symbol: string): string => {
  // Take first 2 characters of the symbol
  return symbol.substring(0, 2).toUpperCase();
};

/**
 * Generate a consistent color based on the symbol
 */
const getColorFromSymbol = (symbol: string): string => {
  const colors = [
    '#2196F3', // Blue
    '#9C27B0', // Purple
    '#FF9800', // Orange
    '#00BCD4', // Teal
    '#3F51B5', // Indigo
    '#4CAF50', // Green
    '#E91E63', // Pink
    '#009688', // Dark Teal
    '#673AB7', // Deep Purple
    '#FF5722', // Deep Orange
  ];

  // Hash the symbol to get a consistent index
  let hash = 0;
  for (let i = 0; i < symbol.length; i++) {
    hash = symbol.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};

export const StockLogo: React.FC<StockLogoProps> = ({
  symbol,
  size = 32,
  showLoading = false,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Get logo URL from service - use PNG format for better compatibility
  // DiceBear also supports PNG format which works with Image component
  const logoUrl = LogoService.getFallbackUrl(symbol).replace('/svg?', '/png?');

  const handleImageLoad = useCallback(() => {
    setLoading(false);
    setError(false);
  }, []);

  const handleImageError = useCallback(() => {
    setLoading(false);
    setError(true);
  }, []);

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  // Render text fallback (initials)
  const renderTextFallback = () => {
    const backgroundColor = getColorFromSymbol(symbol);
    const fontSize = size * 0.4;

    return (
      <View
        style={[
          styles.fallbackContainer,
          containerStyle,
          { backgroundColor },
        ]}
      >
        <Text
          style={[
            styles.fallbackText,
            { fontSize },
          ]}
        >
          {getInitials(symbol)}
        </Text>
      </View>
    );
  };

  // If there was an error loading the image, show text fallback
  if (error) {
    return renderTextFallback();
  }

  return (
    <View style={[styles.container, containerStyle]}>
      {showLoading && loading && (
        <View style={[styles.loadingContainer, containerStyle]}>
          <ActivityIndicator size="small" color="#2196F3" />
        </View>
      )}
      <Image
        source={{ uri: logoUrl }}
        style={[
          styles.image,
          containerStyle,
          loading && styles.hidden,
        ]}
        onLoad={handleImageLoad}
        onError={handleImageError}
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    backgroundColor: '#ffffff',
  },
  hidden: {
    opacity: 0,
    position: 'absolute',
  },
  loadingContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    zIndex: 1,
  },
  fallbackContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    color: '#ffffff',
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default StockLogo;
