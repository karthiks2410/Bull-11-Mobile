/**
 * Game Insights Utility
 * Analyzes game performance data and provides contextual insights
 */

import type { Game, GameStock } from '@/src/domain/entities/Game';

export type InsightType = 'success' | 'warning' | 'danger' | 'info';

export interface GameInsight {
  message: string;
  type: InsightType;
  emoji: string;
}

/**
 * Calculate portfolio momentum (rate of change in returns)
 * Returns: 'accelerating', 'steady', 'decelerating', or 'volatile'
 */
export function calculateMomentum(stocks: readonly GameStock[]): string {
  const changes = stocks.map(stock => {
    const opening = stock.openingPrice;
    const current = stock.currentPrice || opening;
    return opening > 0 ? ((current - opening) / opening) * 100 : 0;
  });

  const positiveCount = changes.filter(c => c > 0).length;
  const negativeCount = changes.filter(c => c < 0).length;
  const avgChange = changes.reduce((sum, c) => sum + c, 0) / changes.length;
  const variance = changes.reduce((sum, c) => sum + Math.pow(c - avgChange, 2), 0) / changes.length;
  const stdDev = Math.sqrt(variance);

  // High volatility
  if (stdDev > 3) return 'volatile';

  // Strong positive momentum
  if (positiveCount >= stocks.length * 0.8 && avgChange > 2) return 'accelerating';

  // Strong negative momentum
  if (negativeCount >= stocks.length * 0.8 && avgChange < -2) return 'decelerating';

  return 'steady';
}

/**
 * Calculate diversification score (0-100)
 * Higher score = more evenly distributed performance
 */
export function calculateDiversificationScore(stocks: readonly GameStock[]): number {
  if (stocks.length <= 1) return 0;

  const changes = stocks.map(stock => {
    const opening = stock.openingPrice;
    const current = stock.currentPrice || opening;
    return opening > 0 ? ((current - opening) / opening) * 100 : 0;
  });

  const avgChange = changes.reduce((sum, c) => sum + c, 0) / changes.length;
  const variance = changes.reduce((sum, c) => sum + Math.pow(c - avgChange, 2), 0) / changes.length;
  const stdDev = Math.sqrt(variance);

  // Convert standard deviation to a 0-100 score
  // Lower std dev = higher diversification score
  // Normalize: assume stdDev of 5+ is highly concentrated (score 0)
  const maxStdDev = 5;
  const score = Math.max(0, Math.min(100, 100 - (stdDev / maxStdDev) * 100));

  return Math.round(score);
}

/**
 * Calculate volatility indicator (0-100)
 * Higher value = more volatile (stocks moving wildly)
 */
export function calculateVolatility(stocks: readonly GameStock[]): number {
  if (stocks.length === 0) return 0;

  const changes = stocks.map(stock => {
    const opening = stock.openingPrice;
    const current = stock.currentPrice || opening;
    return opening > 0 ? Math.abs(((current - opening) / opening) * 100) : 0;
  });

  const avgAbsChange = changes.reduce((sum, c) => sum + c, 0) / changes.length;

  // Normalize to 0-100 scale (assume 10% avg change is maximum)
  const volatility = Math.min(100, (avgAbsChange / 10) * 100);

  return Math.round(volatility);
}

/**
 * Find best and worst performing stocks
 */
export function getBestAndWorstPerformers(stocks: readonly GameStock[]): {
  best: GameStock | null;
  worst: GameStock | null;
  bestChange: number;
  worstChange: number;
} {
  if (stocks.length === 0) {
    return { best: null, worst: null, bestChange: 0, worstChange: 0 };
  }

  const stocksWithChanges = stocks.map(stock => {
    const opening = stock.openingPrice;
    const current = stock.currentPrice || opening;
    const change = opening > 0 ? ((current - opening) / opening) * 100 : 0;
    return { stock, change };
  });

  const sorted = [...stocksWithChanges].sort((a, b) => b.change - a.change);

  return {
    best: sorted[0]?.stock || null,
    worst: sorted[sorted.length - 1]?.stock || null,
    bestChange: sorted[0]?.change || 0,
    worstChange: sorted[sorted.length - 1]?.change || 0,
  };
}

/**
 * Analyze time-based patterns (morning gains, afternoon slump, etc.)
 * Note: This is simplified - in a real app, you'd track historical price movements
 */
