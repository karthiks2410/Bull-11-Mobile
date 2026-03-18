/**
 * Role Validator
 * Validates and re-checks user roles for authorization
 */

import { User, UserRole } from '@/src/domain/entities/User';
import { GetCurrentUserUseCase } from '@/src/domain/usecases/auth/GetCurrentUserUseCase';

export class RoleValidator {
  constructor(private readonly getCurrentUserUseCase: GetCurrentUserUseCase) {}

  /**
   * Verify user has ADMIN role (server-side check)
   */
  async verifyAdminRole(): Promise<{
    isAdmin: boolean;
    user?: User;
    error?: string;
  }> {
    try {
      const user = await this.getCurrentUserUseCase.execute();

      if (user.role !== UserRole.ADMIN) {
        return {
          isAdmin: false,
          user,
          error: 'Access denied. Admin privileges required.',
        };
      }

      return { isAdmin: true, user };
    } catch (error: any) {
      return {
        isAdmin: false,
        error: error.message || 'Failed to verify admin role',
      };
    }
  }

  /**
   * Verify user has specific role
   */
  async verifyRole(requiredRole: UserRole): Promise<boolean> {
    try {
      const user = await this.getCurrentUserUseCase.execute();
      return user.role === requiredRole;
    } catch {
      return false;
    }
  }

  /**
   * Check if user has any of the specified roles
   */
  async hasAnyRole(roles: UserRole[]): Promise<boolean> {
    try {
      const user = await this.getCurrentUserUseCase.execute();
      return roles.includes(user.role);
    } catch {
      return false;
    }
  }

  /**
   * Verify admin role with retry on 403 (privilege escalation detection)
   */
  async verifyWithEscalationCheck(): Promise<{
    isValid: boolean;
    shouldLogout: boolean;
    reason?: string;
  }> {
    try {
      const result = await this.verifyAdminRole();

      if (!result.isAdmin) {
        // User exists but doesn't have admin role
        // This could indicate privilege escalation attempt
        return {
          isValid: false,
          shouldLogout: true,
          reason: 'Role mismatch detected. Please re-authenticate.',
        };
      }

      return { isValid: true, shouldLogout: false };
    } catch (error: any) {
      // Check if it's a 403 Forbidden error
      if (error.message?.includes('403') || error.message?.includes('Forbidden')) {
        return {
          isValid: false,
          shouldLogout: true,
          reason: 'Access denied by server. Your session may have been revoked.',
        };
      }

      // Other errors (network, etc.)
      return {
        isValid: false,
        shouldLogout: false,
        reason: error.message || 'Failed to verify role',
      };
    }
  }
}
