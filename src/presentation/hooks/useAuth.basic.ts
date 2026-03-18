/**
 * Auth Hook
 * Provides authentication state and methods throughout the app
 */

import { useState, useEffect, useCallback } from 'react';
import { container } from '@/src/core/di/container';
import { User, UserRole } from '@/src/domain/entities/User';
import { LoginRequest } from '@/src/domain/usecases/auth/LoginUseCase';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  // Initialize: Check if user is already logged in
  useEffect(() => {
    checkCurrentUser();
  }, []);

  const checkCurrentUser = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const user = await container.getCurrentUserUseCase.execute();
      setState({ user, loading: false, error: null });
    } catch (error) {
      // User is not logged in or token is invalid
      setState({ user: null, loading: false, error: null });
    }
  };

  const login = useCallback(async (credentials: LoginRequest): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await container.loginUseCase.execute(credentials);

      // Check if user is ADMIN
      if (response.user.role !== UserRole.ADMIN) {
        await logout(); // Clear any stored tokens
        throw new Error('Access denied. Admin privileges required.');
      }

      setState({ user: response.user, loading: false, error: null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setState({ user: null, loading: false, error: errorMessage });
      throw error;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      await container.logoutUseCase.execute();
      setState({ user: null, loading: false, error: null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Logout failed';
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  }, []);

  const getCurrentUser = useCallback(async (): Promise<User | null> => {
    try {
      const user = await container.getCurrentUserUseCase.execute();
      setState((prev) => ({ ...prev, user }));
      return user;
    } catch (error) {
      setState((prev) => ({ ...prev, user: null }));
      return null;
    }
  }, []);

  const isAuthenticated = !!state.user;
  const isAdmin = state.user?.role === UserRole.ADMIN;

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    getCurrentUser,
  };
};
