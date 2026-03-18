/**
 * WebSocket Client Service
 * STOMP over SockJS implementation for real-time stock price updates
 *
 * Features:
 * - Connection management (connect, disconnect, reconnect)
 * - Auto-reconnection with exponential backoff
 * - Subscribe/unsubscribe to stock symbols
 * - Parse incoming tick messages
 * - Event-based architecture with callbacks
 * - Connection state tracking
 */

import { Client, IFrame, IMessage, StompSubscription } from '@stomp/stompjs';
// @ts-ignore - SockJS has complex typing, but works correctly at runtime
import SockJS from 'sockjs-client';
import {
  WebSocketPort,
  WebSocketConnectionState,
  SubscriptionRequest,
  PriceUpdateCallback,
  ConnectionStateCallback,
  ErrorCallback,
} from '@/src/domain/ports/WebSocketPort';
import { PriceUpdate, PriceTick } from '@/src/domain/entities/PriceUpdate';
import {
  WebSocketConfig,
  DEFAULT_WS_CONFIG,
  RawTickData,
  SubscribeMessage,
} from './WebSocketTypes';
import { API_CONFIG } from '@/src/core/constants/app.constants';
import { TokenService } from '@/src/core/security/TokenService';

/**
 * StockWebSocketClient
 * Implements WebSocketPort using STOMP over SockJS
 */
export class StockWebSocketClient implements WebSocketPort {
  private client: Client | null = null;
  private config: WebSocketConfig;
  private connectionState: WebSocketConnectionState = WebSocketConnectionState.DISCONNECTED;
  private subscription: StompSubscription | null = null;
  private currentSubscription: SubscriptionRequest | null = null;

  // Reconnection state
  private reconnectAttempts: number = 0;
  private reconnectTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private isManualDisconnect: boolean = false;

  // Callbacks
  private priceUpdateCallbacks: Set<PriceUpdateCallback> = new Set();
  private connectionStateCallbacks: Set<ConnectionStateCallback> = new Set();
  private errorCallbacks: Set<ErrorCallback> = new Set();

  constructor(config?: Partial<WebSocketConfig>) {
    this.config = {
      ...DEFAULT_WS_CONFIG,
      url: API_CONFIG.WS_URL?.replace('ws://', 'http://').replace('wss://', 'https://') || DEFAULT_WS_CONFIG.url,
      ...config,
    };
  }

  /**
   * Connect to the WebSocket server
   */
  async connect(): Promise<void> {
    if (this.client?.connected) {
      this.log('Already connected');
      return;
    }

    this.isManualDisconnect = false;
    this.updateConnectionState(WebSocketConnectionState.CONNECTING);

    // Get JWT token for authentication (TokenService has static methods)
    const token = await TokenService.getToken();
    if (!token) {
      const error = new Error('No authentication token available');
      this.notifyError(error);
      this.updateConnectionState(WebSocketConnectionState.ERROR);
      throw error;
    }

    return new Promise((resolve, reject) => {
      try {
        this.client = new Client({
          // Use SockJS for WebSocket transport
          webSocketFactory: () => new SockJS(this.config.url) as WebSocket,

          // Send JWT token in STOMP connection headers
          connectHeaders: {
            Authorization: `Bearer ${token}`,
          },

          // Heartbeat configuration
          heartbeatIncoming: this.config.heartbeatIncoming,
          heartbeatOutgoing: this.config.heartbeatOutgoing,

          // Debug logging
          debug: this.config.debug ? (msg) => this.log(msg) : () => {},

          // Connection established
          onConnect: (frame: IFrame) => {
            this.log('Connected to WebSocket server');
            this.reconnectAttempts = 0;
            this.updateConnectionState(WebSocketConnectionState.CONNECTED);

            // Resubscribe if we had an active subscription
            if (this.currentSubscription) {
              this.subscribeToTicks();
            }

            resolve();
          },

          // Connection error
          onStompError: (frame: IFrame) => {
            const errorMessage = frame.headers['message'] || 'STOMP error';
            this.log(`STOMP error: ${errorMessage}`);
            this.notifyError(new Error(errorMessage));
            this.updateConnectionState(WebSocketConnectionState.ERROR);
            reject(new Error(errorMessage));
          },

          // WebSocket closed
          onWebSocketClose: (event: CloseEvent) => {
            this.log(`WebSocket closed: ${event.code} - ${event.reason}`);
            this.handleDisconnection();
          },

          // WebSocket error
          onWebSocketError: (event: Event) => {
            this.log('WebSocket error occurred');
            this.notifyError(new Error('WebSocket connection error'));
          },
        });

        // Activate the STOMP client
        this.client.activate();
      } catch (error) {
        this.log(`Connection error: ${error}`);
        this.updateConnectionState(WebSocketConnectionState.ERROR);
        this.notifyError(error instanceof Error ? error : new Error(String(error)));
        reject(error);
      }
    });
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    this.isManualDisconnect = true;
    this.clearReconnectTimeout();

    if (this.subscription) {
      try {
        this.subscription.unsubscribe();
      } catch (e) {
        // Ignore errors during unsubscribe
      }
      this.subscription = null;
    }

    if (this.client) {
      try {
        this.client.deactivate();
      } catch (e) {
        // Ignore errors during deactivation
      }
      this.client = null;
    }

    this.currentSubscription = null;
    this.reconnectAttempts = 0;
    this.updateConnectionState(WebSocketConnectionState.DISCONNECTED);
    this.log('Disconnected from WebSocket server');
  }

