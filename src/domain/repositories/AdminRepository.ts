/**
 * Domain Repository Interface: Admin Operations
 * Defines contract for admin-only operations (Dependency Inversion Principle)
 */

import { User } from '../entities/User';
import { KiteStatusResponse } from '../usecases/admin/CheckKiteStatusUseCase';

export interface AdminRepository {
  // Kite Authentication (Admin only)
  getKiteLoginUrl(): Promise<string>;
  handleKiteCallback(requestToken: string): Promise<string>;
  checkKiteStatus(): Promise<KiteStatusResponse>;

  // User Management (Admin only)
  getAllUsers(): Promise<User[]>;
  getUserById(userId: string): Promise<User>;
  getUserByEmail(email: string): Promise<User>;
}
