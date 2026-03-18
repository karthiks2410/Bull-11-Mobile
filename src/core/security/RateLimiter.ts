/**
 * Rate Limiter
 * Prevents brute force attacks by limiting login attempts
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

interface RateLimitData {
  attempts: number;
  firstAttemptTime: number;
  lockedUntil?: number;
}

export class RateLimiter {
  private static readonly MAX_ATTEMPTS = 5;
  private static readonly WINDOW_MS = 15 * 60 * 1000; // 15 minutes
  private static readonly LOCKOUT_MS = 30 * 60 * 1000; // 30 minutes

  private static getStorageKey(identifier: string): string {
    return `rate_limit_${identifier}`;
  }

  /**
   * Check if action is allowed
   */
  static async isAllowed(identifier: string): Promise<{
    allowed: boolean;
    remainingAttempts: number;
    lockedUntil?: Date;
  }> {
    const key = this.getStorageKey(identifier);
    const data = await this.getData(key);

    if (!data) {
      return { allowed: true, remainingAttempts: this.MAX_ATTEMPTS };
    }

    // Check if locked
    if (data.lockedUntil && Date.now() < data.lockedUntil) {
      return {
        allowed: false,
        remainingAttempts: 0,
        lockedUntil: new Date(data.lockedUntil),
      };
    }

    // Check if window has expired
    if (Date.now() - data.firstAttemptTime > this.WINDOW_MS) {
      // Reset window
      await this.reset(identifier);
      return { allowed: true, remainingAttempts: this.MAX_ATTEMPTS };
    }

    // Check attempts
    const remainingAttempts = this.MAX_ATTEMPTS - data.attempts;
    return {
      allowed: remainingAttempts > 0,
      remainingAttempts: Math.max(0, remainingAttempts),
    };
  }

  /**
   * Record an attempt
   */
  static async recordAttempt(identifier: string): Promise<void> {
    const key = this.getStorageKey(identifier);
    const data = await this.getData(key);

    if (!data) {
      // First attempt
      await this.saveData(key, {
        attempts: 1,
        firstAttemptTime: Date.now(),
      });
      return;
    }

    // Check if window expired
    if (Date.now() - data.firstAttemptTime > this.WINDOW_MS) {
      // Reset and record new attempt
      await this.saveData(key, {
        attempts: 1,
        firstAttemptTime: Date.now(),
      });
      return;
    }

    // Increment attempts
    const newAttempts = data.attempts + 1;

    // Check if should lock
    if (newAttempts >= this.MAX_ATTEMPTS) {
      await this.saveData(key, {
        ...data,
        attempts: newAttempts,
        lockedUntil: Date.now() + this.LOCKOUT_MS,
      });
    } else {
      await this.saveData(key, {
        ...data,
        attempts: newAttempts,
      });
    }
  }

  /**
   * Reset rate limit for identifier
   */
  static async reset(identifier: string): Promise<void> {
    const key = this.getStorageKey(identifier);
    await AsyncStorage.removeItem(key);
  }

  /**
   * Get remaining lockout time in seconds
   */
  static async getLockoutTime(identifier: string): Promise<number> {
    const key = this.getStorageKey(identifier);
    const data = await this.getData(key);

    if (!data?.lockedUntil) return 0;

    const remaining = data.lockedUntil - Date.now();
    return Math.max(0, Math.floor(remaining / 1000));
  }

  private static async getData(key: string): Promise<RateLimitData | null> {
    try {
      const json = await AsyncStorage.getItem(key);
      return json ? JSON.parse(json) : null;
    } catch {
      return null;
    }
  }

  private static async saveData(
    key: string,
    data: RateLimitData
  ): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  }
}
