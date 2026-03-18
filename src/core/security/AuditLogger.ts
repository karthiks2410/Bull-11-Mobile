/**
 * Audit Logger
 * Logs admin actions for security auditing
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export enum AuditAction {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  KITE_SETUP_INITIATED = 'KITE_SETUP_INITIATED',
  KITE_SETUP_COMPLETED = 'KITE_SETUP_COMPLETED',
  VIEW_ALL_USERS = 'VIEW_ALL_USERS',
  VIEW_USER_DETAIL = 'VIEW_USER_DETAIL',
  SEARCH_USER = 'SEARCH_USER',
  ACCESS_DENIED = 'ACCESS_DENIED',
  PRIVILEGE_ESCALATION_DETECTED = 'PRIVILEGE_ESCALATION_DETECTED',
}

export interface AuditLog {
  id: string;
  action: AuditAction;
  userId?: string;
  userEmail?: string;
  timestamp: number;
  metadata?: Record<string, any>;
  success: boolean;
  errorMessage?: string;
}

export class AuditLogger {
  private static readonly STORAGE_KEY = 'audit_logs';
  private static readonly MAX_LOGS = 100; // Keep last 100 logs

  /**
   * Log an admin action
   */
  static async log(
    action: AuditAction,
    userId?: string,
    userEmail?: string,
    metadata?: Record<string, any>,
    success: boolean = true,
    errorMessage?: string
  ): Promise<void> {
    const log: AuditLog = {
      id: this.generateId(),
      action,
      userId,
      userEmail,
      timestamp: Date.now(),
      metadata,
      success,
      errorMessage,
    };

    try {
      const logs = await this.getLogs();
      logs.unshift(log); // Add to beginning

      // Keep only last MAX_LOGS
      const trimmedLogs = logs.slice(0, this.MAX_LOGS);

      await AsyncStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify(trimmedLogs)
      );

      // In production, you might also want to send this to backend
      // await this.sendToBackend(log);
    } catch (error) {
      // Silently handle audit log failures
      // Logging should not interrupt user flow
    }
  }

  /**
   * Get all audit logs
   */
  static async getLogs(): Promise<AuditLog[]> {
    try {
      const json = await AsyncStorage.getItem(this.STORAGE_KEY);
      return json ? JSON.parse(json) : [];
    } catch {
      return [];
    }
  }

  /**
   * Get logs for specific action
   */
  static async getLogsByAction(action: AuditAction): Promise<AuditLog[]> {
    const logs = await this.getLogs();
    return logs.filter((log) => log.action === action);
  }

  /**
   * Get logs for specific user
   */
  static async getLogsByUser(userId: string): Promise<AuditLog[]> {
    const logs = await this.getLogs();
    return logs.filter((log) => log.userId === userId);
  }

  /**
   * Get failed actions
   */
  static async getFailedActions(): Promise<AuditLog[]> {
    const logs = await this.getLogs();
    return logs.filter((log) => !log.success);
  }

  /**
   * Clear all logs
   */
  static async clearLogs(): Promise<void> {
    await AsyncStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Get logs from last N hours
   */
  static async getRecentLogs(hours: number = 24): Promise<AuditLog[]> {
    const logs = await this.getLogs();
    const cutoffTime = Date.now() - hours * 60 * 60 * 1000;
    return logs.filter((log) => log.timestamp >= cutoffTime);
  }

  private static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Send log to backend (implement if backend supports audit trails)
   */
  private static async sendToBackend(log: AuditLog): Promise<void> {
    // TODO: Implement if backend has audit endpoint
    // Example:
    // await apiClient.post('/api/admin/audit-log', log);
  }
}
