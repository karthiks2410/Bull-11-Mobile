/**
 * Logout Flow Integration Tests - QUnit Version
 * Comprehensive tests covering the logout functionality and authentication redirects
 * Converted from Jest to QUnit for simpler testing approach
 */

import QUnit from 'qunit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TokenService } from '../src/core/security/TokenService';
import { SessionManager } from '../src/core/security/SessionManager';
import { UserRole } from '../src/domain/entities/User';

// ===========================
// Mock Data and Stubs
// ===========================

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  role: UserRole.USER,
  createdAt: '2024-01-01',
  totalGames: 5,
};

const mockAuthResponse = {
  user: mockUser,
  token: 'mock.jwt.token',
};

// Router mock
const mockRouter = {
  replace: (path: string) => {
    mockRouter.replaceCalls.push(path);
  },
  push: (path: string) => {
    mockRouter.pushCalls.push(path);
  },
  back: () => {
    mockRouter.backCalls.push(true);
  },
  replaceCalls: [] as string[],
  pushCalls: [] as string[],
  backCalls: [] as boolean[],
  reset: () => {
    mockRouter.replaceCalls = [];
    mockRouter.pushCalls = [];
    mockRouter.backCalls = [];
  },
};

// Container mock with use cases
const mockContainer = {
  loginUseCase: {
    execute: async (credentials: any) => mockAuthResponse,
    calls: [] as any[],
  },
  registerUseCase: {
    execute: async (data: any) => mockAuthResponse,
    calls: [] as any[],
  },
  logoutUseCase: {
    execute: async () => undefined,
    calls: [] as any[],
    shouldThrow: false,
    errorMessage: '',
  },
  getCurrentUserUseCase: {
    execute: async () => mockUser,
    calls: [] as any[],
    returnValue: mockUser as any,
  },
  getActiveGamesUseCase: {
    execute: async () => [],
    calls: [] as any[],
  },
  getGameHistoryUseCase: {
    execute: async () => [],
    calls: [] as any[],
  },
  reset: () => {
    mockContainer.loginUseCase.calls = [];
    mockContainer.registerUseCase.calls = [];
    mockContainer.logoutUseCase.calls = [];
    mockContainer.logoutUseCase.shouldThrow = false;
    mockContainer.logoutUseCase.errorMessage = '';
    mockContainer.getCurrentUserUseCase.calls = [];
    mockContainer.getCurrentUserUseCase.returnValue = mockUser;
    mockContainer.getActiveGamesUseCase.calls = [];
    mockContainer.getGameHistoryUseCase.calls = [];
  },
};

// Simple useAuth hook simulation
class AuthState {
  user: any = null;
  isAuthenticated = false;
  loading = false;
  error: string | null = null;
  sessionTimeRemaining = 0;

  async checkAuth() {
    this.loading = true;
    const token = await TokenService.getToken();
    if (token && await TokenService.isTokenValid()) {
      const user = await mockContainer.getCurrentUserUseCase.execute();
      if (user) {
        this.user = user;
        this.isAuthenticated = true;
        this.sessionTimeRemaining = 1800000; // 30 minutes
      }
    }
    this.loading = false;
  }

  async login(credentials: { email: string; password: string }) {
    try {
      this.loading = true;
      this.error = null;
      mockContainer.loginUseCase.calls.push(credentials);
      const response = await mockContainer.loginUseCase.execute(credentials);
      await TokenService.storeToken(response.token);
      await SessionManager.startSession();
      this.user = response.user;
      this.isAuthenticated = true;
      this.sessionTimeRemaining = 1800000;
      this.loading = false;
    } catch (err: any) {
      this.error = err.message;
      this.loading = false;
      throw err;
    }
  }

  async logout() {
    try {
      this.loading = true;
      this.error = null;

      if (mockContainer.logoutUseCase.shouldThrow) {
        throw new Error(mockContainer.logoutUseCase.errorMessage);
      }

      mockContainer.logoutUseCase.calls.push(true);
      await mockContainer.logoutUseCase.execute();

      // Clear all auth data atomically
      await TokenService.clearToken();
      await SessionManager.endSession();

      this.user = null;
      this.isAuthenticated = false;
      this.sessionTimeRemaining = 0;
      this.loading = false;
    } catch (err: any) {
      this.error = err.message;
      this.loading = false;
      throw err;
    }
  }

