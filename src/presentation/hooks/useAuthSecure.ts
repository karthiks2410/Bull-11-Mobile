/**
 * Enhanced Auth Hook with Security Features
 * Provides authentication state with token validation, rate limiting, and session management
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { container } from '@/src/core/di/container';
import { User, UserRole } from '@/src/domain/entities/User';
import { LoginRequest } from '@/src/domain/usecases/auth/LoginUseCase';
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
  tokenExpiresIn: number | null; // seconds until token expires
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
    tokenExpiresIn: null,
  });

  const roleValidator = useRef(
    new RoleValidator(container.getCurrentUserUseCase)
  ).current;
  const appStateRef = useRef(AppState.currentState);

  // Initialize: Check if user is already logged in
  useEffect(() => {
    checkCurrentUser();
    setupSessionManager();
    setupTokenExpiryMonitor();
    setupAppStateListener();

    return () => {
      SessionManager.cleanup();
    };
  }, []);

  const setupSessionManager = () => {
    SessionManager.initialize(() => {
      // Session expired due to inactivity
      handleSessionExpired();
    });
  };

  const setupTokenExpiryMonitor = () => {
    // Check token expiry every minute
    const interval = setInterval(async () => {
      const expiryTime = await TokenService.getTokenExpiryTime();
      setState((prev) => ({ ...prev, tokenExpiresIn: expiryTime }));

      // Auto-logout if token expired
      if (expiryTime === 0 && state.user) {
        await handleTokenExpired();
      }

      // Warn if expiring soon (handled silently)
      if (await TokenService.isTokenExpiringSoon()) {
        // Token expiring soon - could trigger a notification in the future
      }
    }, 60000); // Every minute

    return () => clearInterval(interval);
  };

  const setupAppStateListener = () => {
    const subscription = AppState.addEventListener(
      'change',
      async (nextAppState: AppStateStatus) => {
        if (
          appStateRef.current.match(/inactive|background/) &&
          nextAppState === 'active'
        ) {
          // App came to foreground - re-verify role
          if (state.user) {
            await verifyAdminRoleOnResume();
          }
        }
        appStateRef.current = nextAppState;
      }
    );

    return () => subscription.remove();
  };

  const verifyAdminRoleOnResume = async () => {
    const result = await roleValidator.verifyWithEscalationCheck();

    if (result.shouldLogout) {
      await AuditLogger.log(
        AuditAction.PRIVILEGE_ESCALATION_DETECTED,
        state.user?.id,
        state.user?.email,
        { reason: result.reason },
        false,
        result.reason
      );
      await logout();
    }
  };

  const handleSessionExpired = async () => {
    await AuditLogger.log(
      AuditAction.LOGOUT,
      state.user?.id,
      state.user?.email,
      { reason: 'Session timeout due to inactivity' },
      true
    );
    await logout();
    // TODO: Show "Session expired" notification
  };

  const handleTokenExpired = async () => {
    await AuditLogger.log(
      AuditAction.LOGOUT,
      state.user?.id,
      state.user?.email,
      { reason: 'Token expired' },
      true
    );
    await logout();
    // TODO: Show "Token expired" notification
  };

  const checkCurrentUser = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      // Check if token is valid
      const isTokenValid = await TokenService.isTokenValid();
      if (!isTokenValid) {
        setState({ user: null, loading: false, error: null, tokenExpiresIn: 0 });
        return;
      }

      // Fetch current user
      const user = await container.getCurrentUserUseCase.execute();

      // Get token expiry
      const expiryTime = await TokenService.getTokenExpiryTime();

      setState({ user, loading: false, error: null, tokenExpiresIn: expiryTime });

      // Start session
      await SessionManager.startSession();
    } catch (error) {
      // User is not logged in or token is invalid
      setState({ user: null, loading: false, error: null, tokenExpiresIn: 0 });
    }
  };

  const login = useCallback(async (credentials: LoginRequest): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      // Check rate limit
      const rateLimitCheck = await RateLimiter.isAllowed(credentials.email);
      if (!rateLimitCheck.allowed) {
        const lockoutSeconds = await RateLimiter.getLockoutTime(credentials.email);
        const minutes = Math.ceil(lockoutSeconds / 60);
        throw new Error(
          `Too many failed login attempts. Please try again in ${minutes} minute(s).`
        );
      }

      // Attempt login
      try {
        const response = await container.loginUseCase.execute(credentials);

        // Check if user is ADMIN
        if (response.user.role !== UserRole.ADMIN) {
          await logout(); // Clear any stored tokens
          await AuditLogger.log(
            AuditAction.ACCESS_DENIED,
            response.user.id,
            response.user.email,
            { reason: 'User role is not ADMIN' },
            false,
            'Admin privileges required'
          );
          throw new Error('Access denied. Admin privileges required.');
        }

        // Success - reset rate limit
        await RateLimiter.reset(credentials.email);

        // Get token expiry
        const expiryTime = await TokenService.getTokenExpiryTime();

        setState({
          user: response.user,
          loading: false,
          error: null,
          tokenExpiresIn: expiryTime,
        });

        // Start session
        await SessionManager.startSession();

        // Log successful login
        await AuditLogger.log(
          AuditAction.LOGIN,
          response.user.id,
          response.user.email,
          undefined,
          true
        );
      } catch (loginError) {
        // Record failed attempt
        await RateLimiter.recordAttempt(credentials.email);

        // Log failed login
        await AuditLogger.log(
          AuditAction.LOGIN,
          undefined,
          credentials.email,
          { error: (loginError as Error).message },
          false,
          (loginError as Error).message
        );

        throw loginError;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setState({ user: null, loading: false, error: errorMessage, tokenExpiresIn: 0 });
      throw error;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      // Log logout
      await AuditLogger.log(
        AuditAction.LOGOUT,
        state.user?.id,
        state.user?.email,
        undefined,
        true
      );

      // End session
      await SessionManager.endSession();

      // Logout
      await container.logoutUseCase.execute();

      setState({ user: null, loading: false, error: null, tokenExpiresIn: 0 });
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

      // Update activity
      await SessionManager.updateActivity();

      return user;
    } catch (error) {
      setState((prev) => ({ ...prev, user: null }));
      return null;
    }
  }, []);

  const updateActivity = useCallback(async () => {
    await SessionManager.updateActivity();
  }, []);

  const isAuthenticated = !!state.user;
  const isAdmin = state.user?.role === UserRole.ADMIN;

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    tokenExpiresIn: state.tokenExpiresIn,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    getCurrentUser,
    updateActivity,
  };
};
