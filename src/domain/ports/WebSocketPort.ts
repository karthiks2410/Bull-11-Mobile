/**
 * Domain Port: WebSocketPort
 * Defines contract for WebSocket operations (Dependency Inversion Principle)
 * This allows the domain layer to depend on abstractions, not concrete implementations
 */

import { PriceUpdate, PriceTick } from '../entities/PriceUpdate';

/**
 * Connection states for the WebSocket client
 */
export enum WebSocketConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  RECONNECTING = 'RECONNECTING',
  ERROR = 'ERROR',
}

/**
 * Subscription request for stock symbols
 */
export interface SubscriptionRequest {
  readonly symbols: readonly string[];
  readonly exchange: 'NSE' | 'BSE';
}

/**
 * Callback types for WebSocket events
 */
export type PriceUpdateCallback = (tick: PriceTick) => void;
export type ConnectionStateCallback = (state: WebSocketConnectionState) => void;
export type ErrorCallback = (error: Error) => void;

/**
 * WebSocket Port Interface
 * Defines the contract that any WebSocket implementation must fulfill
 */
export interface WebSocketPort {
  /**
   * Connect to the WebSocket server
   */
  connect(): Promise<void>;

  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void;

  /**
   * Subscribe to price updates for specific symbols
   */
  subscribe(request: SubscriptionRequest): void;

  /**
   * Unsubscribe from all current subscriptions
   */
  unsubscribe(): void;

  /**
   * Get the current connection state
   */
  getConnectionState(): WebSocketConnectionState;

  /**
   * Check if currently connected
   */
  isConnected(): boolean;

  /**
   * Register a callback for price updates
   */
  onPriceUpdate(callback: PriceUpdateCallback): () => void;

  /**
   * Register a callback for connection state changes
   */
  onConnectionStateChange(callback: ConnectionStateCallback): () => void;

  /**
   * Register a callback for errors
   */
  onError(callback: ErrorCallback): () => void;
}
