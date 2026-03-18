/**
 * GameCardSkeleton Component
 * Animated placeholder cards shown while loading games
 * Uses React Native Reanimated for smooth shimmer effect
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { theme } from '@/src/core/theme';

interface SkeletonBoxProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  shimmerOffset?: number;
}

/**
 * Individual skeleton box with shimmer animation
 */
const SkeletonBox: React.FC<SkeletonBoxProps> = ({
  width,
  height,
  borderRadius = 4,
  shimmerOffset = 0,
}) => {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.ease }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      shimmer.value,
      [0, 0.5, 1],
      [0.3, 0.7, 0.3]
    );
    return {
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: theme.colors.neutral.gray200,
        },
        animatedStyle,
      ]}
    />
  );
};

/**
 * Full skeleton card matching GameCard layout
 */
export const GameCardSkeleton: React.FC = () => {
  return (
    <View style={styles.card}>
      {/* Header row: date and status badge */}
      <View style={styles.headerRow}>
        <SkeletonBox width={100} height={16} shimmerOffset={0} />
        <SkeletonBox width={70} height={24} borderRadius={12} shimmerOffset={100} />
      </View>

      {/* Stock rows */}
      {[0, 1, 2, 3, 4].map((index) => (
        <View key={index} style={styles.stockRow}>
          <View style={styles.stockLeft}>
            <SkeletonBox width={60} height={16} shimmerOffset={index * 50} />
          </View>
          <View style={styles.stockRight}>
            <SkeletonBox width={80} height={16} shimmerOffset={index * 50 + 25} />
            <SkeletonBox width={50} height={14} shimmerOffset={index * 50 + 50} />
          </View>
        </View>
      ))}

      {/* Comparison bar placeholder */}
      <View style={styles.comparisonBarPlaceholder}>
        <SkeletonBox width="100%" height={8} borderRadius={4} shimmerOffset={300} />
      </View>

      {/* Performance container */}
      <View style={styles.performanceContainer}>
        <View style={styles.performanceRow}>
          <SkeletonBox width={100} height={14} shimmerOffset={350} />
          <SkeletonBox width={70} height={20} shimmerOffset={375} />
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.buttonContainer}>
        <View style={styles.buttonPlaceholder}>
          <SkeletonBox width="100%" height={44} borderRadius={8} shimmerOffset={400} />
        </View>
        <View style={styles.buttonPlaceholder}>
          <SkeletonBox width="100%" height={44} borderRadius={8} shimmerOffset={425} />
        </View>
      </View>
    </View>
  );
};

/**
 * Multiple skeleton cards for loading state
 */
interface GameCardsSkeletonProps {
  count?: number;
}

export const GameCardsSkeleton: React.FC<GameCardsSkeletonProps> = ({ count = 2 }) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <GameCardSkeleton key={index} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  card: {
    backgroundColor: theme.colors.background.paper,
    borderRadius: 12,
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  stockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  stockLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  comparisonBarPlaceholder: {
    marginTop: 12,
    marginBottom: 8,
  },
  performanceContainer: {
    backgroundColor: theme.colors.neutral.gray50,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  performanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  buttonPlaceholder: {
    flex: 1,
  },
});
