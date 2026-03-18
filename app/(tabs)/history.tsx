/**
 * History Screen
 * Shows completed and cancelled games with final results
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '@/src/presentation/components/common/Card';
import { GameDetailsModal } from '@/src/presentation/components/GameDetailsModal';
import { StockComparisonBar } from '@/src/presentation/components/StockComparisonBar';
import { LoadingSpinner } from '@/src/presentation/components/common/LoadingSpinner';
import { ErrorDisplay } from '@/src/presentation/components/common/ErrorDisplay';
import { ErrorBanner } from '@/src/presentation/components/common/ErrorBanner';
import { container } from '@/src/core/di/container';
import { useAuth } from '@/src/presentation/hooks/useAuth';
import { ErrorHandler } from '@/src/core/utils/errorHandler';
import { theme, getPerformanceColor } from '@/src/core/theme';
import type { Game } from '@/src/domain/entities/Game';
import { GameStatus } from '@/src/domain/entities/Game';

export default function HistoryScreen() {
  const router = useRouter();
  const { user, isAuthenticated, updateActivity } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await updateActivity();

      const allGames = await container.getGameHistoryUseCase.execute();

      // Filter to show only completed and cancelled games
      const historyGames = allGames.filter(
        game => game.status === GameStatus.COMPLETED || game.status === GameStatus.CANCELLED
      );

      // Sort by closedAt date, most recent first
      historyGames.sort((a, b) => {
        const dateA = a.closedAt ? new Date(a.closedAt).getTime() : 0;
        const dateB = b.closedAt ? new Date(b.closedAt).getTime() : 0;
        return dateB - dateA;
      });

      setGames(historyGames);
    } catch (err) {
      const errorMessage = ErrorHandler.getShortMessage(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Note: AuthGuard handles authentication redirects at the root level
  // No need to check isAuthenticated here - if we reached this component, we're authenticated


  useEffect(() => {
    if (isAuthenticated) {
      loadHistory();
    }
  }, [isAuthenticated]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const calculateDuration = (createdAt: Date, closedAt?: Date): string => {
    if (!closedAt) return 'Unknown';

    const start = new Date(createdAt);
    const end = new Date(closedAt);
    const diffMs = end.getTime() - start.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (diffDays > 0) {
      return `${diffDays}d ${diffHours}h`;
    } else if (diffHours > 0) {
      return `${diffHours}h`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes}m`;
    }
  };

  const handleViewDetails = (gameId: string) => {
    setSelectedGameId(gameId);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedGameId(null);
  };

  const renderGameCard = ({ item }: { item: Game }) => {
    const openingPrice = item.openingPrice || 0;
    const closingPrice = item.closingPrice || openingPrice;
    const percentChange = item.totalReturnPercentage ||
      (openingPrice > 0 ? ((closingPrice - openingPrice) / openingPrice) * 100 : 0);
    const isProfit = percentChange >= 0;
    const isCancelled = item.status === GameStatus.CANCELLED;
    const duration = calculateDuration(item.createdAt, item.closedAt);

    // Helper function to get momentum color
    const getMomentumColor = (momentum?: string): string => {
      if (!momentum) return theme.colors.neutral.gray500;
      switch (momentum.toLowerCase()) {
        case 'accelerating':
        case 'strong gaining':
          return '#4CAF50'; // Green
        case 'gaining':
        case 'steady':
          return '#2196F3'; // Blue
        case 'losing':
          return '#FF9800'; // Orange
        case 'decelerating':
        case 'strong losing':
          return '#F44336'; // Red
        case 'volatile':
          return '#9C27B0'; // Purple
        default:
          return theme.colors.neutral.gray500;
      }
    };

    return (
      <Card>
        <View style={styles.gameCard}>
          <View style={styles.gameHeader}>
            <View>
              <Text style={styles.gameDate}>
                {new Date(item.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
              {item.closedAt && (
                <Text style={styles.closedDate}>
                  Closed: {new Date(item.closedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
              )}
            </View>
            <View style={[
              styles.statusBadge,
              { backgroundColor: isCancelled ? theme.colors.neutral.gray500 : theme.colors.info.main }
            ]}>
              <Text style={styles.statusText}>
                {isCancelled ? 'CANCELLED' : 'COMPLETED'}
              </Text>
            </View>
          </View>

          {/* Best/Worst Performer Badges */}
          {!isCancelled && (item.bestPerformer || item.worstPerformer) && (
            <View style={styles.performerBadgesContainer}>
              {item.bestPerformer && (
                <View style={styles.performerBadge}>
                  <Text style={styles.performerEmoji}>🏆</Text>
                  <Text style={styles.performerText}>
                    Best: {item.bestPerformer.symbol}{' '}
                    <Text style={[styles.performerPercent, { color: getPerformanceColor(item.bestPerformer.percentageChange) }]}>
                      +{item.bestPerformer.percentageChange.toFixed(2)}%
                    </Text>
                  </Text>
                </View>
              )}
              {item.worstPerformer && (
                <View style={styles.performerBadge}>
                  <Text style={styles.performerEmoji}>📉</Text>
                  <Text style={styles.performerText}>
                    Worst: {item.worstPerformer.symbol}{' '}
                    <Text style={[styles.performerPercent, { color: getPerformanceColor(item.worstPerformer.percentageChange) }]}>
                      {item.worstPerformer.percentageChange >= 0 ? '+' : ''}{item.worstPerformer.percentageChange.toFixed(2)}%
                    </Text>
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Momentum Indicator */}
          {!isCancelled && item.momentum && (
            <View style={styles.momentumContainer}>
              <View style={[styles.momentumBadge, { backgroundColor: getMomentumColor(item.momentum) }]}>
                <Text style={styles.momentumText}>
                  {item.momentum.toUpperCase()}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.stocksList}>
            {item.stocks.map((stock, index) => (
              <View key={index} style={styles.stockItem}>
                <Text style={styles.stockSymbol}>{stock.symbol}</Text>
                <View style={styles.stockPrices}>
                  <Text style={styles.stockPrice}>
                    ₹{stock.openingPrice.toFixed(2)}
                  </Text>
                  {stock.closingPrice && (
                    <>
                      <Text style={styles.arrowText}>→</Text>
                      <Text style={styles.stockPrice}>
                        ₹{stock.closingPrice.toFixed(2)}
                      </Text>
                    </>
                  )}
                  {stock.percentageChange !== undefined && (
                    <Text style={[
                      styles.stockPercent,
                      { color: getPerformanceColor(stock.percentageChange) }
                    ]}>
                      {' '}({stock.percentageChange >= 0 ? '+' : ''}{stock.percentageChange.toFixed(2)}%)
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>

          {/* Stock Comparison Bar */}
          <StockComparisonBar stocks={item.stocks} variant="mini" isActive={false} />

          <View style={styles.performanceContainer}>
            <View style={styles.performanceRow}>
              <Text style={styles.performanceLabel}>Duration:</Text>
              <Text style={styles.performanceValue}>{duration}</Text>
            </View>
            <View style={styles.performanceRow}>
              <Text style={styles.performanceLabel}>Opening:</Text>
              <Text style={styles.performanceValue}>₹{openingPrice.toFixed(2)}</Text>
            </View>
            <View style={styles.performanceRow}>
              <Text style={styles.performanceLabel}>Closing:</Text>
              <Text style={styles.performanceValue}>₹{closingPrice.toFixed(2)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.performanceRow}>
              <Text style={styles.totalLabel}>Total Return:</Text>
              <Text style={[
                styles.returnValue,
                { color: isCancelled ? theme.colors.text.disabled : getPerformanceColor(percentChange) }
              ]}>
                {isCancelled ? 'N/A' : `${isProfit ? '+' : ''}${percentChange.toFixed(2)}%`}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.viewDetailsButton}
            onPress={() => handleViewDetails(item.id)}
          >
            <Text style={styles.viewDetailsButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  if (loading && !refreshing) {
    return <LoadingSpinner message="Loading history..." />;
  }

  if (error && !refreshing) {
    return (
      <ErrorDisplay
        title="Failed to Load History"
        message={error}
        onRetry={loadHistory}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Game History</Text>
        <Text style={styles.subtitle}>
          Your completed games
        </Text>
      </View>

      {error && refreshing && (
        <ErrorBanner message={error} type="error" />
      )}

      <FlatList
        data={games}
        renderItem={renderGameCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyText}>No game history</Text>
            <Text style={styles.emptySubtext}>
              Complete or close a game to see it here
            </Text>
          </View>
        }
      />

      {selectedGameId && (
        <GameDetailsModal
          gameId={selectedGameId}
          visible={modalVisible}
          onClose={handleCloseModal}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.default,
  },
  loadingText: {
    marginTop: theme.spacing.spacing.xs,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: theme.spacing.padding.screen,
    paddingBottom: theme.spacing.spacing.base,
    backgroundColor: theme.colors.secondary.main,
  },
  title: {
    ...theme.typography.textStyles.h1,
    color: theme.colors.secondary.contrast,
    marginBottom: theme.spacing.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.secondary.light,
  },
  listContent: {
    paddingVertical: theme.spacing.spacing.base,
  },
  gameCard: {
    padding: theme.spacing.spacing.xs,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.spacing.sm,
  },
  gameDate: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  closedDate: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.disabled,
    marginTop: theme.spacing.spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.spacing.sm,
    paddingVertical: theme.spacing.spacing.xs,
    borderRadius: theme.spacing.borderRadius.full,
  },
  completedBadge: {
    backgroundColor: theme.colors.info.main,
  },
  cancelledBadge: {
    backgroundColor: theme.colors.neutral.gray500,
  },
  statusText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.info.contrast,
  },
  stocksList: {
    marginBottom: theme.spacing.spacing.base,
  },
  stockItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.spacing.xs,
    borderBottomWidth: theme.spacing.borderWidth.thin,
    borderBottomColor: theme.colors.border.light,
  },
  stockSymbol: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  stockPrices: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockPrice: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  arrowText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.disabled,
    marginHorizontal: theme.spacing.spacing.xs,
  },
  performanceContainer: {
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.spacing.borderRadius.base,
    padding: theme.spacing.padding.card,
  },
  performanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.spacing.xs,
  },
  performanceLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  performanceValue: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
  },
  divider: {
    height: theme.spacing.borderWidth.thin,
    backgroundColor: theme.colors.border.light,
    marginVertical: theme.spacing.spacing.xs,
  },
  totalLabel: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  returnValue: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
  },
  profit: {
    color: theme.colors.success.main,
  },
  loss: {
    color: theme.colors.error.main,
  },
  cancelled: {
    color: theme.colors.text.disabled,
  },
  viewDetailsButton: {
    backgroundColor: theme.colors.primary.main,
    borderRadius: theme.spacing.borderRadius.base,
    paddingVertical: theme.spacing.spacing.sm,
    alignItems: 'center',
    marginTop: theme.spacing.spacing.sm,
  },
  viewDetailsButtonText: {
    color: theme.colors.primary.contrast,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: theme.spacing.spacing.base,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.spacing.xs,
  },
  emptySubtext: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.disabled,
    textAlign: 'center',
  },
  performerBadgesContainer: {
    marginBottom: theme.spacing.spacing.sm,
    gap: theme.spacing.spacing.xs,
  },
  performerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.paper,
    paddingVertical: theme.spacing.spacing.xs,
    paddingHorizontal: theme.spacing.spacing.sm,
    borderRadius: theme.spacing.borderRadius.base,
    borderWidth: theme.spacing.borderWidth.thin,
    borderColor: theme.colors.border.light,
  },
  performerEmoji: {
    fontSize: theme.typography.fontSize.base,
    marginRight: theme.spacing.spacing.xs,
  },
  performerText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  performerPercent: {
    fontWeight: theme.typography.fontWeight.bold,
  },
  momentumContainer: {
    marginBottom: theme.spacing.spacing.sm,
    alignItems: 'flex-start',
  },
  momentumBadge: {
    paddingHorizontal: theme.spacing.spacing.sm,
    paddingVertical: theme.spacing.spacing.xs,
    borderRadius: theme.spacing.borderRadius.full,
  },
  momentumText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#FFFFFF',
  },
  stockPercent: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
  },
});
