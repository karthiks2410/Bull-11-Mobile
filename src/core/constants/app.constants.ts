/**
 * Core Constants
 * Centralized configuration values
 */

export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8080',
  WS_URL: process.env.EXPO_PUBLIC_WS_URL || 'http://localhost:8080/ws',
  TIMEOUT: 10000,
} as const;

export const STORAGE_KEYS = {
  JWT_TOKEN: 'bull11_jwt_token',
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    ME: '/api/auth/me',
  },
  GAMES: {
    START: '/api/games/start',
    LIVE: (id: string) => `/api/games/${id}/live`,
    CLOSE: (id: string) => `/api/games/${id}/close`,
    CANCEL: (id: string) => `/api/games/${id}/cancel`,
    HISTORY: '/api/games/history',
    DETAILS: (id: string) => `/api/games/${id}`,
  },
  STOCKS: {
    SEARCH: '/api/kite/instruments/search',
  },
  ADMIN: {
    KITE_LOGIN_URL: '/api/kite/auth/login-url',
    KITE_CALLBACK: '/api/kite/auth/callback',
    KITE_STATUS: '/api/kite/auth/status',
    USERS: '/api/admin/users',
    USER_BY_ID: (id: string) => `/api/admin/users/${id}`,
    USER_BY_EMAIL: (email: string) => `/api/admin/users/email/${email}`,
  },
} as const;

export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  GAME_MIN_STOCKS: 3,
  GAME_MAX_STOCKS: 5,
} as const;
