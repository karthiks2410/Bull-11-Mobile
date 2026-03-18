/**
 * Auth Integration Tests
 * Tests the authentication flow including useAuth hook behavior
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/src/presentation/hooks/useAuth';
import { TokenService } from '@/src/core/security/TokenService';
import { SessionManager } from '@/src/core/security/SessionManager';
import { RateLimiter } from '@/src/core/security/RateLimiter';

// Mock the container and use cases
jest.mock('@/src/core/di/container', () => ({
  container: {
    loginUseCase: {
      execute: jest.fn(),
    },
    registerUseCase: {
      execute: jest.fn(),
    },
    logoutUseCase: {
      execute: jest.fn(),
    },
    getCurrentUserUseCase: {
      execute: jest.fn(),
    },
  },
}));

// Mock React Native AppState
jest.mock('react-native/Libraries/AppState/AppState', () => ({
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  currentState: 'active',
}));

import { container } from '@/src/core/di/container';
import { UserRole } from '@/src/domain/entities/User';

describe('useAuth Hook Integration', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    role: UserRole.USER,
    createdAt: '2024-01-01',
    totalGames: 0,
  };

  const mockAuthResponse = {
    user: mockUser,
    token: 'mock.jwt.token',
  };

  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
    await TokenService.clearToken();
    await SessionManager.endSession();

    // Reset all mocks
    (container.loginUseCase.execute as jest.Mock).mockReset();
    (container.registerUseCase.execute as jest.Mock).mockReset();
    (container.logoutUseCase.execute as jest.Mock).mockReset();
    (container.getCurrentUserUseCase.execute as jest.Mock).mockReset();
  });

  afterEach(async () => {
    await AsyncStorage.clear();
  });

  describe('Initial State', () => {
    test('should initialize with loading state', async () => {
      (container.getCurrentUserUseCase.execute as jest.Mock).mockResolvedValue(null);

      const { result } = renderHook(() => useAuth());

      expect(result.current.loading).toBe(true);
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    test('should check for existing token on mount', async () => {
      // Store a valid token
      await TokenService.storeToken('existing.token');
      (container.getCurrentUserUseCase.execute as jest.Mock).mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.user).toEqual(mockUser);
        expect(result.current.isAuthenticated).toBe(true);
      });
    });
  });

  describe('Login Flow', () => {
    test('should successfully login user', async () => {
      (container.loginUseCase.execute as jest.Mock).mockResolvedValue(mockAuthResponse);
      (container.getCurrentUserUseCase.execute as jest.Mock).mockResolvedValue(null);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.login({
          email: 'test@example.com',
          password: 'password123',
        });
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.loading).toBe(false);
    });

    test('should handle login failure', async () => {
      (container.loginUseCase.execute as jest.Mock).mockRejectedValue(
        new Error('Invalid credentials')
      );
      (container.getCurrentUserUseCase.execute as jest.Mock).mockResolvedValue(null);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        try {
          await result.current.login({
            email: 'test@example.com',
            password: 'wrong',
          });
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBe('Invalid credentials');
    });

    test('should enforce rate limiting on login', async () => {
      (container.loginUseCase.execute as jest.Mock).mockRejectedValue(
        new Error('Invalid credentials')
      );
      (container.getCurrentUserUseCase.execute as jest.Mock).mockResolvedValue(null);

      const { result } = renderHook(() => useAuth());
      await waitFor(() => expect(result.current.loading).toBe(false));

      const credentials = {
        email: 'test@example.com',
        password: 'wrong',
      };

      // Attempt 5 failed logins
      for (let i = 0; i < 5; i++) {
        await act(async () => {
          try {
            await result.current.login(credentials);
          } catch (error) {
            // Expected
          }
        });
      }

      // 6th attempt should be rate limited
      await act(async () => {
        try {
          await result.current.login(credentials);
        } catch (error) {
          expect((error as Error).message).toContain('Too many failed login attempts');
        }
      });
    });
  });

  describe('Logout Flow', () => {
    test('should successfully logout user', async () => {
      // Setup logged in state
      await TokenService.storeToken('test.token');
      (container.getCurrentUserUseCase.execute as jest.Mock).mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      // Logout
      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(container.logoutUseCase.execute).toHaveBeenCalled();

      // Verify token is cleared
      const isValid = await TokenService.isTokenValid();
      expect(isValid).toBe(false);
    });

    test('should clear session on logout', async () => {
      await TokenService.storeToken('test.token');
      (container.getCurrentUserUseCase.execute as jest.Mock).mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth());
      await waitFor(() => expect(result.current.user).toEqual(mockUser));

      await act(async () => {
        await result.current.logout();
      });

      // Session should be invalid
      const sessionValid = await SessionManager.isSessionValid();
      expect(sessionValid).toBe(false);
    });
  });

  describe('Registration Flow', () => {
    test('should successfully register user', async () => {
      (container.registerUseCase.execute as jest.Mock).mockResolvedValue(mockAuthResponse);
      (container.getCurrentUserUseCase.execute as jest.Mock).mockResolvedValue(null);

      const { result } = renderHook(() => useAuth());
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.register({
          email: 'new@example.com',
          password: 'password123',
          name: 'New User',
        });
      });

      expect(container.registerUseCase.execute).toHaveBeenCalled();
      expect(result.current.loading).toBe(false);
    });

    test('should handle registration failure', async () => {
      (container.registerUseCase.execute as jest.Mock).mockRejectedValue(
        new Error('Email already exists')
      );
      (container.getCurrentUserUseCase.execute as jest.Mock).mockResolvedValue(null);

      const { result } = renderHook(() => useAuth());
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        try {
          await result.current.register({
            email: 'existing@example.com',
            password: 'password123',
            name: 'User',
          });
        } catch (error) {
          // Expected
        }
      });

      expect(result.current.error).toBe('Email already exists');
    });
  });

  describe('Session Management', () => {
    test('should start session on successful login', async () => {
      (container.loginUseCase.execute as jest.Mock).mockResolvedValue(mockAuthResponse);
      (container.getCurrentUserUseCase.execute as jest.Mock).mockResolvedValue(null);

      const { result } = renderHook(() => useAuth());
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.login({
          email: 'test@example.com',
          password: 'password123',
        });
      });

      // Session should be valid
      const sessionValid = await SessionManager.isSessionValid();
      expect(sessionValid).toBe(true);
    });

    test('should update activity on getCurrentUser', async () => {
      await TokenService.storeToken('test.token');
      (container.getCurrentUserUseCase.execute as jest.Mock).mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth());
      await waitFor(() => expect(result.current.user).toEqual(mockUser));

      const beforeActivity = Date.now();
      await act(async () => {
        await result.current.getCurrentUser();
      });

      // Activity should be updated (session valid)
      const sessionValid = await SessionManager.isSessionValid();
      expect(sessionValid).toBe(true);
    });
  });

  describe('Role Detection', () => {
    test('should detect USER role', async () => {
      await TokenService.storeToken('test.token');
      (container.getCurrentUserUseCase.execute as jest.Mock).mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth());
      await waitFor(() => {
        expect(result.current.isAdmin).toBe(false);
      });
    });

    test('should detect ADMIN role', async () => {
      const adminUser = { ...mockUser, role: UserRole.ADMIN };
      await TokenService.storeToken('test.token');
      (container.getCurrentUserUseCase.execute as jest.Mock).mockResolvedValue(adminUser);

      const { result } = renderHook(() => useAuth());
      await waitFor(() => {
        expect(result.current.isAdmin).toBe(true);
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle token validation errors', async () => {
      // Store invalid token data
      await AsyncStorage.setItem('bull11_jwt_token', 'invalid-json-{');
      (container.getCurrentUserUseCase.execute as jest.Mock).mockResolvedValue(null);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.user).toBeNull();
      });
    });

    test('should handle getCurrentUser API errors', async () => {
      await TokenService.storeToken('test.token');
      (container.getCurrentUserUseCase.execute as jest.Mock).mockRejectedValue(
        new Error('API Error')
      );

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.user).toBeNull();
      });
    });
  });

  describe('Activity Tracking', () => {
    test('should update activity timestamp', async () => {
      await TokenService.storeToken('test.token');
      (container.getCurrentUserUseCase.execute as jest.Mock).mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth());
      await waitFor(() => expect(result.current.user).toEqual(mockUser));

      await act(async () => {
        await result.current.updateActivity();
      });

      // Should not throw and session should still be valid
      const sessionValid = await SessionManager.isSessionValid();
      expect(sessionValid).toBe(true);
    });

    test('should not update activity when not authenticated', async () => {
      (container.getCurrentUserUseCase.execute as jest.Mock).mockResolvedValue(null);

      const { result } = renderHook(() => useAuth());
      await waitFor(() => expect(result.current.loading).toBe(false));

      // Should not throw
      await act(async () => {
        await result.current.updateActivity();
      });
    });
  });
});
