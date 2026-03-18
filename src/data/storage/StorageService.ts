/**
 * Storage Service
 * Handles secure token storage using TokenService with expiry validation
 */

import { TokenService } from '@/src/core/security';

export class StorageService {
  /**
   * Store JWT token with expiry metadata
   */
  async storeToken(token: string): Promise<void> {
    await TokenService.storeToken(token);
  }

  /**
   * Get JWT token (validates expiry automatically)
   */
  async getToken(): Promise<string | null> {
    return await TokenService.getToken();
  }

  /**
   * Clear JWT token
   */
  async clearToken(): Promise<void> {
    await TokenService.clearToken();
  }

  /**
   * Check if valid token exists
   */
  async hasToken(): Promise<boolean> {
    return await TokenService.isTokenValid();
  }

  /**
   * Get remaining time until token expires (seconds)
   */
  async getTokenExpiryTime(): Promise<number> {
    return await TokenService.getTokenExpiryTime();
  }

  /**
   * Check if token is expiring soon (< 1 hour)
   */
  async isTokenExpiringSoon(): Promise<boolean> {
    return await TokenService.isTokenExpiringSoon();
  }
}
