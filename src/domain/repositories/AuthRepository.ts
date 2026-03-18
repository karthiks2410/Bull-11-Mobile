/**
 * Domain Repository Interface: Authentication
 * Defines contract for auth operations (Dependency Inversion Principle)
 */

import { User } from '../entities/User';

export interface AuthRepository {
  login(email: string, password: string): Promise<{ token: string; user: User }>;
  register(email: string, password: string, name: string): Promise<User>;
  getCurrentUser(): Promise<User>;
  logout(): Promise<void>;
  storeToken(token: string): Promise<void>;
  getToken(): Promise<string | null>;
  clearToken(): Promise<void>;
}
