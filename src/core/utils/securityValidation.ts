/**
 * Security Validation Utilities
 * Provides input sanitization, validation, and rate limiting for stock search/selection
 */

import type { Stock } from '@/src/domain/entities/Stock';
import { getLogger } from '@/src/core/logging';

const logger = getLogger('Security');

/**
 * SQL Injection patterns to detect and block
 */
const SQL_INJECTION_PATTERNS = [
  /(\bOR\b|\bAND\b)\s+[\w\s]*=[\w\s]*/i,
  /'/,
  /--/,
  /\/\*/,
  /\*\//,
  /;/,
  /\bDROP\b/i,
  /\bDELETE\b/i,
  /\bINSERT\b/i,
  /\bUPDATE\b/i,
  /\bEXEC\b/i,
  /\bUNION\b/i,
  /\bSELECT\b/i,
];

/**
 * Script injection patterns to detect and block
 */
const SCRIPT_INJECTION_PATTERNS = [
  /<script[^>]*>/i,
  /<\/script>/i,
  /javascript:/i,
  /onerror\s*=/i,
  /onclick\s*=/i,
  /onload\s*=/i,
  /<iframe[^>]*>/i,
  /<embed[^>]*>/i,
];

/**
 * Configuration for security features
 */
export const SECURITY_CONFIG = {
  SEARCH_QUERY_MAX_LENGTH: 50,
  SEARCH_RATE_LIMIT_MS: 500,
  STOCK_SELECTION_RATE_LIMIT_MS: 300,
  ALLOWED_SYMBOL_PATTERN: /^[A-Z0-9\-_&.]+$/,
  ALLOWED_NAME_PATTERN: /^[A-Za-z0-9\s\-&.,()]+$/,
};

/**
 * Rate limiter class for preventing rapid repeated actions
 */
export class RateLimiter {
  private lastActionTime: number = 0;
  private actionCount: number = 0;
  private readonly limitMs: number;
  private readonly actionName: string;

  constructor(limitMs: number, actionName: string) {
    this.limitMs = limitMs;
    this.actionName = actionName;
  }

  /**
   * Check if action is allowed based on rate limit
   * Returns true if allowed, false if blocked
   */
  canPerform(): boolean {
    const now = Date.now();
    const timeSinceLastAction = now - this.lastActionTime;

    if (timeSinceLastAction < this.limitMs) {
      this.actionCount++;
      if (this.actionCount > 5) {
        logger.warn(
          `Excessive ${this.actionName} attempts detected (${this.actionCount} in ${timeSinceLastAction}ms)`
        );
      }
      return false;
    }

    this.lastActionTime = now;
    this.actionCount = 0;
    return true;
  }

  /**
   * Reset the rate limiter
   */
  reset(): void {
    this.lastActionTime = 0;
    this.actionCount = 0;
  }
}

/**
 * Sanitize search query input
 * - Trims whitespace
 * - Removes special characters (except alphanumeric, space, &, -, .)
 * - Enforces max length
 * - Blocks SQL injection patterns
 * - Blocks script tags
 */
export function sanitizeSearchQuery(input: string): string {
  // Trim whitespace
  let sanitized = input.trim();

  // Enforce max length
  if (sanitized.length > SECURITY_CONFIG.SEARCH_QUERY_MAX_LENGTH) {
    sanitized = sanitized.substring(0, SECURITY_CONFIG.SEARCH_QUERY_MAX_LENGTH);
    logger.warn(
      `Search query truncated to ${SECURITY_CONFIG.SEARCH_QUERY_MAX_LENGTH} characters`
    );
  }

  // Check for SQL injection patterns
  for (const pattern of SQL_INJECTION_PATTERNS) {
    if (pattern.test(sanitized)) {
      logger.warn('SQL injection pattern detected and blocked:', sanitized);
      throw new Error('Invalid search query: suspected injection attempt');
    }
  }

  // Check for script injection patterns
  for (const pattern of SCRIPT_INJECTION_PATTERNS) {
    if (pattern.test(sanitized)) {
      logger.warn('Script injection pattern detected and blocked:', sanitized);
      throw new Error('Invalid search query: suspected script injection');
    }
  }

  // Remove special characters (keep only alphanumeric, space, &, -, .)
  sanitized = sanitized.replace(/[^A-Za-z0-9\s&\-.]/g, '');

  return sanitized;
}

/**
 * Validate stock object structure
 * Ensures all required fields exist and are of correct type
 */
