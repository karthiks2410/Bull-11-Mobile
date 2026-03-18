/**
 * Admin Types
 * Type definitions for admin-related components and screens
 */

// Kite OAuth Status
export type KiteAuthStatus = 'idle' | 'authenticating' | 'completing' | 'success' | 'error';

// Kite Status Badge Props
export interface KiteStatusBadgeProps {
  isConnected: boolean;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

// Admin Statistics
export interface AdminStats {
  totalUsers: number;
  activeGames: number;
  kiteConnected: boolean;
  lastUpdated: Date;
}

// Admin Action Card
export interface AdminActionCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
  highlight?: boolean;
}