  /**
   * Subscribe to price updates for specific symbols
   */
  subscribe(request: SubscriptionRequest): void {
    this.currentSubscription = request;

    if (this.client?.connected) {
      this.subscribeToTicks();
      this.sendSubscriptionRequest(request);
    } else {
      this.log('Not connected. Will subscribe when connection is established.');
    }
  }

  /**
   * Unsubscribe from all current subscriptions
   */
  unsubscribe(): void {
    if (this.subscription) {
      try {
        this.subscription.unsubscribe();
      } catch (e) {
        // Ignore errors
      }
      this.subscription = null;
    }
    this.currentSubscription = null;
    this.log('Unsubscribed from price updates');
  }

  /**
   * Get the current connection state
   */
  getConnectionState(): WebSocketConnectionState {
    return this.connectionState;
  }

  /**
   * Check if currently connected
   */
  isConnected(): boolean {
    return this.connectionState === WebSocketConnectionState.CONNECTED && !!this.client?.connected;
  }

  /**
   * Register a callback for price updates
   */
  onPriceUpdate(callback: PriceUpdateCallback): () => void {
    this.priceUpdateCallbacks.add(callback);
    return () => {
      this.priceUpdateCallbacks.delete(callback);
    };
  }

  /**
   * Register a callback for connection state changes
   */
  onConnectionStateChange(callback: ConnectionStateCallback): () => void {
    this.connectionStateCallbacks.add(callback);
    // Immediately notify of current state
    callback(this.connectionState);
    return () => {
      this.connectionStateCallbacks.delete(callback);
    };
  }

  /**
   * Register a callback for errors
   */
  onError(callback: ErrorCallback): () => void {
    this.errorCallbacks.add(callback);
    return () => {
      this.errorCallbacks.delete(callback);
    };
  }

  // Private methods

  /**
   * Subscribe to the ticks destination
   */
  private subscribeToTicks(): void {
    if (!this.client?.connected) {
      return;
    }

    // Unsubscribe from existing subscription
    if (this.subscription) {
      try {
        this.subscription.unsubscribe();
      } catch (e) {
        // Ignore
      }
    }

    // Subscribe to the ticks destination
    this.subscription = this.client.subscribe(
      this.config.ticksDestination,
      (message: IMessage) => {
        this.handleTickMessage(message);
      }
    );

    this.log(`Subscribed to ${this.config.ticksDestination}`);
  }

  /**
   * Send subscription request to server
   */
  private sendSubscriptionRequest(request: SubscriptionRequest): void {
    if (!this.client?.connected) {
      return;
    }

    const subscribeMessage: SubscribeMessage = {
      symbols: [...request.symbols],
      exchange: request.exchange,
    };

    this.client.publish({
      destination: this.config.subscribeEndpoint,
      body: JSON.stringify(subscribeMessage),
      headers: {
        'content-type': 'application/json',
      },
    });

    this.log(`Sent subscription request for: ${request.symbols.join(', ')}`);
  }

