/**
 * React Hook: useStockWebSocket
 * Provides real-time stock price updates via WebSocket
 *
 * Features:
 * - Connect/disconnect on mount/unmount
 * - Subscribe to stock symbols by game ID or symbol array
 * - AppState handling (pause when backgrounded)
 * - Automatic reconnection
 * - Type-safe price updates
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { getWebSocketClient, StockWebSocketClient } from '@/src/data/websocket/WebSocketClient';
import {
  WebSocketConnectionState,
  SubscriptionRequest,
} from '@/src/domain/ports/WebSocketPort';
import { PriceUpdate, PriceTick } from '@/src/domain/entities/PriceUpdate';
import { Game } from '@/src/domain/entities/Game';

/**
 * Price map type: symbol -> latest price update
 */
export type PriceMap = Map<string, PriceUpdate>;

/**
 * Hook options
 */
export interface UseStockWebSocketOptions {
  /** Auto-connect on mount (default: true) */
  autoConnect?: boolean;
  /** Exchange to subscribe to (default: 'NSE') */
  exchange?: 'NSE' | 'BSE';
  /** Pause updates when app is backgrounded (default: true) */
  pauseInBackground?: boolean;
  /** Enable debug logging (default: false) */
  debug?: boolean;
}

/**
 * Hook return type
 */
export interface UseStockWebSocketResult {
  /** Map of symbol -> latest price update */
  prices: PriceMap;
  /** Current connection state */
  connectionState: WebSocketConnectionState;
  /** Last error that occurred */
  error: Error | null;
  /** Whether currently connected */
  isConnected: boolean;
  /** Whether currently loading/connecting */
  isLoading: boolean;
  /** Manually connect to WebSocket */
  connect: () => Promise<void>;
  /** Manually disconnect from WebSocket */
  disconnect: () => void;
  /** Subscribe to symbols */
  subscribe: (symbols: string[]) => void;
  /** Unsubscribe from current symbols */
  unsubscribe: () => void;
  /** Last update timestamp */
  lastUpdateTime: Date | null;
}

/**
 * Default options
 */
const DEFAULT_OPTIONS: Required<UseStockWebSocketOptions> = {
  autoConnect: true,
  exchange: 'NSE',
  pauseInBackground: true,
  debug: false,
};

/**
 * Extract stock symbols from a game
 */
function extractSymbolsFromGame(game: Game): string[] {
  return game.stocks.map((stock) => stock.symbol);
}

/**
 * Extract stock symbols from multiple games
 */
function extractSymbolsFromGames(games: Game[]): string[] {
  const symbolSet = new Set<string>();
  games.forEach((game) => {
    game.stocks.forEach((stock) => {
      symbolSet.add(stock.symbol);
    });
  });
  return Array.from(symbolSet);
}

/**
 * useStockWebSocket - Main hook for WebSocket price updates
 *
 * @param gameOrSymbols - Game object, array of games, game ID (string), or array of stock symbols
 * @param options - Hook configuration options
 * @returns WebSocket state and control functions
 *
 * @example
 * // With a game object
 * const { prices, connectionState } = useStockWebSocket(activeGame);
 *
 * @example
 * // With multiple games
 * const { prices, connectionState } = useStockWebSocket(activeGames);
 *
 * @example
 * // With stock symbols directly
 * const { prices, connectionState } = useStockWebSocket(['INFY', 'TCS', 'RELIANCE']);
 */
