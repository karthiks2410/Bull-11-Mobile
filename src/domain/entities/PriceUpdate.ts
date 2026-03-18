/**
 * Domain Entity: PriceUpdate
 * Represents a real-time stock price update from WebSocket
 */

export interface PriceUpdate {
  readonly instrumentToken: number;
  readonly tradingSymbol: string;
  readonly lastPrice: number;
  readonly open: number;
  readonly high: number;
  readonly low: number;
  readonly close: number;
  readonly volume: number;
  readonly change: number;
  readonly timestamp: Date;
}

/**
 * Batch of price updates received in a single tick
 */
export interface PriceTick {
  readonly updates: readonly PriceUpdate[];
  readonly receivedAt: Date;
}
