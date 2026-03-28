/**
 * Centralized Logging Configuration
 * Uses react-native-logs for structured logging with levels
 * Can be easily integrated with remote logging services (Kibana, Sentry, etc.)
 */

import { logger, consoleTransport } from 'react-native-logs';
import type { configLoggerType } from 'react-native-logs';

/**
 * Logger Configuration
 * - Development: DEBUG level, colorized console output
 * - Production: INFO level, structured JSON output ready for remote services
 */
const config: configLoggerType<typeof consoleTransport, 'debug' | 'info' | 'warn' | 'error'> = {
  levels: {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  },
  severity: __DEV__ ? 'debug' : 'info',
  transport: consoleTransport,
  transportOptions: {
    colors: {
      debug: 'blueBright',
      info: 'greenBright',
      warn: 'yellowBright',
      error: 'redBright',
    },
    extensionColors: {
      root: 'magenta',
      auth: 'blue',
      game: 'green',
      stock: 'cyan',
      admin: 'yellow',
      security: 'red',
    },
  },
  async: true,
  dateFormat: 'time',
  printLevel: true,
  printDate: true,
  enabled: true,
};

// Create the logger instance
const log = logger.createLogger(config);

/**
 * Get a logger instance for a specific module
 * Usage: const logger = getLogger('AuthScreen');
 *
 * Then use: logger.debug('message'), logger.info('message'), etc.
 */
export function getLogger(module: string) {
  return log.extend(module);
}

/**
 * Re-export the main logger for direct use if needed
 */
export const Logger = log;

/**
 * Log levels enum for external use
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

/**
 * Example usage:
 *
 * import { getLogger } from '@/src/core/logging';
 *
 * const logger = getLogger('MyComponent');
 *
 * logger.debug('Debug message', { extra: 'data' });
 * logger.info('Info message');
 * logger.warn('Warning message');
 * logger.error('Error message', { error: err });
 */

/**
 * Future Integration Notes:
 *
 * For Kibana/ELK Stack Integration:
 * 1. Create custom transport that POSTs to your log aggregation endpoint
 * 2. Add transport to config: transport: [consoleTransport, kibanaTransport]
 *
 * For Sentry Integration:
 * 1. npm install @sentry/react-native
 * 2. Create Sentry transport
 * 3. Add to config
 *
 * Example custom transport:
 *
 * const kibanaTransport = (props: any) => {
 *   const { msg, level, extension, rawMsg } = props;
 *   // POST to your Kibana endpoint
 *   fetch('https://your-kibana-endpoint/logs', {
 *     method: 'POST',
 *     body: JSON.stringify({ level, module: extension, message: msg, data: rawMsg }),
 *   });
 * };
 */