export function useStockWebSocket(
  gameOrSymbols?: Game | Game[] | string[] | string | null,
  options: UseStockWebSocketOptions = {}
): UseStockWebSocketResult {
  // Merge options with defaults
  const opts = useMemo(
    () => ({ ...DEFAULT_OPTIONS, ...options }),
    [options.autoConnect, options.exchange, options.pauseInBackground, options.debug]
  );

  // State
  const [prices, setPrices] = useState<PriceMap>(new Map());
  const [connectionState, setConnectionState] = useState<WebSocketConnectionState>(
    WebSocketConnectionState.DISCONNECTED
  );
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

  // Refs for cleanup and tracking
  const clientRef = useRef<StockWebSocketClient | null>(null);
  const cleanupFunctionsRef = useRef<Array<() => void>>([]);
  const isMountedRef = useRef(true);
  const isBackgroundedRef = useRef(false);
  const pendingSubscriptionRef = useRef<string[] | null>(null);
  const currentSymbolsRef = useRef<string[]>([]);

  // Debug logging
  const log = useCallback(
    (message: string) => {
      if (opts.debug) {
        console.log(`[useStockWebSocket] ${message}`);
      }
    },
    [opts.debug]
  );

  // Extract symbols from input
  const symbols = useMemo(() => {
    if (!gameOrSymbols) {
      return [];
    }

    // String array (symbols)
    if (Array.isArray(gameOrSymbols)) {
      if (gameOrSymbols.length === 0) {
        return [];
      }
      // Check if it's an array of strings or games
      if (typeof gameOrSymbols[0] === 'string') {
        return gameOrSymbols as string[];
      }
      // Array of games
      return extractSymbolsFromGames(gameOrSymbols as Game[]);
    }

    // Single string (could be game ID - not supported yet, return empty)
    if (typeof gameOrSymbols === 'string') {
      log('Game ID lookup not yet implemented. Pass symbols array or Game object.');
      return [];
    }

    // Single game object
    return extractSymbolsFromGame(gameOrSymbols);
  }, [gameOrSymbols, log]);

  // Initialize WebSocket client
  const initializeClient = useCallback(() => {
    if (!clientRef.current) {
      clientRef.current = getWebSocketClient({ debug: opts.debug });
      log('WebSocket client initialized');
    }
    return clientRef.current;
  }, [opts.debug, log]);

  // Handle price update
  const handlePriceUpdate = useCallback(
    (tick: PriceTick) => {
      if (!isMountedRef.current || isBackgroundedRef.current) {
        return;
      }

      setPrices((prevPrices) => {
        const newPrices = new Map(prevPrices);
        tick.updates.forEach((update) => {
          newPrices.set(update.tradingSymbol, update);
        });
        return newPrices;
      });

      setLastUpdateTime(tick.receivedAt);
      log(`Received ${tick.updates.length} price updates`);
    },
    [log]
  );

  // Handle connection state change
  const handleConnectionStateChange = useCallback(
    (state: WebSocketConnectionState) => {
      if (!isMountedRef.current) {
        return;
      }

      setConnectionState(state);
      log(`Connection state changed to: ${state}`);

      // Clear error on successful connection
      if (state === WebSocketConnectionState.CONNECTED) {
        setError(null);

        // If we have pending subscriptions, apply them
        if (pendingSubscriptionRef.current && pendingSubscriptionRef.current.length > 0) {
          const client = clientRef.current;
          if (client) {
            const request: SubscriptionRequest = {
              symbols: pendingSubscriptionRef.current,
              exchange: opts.exchange,
            };
            client.subscribe(request);
            currentSymbolsRef.current = [...pendingSubscriptionRef.current];
            log(`Applied pending subscription: ${pendingSubscriptionRef.current.join(', ')}`);
          }
          pendingSubscriptionRef.current = null;
        }
      }
    },
    [opts.exchange, log]
  );

  // Handle error
  const handleError = useCallback(
    (err: Error) => {
      if (!isMountedRef.current) {
        return;
      }

      setError(err);
      log(`Error: ${err.message}`);
    },
    [log]
  );

  // Connect to WebSocket
  const connect = useCallback(async () => {
    const client = initializeClient();

    if (client.isConnected()) {
      log('Already connected');
      return;
    }

    try {
      setError(null);
      await client.connect();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    }
  }, [initializeClient, log]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    const client = clientRef.current;
    if (client) {
      client.disconnect();
      currentSymbolsRef.current = [];
      pendingSubscriptionRef.current = null;
      log('Disconnected');
    }
  }, [log]);

  // Subscribe to symbols
  const subscribe = useCallback(
    (newSymbols: string[]) => {
      if (newSymbols.length === 0) {
        log('No symbols to subscribe');
        return;
      }

      const client = clientRef.current;

      if (!client || !client.isConnected()) {
        // Store for later when connected
        pendingSubscriptionRef.current = newSymbols;
        log(`Queued subscription for: ${newSymbols.join(', ')}`);
        return;
      }

      const request: SubscriptionRequest = {
        symbols: newSymbols,
        exchange: opts.exchange,
      };

      client.subscribe(request);
      currentSymbolsRef.current = [...newSymbols];
      log(`Subscribed to: ${newSymbols.join(', ')}`);
    },
    [opts.exchange, log]
  );

  // Unsubscribe from current symbols
  const unsubscribe = useCallback(() => {
    const client = clientRef.current;
    if (client) {
      client.unsubscribe();
      currentSymbolsRef.current = [];
      pendingSubscriptionRef.current = null;
      log('Unsubscribed from all symbols');
    }
  }, [log]);

  // Handle AppState changes
  useEffect(() => {
    if (!opts.pauseInBackground) {
      return;
    }

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      const wasBackgrounded = isBackgroundedRef.current;
      isBackgroundedRef.current = nextAppState !== 'active';

      if (nextAppState === 'active' && wasBackgrounded) {
        // Resuming from background
        log('App resumed from background');

        // Reconnect if we were connected before
        const client = clientRef.current;
        if (client && !client.isConnected() && currentSymbolsRef.current.length > 0) {
          log('Reconnecting after resume...');
          connect().catch((err) => {
            log(`Reconnection failed: ${err.message}`);
          });
        }
      } else if (nextAppState !== 'active') {
        // Going to background
        log('App going to background');
        // Note: We don't disconnect here - the WebSocket client handles reconnection
        // We just pause processing updates
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    cleanupFunctionsRef.current.push(() => subscription.remove());

    return () => {
      subscription.remove();
    };
  }, [opts.pauseInBackground, connect, log]);

  // Set up event listeners when client is available
  useEffect(() => {
    const client = initializeClient();

    // Register callbacks
    const unsubPriceUpdate = client.onPriceUpdate(handlePriceUpdate);
    const unsubConnectionState = client.onConnectionStateChange(handleConnectionStateChange);
    const unsubError = client.onError(handleError);

    cleanupFunctionsRef.current.push(unsubPriceUpdate, unsubConnectionState, unsubError);

    return () => {
      unsubPriceUpdate();
      unsubConnectionState();
      unsubError();
    };
  }, [initializeClient, handlePriceUpdate, handleConnectionStateChange, handleError]);

  // Auto-connect and subscribe when symbols change
  useEffect(() => {
    if (!opts.autoConnect || symbols.length === 0) {
      return;
    }

    // Check if symbols actually changed
    const currentSymbolsString = currentSymbolsRef.current.sort().join(',');
    const newSymbolsString = [...symbols].sort().join(',');

    if (currentSymbolsString === newSymbolsString) {
      log('Symbols unchanged, skipping subscription update');
      return;
    }

    const client = clientRef.current;

    // If not connected, connect first then subscribe
    if (!client || !client.isConnected()) {
      pendingSubscriptionRef.current = symbols;
      connect().catch((err) => {
        log(`Auto-connect failed: ${err.message}`);
      });
    } else {
      // Already connected, just subscribe
      subscribe(symbols);
    }
  }, [symbols, opts.autoConnect, connect, subscribe, log]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      log('Hook unmounting, cleaning up...');

      // Run all cleanup functions
      cleanupFunctionsRef.current.forEach((cleanup) => {
        try {
          cleanup();
        } catch (e) {
          // Ignore cleanup errors
        }
      });
      cleanupFunctionsRef.current = [];

      // Note: We don't disconnect the singleton client here
      // as other components might be using it
      // The client handles its own lifecycle
    };
  }, [log]);

  // Computed values
  const isConnected = connectionState === WebSocketConnectionState.CONNECTED;
  const isLoading =
    connectionState === WebSocketConnectionState.CONNECTING ||
    connectionState === WebSocketConnectionState.RECONNECTING;

  return {
    prices,
    connectionState,
    error,
    isConnected,
    isLoading,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    lastUpdateTime,
  };
}

/**
 * Helper hook to get a single stock's price
 *
 * @param symbol - Stock symbol to watch
 * @param options - Hook options
 * @returns Single stock price update and connection state
 */
export function useSingleStockPrice(
  symbol: string | null,
  options: UseStockWebSocketOptions = {}
): {
  price: PriceUpdate | null;
  connectionState: WebSocketConnectionState;
  error: Error | null;
  isConnected: boolean;
} {
  const symbols = useMemo(() => (symbol ? [symbol] : []), [symbol]);
  const { prices, connectionState, error, isConnected } = useStockWebSocket(symbols, options);

  const price = symbol ? prices.get(symbol) || null : null;

  return {
    price,
    connectionState,
    error,
    isConnected,
  };
}

/**
 * Hook specifically for active games
 * Extracts symbols from all active games and subscribes
 *
 * @param games - Array of active games
 * @param options - Hook options
 * @returns Price map and connection state
 */
export function useActiveGamesPrices(
  games: Game[],
  options: UseStockWebSocketOptions = {}
): UseStockWebSocketResult {
  return useStockWebSocket(games, options);
}

export default useStockWebSocket;