  /**
   * Handle incoming tick message
   */
  private handleTickMessage(message: IMessage): void {
    try {
      const rawTicks: RawTickData[] = JSON.parse(message.body);

      if (!Array.isArray(rawTicks)) {
        this.log('Invalid tick data format: expected array');
        return;
      }

      const updates: PriceUpdate[] = rawTicks.map((raw) => ({
        instrumentToken: raw.instrumentToken,
        tradingSymbol: raw.tradingSymbol,
        lastPrice: raw.lastPrice,
        open: raw.open,
        high: raw.high,
        low: raw.low,
        close: raw.close,
        volume: raw.volume,
        change: raw.change,
        timestamp: new Date(raw.timestamp),
      }));

      const tick: PriceTick = {
        updates,
        receivedAt: new Date(),
      };

      this.notifyPriceUpdate(tick);
    } catch (error) {
      this.log(`Error parsing tick message: ${error}`);
      this.notifyError(new Error('Failed to parse price update'));
    }
  }

  /**
   * Handle disconnection and trigger reconnection
   */
  private handleDisconnection(): void {
    if (this.isManualDisconnect) {
      this.updateConnectionState(WebSocketConnectionState.DISCONNECTED);
      return;
    }

    this.updateConnectionState(WebSocketConnectionState.RECONNECTING);
    this.scheduleReconnect();
  }

  /**
   * Schedule a reconnection attempt with exponential backoff
   */
  private scheduleReconnect(): void {
    this.clearReconnectTimeout();

    const delay = Math.min(
      this.config.reconnectDelay * Math.pow(this.config.reconnectMultiplier, this.reconnectAttempts),
      this.config.maxReconnectDelay
    );

    this.log(`Scheduling reconnect attempt ${this.reconnectAttempts + 1} in ${delay}ms`);

    this.reconnectTimeoutId = setTimeout(async () => {
      this.reconnectAttempts++;
      this.log(`Reconnect attempt ${this.reconnectAttempts}`);

      try {
        await this.connect();
      } catch (error) {
        this.log(`Reconnect attempt ${this.reconnectAttempts} failed`);
        // handleDisconnection will schedule the next attempt
      }
    }, delay);
  }

  /**
   * Clear any pending reconnection timeout
   */
  private clearReconnectTimeout(): void {
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }
  }

  /**
   * Update connection state and notify callbacks
   */
  private updateConnectionState(state: WebSocketConnectionState): void {
    if (this.connectionState === state) {
      return;
    }

    this.connectionState = state;
    this.connectionStateCallbacks.forEach((callback) => {
      try {
        callback(state);
      } catch (e) {
        // Ignore callback errors
      }
    });
  }

  /**
   * Notify price update callbacks
   */
  private notifyPriceUpdate(tick: PriceTick): void {
    this.priceUpdateCallbacks.forEach((callback) => {
      try {
        callback(tick);
      } catch (e) {
        // Ignore callback errors
      }
    });
  }

  /**
   * Notify error callbacks
   */
  private notifyError(error: Error): void {
    this.errorCallbacks.forEach((callback) => {
      try {
        callback(error);
      } catch (e) {
        // Ignore callback errors
      }
    });
  }

  /**
   * Debug logging
   */
  private log(message: string): void {
    if (this.config.debug) {
      console.log(`[StockWebSocketClient] ${message}`);
    }
  }
}

/**
 * Singleton instance for global access
 */
let webSocketClientInstance: StockWebSocketClient | null = null;

/**
 * Get or create the WebSocket client singleton
 */
export function getWebSocketClient(config?: Partial<WebSocketConfig>): StockWebSocketClient {
  if (!webSocketClientInstance) {
    webSocketClientInstance = new StockWebSocketClient(config);
  }
  return webSocketClientInstance;
}

/**
 * Reset the WebSocket client singleton (useful for testing)
 */
export function resetWebSocketClient(): void {
  if (webSocketClientInstance) {
    webSocketClientInstance.disconnect();
    webSocketClientInstance = null;
  }
}
