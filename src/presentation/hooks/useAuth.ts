/**
 * Enhanced Auth Hook with Security Features
 * Provides authentication state and methods with security enhancements
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState } from 'react-native';
import { container } from '@/src/core/di/container';
import { User, UserRole } from '@/src/domain/entities/User';
import { LoginRequest } from '@/src/domain/usecases/auth/LoginUseCase';
import { RegisterRequest } from '@/src/domain/usecases/auth/RegisterUseCase';
import {
  TokenService,
  RateLimiter,
  SessionManager,
  RoleValidator,
  AuditLogger,
  AuditAction,
} from '@/src/core/security';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  sessionTimeRemaining: number; // seconds until auto-logout
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
    sessionTimeRemaining: 0,
  });

  const roleValidator = useRef(new RoleValidator(container.getCurrentUserUseCase));
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize: Check if user is already logged in
  useEffect(() => {
    checkCurrentUser();
    initializeSession();

    return () => {
      SessionManager.cleanup();
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
      }
    };
  }, []);

  // Monitor app state for background/foreground transitions
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState === 'active' && state.user) {
        // App came to foreground - verify session
        const isValid = await SessionManager.isSessionValid();
        if (!isValid) {
          await handleSessionExpiry();
        } else {
          // Re-verify admin role
          await verifyAdminRoleOnResume();
        }
      }
    });

    return () => subscription.remove();
  }, [state.user]);

  const initializeSession = () => {
    SessionManager.initialize(async () => {
      await handleSessionExpiry();
    });

    // Update session time remaining every minute
    sessionTimerRef.current = setInterval(async () => {
      const remaining = await SessionManager.getTimeUntilExpiry();
      setState((prev) => ({ ...prev, sessionTimeRemaining: remaining }));
    }, 60000) as any; // Update every minute
  };

  const handleSessionExpiry = async () => {
    await AuditLogger.log(
      AuditAction.LOGOUT,
      state.user?.id,
      state.user?.email,
      { reason: 'session_timeout' }
    );

    await logout();
    setState((prev) => ({
      ...prev,
      error: 'Session expired due to inactivity. Please login again.',
    }));
  };

  const checkCurrentUser = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      // Check token validity
      const isTokenValid = await TokenService.isTokenValid();

      if (!isTokenValid) {
        setState({ user: null, loading: false, error: null, sessionTimeRemaining: 0 });
        return;
      }

      const user = await container.getCurrentUserUseCase.execute();

      setState({ user, loading: false, error: null, sessionTimeRemaining: 0 });
      await SessionManager.startSession();
    } catch (error) {
      // User is not logged in or token is invalid
      setState({ user: null, loading: false, error: null, sessionTimeRemaining: 0 });
    }
  };

  const login = useCallback(async (credentials: LoginRequest): Promise<User> => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      // Check rate limiting
      const rateLimitCheck = await RateLimiter.isAllowed(credentials.email);
      if (!rateLimitCheck.allowed) {
        const lockoutTime = await RateLimiter.getLockoutTime(credentials.email);
        const minutes = Math.ceil(lockoutTime / 60);
        throw new Error(
          `Too many failed login attempts. Please try again in ${minutes} minutes.`
        );
      }

      try {
        const response = await container.loginUseCase.execute(credentials);

        // Success - reset rate limiter
        await RateLimiter.reset(credentials.email);

        // Log successful login
        await AuditLogger.log(
          AuditAction.LOGIN,
          response.user.id,
          response.user.email,
          { timestamp: Date.now(), role: response.user.role },
          true
        );

        setState({ user: response.user, loading: false, error: null, sessionTimeRemaining: 0 });

        // Start session management
        await SessionManager.startSession();

        return response.user;
      } catch (error) {
        // Record failed attempt
        await RateLimiter.recordAttempt(credentials.email);
        throw error;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setState({ user: null, loading: false, error: errorMessage, sessionTimeRemaining: 0 });
      throw error;
    }
  }, []);

  const register = useCallback(async (credentials: RegisterRequest): Promise<User> => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      // Execute registration (returns user only, no token/login)
      const response = await container.registerUseCase.execute(credentials);

      // Log registration
      await AuditLogger.log(
        AuditAction.LOGIN,
        response.user.id,
        response.user.email,
        { timestamp: Date.now(), isNewUser: true },
        true
      );

      setState((prev) => ({ ...prev, loading: false, error: null }));

      // Return user without setting auth state - they need to login
      return response.user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setState({ user: null, loading: false, error: errorMessage, sessionTimeRemaining: 0 });
      throw error;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      if (state.user) {
        await AuditLogger.log(
          AuditAction.LOGOUT,
          state.user.id,
          state.user.email,
          { timestamp: Date.now() }
        );
      }

      // Clear token from storage
      await container.logoutUseCase.execute();

      await SessionManager.endSession();

      // Clear state immediately
      setState({ user: null, loading: false, error: null, sessionTimeRemaining: 0 });

      // Small delay to ensure state is updated before navigation
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Logout failed';
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  }, [state.user]);

  const getCurrentUser = useCallback(async (): Promise<User | null> => {
    try {
      const user = await container.getCurrentUserUseCase.execute();
      setState((prev) => ({ ...prev, user }));
      await SessionManager.updateActivity();
      return user;
    } catch (error) {
      setState((prev) => ({ ...prev, user: null }));
      return null;
    }
  }, []);

  const verifyAdminRoleOnResume = async () => {
    if (!state.user) return;

    const result = await roleValidator.current.verifyWithEscalationCheck();

    if (!result.isValid && result.shouldLogout) {
      await AuditLogger.log(
        AuditAction.PRIVILEGE_ESCALATION_DETECTED,
        state.user.id,
        state.user.email,
        { reason: result.reason },
        false
      );

      await logout();
      setState((prev) => ({
        ...prev,
        error: result.reason || 'Access denied. Please login again.',
      }));
    }
  };

  const updateActivity = useCallback(async () => {
    await SessionManager.updateActivity();
  }, []);

  const isAuthenticated = !!state.user;
  const isAdmin = state.user?.role === UserRole.ADMIN;

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    isAuthenticated,
    isAdmin,
    sessionTimeRemaining: state.sessionTimeRemaining,
    login,
    register,
    logout,
    getCurrentUser,
    updateActivity,
  };
};