export function validateStockStructure(stock: any): stock is Stock {
  if (!stock || typeof stock !== 'object') {
    logger.warn('Invalid stock object: not an object', stock);
    return false;
  }

  // Check required fields
  const requiredFields: (keyof Stock)[] = ['symbol', 'name', 'instrumentToken', 'exchange'];
  for (const field of requiredFields) {
    if (!stock[field]) {
      logger.warn(`Invalid stock object: missing field "${field}"`, stock);
      return false;
    }
  }

  // Validate symbol format (alphanumeric with &, -, _ allowed)
  if (typeof stock.symbol !== 'string' || !SECURITY_CONFIG.ALLOWED_SYMBOL_PATTERN.test(stock.symbol)) {
    logger.warn('Invalid stock symbol format:', stock.symbol);
    return false;
  }

  // Validate name format
  if (typeof stock.name !== 'string' || !SECURITY_CONFIG.ALLOWED_NAME_PATTERN.test(stock.name)) {
    logger.warn('Invalid stock name format:', stock.name);
    return false;
  }

  // Validate instrumentToken is a number
  if (typeof stock.instrumentToken !== 'number' || isNaN(stock.instrumentToken)) {
    logger.warn('Invalid instrumentToken: must be a number', stock.instrumentToken);
    return false;
  }

  // Validate exchange format
  if (typeof stock.exchange !== 'string' || stock.exchange.length === 0) {
    logger.warn('Invalid exchange format:', stock.exchange);
    return false;
  }

  return true;
}

/**
 * Validate stock came from legitimate API response
 * Checks for client-side manipulation indicators
 */
export function validateStockSource(stock: Stock): boolean {
  // Check if stock has suspicious field values
  if (stock.symbol.length > 20) {
    logger.warn('Suspiciously long stock symbol:', stock.symbol);
    return false;
  }

  if (stock.name.length > 200) {
    logger.warn('Suspiciously long stock name:', stock.name);
    return false;
  }

  // Instrument token should be within reasonable range (positive integer)
  if (stock.instrumentToken <= 0 || stock.instrumentToken > 99999999) {
    logger.warn('Instrument token outside valid range:', stock.instrumentToken);
    return false;
  }

  // Exchange should be a known exchange code
  const validExchanges = ['NSE', 'BSE', 'NFO', 'MCX', 'BFO', 'CDS'];
  if (!validExchanges.includes(stock.exchange)) {
    logger.warn('Unknown exchange:', stock.exchange);
    return false;
  }

  return true;
}

/**
 * Validate array of selected stocks before sending to backend
 */
export function validateSelectedStocks(
  stocks: Stock[],
  minCount: number,
  maxCount: number
): { valid: boolean; error?: string } {
  // Check count
  if (stocks.length < minCount) {
    return {
      valid: false,
      error: `At least ${minCount} stocks required`,
    };
  }

  if (stocks.length > maxCount) {
    return {
      valid: false,
      error: `Maximum ${maxCount} stocks allowed`,
    };
  }

  // Validate each stock structure
  for (const stock of stocks) {
    if (!validateStockStructure(stock)) {
      return {
        valid: false,
        error: 'Invalid stock data detected',
      };
    }

    if (!validateStockSource(stock)) {
      return {
        valid: false,
        error: 'Stock data validation failed',
      };
    }
  }

  // Check for duplicate symbols
  const symbols = stocks.map(s => s.symbol);
  const uniqueSymbols = new Set(symbols);
  if (symbols.length !== uniqueSymbols.size) {
    logger.warn('Duplicate symbols detected:', symbols);
    return {
      valid: false,
      error: 'Duplicate stocks detected',
    };
  }

  // Validate instrument tokens are unique
  const instrumentTokens = stocks.map(s => s.instrumentToken);
  const uniqueTokens = new Set(instrumentTokens);
  if (instrumentTokens.length !== uniqueTokens.size) {
    logger.warn('Duplicate instrument tokens detected:', instrumentTokens);
    return {
      valid: false,
      error: 'Invalid stock data: duplicate tokens',
    };
  }

  return { valid: true };
}

/**
 * Sanitize stock symbols array before API call
 */
export function sanitizeStockSymbols(stocks: Stock[]): string[] {
  return stocks
    .filter(stock => validateStockStructure(stock) && validateStockSource(stock))
    .map(stock => stock.symbol.toUpperCase().trim());
}

/**
 * Check if a stock is already in the selection
 */
export function isDuplicateStock(stock: Stock, selectedStocks: Stock[]): boolean {
  return selectedStocks.some(
    s => s.symbol === stock.symbol || s.instrumentToken === stock.instrumentToken
  );
}

/**
 * Log suspicious activity for debugging/monitoring
 */
export function logSuspiciousActivity(action: string, details: any): void {
  const timestamp = new Date().toISOString();
  logger.warn(`Security Alert ${timestamp} - ${action}`, details);
}
