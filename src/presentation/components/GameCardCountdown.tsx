/**
 * GameCardCountdown Component
 * Displays countdown timer to market close (3:30 PM IST) on game cards
 *
 * Features:
 * - Auto-updates every minute
 * - Color-coded based on time remaining:
 *   - Green: > 1 hour remaining
 *   - Yellow: 30 min - 1 hour remaining
 *   - Red: < 30 min remaining
 *   - Gray: Market ended/closed
 * - Weekend detection (shows "Market closed")
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useMarketCountdown, COUNTDOWN_COLORS } from '@/src/presentation/hooks';
import { theme } from '@/src/core/theme';

interface GameCardCountdownProps {
  /** Optional game creation date for context */
  gameCreatedAt?: string | Date;
  /** Custom style for the container */
  style?: object;
}

/**
 * GameCardCountdown - Displays time remaining until market close
 *
 * @example
 * <GameCardCountdown gameCreatedAt={game.createdAt} />
 */
export const GameCardCountdown: React.FC<GameCardCountdownProps> = ({
  gameCreatedAt,
  style,
}) => {
  const { displayText, color, isMarketOpen, hasEnded } = useMarketCountdown(gameCreatedAt);

  // Determine icon based on state
  const getIcon = () => {
    if (!isMarketOpen && !hasEnded) return '📅'; // Weekend
    if (hasEnded) return '🏁'; // Ended
    return '⏱️'; // Active countdown
  };

  return (
    <View style={[styles.container, { backgroundColor: `${color}15` }, style]}>
      <Text style={styles.icon}>{getIcon()}</Text>
      <Text style={[styles.text, { color }]}>
        {isMarketOpen ? `Ends in: ${displayText}` : displayText}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  icon: {
    fontSize: 12,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});

export default GameCardCountdown;
