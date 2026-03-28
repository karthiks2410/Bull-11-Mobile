/**
 * Logging Usage Examples
 *
 * This file demonstrates how to use the react-native-logs logger
 * throughout the Bull-11 application.
 */

import { getLogger } from '@/src/core/logging';

// ============================================
// Example 1: Basic Usage in a Component
// ============================================

function MyComponent() {
  const logger = getLogger('MyComponent');

  const handleAction = () => {
    logger.debug('Button clicked'); // Only in dev mode
    logger.info('Processing action');
    logger.warn('Something unusual happened');
    logger.error('An error occurred', { error: 'details' });
  };
}

// ============================================
// Example 2: Use Case Logging
// ============================================

export class LoginUseCase {
  private logger = getLogger('LoginUseCase');
  // Note: authRepository would be injected via constructor in real usage

  async execute(email: string, password: string): Promise<void> {
    this.logger.debug('Login attempt', { email });

    try {
      this.logger.info('Login successful', { email });
    } catch (error) {
      this.logger.error('Login failed', { email, error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }
}

// ============================================
// Example 3: API Client Logging
// ============================================

export class ApiClient {
  private logger = getLogger('ApiClient');

  async get(endpoint: string) {
    this.logger.debug('GET request', { endpoint });

    try {
      const response = await fetch(endpoint);
      this.logger.debug('Response received', { status: response.status });
      return response.json();
    } catch (error) {
      this.logger.error('Request failed', { endpoint, error });
      throw error;
    }
  }
}

// ============================================
// Example 4: Security Event Logging
// ============================================

function containsSQLKeywords(input: string): boolean {
  const sqlPattern = /\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|WHERE|FROM)\b/i;
  return sqlPattern.test(input);
}

export function validateInput(input: string) {
  const logger = getLogger('Security');

  if (input.length > 100) {
    logger.warn('Input exceeds max length', { length: input.length });
    return false;
  }

  if (containsSQLKeywords(input)) {
    logger.warn('Potential SQL injection attempt detected', { input: input.substring(0, 20) });
    return false;
  }

  logger.debug('Input validation passed');
  return true;
}

// ============================================
// Log Levels
// ============================================

/**
 * DEBUG (0): Detailed diagnostic information
 * - Only visible in development (__DEV__ = true)
 * - Use for debugging during development
 * - Examples: "Component mounted", "API request started"
 *
 * INFO (1): General informational messages
 * - Visible in both dev and production
 * - Use for notable events and state changes
 * - Examples: "User logged in", "Game started"
 *
 * WARN (2): Warning messages for potentially harmful situations
 * - Visible in both dev and production
 * - Use for recoverable errors and security events
 * - Examples: "Rate limit exceeded", "Invalid input detected"
 *
 * ERROR (3): Error events that might still allow the app to continue
 * - Visible in both dev and production
 * - Use for errors that need attention
 * - Examples: "API request failed", "Payment processing error"
 */

// ============================================
// Best Practices
// ============================================

/**
 * DO:
 * ✅ Use appropriate log levels
 * ✅ Include context data as second parameter
 * ✅ Use descriptive module names: getLogger('AuthScreen'), getLogger('GameRepository')
 * ✅ Log security events at WARN level
 * ✅ Log API errors at ERROR level
 *
 * DON'T:
 * ❌ Log sensitive data (passwords, tokens, full credit cards)
 * ❌ Log large objects (can impact performance)
 * ❌ Use console.log directly (use logger instead)
 * ❌ Log in tight loops (can flood logs)
 * ❌ Leave DEBUG logs in production code paths
 */

// ============================================
// Future: Remote Logging Integration
// ============================================

/**
 * When ready for production monitoring:
 *
 * 1. Install Sentry:
 *    npm install @sentry/react-native
 *
 * 2. Configure in Logger.ts:
 *    import * as Sentry from '@sentry/react-native';
 *
 *    const sentryTransport = (props) => {
 *      const { level, extension, msg, rawMsg } = props;
 *      if (level >= 2) { // WARN and ERROR only
 *        Sentry.captureMessage(msg, {
 *          level: level === 2 ? 'warning' : 'error',
 *          tags: { module: extension },
 *          extra: rawMsg,
 *        });
 *      }
 *    };
 *
 *    const config = {
 *      transport: [consoleTransport, sentryTransport],
 *      // ... rest of config
 *    };
 *
 * 3. For Kibana/ELK integration:
 *    - Create custom transport that POSTs to your log aggregation endpoint
 *    - Format as JSON with timestamp, level, module, message, data
 *    - Add authentication headers
 */

export {};
