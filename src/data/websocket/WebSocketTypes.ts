/**
 * WebSocket Message Types
 * Defines the message structures for STOMP communication
 */

/**
 * Outgoing subscription message to server
 */
export interface SubscribeMessage {
  symbols: string[];
  exchange: string;
}

/**
 * Incoming tick data from server (raw format)
 */
export interface RawTickData {
  instrumentToken: number;
  tradingSymbol: string;
  lastPrice: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  change: number;
  timestamp: string;
}

/**
 * STOMP frame headers
 */
export interface StompHeaders {
  destination?: string;
  id?: string;
  'content-type'?: string;
  [key: string]: string | undefined;
}

/**
 * WebSocket configuration
 */
export interface WebSocketConfig {
  url: string;
  subscribeEndpoint: string;
  ticksDestination: string;
  heartbeatIncoming: number;
  heartbeatOutgoing: number;
  reconnectDelay: number;
  maxReconnectDelay: number;
  reconnectMultiplier: number;
  debug: boolean;
}

/**
 * Default WebSocket configuration
 */
export const DEFAULT_WS_CONFIG: WebSocketConfig = {
  url: 'http://localhost:9090/ws',
  subscribeEndpoint: '/app/subscribe',
  ticksDestination: '/topic/stocks',
  heartbeatIncoming: 30000,
  heartbeatOutgoing: 30000,
  reconnectDelay: 1000,
  maxReconnectDelay: 30000,
  reconnectMultiplier: 2,
  debug: process.env.NODE_ENV === 'development',
};