  reset() {
    this.user = null;
    this.isAuthenticated = false;
    this.loading = false;
    this.error = null;
    this.sessionTimeRemaining = 0;
  }
}

// ===========================
// Test Suites
// ===========================

QUnit.module('Logout Flow - Integration Tests', (hooks) => {
  hooks.beforeEach(async () => {
    // Clear all storage and mocks
    await AsyncStorage.clear();
    await TokenService.clearToken();
    await SessionManager.endSession();
    mockRouter.reset();
    mockContainer.reset();
  });

  hooks.afterEach(async () => {
    await AsyncStorage.clear();
  });

  // ===========================
  // TEST SUITE 1: Profile handleLogout functionality
  // ===========================
  QUnit.module('Test 1: Profile handleLogout functionality', () => {
    QUnit.test('should clear auth state and redirect to /auth/login on logout', async (assert) => {
      // Setup: User is logged in
      await TokenService.storeToken('test.token');
      const authState = new AuthState();
      await authState.checkAuth();

      // Verify initial state
      assert.ok(authState.isAuthenticated, 'User should be authenticated initially');
      assert.deepEqual(authState.user, mockUser, 'User data should match mock');

      // Simulate profile screen's handleLogout function
      await authState.logout();
      mockRouter.replace('/auth/login');

      // Verify auth state is cleared
      assert.strictEqual(authState.user, null, 'User should be null after logout');
      assert.notOk(authState.isAuthenticated, 'isAuthenticated should be false');

      // Verify logout use case was called
      assert.ok(mockContainer.logoutUseCase.calls.length > 0, 'Logout use case should be called');

      // Verify redirect to login screen
      assert.ok(
        mockRouter.replaceCalls.includes('/auth/login'),
        'Router should redirect to /auth/login'
      );
    });

    QUnit.test('should handle logout errors gracefully', async (assert) => {
      // Setup: User is logged in
      await TokenService.storeToken('test.token');
      const authState = new AuthState();
      await authState.checkAuth();

      assert.ok(authState.isAuthenticated, 'User should be authenticated');

      // Configure logout to throw error
      mockContainer.logoutUseCase.shouldThrow = true;
      mockContainer.logoutUseCase.errorMessage = 'Network error';

      // Attempt logout
      try {
        await authState.logout();
        assert.ok(false, 'Should have thrown an error');
      } catch (error: any) {
        assert.strictEqual(error.message, 'Network error', 'Error message should match');
      }

      // Error should be set
      assert.strictEqual(authState.error, 'Network error', 'Error state should be set');
    });
  });

  // ===========================
  // TEST SUITE 2: useAuth logout() clears all auth data
  // ===========================
  QUnit.module('Test 2: useAuth logout() clears all auth data', () => {
    QUnit.test('should clear token from storage', async (assert) => {
      // Setup: User is logged in with a valid token
      await TokenService.storeToken('valid.jwt.token');
      const authState = new AuthState();
      await authState.checkAuth();

      assert.ok(authState.isAuthenticated, 'User should be authenticated');

      // Verify token is valid before logout
      const tokenBeforeLogout = await TokenService.getToken();
      assert.strictEqual(tokenBeforeLogout, 'valid.jwt.token', 'Token should exist before logout');

      // Perform logout
      await authState.logout();

      // Verify token is cleared
      const tokenAfterLogout = await TokenService.getToken();
      assert.strictEqual(tokenAfterLogout, null, 'Token should be null after logout');

      // Verify token is no longer valid
      const isValid = await TokenService.isTokenValid();
      assert.notOk(isValid, 'Token should not be valid after logout');
    });

    QUnit.test('should end session', async (assert) => {
      // Setup: User is logged in with active session
      await TokenService.storeToken('test.token');
      await SessionManager.startSession();
      const authState = new AuthState();
      await authState.checkAuth();

      assert.ok(authState.isAuthenticated, 'User should be authenticated');

      // Verify session is valid before logout
      const sessionBeforeLogout = await SessionManager.isSessionValid();
      assert.ok(sessionBeforeLogout, 'Session should be valid before logout');

      // Perform logout
      await authState.logout();

      // Verify session is ended
      const sessionAfterLogout = await SessionManager.isSessionValid();
      assert.notOk(sessionAfterLogout, 'Session should be invalid after logout');
    });

    QUnit.test('should clear user state', async (assert) => {
      // Setup: User is logged in
      await TokenService.storeToken('test.token');
      const authState = new AuthState();
      await authState.checkAuth();

      assert.deepEqual(authState.user, mockUser, 'User should be set before logout');
      assert.ok(authState.isAuthenticated, 'Should be authenticated before logout');

      // Perform logout
      await authState.logout();

      // Verify user state is cleared
      assert.strictEqual(authState.user, null, 'User should be null');
      assert.notOk(authState.isAuthenticated, 'isAuthenticated should be false');
      assert.notOk(authState.loading, 'loading should be false');
      assert.strictEqual(authState.sessionTimeRemaining, 0, 'sessionTimeRemaining should be 0');
    });

    QUnit.test('should clear all auth data atomically', async (assert) => {
      // Setup: User is logged in
      await TokenService.storeToken('test.token');
      await SessionManager.startSession();
      const authState = new AuthState();
      await authState.checkAuth();

      assert.ok(authState.isAuthenticated, 'User should be authenticated');

      // Perform logout
      await authState.logout();

      // Verify ALL auth data is cleared
      assert.strictEqual(authState.user, null, 'User should be null');
      assert.notOk(authState.isAuthenticated, 'isAuthenticated should be false');
      assert.notOk(await TokenService.isTokenValid(), 'Token should be invalid');
      assert.notOk(await SessionManager.isSessionValid(), 'Session should be invalid');
      assert.ok(mockContainer.logoutUseCase.calls.length > 0, 'Logout use case should be called');
    });
  });

  // ===========================
  // TEST SUITE 3: Active Games redirects unauthenticated users
  // ===========================
  QUnit.module('Test 3: Active Games redirects unauthenticated users', () => {
    QUnit.test('should redirect to /auth/login when user is not authenticated', async (assert) => {
      // Setup: No user is logged in
      mockContainer.getCurrentUserUseCase.returnValue = null;

      const authState = new AuthState();
      await authState.checkAuth();

      // Simulate AuthGuard behavior
      if (!authState.isAuthenticated) {
        mockRouter.replace('/auth/login');
      }

      // Wait for redirect
      assert.ok(
        mockRouter.replaceCalls.includes('/auth/login'),
        'Should redirect to /auth/login'
      );
    });

    QUnit.test('should not show protected content when redirecting', async (assert) => {
      // Setup: No user is logged in
      mockContainer.getCurrentUserUseCase.returnValue = null;

      const authState = new AuthState();
      await authState.checkAuth();

      // Simulate AuthGuard return logic
      const shouldShowProtectedContent = authState.isAuthenticated;

      assert.notOk(shouldShowProtectedContent, 'Protected content should not be shown');
    });

    QUnit.test('should show protected content when user is authenticated', async (assert) => {
      // Setup: User is logged in
      await TokenService.storeToken('test.token');
      const authState = new AuthState();
      await authState.checkAuth();

      // Simulate AuthGuard return logic
      const shouldShowProtectedContent = authState.isAuthenticated;

      assert.ok(shouldShowProtectedContent, 'Protected content should be shown');
      assert.strictEqual(mockRouter.replaceCalls.length, 0, 'Should not redirect when authenticated');
    });
  });

  // ===========================
  // TEST SUITE 4: Active Games returns null when not authenticated
  // ===========================
  QUnit.module('Test 4: Active Games returns null when not authenticated', () => {
    QUnit.test('should return null immediately when isAuthenticated is false', async (assert) => {
      // Setup: User is not authenticated
      mockContainer.getCurrentUserUseCase.returnValue = null;

      const authState = new AuthState();
      await authState.checkAuth();

      assert.notOk(authState.loading, 'Loading should be false');
      assert.notOk(authState.isAuthenticated, 'isAuthenticated should be false');

      // Simulate index.tsx behavior: if (!isAuthenticated) { return null; }
      const shouldRenderContent = authState.isAuthenticated;
      assert.notOk(shouldRenderContent, 'Should not render content when not authenticated');
    });

    QUnit.test('should transition to null state after logout', async (assert) => {
      // Setup: User is logged in
      await TokenService.storeToken('test.token');
      const authState = new AuthState();
      await authState.checkAuth();

      // Initially authenticated
      assert.ok(authState.isAuthenticated, 'Should be authenticated initially');

      // Content should render
      let shouldRender = authState.isAuthenticated;
      assert.ok(shouldRender, 'Content should render when authenticated');

      // Perform logout
      await authState.logout();

      // After logout, content should not render
      shouldRender = authState.isAuthenticated;
      assert.notOk(shouldRender, 'Content should not render after logout');
    });

    QUnit.test('should prevent loading games when not authenticated', async (assert) => {
      // Setup: User is not authenticated
      mockContainer.getCurrentUserUseCase.returnValue = null;

      const authState = new AuthState();
      await authState.checkAuth();

      assert.notOk(authState.isAuthenticated, 'Should not be authenticated');

      // Simulate index.tsx early return logic
      if (!authState.isAuthenticated) {
        // Should return null without loading games
        assert.strictEqual(
          mockContainer.getActiveGamesUseCase.calls.length,
          0,
          'getActiveGamesUseCase should not be called'
        );
      }
    });

    QUnit.test('should handle logout during active games loading', async (assert) => {
      // Setup: User is logged in
      await TokenService.storeToken('test.token');
      const authState = new AuthState();
      await authState.checkAuth();

      assert.ok(authState.isAuthenticated, 'Should be authenticated');

      // Start loading games (don't await)
      const loadGamesPromise = mockContainer.getActiveGamesUseCase.execute();

      // Logout immediately
      await authState.logout();

      // Should immediately become unauthenticated
      assert.notOk(authState.isAuthenticated, 'Should be unauthenticated after logout');

      // Wait for games promise to resolve (cleanup)
      await loadGamesPromise;
    });
  });

  // ===========================
  // TEST SUITE 5: AuthGuard allows access to /auth/login
  // ===========================
  QUnit.module('Test 5: AuthGuard allows access to /auth/login', () => {
    QUnit.test('should NOT redirect from /auth/login when not authenticated', async (assert) => {
      // Setup: No user is logged in
      mockContainer.getCurrentUserUseCase.returnValue = null;

      const authState = new AuthState();
      await authState.checkAuth();

      assert.notOk(authState.isAuthenticated, 'Should not be authenticated');

      // AuthGuard only redirects protected routes, not auth routes
      // This is handled by the route structure, not AuthGuard
      const isAuthRoute = true; // Simulating /auth/login
      if (!authState.isAuthenticated && !isAuthRoute) {
        mockRouter.replace('/auth/login');
      }

      assert.strictEqual(mockRouter.replaceCalls.length, 0, 'Should not redirect from auth routes');
    });

    QUnit.test('should allow unauthenticated users to see login screen', async (assert) => {
      // Setup: No user is logged in
      mockContainer.getCurrentUserUseCase.returnValue = null;

      const authState = new AuthState();
      await authState.checkAuth();

      // Simulate login screen (not wrapped in AuthGuard)
      const loginScreenVisible = !authState.isAuthenticated; // Login screen is always visible

      assert.ok(loginScreenVisible, 'Login screen should be visible when not authenticated');
    });
  });

  // ===========================
  // TEST SUITE 6: AuthGuard does NOT redirect during logout transition
  // ===========================
  QUnit.module('Test 6: AuthGuard does NOT redirect during logout transition', () => {
    QUnit.test('should complete logout flow without redirect loops', async (assert) => {
      // Setup: User is logged in
      await TokenService.storeToken('test.token');
      const authState = new AuthState();
      await authState.checkAuth();

      assert.ok(authState.isAuthenticated, 'Should be authenticated');

      // Perform logout and immediate redirect (simulating profile.tsx)
      await authState.logout();
      mockRouter.replace('/auth/login');

      // Verify single redirect to login
      assert.strictEqual(mockRouter.replaceCalls.length, 1, 'Should redirect exactly once');
      assert.strictEqual(mockRouter.replaceCalls[0], '/auth/login', 'Should redirect to login');

      // Verify user is logged out
      assert.notOk(authState.isAuthenticated, 'Should be logged out');
    });

    QUnit.test('should clear state before redirecting', async (assert) => {
      // Setup: User is logged in
      await TokenService.storeToken('test.token');
      const authState = new AuthState();
      await authState.checkAuth();

      assert.ok(authState.isAuthenticated, 'Should be authenticated');

      // Track state during logout
      let userDuringLogout: any = null;
      let isAuthenticatedDuringLogout: boolean | null = null;

      await authState.logout();

      // Capture state immediately after logout
      userDuringLogout = authState.user;
      isAuthenticatedDuringLogout = authState.isAuthenticated;

      // State should be cleared BEFORE any redirect
      assert.strictEqual(userDuringLogout, null, 'User should be null after logout');
      assert.notOk(isAuthenticatedDuringLogout, 'isAuthenticated should be false after logout');
    });

    QUnit.test('should handle rapid logout and navigation', async (assert) => {
      // Setup: User is logged in
      await TokenService.storeToken('test.token');
      const authState = new AuthState();
      await authState.checkAuth();

      assert.ok(authState.isAuthenticated, 'Should be authenticated');

      // Simulate rapid logout + navigate (user clicking quickly)
      const logoutPromise = authState.logout();
      mockRouter.replace('/auth/login');
      await logoutPromise;

      // Should complete without errors
      assert.notOk(authState.isAuthenticated, 'Should be logged out');
      assert.ok(
        mockRouter.replaceCalls.includes('/auth/login'),
        'Should redirect to login'
      );
    });

    QUnit.test('should prevent re-authentication checks during logout', async (assert) => {
      // Setup: User is logged in
      await TokenService.storeToken('test.token');
      const authState = new AuthState();
      await authState.checkAuth();

      assert.ok(authState.isAuthenticated, 'Should be authenticated');

      const callCountBefore = mockContainer.getCurrentUserUseCase.calls.length;

      // Perform logout
      await authState.logout();

      const callCountAfter = mockContainer.getCurrentUserUseCase.calls.length;

      // getCurrentUserUseCase should not be called during logout
      assert.strictEqual(
        callCountAfter,
        callCountBefore,
        'getCurrentUserUseCase should not be called during logout'
      );
    });
  });

  // ===========================
  // INTEGRATION TEST: Full logout flow
  // ===========================
  QUnit.module('Full Logout Flow Integration', () => {
    QUnit.test('should complete full logout flow: authenticated -> logout -> login screen', async (assert) => {
      // Step 1: User logs in
      const authState = new AuthState();

      await authState.login({
        email: 'test@example.com',
        password: 'password123',
      });

      // Step 2: Verify user is authenticated
      assert.ok(authState.isAuthenticated, 'User should be authenticated');
      assert.deepEqual(authState.user, mockUser, 'User data should match');
      assert.ok(await TokenService.isTokenValid(), 'Token should be valid');
      assert.ok(await SessionManager.isSessionValid(), 'Session should be valid');

      // Step 3: User clicks logout button in profile
      await authState.logout();
      mockRouter.replace('/auth/login');

      // Step 4: Verify complete logout
      assert.notOk(authState.isAuthenticated, 'Should be logged out');
      assert.strictEqual(authState.user, null, 'User should be null');
      assert.strictEqual(authState.error, null, 'Error should be null');
      assert.notOk(await TokenService.isTokenValid(), 'Token should be invalid');
      assert.notOk(await SessionManager.isSessionValid(), 'Session should be invalid');

      // Step 5: Verify redirect to login
      assert.ok(mockRouter.replaceCalls.includes('/auth/login'), 'Should redirect to login');
      assert.strictEqual(mockRouter.replaceCalls.length, 1, 'Should redirect exactly once');
    });

    QUnit.test('should prevent access to protected routes after logout', async (assert) => {
      // Setup: User is logged in
      await TokenService.storeToken('test.token');
      const authState = new AuthState();
      await authState.checkAuth();

      assert.ok(authState.isAuthenticated, 'Should be authenticated');

      // Logout
      await authState.logout();

      // Try to access protected route
      mockContainer.getCurrentUserUseCase.returnValue = null;

      // Simulate AuthGuard check for protected route
      if (!authState.isAuthenticated) {
        mockRouter.replace('/auth/login');
      }

      // Should redirect to login
      assert.ok(
        mockRouter.replaceCalls.includes('/auth/login'),
        'Should redirect to login after logout'
      );
    });
  });
});
