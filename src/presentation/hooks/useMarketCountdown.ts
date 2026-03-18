/**
 * useMarketCountdown Hook
 * Provides countdown timer to market close (3:30 PM IST)
 *
 * Features:
 * - Auto-updates every minute
 * - IST timezone handling (UTC+5:30)
 * - Weekend market closed detection
 * - Color-coded based on time remaining
 */

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Countdown state returned by the hook
 */
export interface MarketCountdownState {
  /** Formatted time string (e.g., "2h 15m", "Ended 1h ago", "Market closed") */
  displayText: string;
  /** Color for the countdown based on time remaining */
  color: string;
  /** Whether market is currently open */
  isMarketOpen: boolean;
  /** Whether this game has ended (market closed for today) */
  hasEnded: boolean;
  /** Minutes remaining until market close (negative if ended) */
  minutesRemaining: number;
}

/**
 * Colors for countdown states
 */
export const COUNTDOWN_COLORS = {
  /** More than 1 hour remaining */
  safe: '#4CAF50',      // Green
  /** 30 minutes to 1 hour remaining */
  warning: '#FFC107',   // Yellow/Amber
  /** Less than 30 minutes remaining */
  critical: '#f44336',  // Red
  /** Market ended for today */
  ended: '#757575',     // Gray
  /** Market closed (weekend) */
  closed: '#9CA3AF',    // Light gray
} as const;

/**
 * IST timezone offset in minutes (UTC+5:30 = 330 minutes)
 */
const IST_OFFSET_MINUTES = 330;

/**
 * Market close time in IST (3:30 PM = 15:30)
 */
const MARKET_CLOSE_HOUR = 15;
const MARKET_CLOSE_MINUTE = 30;

/**
 * Get current time in IST
 */
const getISTDate = (): Date => {
  const now = new Date();
  // Get UTC time
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
  // Add IST offset
  return new Date(utcTime + (IST_OFFSET_MINUTES * 60000));
};

/**
 * Check if it's a weekend (Saturday=6, Sunday=0) in IST
 */
const isWeekendIST = (): boolean => {
  const istDate = getISTDate();
  const day = istDate.getDay();
  return day === 0 || day === 6;
};

/**
 * Get market close time for today in IST
 * Returns a Date object set to 3:30 PM IST today
 */
const getMarketCloseTimeIST = (): Date => {
  const istNow = getISTDate();
  const closeTime = new Date(istNow);
  closeTime.setHours(MARKET_CLOSE_HOUR, MARKET_CLOSE_MINUTE, 0, 0);
  return closeTime;
};

/**
 * Calculate minutes remaining until market close
 * Returns negative value if market has closed
 */
const calculateMinutesRemaining = (): number => {
  const istNow = getISTDate();
  const closeTime = getMarketCloseTimeIST();
  const diffMs = closeTime.getTime() - istNow.getTime();
  return Math.floor(diffMs / 60000);
};

/**
 * Format time duration as "Xh Ym" or "Ended Xh Ym ago"
 */
const formatDuration = (minutes: number, hasEnded: boolean): string => {
  const absMinutes = Math.abs(minutes);
  const hours = Math.floor(absMinutes / 60);
  const mins = absMinutes % 60;

  let formatted = '';
  if (hours > 0) {
    formatted = mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  } else {
    formatted = `${mins}m`;
  }

  if (hasEnded) {
    return `Ended ${formatted} ago`;
  }
  return formatted;
};

/**
 * Get color based on minutes remaining
 */
const getCountdownColor = (minutes: number, isWeekend: boolean): string => {
  if (isWeekend) {
    return COUNTDOWN_COLORS.closed;
  }
  if (minutes <= 0) {
    return COUNTDOWN_COLORS.ended;
  }
  if (minutes <= 30) {
    return COUNTDOWN_COLORS.critical;
  }
  if (minutes <= 60) {
    return COUNTDOWN_COLORS.warning;
  }
  return COUNTDOWN_COLORS.safe;
};

/**
 * useMarketCountdown Hook
 *
 * Provides real-time countdown to market close (3:30 PM IST)
 * Updates every minute automatically
 *
 * @param gameCreatedAt - Optional game creation date to check if game was created today
 * @returns MarketCountdownState with display text, color, and status flags
 *
 * @example
 * const { displayText, color, isMarketOpen } = useMarketCountdown();
 * return <Text style={{ color }}>{displayText}</Text>;
 */
export const useMarketCountdown = (gameCreatedAt?: string | Date): MarketCountdownState => {
  const [state, setState] = useState<MarketCountdownState>(() => calculateState());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /**
   * Calculate the current countdown state
   */
  function calculateState(): MarketCountdownState {
    const isWeekend = isWeekendIST();

    if (isWeekend) {
      return {
        displayText: 'Market closed',
        color: COUNTDOWN_COLORS.closed,
        isMarketOpen: false,
        hasEnded: false,
        minutesRemaining: 0,
      };
    }

    const minutesRemaining = calculateMinutesRemaining();
    const hasEnded = minutesRemaining <= 0;
    const isMarketOpen = !hasEnded;

    // Determine display text
    let displayText: string;
    if (hasEnded) {
      displayText = formatDuration(minutesRemaining, true);
    } else {
      displayText = formatDuration(minutesRemaining, false);
    }

    const color = getCountdownColor(minutesRemaining, isWeekend);

    return {
      displayText,
      color,
      isMarketOpen,
      hasEnded,
      minutesRemaining,
    };
  }

  /**
   * Update state with current countdown
   */
  const updateCountdown = useCallback(() => {
    setState(calculateState());
  }, []);

  useEffect(() => {
    // Initial calculation
    updateCountdown();

    // Set up interval to update every minute
    intervalRef.current = setInterval(updateCountdown, 60000);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [updateCountdown]);

  return state;
};

/**
 * Export utility functions for testing and direct use
 */
export const MarketUtils = {
  getISTDate,
  isWeekendIST,
  getMarketCloseTimeIST,
  calculateMinutesRemaining,
  formatDuration,
  getCountdownColor,
};

export default useMarketCountdown;
