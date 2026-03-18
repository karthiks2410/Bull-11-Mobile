/**
 * Insight Banner Component
 * Displays contextual performance insights for games
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { GameInsight } from '@/src/core/utils/gameInsights';
import { getInsightColor, getInsightBackgroundColor } from '@/src/core/utils/gameInsights';

interface InsightBannerProps {
  insight: GameInsight;
}

export const InsightBanner: React.FC<InsightBannerProps> = ({ insight }) => {
  const textColor = getInsightColor(insight.type);
  const backgroundColor = getInsightBackgroundColor(insight.type);

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={styles.emoji}>{insight.emoji}</Text>
      <Text style={[styles.message, { color: textColor }]}>
        {insight.message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  emoji: {
    fontSize: 16,
  },
  message: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
});