export function getTimeBasedInsight(createdAt: Date): string | null {
  const now = new Date();
  const diffMs = now.getTime() - createdAt.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  // Market session insights
  const currentHour = now.getHours();

  if (diffMinutes < 5) {
    return 'Just started';
  }

  if (diffMinutes < 30) {
    return 'Early session';
  }

  if (diffHours < 2) {
    return 'Building momentum';
  }

  if (currentHour >= 9 && currentHour < 12) {
    return 'Morning session';
  }

  if (currentHour >= 12 && currentHour < 15) {
    return 'Afternoon session';
  }

  if (currentHour >= 15) {
    return 'Closing hours';
  }

  return null;
}

/**
 * Generate smart insight message for a game
 */
export function generateGameInsight(game: Game): GameInsight | null {
  if (game.stocks.length === 0) return null;

  const openingPrice = game.openingPrice || 0;
  const currentPrice = game.stocks.reduce((sum, stock) =>
    sum + (stock.currentPrice || stock.openingPrice), 0
  );
  const totalReturn = openingPrice > 0
    ? ((currentPrice - openingPrice) / openingPrice) * 100
    : 0;

  const momentum = calculateMomentum(game.stocks);
  const volatility = calculateVolatility(game.stocks);
  const diversification = calculateDiversificationScore(game.stocks);
  const { best, bestChange, worstChange } = getBestAndWorstPerformers(game.stocks);

  // High momentum positive
  if (momentum === 'accelerating' && totalReturn > 3) {
    return {
      message: 'Strong momentum!',
      type: 'success',
      emoji: '🔥',
    };
  }

  // High momentum negative
  if (momentum === 'decelerating' && totalReturn < -3) {
    return {
      message: 'Portfolio struggling',
      type: 'danger',
      emoji: '📉',
    };
  }

  // Volatile market
  if (momentum === 'volatile' && volatility > 60) {
    return {
      message: 'High volatility',
      type: 'warning',
      emoji: '⚡',
    };
  }

  // Steady performer
  if (momentum === 'steady' && Math.abs(totalReturn) < 2 && volatility < 30) {
    return {
      message: 'Steady performer',
      type: 'info',
      emoji: '🎯',
    };
  }

  // One stock carrying portfolio
  if (game.stocks.length > 2 && best && bestChange > 5 && Math.abs(bestChange - worstChange) > 8) {
    return {
      message: `${best.symbol} is carrying you!`,
      type: 'info',
      emoji: '🏆',
    };
  }

  // Concentrated losses
  if (game.stocks.length > 2 && worstChange < -5 && Math.abs(bestChange - worstChange) > 8) {
    return {
      message: 'One stock dragging down',
      type: 'warning',
      emoji: '⚠️',
    };
  }

  // Strong gains
  if (totalReturn > 5) {
    return {
      message: 'Exceptional gains!',
      type: 'success',
      emoji: '💰',
    };
  }

  // Heavy losses
  if (totalReturn < -5) {
    return {
      message: 'Heavy losses',
      type: 'danger',
      emoji: '🔻',
    };
  }

  // Moderate gains
  if (totalReturn > 2) {
    return {
      message: 'Solid performance',
      type: 'success',
      emoji: '📈',
    };
  }

  // Low diversification with multiple stocks
  if (game.stocks.length > 3 && diversification < 40 && volatility > 50) {
    return {
      message: 'Uneven performance',
      type: 'info',
      emoji: '📊',
    };
  }

  return null;
}

/**
 * Get color for insight type
 */
export function getInsightColor(type: InsightType): string {
  switch (type) {
    case 'success':
      return '#4CAF50'; // Green
    case 'warning':
      return '#FF9800'; // Orange
    case 'danger':
      return '#F44336'; // Red
    case 'info':
      return '#2196F3'; // Blue
    default:
      return '#757575'; // Gray
  }
}

/**
 * Get background color for insight banner
 */
export function getInsightBackgroundColor(type: InsightType): string {
  switch (type) {
    case 'success':
      return '#E8F5E9'; // Light green
    case 'warning':
      return '#FFF3E0'; // Light orange
    case 'danger':
      return '#FFEBEE'; // Light red
    case 'info':
      return '#E3F2FD'; // Light blue
    default:
      return '#F5F5F5'; // Light gray
  }
}
